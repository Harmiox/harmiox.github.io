<?php
/**
 * This file implements the UI controller for the dashboard.
 *
 * b2evolution - {@link http://b2evolution.net/}
 * Released under GNU GPL License - {@link http://b2evolution.net/about/gnu-gpl-license}
 *
 * @license GNU GPL v2 - {@link http://b2evolution.net/about/gnu-gpl-license}
 *
 * @copyright (c)2003-2015 by Francois Planque - {@link http://fplanque.com/}
 *
 * @package admin
 *
 * @todo add 5 plugin hooks. Will be widgetized later (same as SkinTag became Widgets)
 */
if( !defined('EVO_MAIN_INIT') ) die( 'Please, do not access this page directly.' );


// load dashboard functions
load_funcs( 'dashboard/model/_dashboard.funcs.php' );

/**
 * @var User
 */
global $current_User;

global $dispatcher, $allow_evo_stats, $blog;


if( empty( $_GET['blog'] ) )
{ // Use dashboard for selected blog only from GET request
	$blog = 0;
	unset( $Blog );
}

if( $blog )
{ // Collection dashboard
	if( ! $current_User->check_perm( 'blog_ismember', 'view', false, $blog ) )
	{ // We don't have permission for the requested blog (may happen if we come to admin from a link on a different blog)
		set_working_blog( 0 );
		unset( $Blog );
	}

	$AdminUI->set_path( 'collections', 'dashboard' );

	// Init params to display a panel with blog selectors
	$AdminUI->set_coll_list_params( 'blog_ismember', 'view', array( 'ctrl' => 'dashboard' ) );

	$AdminUI->breadcrumbpath_init( true, array( 'text' => T_('Collections'), 'url' => $admin_url.'?ctrl=dashboard&amp;blog=$blog$' ) );
	$AdminUI->breadcrumbpath_add( T_('Collection Dashboard'), $admin_url.'?ctrl=dashboard&amp;blog=$blog$' );

	// Set an url for manual page:
	$AdminUI->set_page_manual_link( 'collection-dashboard' );

	// We should activate toolbar menu items for this controller and action
	$activate_collection_toolbar = true;
}
else
{ // Site dashboard
	$AdminUI->set_path( 'site', 'dashboard' );

	$AdminUI->breadcrumbpath_init( false );
	$AdminUI->breadcrumbpath_add( T_('Site'), $admin_url.'?ctrl=dashboard' );
	$AdminUI->breadcrumbpath_add( T_('Site Dashboard'), $admin_url.'?ctrl=dashboard' );

	// Set an url for manual page:
	$AdminUI->set_page_manual_link( 'site-dashboard' );
}

// Load jquery UI to animate background color on change comment status and to transfer a comment to recycle bin
require_js( '#jqueryUI#' );

require_js( 'communication.js' ); // auto requires jQuery
// Load the appropriate blog navigation styles (including calendar, comment forms...):
require_css( $AdminUI->get_template( 'blog_base.css' ) ); // Default styles for the blog navigation
// Colorbox (a lightweight Lightbox alternative) allows to zoom on images and do slideshows with groups of images:
require_js_helper( 'colorbox' );

// Include files to work with charts
require_js( '#easypiechart#' );
require_css( 'jquery/jquery.easy-pie-chart.css' );

if( empty( $blog ) )
{ // Init JS to quick edit an order of the blogs in the table cell by AJAX
	init_field_editor_js( array(
			'field_prefix' => 'order-blog-',
			'action_url' => $admin_url.'?ctrl=dashboard&order_action=update&order_data=',
		) );
}

// Display <html><head>...</head> section! (Note: should be done early if actions do not redirect)
$AdminUI->disp_html_head();

// Display title, menu, messages, etc. (Note: messages MUST be displayed AFTER the actions)
$AdminUI->disp_body_top();

