<?php
/**
 * This file implements the Wide Scroll plugin for b2evolution
 *
 * This is Ron's remix!
 * Includes code from the WordPress team -
 *  http://sourceforge.net/project/memberlist.php?group_id=51422
 *
 * b2evolution - {@link http://b2evolution.net/}
 * Released under GNU GPL License - {@link http://b2evolution.net/about/gnu-gpl-license}
 * @copyright (c)2003-2015 by Francois Planque - {@link http://fplanque.com/}
 *
 * @package plugins
 */
if( !defined('EVO_MAIN_INIT') ) die( 'Please, do not access this page directly.' );

/**
 * @package plugins
 */
class widescroll_plugin extends Plugin
{
	var $code = 'evo_widescroll';
	var $name = 'Wide scroll';
	var $priority = 100;
	var $version = '5.0.0';
	var $group = 'rendering';
	var $number_of_installs = 1;

	/**
	 * Init
	 */
	function PluginInit( & $params )
	{
		$this->short_desc = T_('Wide scroll');
		$this->long_desc = T_('This plugin allows to horizontally scroll through blocks of wide content.');
	}


	/**
	 * Define here default collection/blog settings that are to be made available in the backoffice.
	 *
	 * @param array Associative array of parameters.
	 * @return array See {@link Plugin::GetDefaultSettings()}.
	 */
	function get_coll_setting_definitions( & $params )
	{
		$default_params = array(
				'default_comment_rendering' => 'never'
			);

		if( isset( $params['blog_type'] ) )
		{	// Set the default settings depending on collection type:
			switch( $params['blog_type'] )
			{
				case 'forum':
				case 'manual':
					$default_params['default_post_rendering'] = 'never';
					break;
			}
		}

		return parent::get_coll_setting_definitions( array_merge( $params, $default_params ) );
	}


	/**
	 * Display Toolbar
	 */
	function DisplayCodeToolbar()
	{
		global $Hit;

		if( $Hit->is_lynx() )
		{ // let's deactivate toolbar on Lynx, because they don't work there.
			return false;
		}

		// Load js to work with textarea
		require_js( 'functions.js', 'blog', true, true );

		?><script type="text/javascript">
		//<![CDATA[
		var widescroll_buttons = new Array();

		function widescroll_button( id, text, tag_open, tag_close, title, style )
		{
			this.id = id;               // used to name the toolbar button
			this.text = text;           // label on button
			this.tag_open = tag_open;   // tag code to insert
			this.tag_close = tag_close; // tag code to insert
			this.title = title;         // title
			this.style = style;         // style on button
		}

		widescroll_buttons[widescroll_buttons.length] = new widescroll_button(
				'widescroll', 'wide scroll', '<div class="wide_scroll">', '</div>',
				'<?php echo TS_('Teaser break') ?>', ''
			);

		function widescroll_toolbar( title )
		{
			document.write( '<?php echo $this->get_template( 'toolbar_title_before' ); ?>' + title + '<?php echo $this->get_template( 'toolbar_title_after' ); ?>' );
			document.write( '<?php echo $this->get_template( 'toolbar_group_before' ); ?>' );
			for( var i = 0; i < widescroll_buttons.length; i++ )
			{
				var button = widescroll_buttons[i];
				document.write( '<input type="button" id="' + button.id + '" title="' + button.title + '"'
					+ ( typeof( button.style ) != 'undefined' ? ' style="' + button.style + '"' : '' ) + ' class="<?php echo $this->get_template( 'toolbar_button_class' ); ?>" data-func="widescroll_insert_tag|b2evoCanvas|'+i+'" value="' + button.text + '" />' );
			}
			document.write( '<?php echo $this->get_template( 'toolbar_group_after' ); ?>' );
		}

		function widescroll_insert_tag( canvas_field, i )
		{
			if( typeof( tinyMCE ) != 'undefined' && typeof( tinyMCE.activeEditor ) != 'undefined' && tinyMCE.activeEditor )
			{ // tinyMCE plugin is active now, we should focus cursor to the edit area
				tinyMCE.execCommand( 'mceFocus', false, tinyMCE.activeEditor.id );
			}
			// Insert tag text in area
			textarea_wrap_selection( canvas_field, widescroll_buttons[i].tag_open, widescroll_buttons[i].tag_close, 0 );
		}
		//]]>
		</script><?php

		echo $this->get_template( 'toolbar_before', array( '$toolbar_class$' => $this->code.'_toolbar' ) );
		?><script type="text/javascript">widescroll_toolbar( '<?php echo TS_('Wide scroll:'); ?> ' );</script><?php
		echo $this->get_template( 'toolbar_after' );

		return true;
	}


