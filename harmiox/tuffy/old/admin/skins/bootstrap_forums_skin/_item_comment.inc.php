<?php
/**
 * This is the template that displays a single comment
 *
 * This file is not meant to be called directly.
 *
 * b2evolution - {@link http://b2evolution.net/}
 * Released under GNU GPL License - {@link http://b2evolution.net/about/gnu-gpl-license}
 * @copyright (c)2003-2015 by Francois Planque - {@link http://fplanque.com/}
 *
 * @package evoskins
 */
if( !defined('EVO_MAIN_INIT') ) die( 'Please, do not access this page directly.' );
global $comment_template_counter, $cat;

// Default params:
$params = array_merge( array(
		'comment_start'         => '<article class="evo_comment panel panel-default">',
		'comment_end'           => '</article>',

		'comment_post_display'	=> true,	// Do we want ot display the title of the post we're referring to?
		'comment_post_before'   => '<h4 class="evo_comment_post_title ellipsis">',
		'comment_post_after'    => '</h4>',

		'comment_title_before'  => '<div class="panel-heading posts_panel_title_wrapper"><div class="cell1 ellipsis"><h4 class="evo_comment_title panel-title">',
		'comment_status_before' => '</h4></div>',
		'comment_title_after'   => '</div>',

		'comment_avatar_before' => '<div class="panel-body"><span class="evo_comment_avatar col-md-1 col-sm-2">',
		'comment_avatar_after'  => '</span>',
		'comment_rating_before' => '<div class="evo_comment_rating">',
		'comment_rating_after'  => '</div>',
		'comment_text_before'   => '<div class="evo_comment_text col-md-11 col-sm-10">',
		'comment_text_after'    => '</div>',
		'comment_info_before'   => '<footer class="evo_comment_footer clear text-muted"><small>',
		'comment_info_after'    => '</small></footer></div>',
		'link_to'               => 'userurl>userpage', // 'userpage' or 'userurl' or 'userurl>userpage' or 'userpage>userurl'
		'author_link_text'      => 'name', // avatar_name | avatar_login | only_avatar | name | login | nickname | firstname | lastname | fullname | preferredname
		'before_image'          => '<figure class="evo_image_block">',
		'before_image_legend'   => '<figcaption class="evo_image_legend">',
		'after_image_legend'    => '</figcaption>',
		'after_image'           => '</figure>',
		'image_size'            => 'fit-1280x720',
		'image_class'           => 'img-responsive',
		'Comment'               => NULL, // This object MUST be passed as a param!
		'display_vote_helpful'  => true,
	), $params );
	
// In this skin, it makes no sense to navigate in any different mode than "same category"
// Use the category from param
$current_cat = param( 'cat', 'integer', 0 );
if( $current_cat == 0 )
{ // Use main category by default because the category wasn't set
	$current_cat = $Item->main_cat_ID;
}

if( ! isset( $comment_template_counter ) )
{
$comment_template_counter = isset( $params['comment_number'] ) ? $params['comment_number'] : 1;
if( $disp == 'single' || $disp == 'post' )
	{ // Increase a number, because Item has 1st number
		$comment_template_counter++;
	}
}
/**
 * @var Comment
 */
$Comment = & $params['Comment'];

$comment_class = 'vs_'.$Comment->status;

// Load comment's Item object:
$Comment->get_Item();


$Comment->anchor();
echo '<article class="'.$comment_class.' evo_comment panel panel-default" id="comment_'.$Comment->ID.'">';