if( $blog )
{ // We want to look at a specific blog:

	// Begin payload block:
	// This div is to know where to display the message after overlay close:
	echo '<div class="first_payload_block">'."\n";

	$AdminUI->disp_payload_begin();

	echo '<h2 class="page-title">'.$Blog->dget( 'name' ).'</h2>';

	echo '<div class="row browse"><div class="col-lg-9 col-xs-12 floatleft">';

	load_class( 'items/model/_itemlist.class.php', 'ItemList' );

	$block_item_Widget = new Widget( 'dash_item' );

	$nb_blocks_displayed = 0;

	$blog_moderation_statuses = explode( ',', $Blog->get_setting( 'moderation_statuses' ) );
	$highest_publish_status = get_highest_publish_status( 'comment', $Blog->ID, false );
	$user_modeartion_statuses = array();

	foreach( $blog_moderation_statuses as $status )
	{
		if( ( $status !== $highest_publish_status ) && $current_User->check_perm( 'blog_comment!'.$status, 'edit', false, $blog ) )
		{
			$user_modeartion_statuses[] = $status;
		}
	}
	$user_perm_moderate_cmt = count( $user_modeartion_statuses );

	if( $user_perm_moderate_cmt )
	{
		/*
		 * COMMENTS:
		 */
		$CommentList = new CommentList2( $Blog );

		// Filter list:
		$CommentList->set_filters( array(
				'types' => array( 'comment','trackback','pingback' ),
				'statuses' => $user_modeartion_statuses,
				'user_perm' => 'moderate',
				'post_statuses' => array( 'published', 'community', 'protected' ),
				'order' => 'DESC',
				'comments' => 30,
			) );

		// Set param prefix for URLs
		$param_prefix = 'cmnt_fullview_';
		if( !empty( $CommentList->param_prefix ) )
		{
			$param_prefix = $CommentList->param_prefix;
		}

		// Get ready for display (runs the query):
		$CommentList->display_init();
	}

	if( $user_perm_moderate_cmt && $CommentList->result_num_rows )
	{ // We have comments awaiting moderation

		load_funcs( 'comments/model/_comment_js.funcs.php' );

		$nb_blocks_displayed++;

		$opentrash_link = get_opentrash_link( true, false, array(
				'class' => 'btn btn-default'
			) );
		$refresh_link = '<span class="floatright">'.action_icon( T_('Refresh comment list'), 'refresh', $admin_url.'?blog='.$blog, ' '.T_('Refresh'), 3, 4, array( 'onclick' => 'startRefreshComments( \''.request_from().'\' ); return false;', 'class' => 'btn btn-default' ) ).'</span> ';

		$show_statuses_param = $param_prefix.'show_statuses[]='.implode( '&amp;'.$param_prefix.'show_statuses[]=', $user_modeartion_statuses );
		$block_item_Widget->title = $refresh_link.$opentrash_link.T_('Comments awaiting moderation').
			' <a href="'.$admin_url.'?ctrl=comments&amp;blog='.$Blog->ID.'&amp;'.$show_statuses_param.'" style="text-decoration:none">'.
			'<span id="badge" class="badge badge-important">'.$CommentList->get_total_rows().'</span></a>'.
			get_manual_link( 'collection-dashboard' );

		echo '<div class="evo_content_block">';
		echo '<div id="comments_block" class="dashboard_comments_block">';

		$block_item_Widget->disp_template_replaced( 'block_start' );

		echo '<div id="comments_container">';

		// GET COMMENTS AWAITING MODERATION (the code generation is shared with the AJAX callback):
		show_comments_awaiting_moderation( $Blog->ID, $CommentList );

		echo '</div>';

		$block_item_Widget->disp_template_raw( 'block_end' );

		echo '</div>';
		echo '</div>';
	}

	/*
	 * RECENT POSTS awaiting moderation
	 */
	$post_moderation_statuses = explode( ',', $Blog->get_setting( 'post_moderation_statuses' ) );
	ob_start();
	foreach( $post_moderation_statuses as $status )
	{ // go through all statuses
		if( display_posts_awaiting_moderation( $status, $block_item_Widget ) )
		{ // a block was dispalyed for this status
			$nb_blocks_displayed++;
		}
	}
	$posts_awaiting_moderation_content = ob_get_contents();
	ob_clean();
	if( ! empty( $posts_awaiting_moderation_content ) )
	{
		echo '<div class="items_container evo_content_block">';
		echo $posts_awaiting_moderation_content;
		echo '</div>';
	}

	/*
	 * RECENTLY EDITED
	 */
	// Create empty List:
	$ItemList = new ItemList2( $Blog, NULL, NULL );

	// Filter list:
	$ItemList->set_filters( array(
			'visibility_array' => get_visibility_statuses( 'keys', array('trash') ),
			'orderby' => 'datemodified',
			'order' => 'DESC',
			'posts' => 5,
		) );

	// Get ready for display (runs the query):
	$ItemList->display_init();

	if( $ItemList->result_num_rows )
	{	// We have recent edits

		$nb_blocks_displayed++;

		if( $current_User->check_perm( 'blog_post_statuses', 'edit', false, $Blog->ID ) )
		{	// We have permission to add a post with at least one status:
			$block_item_Widget->global_icon( T_('Write a new post...'), 'new', '?ctrl=items&amp;action=new&amp;blog='.$Blog->ID, T_('New post').' &raquo;', 3, 4, array( 'class' => 'action_icon btn-primary' ) );
		}

		echo '<div class="items_container evo_content_block">';

		$block_item_Widget->title = T_('Recently edited');
		$block_item_Widget->disp_template_replaced( 'block_start' );

		while( $Item = & $ItemList->get_item() )
		{
			echo '<div class="dashboard_post dashboard_post_'.($ItemList->current_idx % 2 ? 'even' : 'odd' ).'" lang="'.$Item->get('locale').'">';
			// We don't switch locales in the backoffice, since we use the user pref anyway
			// Load item's creator user:
			$Item->get_creator_User();

/* OLD:
			$Item->status( array(
					'before' => '<div class="floatright"><span class="note status_'.$Item->status.'"><span>',
					'after'  => '</span></span></div>',
				) );
	NEW:
*/
			$Item->format_status( array(
					'template' => '<div class="floatright"><span class="note status_$status$"><span>$status_title$</span></span></div>',
				) );

			echo '<div class="dashboard_float_actions">';
			$Item->edit_link( array( // Link to backoffice for editing
					'before'    => ' ',
					'after'     => ' ',
					'class'     => 'ActionButton btn btn-primary w80px',
					'text'      => get_icon( 'edit_button' ).' '.T_('Edit')
				) );

			// Display images that are linked to this post:
			$Item->images( array(
					'before'              => '<div class="dashboard_thumbnails">',
					'before_image'        => '',
					'before_image_legend' => NULL,	// No legend
					'after_image_legend'  => NULL,
					'after_image'         => '',
					'after'               => '</div>',
					'image_size'          => 'crop-80x80',
					'limit'               => 1,
					// Optionally restrict to files/images linked to specific position: 'teaser'|'teaserperm'|'teaserlink'|'aftermore'|'inline'|'fallback'|'cover'
					'restrict_to_image_position' => 'cover,teaser,teaserperm,teaserlink,aftermore,inline',
					// Sort the attachments to get firstly "Cover", then "Teaser", and "After more" as last order
					'links_sql_select'    => ', CASE '
							.'WHEN link_position = "cover"      THEN "1" '
							.'WHEN link_position = "teaser"     THEN "2" '
							.'WHEN link_position = "teaserperm" THEN "3" '
							.'WHEN link_position = "teaserlink" THEN "4" '
							.'WHEN link_position = "aftermore"  THEN "5" '
							.'WHEN link_position = "inline"     THEN "6" '
							// .'ELSE "99999999"' // Use this line only if you want to put the other position types at the end
						.'END AS position_order',
					'links_sql_orderby'   => 'position_order, link_order',
				) );
			echo '</div>';

			echo '<div class="dashboard_content">';

			echo '<h3 class="dashboard_post_title">';
			$item_title = $Item->dget('title');
			if( ! strlen($item_title) )
			{
				$item_title = '['.format_to_output(T_('No title')).']';
			}
			echo '<a href="?ctrl=items&amp;blog='.$Blog->ID.'&amp;p='.$Item->ID.'">'.$item_title.'</a>';
			echo '</h3>';

			echo htmlspecialchars( $Item->get_content_excerpt( 150 ), NULL, $evo_charset );

			echo '</div>';

			echo '<div class="clear"></div>';
			echo '</div>';
		}

		echo '</div>';

		$block_item_Widget->disp_template_raw( 'block_end' );
	}


	if( $nb_blocks_displayed == 0 )
	{	// We haven't displayed anything yet!

		$nb_blocks_displayed++;

		$block_item_Widget = new Widget( 'block_item' );
		$block_item_Widget->title = T_('Getting started');
		$block_item_Widget->disp_template_replaced( 'block_start' );

		echo '<p><strong>'.T_('Welcome to your new blog\'s dashboard!').'</strong></p>';

		echo '<p>'.T_('Use the links on the right to write a first post or to customize your blog.').'</p>';

		echo '<p>'.T_('You can see your blog page at any time by clicking "See" in the b2evolution toolbar at the top of this page.').'</p>';

 		echo '<p>'.T_('You can come back here at any time by clicking "Manage" in that same evobar.').'</p>';

		$block_item_Widget->disp_template_raw( 'block_end' );
	}


	/*
	 * DashboardBlogMain to be added here (anyone?)
	 */


	echo '</div><div class="col-lg-3 col-xs-12 floatright">';

	/*
	 * RIGHT COL
	 */

	$side_item_Widget = new Widget( 'side_item' );

	$perm_options_edit = $current_User->check_perm( 'options', 'edit' );
	$perm_blog_properties = $current_User->check_perm( 'blog_properties', 'edit', false, $Blog->ID );
	// Set column size of the right blocks for bootstrap skin depending on current user permissions
	if( $perm_options_edit && $perm_blog_properties )
	{
		$right_block_col_size = '4';
	}
	elseif( $perm_options_edit || $perm_blog_properties )
	{
		$right_block_col_size = '6';
	}
	else
	{
		$right_block_col_size = '12';
	}

	echo '<div class="row dashboard_sidebar_panels"><div class="col-lg-12 col-sm-'.$right_block_col_size.' col-xs-12">';

	$side_item_Widget->title = T_('Manage this collection');
	$side_item_Widget->disp_template_replaced( 'block_start' );

	echo '<div class="dashboard_sidebar">';
	echo '<ul>';
		if( $current_User->check_perm( 'blog_post_statuses', 'edit', false, $Blog->ID ) )
		{
			echo '<li><a href="'.$dispatcher.'?ctrl=items&amp;action=new&amp;blog='.$Blog->ID.'">'.T_('Write a new post').' &raquo;</a></li>';
		}

 		echo '<li>'.T_('Browse').':<ul>';
		echo '<li><a href="'.$dispatcher.'?ctrl=items&tab=full&filter=restore&blog='.$Blog->ID.'">'.T_('Posts (full)').' &raquo;</a></li>';
		echo '<li><a href="'.$dispatcher.'?ctrl=items&tab=type&tab_type=posts&filter=restore&blog='.$Blog->ID.'">'.T_('Posts (list)').' &raquo;</a></li>';
		if( $current_User->check_perm( 'blog_comments', 'edit', false, $Blog->ID ) )
		{
			echo '<li><a href="'.$dispatcher.'?ctrl=comments&amp;filter=restore&amp;blog='.$Blog->ID.'">'.T_('Comments').' &raquo;</a></li>';
		}
		echo '</ul></li>';

		if( $current_User->check_perm( 'blog_cats', '', false, $Blog->ID ) )
		{
			echo '<li><a href="'.$dispatcher.'?ctrl=chapters&blog='.$Blog->ID.'">'.T_('Edit categories').' &raquo;</a></li>';
		}

		echo '<li><a href="'.$Blog->get('url').'">'.T_('View this collection').'</a></li>';
	echo '</ul>';
	echo '</div>';

	$side_item_Widget->disp_template_raw( 'block_end' );

	echo '</div>';

	if( $perm_blog_properties )
	{
		echo '<div class="col-lg-12 col-sm-'.$right_block_col_size.' col-xs-12">';

		$side_item_Widget->title = T_('Customize this collection');
		$side_item_Widget->disp_template_replaced( 'block_start' );

		echo '<div class="dashboard_sidebar">';
		echo '<ul>';

		echo '<li><a href="'.$dispatcher.'?ctrl=coll_settings&amp;tab=general&amp;blog='.$Blog->ID.'">'.T_('Blog properties').' &raquo;</a></li>';
		echo '<li><a href="'.$dispatcher.'?ctrl=coll_settings&amp;tab=features&amp;blog='.$Blog->ID.'">'.T_('Blog features').' &raquo;</a></li>';
		echo '<li><a href="'.$dispatcher.'?ctrl=coll_settings&amp;tab=skin&amp;blog='.$Blog->ID.'">'.T_('Blog skin').' &raquo;</a></li>';
		echo '<li><a href="'.$dispatcher.'?ctrl=widgets&amp;blog='.$Blog->ID.'">'.T_('Blog widgets').' &raquo;</a></li>';
		echo '<li><a href="'.$dispatcher.'?ctrl=coll_settings&amp;tab=urls&amp;blog='.$Blog->ID.'">'.T_('Blog URLs').' &raquo;</a></li>';

		echo '</ul>';
		echo '</div>';

		$side_item_Widget->disp_template_raw( 'block_end' );

		echo '</div>';
	}

	if( $perm_options_edit )
	{ // We have some serious admin privilege:

		// -- Collection stats -- //{
		$chart_data = array();

		// Posts
		$posts_sql_from = 'INNER JOIN T_categories ON cat_ID = post_main_cat_ID';
		$posts_sql_where = 'cat_blog_ID = '.$DB->quote( $blog );
		$chart_data[] = array(
				'title' => T_('Posts'),
				'value' => $post_all_counter = get_table_count( 'T_items__item', $posts_sql_where, $posts_sql_from ),
				'type'  => 'number',
			);
		// Slugs
		$slugs_sql_from = 'INNER JOIN T_items__item ON post_ID = slug_itm_ID '.$posts_sql_from;
		$slugs_sql_where = 'slug_type = "item" AND '.$posts_sql_where;
		$chart_data[] = array(
				'title' => T_('Slugs'),
				'value' => get_table_count( 'T_slug', $slugs_sql_where, $slugs_sql_from ),
				'type'  => 'number',
			);
		// Comments
		$comments_sql_from = 'INNER JOIN T_items__item ON post_ID = comment_item_ID '.$posts_sql_from;
		$comments_sql_where = $posts_sql_where;
		$chart_data[] = array(
				'title' => T_('Comments'),
				'value' => get_table_count( 'T_comments', $comments_sql_where, $comments_sql_from ),
				'type'  => 'number',
			);

		echo '<div class="col-lg-12 col-sm-'.$right_block_col_size.' col-xs-12">';

		$side_item_Widget->title = T_('Collection metrics');
		$side_item_Widget->disp_template_replaced( 'block_start' );

		display_charts( $chart_data );

		$side_item_Widget->disp_template_raw( 'block_end' );

		echo '</div>';
	}

	echo '</div>';

	/*
	 * DashboardBlogSide to be added here (anyone?)
	 */


	echo '</div><div class="clear"></div></div>';


	// End payload block:
	$AdminUI->disp_payload_end();

	echo '</div>'."\n";
}
else
{ // We're on the GLOBAL tab...
	$AdminUI->disp_payload_begin();
	// Display blog list VIEW:
	$AdminUI->disp_view( 'collections/views/_coll_list.view.php' );
	$AdminUI->disp_payload_end();


	/*
	 * DashboardGlobalMain to be added here (anyone?)
	 */
}


