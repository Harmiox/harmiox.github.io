<?php
/**
 * This file implements the Media Index Widget class.
 *
 * This file is part of the evoCore framework - {@link http://evocore.net/}
 * See also {@link https://github.com/b2evolution/b2evolution}.
 *
 * @license GNU GPL v2 - {@link http://b2evolution.net/about/gnu-gpl-license}
 *
 * @copyright (c)2003-2015 by Francois Planque - {@link http://fplanque.com/}
 *
 * @package evocore
 */
if( !defined('EVO_MAIN_INIT') ) die( 'Please, do not access this page directly.' );

load_class( 'widgets/model/_widget.class.php', 'ComponentWidget' );
load_class( '_core/model/dataobjects/_dataobjectlist2.class.php', 'DataObjectList2' );

/**
 * ComponentWidget Class
 *
 * A ComponentWidget is a displayable entity that can be placed into a Container on a web page.
 *
 * @package evocore
 */
class coll_media_index_Widget extends ComponentWidget
{
	/**
	 * Constructor
	 */
	function coll_media_index_Widget( $db_row = NULL )
	{
		// Call parent constructor:
		parent::ComponentWidget( $db_row, 'core', 'coll_media_index' );
	}


  /**
   * Get definitions for editable params
   *
	 * @see Plugin::GetDefaultSettings()
	 * @param local params like 'for_editing' => true
	 */
	function get_param_definitions( $params )
	{
		load_funcs( 'files/model/_image.funcs.php' );

		/**
		 * @var ItemTypeCache
		 */
		$ItemTypeCache = & get_ItemTypeCache();
		$item_type_options =
			array(
				''  => T_('All'),
			) + $ItemTypeCache->get_option_array() ;

		$r = array_merge( array(
			'title' => array(
				'label' => T_('Block title'),
				'note' => T_( 'Title to display in your skin.' ),
				'size' => 40,
				'defaultvalue' => T_('Recent photos'),
			),
			'item_visibility' => array(
				'label' => T_('Item visibility'),
				'note' => T_('What post statuses should be included in the list?'),
				'type' => 'radio',
				'field_lines' => true,
				'options' => array(
						array( 'public', T_('show public images (cacheable)') ),
						array( 'all', T_('show all images the current user is allowed to see (not cacheable)') ) ),
				'defaultvalue' => 'all',
			),
			'item_type' => array(
				'label' => T_('Post type'),
				'note' => T_('What kind of items do you want to list?'),
				'type' => 'select',
				'options' => $item_type_options,
				'defaultvalue' => '1',
			),
			'thumb_size' => array(
				'label' => T_('Thumbnail size'),
				'note' => T_('Cropping and sizing of thumbnails'),
				'type' => 'select',
				'options' => get_available_thumb_sizes(),
				'defaultvalue' => 'crop-80x80',
			),
			'thumb_layout' => array(
				'label' => T_('Layout'),
				'note' => T_('How to lay out the thumbnails'),
				'type' => 'select',
				'options' => array(
						'grid' => T_('Grid'),
						'list' => T_('List'),
						'flow' => T_('Flowing Blocks')
					),
				'defaultvalue' => 'flow',
			),
			'disp_image_title' => array(
				'label' => T_( 'Display image title' ),
				'note' => T_( 'Check this to display image title. This falls back to post title if image title is not set.' ),
				'type' => 'checkbox',
				'defaultvalue' => false,
			),
			'grid_nb_cols' => array(
				'label' => T_( 'Columns' ),
				'note' => T_( 'Number of columns in grid mode.' ),
				'size' => 4,
				'defaultvalue' => 2,
			),
			'limit' => array(
				'label' => T_( 'Max items' ),
				'note' => T_( 'Maximum number of items to display.' ),
				'size' => 4,
				'defaultvalue' => 3,
			),
			'order_by' => array(
				'label' => T_('Order by'),
				'note' => T_('How to sort the items'),
				'type' => 'select',
				'options' => get_available_sort_options(),
				'defaultvalue' => 'datestart',
			),
			'order_dir' => array(
				'label' => T_('Direction'),
				'note' => T_('How to sort the items'),
				'type' => 'radio',
				'options' => array( array( 'ASC', T_('Ascending') ),
									array( 'DESC', T_('Descending') ) ),
				'defaultvalue' => 'DESC',
			),
			'blog_ID' => array(
				'label' => T_('Collection'),
				'note' => T_('ID of the collection to use, leave empty for the current collection.'),
				'size' => 4,
				'type' => 'integer',
				'allow_empty' => true,
			),
		), parent::get_param_definitions( $params )	);

		return $r;
	}