// Title
echo $params['comment_title_before'];
switch( $Comment->get( 'type' ) )
{
	// ON *DISP = COMMENTS* SHOW THE FOLLOWING TITLE FOR EACH COMMENT
	case $disp == 'comments': // Display a comment:
	?><a href="<?php echo $Comment->get_permanent_url(); ?>" class="permalink">#<?php echo $comment_template_counter; ?></a> <?php
		if( empty($Comment->ID) )
		{	// PREVIEW comment
			echo '<span class="evo_comment_type_preview">'.T_('PREVIEW Comment from:').'</span> ';
		}
		else
		{	// Normal comment
			$Comment->permanent_link( array(
					'before'    => '',
					'after'     => ' '.T_('from:').' ',
					'text'      => T_('Comment'),
					'class'		=> 'evo_comment_type',
					'nofollow'  => true,
				) );
		}

		$Comment->author2( array(
				'before'       => ' ',
				'after'        => '#',
				'before_user'  => '',
				'after_user'   => '#',
				'format'       => 'htmlbody',
				'link_to'      => $params['link_to'],		// 'userpage' or 'userurl' or 'userurl>userpage' or 'userpage>userurl'
				'link_text'    => $params['author_link_text'],
			) );
			
		// Post title
		if( $params['comment_post_display'] )
		{
			echo $params['comment_post_before'];
			echo ' '.T_('in response to:').' ';
			$Comment->Item->title( array(
					'link_type' => 'permalink',
				) );
			echo $params['comment_post_after'];
		}

		if( ! $Comment->get_author_User() )
		{ // Display action icon to message only if this comment is from a visitor
			$Comment->msgform_link( $Blog->get( 'msgformurl' ) );
		}
		break;
		
	// ON *DISP = SINGLE* SHOW THE FOLLOWING TITLE FOR EACH COMMENT
	case 'comment': // Display a comment:
		?><a href="<?php echo $Comment->get_permanent_url(); ?>" class="permalink">#<?php echo $comment_template_counter; ?></a> <?php
		if( empty($Comment->ID) )
		{	// PREVIEW comment
			echo '<span class="evo_comment_type_preview">'.T_('PREVIEW Comment from:').'</span> ';
		}
		else
		{	// Normal comment
			$Comment->permanent_link( array(
					'before'    => '',
					'after'     => ' '.T_('from:').' ',
					'text'      => T_('Comment'),
					'class'		=> 'evo_comment_type',
					'nofollow'  => true,
				) );
		}

		$Comment->author2( array(
				'before'       => ' ',
				'after'        => '#',
				'before_user'  => '',
				'after_user'   => '#',
				'format'       => 'htmlbody',
				'link_to'      => $params['link_to'],		// 'userpage' or 'userurl' or 'userurl>userpage' or 'userpage>userurl'
				'link_text'    => $params['author_link_text'],
			) );

		if( ! $Comment->get_author_User() )
		{ // Display action icon to message only if this comment is from a visitor
			$Comment->msgform_link( $Blog->get( 'msgformurl' ) );
		}
		break;

	case 'trackback': // Display a trackback:
		$Comment->permanent_link( array(
				'before'    => '',
				'after'     => ' '.T_('from:').' ',
				'text' 		=> T_('Trackback'),
				'class'		=> 'evo_comment_type',
				'nofollow'	=> true,
			) );
		$Comment->author( '', '#', '', '#', 'htmlbody', true, $params['author_link_text'] );
		break;

	case 'pingback': // Display a pingback:
		$Comment->permanent_link( array(
				'before'    => '',
				'after'     => ' '.T_('from:').' ',
				'text' 		=> T_('Pingback'),
				'class'		=> 'evo_comment_type',
				'nofollow'	=> true,
			) );
		$Comment->author( '', '#', '', '#', 'htmlbody', true, $params['author_link_text'] );
		break;
}

echo $params['comment_status_before'];

// Status banners
if( $Skin->enabled_status_banner( $Comment->status ) && $Comment->ID > 0 )
{ // Don't display status for previewed comments
		$Comment->format_status( array(
				'template' => '<div class="cell2"><div class="evo_status evo_status__$status$ badge pull-right">$status_title$</div></div>',
			) );
		$legend_statuses[] = $Comment->status;
}

echo $params['comment_title_after'];

// Avatar:
echo $params['comment_avatar_before'];
$Comment->author2( array(
					'link_text'  => 'only_avatar',
					'thumb_size' => 'crop-top-80x80',
				) );
echo $params['comment_avatar_after'];

// Rating:
$Comment->rating( array(
		'before' => $params['comment_rating_before'],
		'after'  => $params['comment_rating_after'],
	) );

// Text:
echo $params['comment_text_before'];

$Comment->content( 'htmlbody', false, true, $params );

echo $params['comment_text_after'];