/*
 * Administrative tasks
 */

if( $current_User->check_perm( 'options', 'edit' ) )
{ // We have some serious admin privilege:
	/**
	 * @var AbstractSettings
	 */
	global $global_Cache;

	// Begin payload block:
	$AdminUI->disp_payload_begin();

	echo '<div class="row browse"><div class="col-lg-12">';

	if( empty( $blog ) )
	{ // -- System stats -- //

		$chart_data = array();
		// Users
		$chart_data[] = array(
				'title' => T_('Users'),
				'value' => get_table_count( 'T_users' ),
				'type'  => 'number',
			);
		// Blogs
		$chart_data[] = array(
				'title' => T_('Blogs'),
				'value' => get_table_count( 'T_blogs' ),
				'type'  => 'number',
			);
		$post_all_counter = get_table_count( 'T_items__item' );
		if( empty( $blog ) )
		{
			// Posts
			$chart_data[] = array(
					'title' => T_('Posts'),
					'value' => $post_all_counter,
					'type'  => 'number',
				);
		}
		if( empty( $blog ) )
		{
			// Slugs
			$chart_data[] = array(
					'title' => T_('Slugs'),
					'value' => get_table_count( 'T_slug' ),
					'type'  => 'number',
				);
			// Comments
			$chart_data[] = array(
					'title' => T_('Comments'),
					'value' => get_table_count( 'T_comments' ),
					'type'  => 'number',
				);
		}
		// Files
		$chart_data[] = array(
				'title' => T_('Files'),
				'value' => get_table_count( 'T_files' ),
				'type'  => 'number',
			);
		// Conversations
		$chart_data[] = array(
				'title' => T_('Conversations'),
				'value' => get_table_count( 'T_messaging__thread' ),
				'type'  => 'number',
			);
		// Messages
		$chart_data[] = array(
				'title' => T_('Messages'),
				'value' => get_table_count( 'T_messaging__message' ),
				'type'  => 'number',
			);

		$stat_item_Widget = new Widget( 'block_item' );

		$stat_item_Widget->title = T_('System metrics');
		$stat_item_Widget->disp_template_replaced( 'block_start' );

		display_charts( $chart_data );

		$stat_item_Widget->disp_template_raw( 'block_end' );

	} //---- END OF - System stats ----//

	$block_item_Widget = new Widget( 'block_item' );

	$block_item_Widget->title = T_('Updates from b2evolution.net');
	$block_item_Widget->disp_template_replaced( 'block_start' );


	// Note: hopefully, the updates will have been downloaded in the shutdown function of a previous page (including the login screen)
	// However if we have outdated info, we will load updates here.

	// Let's clear any remaining messages that should already have been displayed before...
	$Messages->clear();

	if( b2evonet_get_updates() !== NULL )
	{	// Updates are allowed, display them:

		// Display info & error messages
		$Messages->display();

		$version_status_msg = $global_Cache->get( 'version_status_msg' );
		if( !empty($version_status_msg) )
		{	// We have managed to get updates (right now or in the past):
			echo '<p>'.$version_status_msg.'</p>';
			$extra_msg = $global_Cache->get( 'extra_msg' );
			if( !empty($extra_msg) )
			{
				echo '<p>'.$extra_msg.'</p>';
			}
		}

		$block_item_Widget->disp_template_replaced( 'block_end' );

		/*
		 * DashboardAdminMain to be added here (anyone?)
		 */
	}
	else
	{
		echo '<p>Updates from b2evolution.net are disabled!</p>';
		echo '<p>You will <b>NOT</b> be alerted if you are running an insecure configuration.</p>';
	}

	// Track just the first login into b2evolution to determine how many people installed manually vs automatic installs:
	if( $current_User->ID == 1 && $UserSettings->get('first_login') == NULL )
	{
		echo 'This is the Admin\'s first ever login.';
		echo '<img src="http://b2evolution.net/htsrv/track.php?key=first-ever-login" alt="" />';
		// OK, done. Never do this again from now on:
		$UserSettings->set('first_login', $localtimenow ); // We might actually display how long the system has been running somewhere
		$UserSettings->dbupdate();
	}


	/*
	 * DashboardAdminSide to be added here (anyone?)
	 */

	echo '</div></div>';

	// End payload block:
	$AdminUI->disp_payload_end();
}