	/**
	 * Get help URL
	 *
	 * @return string URL
	 */
	function get_help_url()
	{
		return get_manual_url( 'photo-index-widget' );
	}


	/**
	 * Get name of widget
	 */
	function get_name()
	{
		return T_('Photo index');
	}


	/**
	 * Get a very short desc. Used in the widget list.
	 */
	function get_short_desc()
	{
		return format_to_output($this->disp_params['title']);
	}


	/**
	 * Get short description
	 */
	function get_desc()
	{
		return T_('Index of photos; click goes to original image post.');
	}


	/**
	 * Prepare display params
	 *
	 * @param array MUST contain at least the basic display params
	 */
	function init_display( $params )
	{
		parent::init_display( $params );

		if( $this->disp_params['item_visibility'] == 'all' )
		{ // Don't cache the widget when we display the images of posts with ALL statuses
			$this->disp_params[ 'allow_blockcache' ] = 0;
		}
	}


	/**
	 * Display the widget!
	 *
	 * @param array MUST contain at least the basic display params
	 */
	function display( $params )
	{
		global $localtimenow, $DB, $Blog;

		$this->init_display( $params );

		$blog_ID = intval( $this->disp_params['blog_ID'] );
		if( empty( $blog_ID ) )
		{ // Use current blog by default
			$blog_ID = $Blog->ID;
		}

		$BlogCache = & get_BlogCache();
		if( ! $BlogCache->get_by_ID( $blog_ID, false, false ) )
		{ // No blog exists
			return;
		}

		// Display photos:
		// TODO: permissions, complete statuses...
		// TODO: A FileList object based on ItemListLight but adding File data into the query?
		//          overriding ItemListLigth::query() for starters ;)

		// Init caches
		$FileCache = & get_FileCache();
		$ItemCache = & get_ItemCache();

		// Query list of files and posts fields:
		// Note: We use ItemQuery to get attachments from all posts which should be visible ( even in case of aggregate blogs )
		$ItemQuery = new ItemQuery( $ItemCache->dbtablename, $ItemCache->dbprefix, $ItemCache->dbIDname );
		$ItemQuery->SELECT( 'post_ID, post_datestart, post_datemodified, post_main_cat_ID, post_urltitle, post_canonical_slug_ID,
									post_tiny_slug_ID, post_ityp_ID, post_title, post_excerpt, post_url, file_ID, file_type,
									file_title, file_root_type, file_root_ID, file_path, file_alt, file_desc, file_path_hash' );
		$ItemQuery->FROM_add( 'INNER JOIN T_links ON post_ID = link_itm_ID' );
		$ItemQuery->FROM_add( 'INNER JOIN T_files ON link_file_ID = file_ID' );
		$ItemQuery->where_chapter( $blog_ID );
		if( $this->disp_params['item_visibility'] == 'public' )
		{ // Get images only of the public items
			$ItemQuery->where_visibility( array( 'published' ) );
		}
		else
		{ // Get image of all available posts for current user
			$ItemQuery->where_visibility( NULL );
		}
		$ItemQuery->WHERE_and( '( file_type = "image" ) OR ( file_type IS NULL )' );
		$ItemQuery->WHERE_and( 'post_datestart <= \''.remove_seconds( $localtimenow ).'\'' );
		$ItemQuery->WHERE_and( 'link_position != "cover"' );
		if( !empty( $this->disp_params['item_type'] ) )
		{ // Get items only with specified type
			$ItemQuery->WHERE_and( 'post_ityp_ID = '.intval( $this->disp_params['item_type'] ) );
		}
		$ItemQuery->GROUP_BY( 'link_ID' );

		// fp> TODO: because no way of getting images only, we get 4 times more data than requested and hope that 25% at least will be images :/
		// asimo> This was updated and we get images and those files where we don't know the file type yet. Now we get 2 times more data than requested.
		// Maybe it would be good to get only the requested amount of files, because after a very short period the file types will be set for all images.
		$ItemQuery->LIMIT( intval( $this->disp_params['limit'] ) * 2 );

		$ItemQuery->ORDER_BY(	gen_order_clause( $this->disp_params['order_by'], $this->disp_params['order_dir'],
											'post_', 'post_ID '.$this->disp_params['order_dir'].', link_ID' ) );

		// Init FileList with the above defined query
		$FileList = new DataObjectList2( $FileCache );
		$FileList->sql = $ItemQuery->get();

		$FileList->query( false, false, false, 'Media index widget' );

		$layout = $this->disp_params['thumb_layout'];

		$nb_cols = $this->disp_params['grid_nb_cols'];
		$count = 0;
		$r = '';
		/**
		 * @var File
		 */
		while( $File = & $FileList->get_next() )
		{
			if( $count >= $this->disp_params['limit'] )
			{	// We have enough images already!
				break;
			}

			if( ! $File->is_image() )
			{ // Skip anything that is not an image
				// Only images are selected or those files where we don't know the file type yet.
				// This check is only for those files where we don't know the filte type. The file type will be set during the check.
				continue;
			}

			if( $layout == 'grid' )
			{ // Grid layout
				if( $count % $nb_cols == 0 )
				{
					$r .= $this->disp_params['grid_colstart'];
				}
				$r .= $this->disp_params['grid_cellstart'];
			}
			elseif( $layout == 'flow' )
			{ // Flow block layout
				$r .= $this->disp_params['flow_block_start'];
			}
			else
			{ // List layout
				$r .= $this->disp_params['item_start'];
			}

			// 1/ Hack a dirty permalink( will redirect to canonical):
			// $link = url_add_param( $Blog->get('url'), 'p='.$post_ID );

			// 2/ Hack a link to the right "page". Very daring!!
			// $link = url_add_param( $Blog->get('url'), 'paged='.$count );

			// 3/ Instantiate a light object in order to get permamnent url:
			$ItemLight = new ItemLight( $FileList->get_row_by_idx( $FileList->current_idx - 1 ) );	// index had already been incremented

			$r .= '<a href="'.$ItemLight->get_permanent_url().'">';
			// Generate the IMG THUMBNAIL tag with all the alt, title and desc if available
			$r .= $File->get_thumb_imgtag( $this->disp_params['thumb_size'], '', '', $ItemLight->title );
			$r .= '</a>';
			if( $this->disp_params['disp_image_title'] )
			{ // Dislay title of image or item
				$title = ( $File->get( 'title' ) ) ? $File->get( 'title' ) : $ItemLight->title;
				if( ! empty( $title ) )
				{
					$r .= '<span class="note">'.$title.'</span>';
				}
			}

			++$count;

			if( $layout == 'grid' )
			{ // Grid layout
				$r .= $this->disp_params['grid_cellend'];
				if( $count % $nb_cols == 0 )
				{
					$r .= $this->disp_params['grid_colend'];
				}
			}
			elseif( $layout == 'flow' )
			{ // Flow block layout
				$r .= $this->disp_params['flow_block_end'];
			}
			else
			{ // List layout
				$r .= $this->disp_params['item_end'];
			}
		}

		// Exit if no files found
		if( empty($r) ) return;

		echo $this->disp_params['block_start'];

		// Display title if requested
		$this->disp_title();

		echo $this->disp_params['block_body_start'];

		if( $layout == 'grid' )
		{ // Grid layout
			echo $this->disp_params['grid_start'];
		}
		elseif( $layout == 'flow' )
		{ // Flow block layout
			echo $this->disp_params['flow_start'];
		}
		else
		{ // List layout
			echo $this->disp_params['list_start'];
		}

		echo $r;

		if( $layout == 'grid' )
		{ // Grid layout
			if( $count && ( $count % $nb_cols != 0 ) )
			{
				echo $this->disp_params['grid_colend'];
			}

			echo $this->disp_params['grid_end'];
		}
		elseif( $layout == 'flow' )
		{ // Flow block layout
			echo $this->disp_params['flow_end'];
		}
		else
		{ // List layout
			echo $this->disp_params['list_end'];
		}

		echo $this->disp_params['block_body_end'];

		echo $this->disp_params['block_end'];

		return true;
	}


	/**
	 * Maybe be overriden by some widgets, depending on what THEY depend on..
	 *
	 * @return array of keys this widget depends on
	 */
	function get_cache_keys()
	{
		global $Blog;

		$blog_ID = intval( $this->disp_params['blog_ID'] );
		if( empty( $blog_ID ) )
		{ // Use current blog by default
			$blog_ID = $Blog->ID;
		}

		return array(
				'wi_ID'         => $this->ID, // Have the widget settings changed?
				'set_coll_ID'   => $Blog->ID, // Have the settings of the blog changed? (ex: new skin)
				'cont_coll_ID'  => $blog_ID,  // Has the content of the displayed blog changed?
				'media_coll_ID' => $blog_ID,  // Have some media files attached to one of the blogs item?
			);
	}
}

?>