// Info:
echo $params['comment_info_before'];
	$commented_Item = & $Comment->get_Item();
	$Comment->date(); echo ' @ '; $Comment->time( '#short_time' );
echo $params['comment_info_after'];

/* ======================== START OF COMMENT FOOTER ======================== */
?>
<div class="panel-footer small clearfix">
		<a href="<?php
		if( $disp == 'comments' )
		{	// We are displaying a comment in the Latest comments page:
			echo $Blog->get('lastcommentsurl');
		}
		else
		{	// We are displaying a comment under a post/topic:
			echo $Item->get_permanent_url();
		}
		?>#skin_wrapper" class="to_top"><?php echo T_('Back to top'); ?></a>
	<?php
	// Check if BBcode plugin is enabled for current blog
	$bbcode_plugin_is_enabled = false;
	if( class_exists( 'bbcode_plugin' ) )
	{ // Plugin exists
		global $Plugins;
		$bbcode_Plugin = & $Plugins->get_by_classname( 'bbcode_plugin' );
		if( $bbcode_Plugin->status == 'enabled' && $bbcode_Plugin->get_coll_setting( 'coll_apply_comment_rendering', $Blog ) != 'never' )
		{ // Plugin is enabled and activated for comments
			$bbcode_plugin_is_enabled = true;
		}
	}
	if( $bbcode_plugin_is_enabled && $commented_Item && $commented_Item->can_comment( NULL ) )
	{ // Display button to quote this comment
		echo '<a href="'.$commented_Item->get_permanent_url().'?mode=quote&amp;qc='.$Comment->ID.'#form_p'.$commented_Item->ID.'" title="'.T_('Reply with quote').'" class="'.button_class( 'text' ).' pull-left quote_button">'.get_icon( 'comments', 'imgtag', array( 'title' => T_('Reply with quote') ) ).' '.T_('Quote').'</a>';
	}

	$Comment->reply_link( ' ', ' ', '#', '#', 'pull-left' ); /* Link for replying to the Comment */

	if( $params['display_vote_helpful'] )
	{ // Display a voting tool
		$Comment->vote_helpful( '', '', '&amp;', true, true, array(
				'helpful_text'    => T_('Is this reply helpful?'),
				'title_yes'       => T_('Mark this reply as helpful!'),
				'title_yes_voted' => T_('You think this reply is helpful'),
				'title_no'        => T_('Mark this reply as not helpful!'),
				'title_no_voted'  => T_('You think this reply is not helpful'),
				'class'           => 'vote_helpful'
			) );
	}

	// Display Spam Voting system
	$Comment->vote_spam( '', '', '&amp;', true, true, array(
			'title_spam'          => T_('Mark this reply as spam!'),
			'title_spam_voted'    => T_('You think this reply is spam'),
			'title_notsure'       => T_('Mark this reply as not sure!'),
			'title_notsure_voted' => T_('You are not sure in this reply'),
			'title_ok'            => T_('Mark this reply as OK!'),
			'title_ok_voted'      => T_('You think this reply is OK'),
		) );

	echo '<div class="pull-right">';
		$comment_redirect_url = rawurlencode( $Comment->get_permanent_url() );
		$Comment->edit_link( ' ', '', '#', T_('Edit this reply'), button_class( 'text' ), '&amp;', true, $comment_redirect_url ); /* Link for editing */
		echo ' <span class="'.button_class( 'group' ).'">';
		$delete_button_is_displayed = is_logged_in() && $current_User->check_perm( 'comment!CURSTATUS', 'delete', false, $Comment );
		$Comment->moderation_links( array(
				'ajax_button' => true,
				'class'       => button_class( 'text' ),
				'redirect_to' => $comment_redirect_url,
				'detect_last' => !$delete_button_is_displayed,
			) );
		$Comment->delete_link( '', '', '#', T_('Delete this reply'), button_class( 'text' ), false, '&amp;', true, false, '#', rawurlencode( $commented_Item->get_permanent_url() ) ); /* Link to backoffice for deleting */

		echo '</span>';
	echo '</div>';
?>
</div>

<?php echo $params['comment_end'];

$comment_template_counter++;
?>