	/**
	 * Display a toolbar
	 *
	 * @todo dh> This seems to be a lot of Javascript. Please try exporting it in a
	 *       (dynamically created) .js src file. Then we could use cache headers
	 *       to let the browser cache it.
	 * @param array Associative array of parameters
	 * @return boolean did we display a toolbar?
	 */
	function AdminDisplayToolbar( & $params )
	{
		$allow_HTML = false;

		if( ! empty( $params['Item'] ) )
		{ // Item is set, get Blog from post
			$edited_Item = & $params['Item'];
			$Blog = & $edited_Item->get_Blog();
			// We editing an Item, Check if HTML is allowed for the post type:
			$allow_HTML = $edited_Item->get_type_setting( 'allow_html' );
		}

		if( empty( $Blog ) )
		{ // Item is not set, try global Blog
			global $Blog;
			if( empty( $Blog ) )
			{ // We can't get a Blog, this way "apply_rendering" plugin collection setting is not available
				return false;
			}
		}

		if( ! empty( $params['Comment'] ) )
		{	// We editing a Comment, Check if HTML is allowed for the comments of current Blog:
			$allow_HTML = $Blog->get_setting( 'allow_html_comment' );
		}

		if( ! $allow_HTML )
		{	// Only when HTML is allowed in post/comment
			return false;
		}

		$coll_setting_name = ( $params['target_type'] == 'Comment' ) ? 'coll_apply_comment_rendering' : 'coll_apply_rendering';
		$apply_rendering = $this->get_coll_setting( $coll_setting_name, $Blog );
		if( empty( $apply_rendering ) || $apply_rendering == 'never' )
		{ // Plugin is not enabled for current case, so don't display a toolbar:
			return false;
		}

		// Append css styles for tinymce editor area
		global $tinymce_content_css;
		if( empty( $tinymce_content_css ) )
		{ // Initialize first time
			$tinymce_content_css = array();
		}
		$tinymce_content_css[] = get_require_url( $this->get_plugin_url().'tinymce_editor.css', true, 'css' );

		// Print toolbar on screen
		return $this->DisplayCodeToolbar();
	}


	/**
	 * Event handler: Called when displaying editor toolbars.
	 *
	 * @param array Associative array of parameters
	 * @return boolean did we display a toolbar?
	 */
	function DisplayCommentToolbar( & $params )
	{
		if( ! empty( $params['Comment'] ) )
		{ // Comment is set, get Blog from comment
			$Comment = & $params['Comment'];
			if( !empty( $Comment->item_ID ) )
			{
				$comment_Item = & $Comment->get_Item();
				$Blog = & $comment_Item->get_Blog();
			}
		}

		if( empty( $Blog ) )
		{ // Comment is not set, try global Blog
			global $Blog;
			if( empty( $Blog ) )
			{ // We can't get a Blog, this way "apply_comment_rendering" plugin collection setting is not available
				return false;
			}
		}

		if( ! $Blog->get_setting( 'allow_html_comment' ) )
		{	// Only when HTML is allowed in comment
			return false;
		}

		$apply_rendering = $this->get_coll_setting( 'coll_apply_comment_rendering', $Blog );
		if( empty( $apply_rendering ) || $apply_rendering == 'never' )
		{ // Plugin is not enabled for current case, so don't display a toolbar:
			return false;
		}

		// Print toolbar on screen
		return $this->DisplayCodeToolbar();
	}


	/**
	 * Spits out the styles used
	 *
	 * @see Plugin::SkinBeginHtmlHead()
	 */
	function SkinBeginHtmlHead()
	{
		global $Blog;

		if( ! isset( $Blog ) || (
		    $this->get_coll_setting( 'coll_apply_rendering', $Blog ) == 'never' && 
		    $this->get_coll_setting( 'coll_apply_comment_rendering', $Blog ) == 'never' ) )
		{ // Don't load css/js files when plugin is not enabled
			return;
		}

		require_js( '#jquery#', 'blog' );
		require_js( $this->get_plugin_url().'jquery.scrollwide.min.js', true );
		require_css( $this->get_plugin_url().'jquery.scrollwide.css', true );
	}


	/**
	 * Perform rendering
	 *
	 * @see Plugin::RenderItemAsHtml()
	 */
	function RenderItemAsHtml( & $params )
	{
		return true;
	}
}

?>