if( ! empty( $chart_data ) )
{ // JavaScript to initialize charts
?>
<script type="text/javascript">
jQuery( 'document' ).ready( function()
{
	var chart_params = {
		barColor: function(percent)
		{
			return get_color_by_percent( {r:97, g:189, b:79}, {r:242, g:214, b:0}, {r:255, g:171, b:74}, percent );
		},
		size: 75,
		trackColor: '#eee',
		scaleColor: false,
		lineCap: 'round',
		lineWidth: 6,
		animate: 700
	}
	jQuery( '.chart .number' ).easyPieChart( chart_params );
} );

function get_color_by_percent( color_from, color_middle, color_to, percent )
{
	function get_color_hex( start_color, end_color )
	{
		num = start_color + Math.round( ( end_color - start_color ) * ( percent / 100 ) );
		num = Math.min( num, 255 ); // not more than 255
		num = Math.max( num, 0 ); // not less than 0
		var str = num.toString( 16 );
		if( str.length < 2 )
		{
			str = "0" + str;
		}
		return str;
	}

	if( percent < 50 )
	{
		color_to = color_middle;
		percent *= 2;
	}
	else
	{
		color_from = color_middle;
		percent = ( percent - 50 ) * 2;
	}

	return "#" +
		get_color_hex( color_from.r, color_to.r ) +
		get_color_hex( color_from.g, color_to.g ) +
		get_color_hex( color_from.b, color_to.b );
}
</script>
<?php
}

// Display body bottom, debug info and close </html>:
$AdminUI->disp_global_footer();

?>