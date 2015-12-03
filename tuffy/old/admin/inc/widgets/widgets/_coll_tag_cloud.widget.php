<?php
/**
 * This file implements the xyz Widget class.
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

/**
 * ComponentWidget Class
 *
 * A ComponentWidget is a displayable entity that can be placed into a Container on a web page.
 *
 * @package evocore
 */
class coll_tag_cloud_Widget extends ComponentWidget
{
	/**
	 * Constructor
	 */
	function coll_tag_cloud_Widget( $db_row = NULL )
	{
		// Call parent constructor:
		parent::ComponentWidget( $db_row, 'core', 'coll_tag_cloud' );
	}


	/**
	 * Load params
	 */
	function load_from_Request()
	{
		parent::load_from_Request();

		// SPECIAL treatments:
		if( empty($this->param_array['tag_separator']) )
		{	// Default name, don't store:
			$this->set( 'tag_separator', ' ' );
		}
	}


	/**
	 * Get help URL
	 *
	 * @return string URL
	 */
	function get_help_url()
	{
		return get_manual_url( 'tag-cloud-widget' );
	}


	/**
	 * Get name of widget
	 */
	function get_name()
	{
		return T_('Tag cloud');
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
		return T_('Cloud of all tags; click filters blog on selected tag.');
	}


	/**
	 * Get definitions for editable params
	 *
	 * @see Plugin::GetDefaultSettings()
	 * @param local params like 'for_editing' => true
	 */
	function get_param_definitions( $params )
	{
		$r = array_merge( array(
			'title' => array(
					'type' => 'text',
					'label' => T_('Block title'),
					'defaultvalue' => T_('Tag cloud'),
					'size' => 20,
					'maxlength' => 100,
				),
			'blog_ids' => array(
					'type' => 'text',
					'label' => T_('Source collections'),
					'note' => T_('Comma-separated list of collection IDs. Leave empty for current collection.'),
					'valid_pattern' => array( 'pattern' => '/^(\d+(,\d+)*)?$/',
													  'error' => T_('Invalid list of Collection IDs.') ),
				),
			'destination_coll_ID' => array(
					'type' => 'integer',
					'label' => T_('Destination collection'),
					'allow_empty' => true,
					'size' => 2,
					'note' => T_('Collection ID. Leave empty for automatic selection.'),
				),
			'max_tags' => array(
					'type' => 'integer',
					'label' => T_('Max # of tags'),
					'size' => 4,
					'defaultvalue' => 50,
				),
			'tag_separator' => array(
					'type' => 'text',
					'label' => T_('Tag separator'),
					'defaultvalue' => ' ',
					'size' => 2,
					'maxlength' => 100,
				),
			// fp> TODO: make an inline group of fields here:
			'tag_min_size' => array(
					'type' => 'integer',
					'label' => T_('Min size'),
					'size' => 3,
					'defaultvalue' => 8,
				),
			'tag_max_size' => array(
					'type' => 'integer',
					'label' => T_('Max size'),
					'size' => 3,
					'defaultvalue' => 22,
				),
			'tag_ordering' => array(
					'type' => 'select',
					'label' => T_('Ordering'),
					'options' => array( 'ASC'  => T_('Ascending'), 'RAND' => T_('Random') ),
					'defaultvalue' => 'ASC',
					'note' => T_('How to sort the tag cloud.'),
				),
			/* fp> TODO: I don't see anything to validate input/prevent SQL injection here!
			'filter_list' => array(
					'type' => 'textarea',
					'label' => T_('Filter tags'),
					'note' => T_('This is a comma separated list of tags to ignore.'),
					'size' => 40,
					'rows' => 2,
				),
				*/
			), parent::get_param_definitions( $params )	);

		// add limit default 100

		return $r;
	}


	/**
	 * Display the widget!
	 *
	 * @param array MUST contain at least the basic display params
	 */
	function display( $params )
	{
		$this->init_display( $params );

		global $blog;

		$BlogCache = & get_BlogCache();

		// Source collections:
		// Get a list of quoted blog IDs
		$blog_ids = sanitize_id_list($this->disp_params['blog_ids'], true);
		if( empty($blog) && empty($blog_ids) )
		{	// Nothing to display
			return;
		}
		elseif( empty($blog_ids) )
		{	// Use current Blog
			$blog_ids = $blog;
		}

		// Destination:
		if( $destination_coll_ID = $this->disp_params['destination_coll_ID'] )
		{	// Get destination Colelction, but allow error, in that case we'll get NULL
			$destination_Blog = $BlogCache->get_by_ID( $destination_coll_ID, false );
		}
		else
		{ // Auto destination:
			$destination_Blog = NULL;
		}

		$results = get_tags( $blog_ids, $this->disp_params['max_tags'], /* $this->disp_params['filter_list'] */ NULL, false );

		if( empty($results) )
		{	// No tags!
			return;
		}

		$max_count = $results[0]->tag_count;
		$min_count = $results[count($results)-1]->tag_count;
		$count_span = max( 1, $max_count - $min_count );
		$max_size = $this->disp_params['tag_max_size'];
		$min_size = $this->disp_params['tag_min_size'];
		$size_span = $max_size - $min_size;

		if($this->disp_params['tag_ordering'] == 'ASC')
		{
			usort($results, array($this, 'tag_cloud_cmp'));
		}
		elseif($this->disp_params['tag_ordering'] == 'RAND')
		{
			shuffle( $results );
		}

		echo $this->disp_params['block_start'];

		$this->disp_title();

		echo $this->disp_params['block_body_start'];

		echo $this->disp_params['tag_cloud_start'];

		$count = 0;
		foreach( $results as $row )
		{
			if( $count > 0 )
			{
				echo $this->disp_params['tag_separator'];
			}

			// If there's a space in the tag name, quote it:
			$tag_name_disp = strpos($row->tag_name, ' ')
				? '&laquo;'.format_to_output($row->tag_name, 'htmlbody').'&raquo;'
				: format_to_output($row->tag_name, 'htmlbody');

			$font_size = floor( $row->tag_count * $size_span / $count_span + $min_size );

			if( !is_null($destination_Blog) )
			{
				$l_Blog = $destination_Blog;
			}
			else
			{	// Automatic destination decision. Note: this may not be be best decision.
				$l_Blog = $BlogCache->get_by_ID( $row->cat_blog_ID );
			}

			echo $l_Blog->get_tag_link( $row->tag_name, $tag_name_disp, array(
				'style' => 'font-size:'.$font_size.'pt;',
				'title' => sprintf( T_('Display posts tagged with "%s"'), $row->tag_name ) ) );
			$count++;
		}
		echo $this->disp_params['tag_cloud_end'];

		echo $this->disp_params['block_body_end'];

		echo $this->disp_params['block_end'];

		return true;
	}


	function tag_cloud_cmp($a, $b)
	{
		return strcasecmp($a->tag_name, $b->tag_name);
	}
}
?>