<?php
/**
 * This file is part of the evoCore framework - {@link http://evocore.net/}
 * See also {@link https://github.com/b2evolution/b2evolution}.
 *
 * @license GNU GPL v2 - {@link http://b2evolution.net/about/gnu-gpl-license}
 *
 * @copyright (c)2009-2015 by Francois Planque - {@link http://fplanque.com/}
 * Parts of this file are copyright (c)2009 by The Evo Factory - {@link http://www.evofactory.com/}.
 *
 * @package evocore
 */

if( !defined('EVO_MAIN_INIT') ) die( 'Please, do not access this page directly.' );


global $Blog;

// Create query
$SQL = new SQL();
$SQL->SELECT( 't.*, IF( tb.itc_ityp_ID > 0, 1, 0 ) AS type_enabled' );
$SQL->FROM( 'T_items__type AS t' );
$SQL->FROM_add( 'LEFT JOIN T_items__type_coll AS tb ON itc_ityp_ID = ityp_ID AND itc_coll_ID = '.$Blog->ID );

// Create result set:
$Results = new Results( $SQL->get(), 'ityp_' );

$Results->title = T_('Item/Post/Page types').get_manual_link( 'managing-item-types' );

// get reserved and default ids
global $default_ids;
$default_ids = ItemType::get_default_ids();

/**
 * Callback to build possible actions depending on post type id
 *
 */
function get_actions_for_itemtype( $id )
{
	global $default_ids;
	$action = action_icon( T_('Duplicate this Post Type...'), 'copy',
										regenerate_url( 'action', 'ityp_ID='.$id.'&amp;action=new') );

	if( ! ItemType::is_reserved( $id ) )
	{ // Edit all post types except of not reserved post type
		$action = action_icon( T_('Edit this Post Type...'), 'edit',
										regenerate_url( 'action', 'ityp_ID='.$id.'&amp;action=edit') )
							.$action;
	}

	if( ! ItemType::is_special( $id ) && ! in_array( $id, $default_ids ) )
	{ // Delete only the not reserved and not default post types
		$action .= action_icon( T_('Delete this Post Type!'), 'delete',
									regenerate_url( 'action', 'ityp_ID='.$id.'&amp;action=delete&amp;'.url_crumb('itemtype').'') );
	}
	return $action;
}

/**
 * Callback to make post type name depending on post type id
 *
 */
function get_name_for_itemtype( $id, $name )
{
	global $current_User;

	if( ! ItemType::is_reserved( $id ) && $current_User->check_perm( 'options', 'edit' ) )
	{ // Not reserved id AND current User has permission to edit the global settings
		$ret_name = '<a href="'.regenerate_url( 'action,ID', 'ityp_ID='.$id.'&amp;action=edit' ).'">'.$name.'</a>';
	}
	else
	{
		$ret_name = $name;
	}

	return '<strong>'.$ret_name.'</strong>';
}


$Results->cols[] = array(
		'th' => T_('ID'),
		'order' => 'ityp_ID',
		'th_class' => 'shrinkwrap',
		'td_class' => 'shrinkwrap',
		'td' => '$ityp_ID$',
	);

function ityp_row_enabled( $enabled, $item_type_ID )
{
	if( ItemType::is_reserved( $item_type_ID ) )
	{ // It is reserved item type, Don't allow to enable this
		return '';
	}

	global $current_User, $admin_url, $Blog;

	$perm_edit = $current_User->check_perm( 'options', 'edit', false );

	if( $enabled )
	{ // Enabled
		if( $perm_edit && $Blog->can_be_item_type_disabled( $item_type_ID ) )
		{ // URL to disable the item type
			$status_url = $admin_url.'?ctrl=itemtypes&amp;action=disable&amp;ityp_ID='.$item_type_ID.'&amp;blog='.$Blog->ID.'&amp;'.url_crumb( 'itemtype' );
		}
		$status_icon = get_icon( 'bullet_green', 'imgtag', array( 'title' => T_('The item type is enabled.') ) );
	}
	else
	{ // Disabled
		if( $perm_edit )
		{ // URL to enable the item type
			$status_url = $admin_url.'?ctrl=itemtypes&amp;action=enable&amp;ityp_ID='.$item_type_ID.'&amp;blog='.$Blog->ID.'&amp;'.url_crumb( 'itemtype' );
		}
		$status_icon = get_icon( 'bullet_empty_grey', 'imgtag', array( 'title' => T_('The item type is disabled.') ) );
	}

	if( isset( $status_url ) )
	{
		return '<a href="'.$status_url.'">'.$status_icon.'</a>';
	}
	else
	{
		return $status_icon;
	}
}
$Results->cols[] = array(
		'th' => sprintf( T_('Enabled in<br />%s'), $Blog->get( 'shortname' ) ),
		'order' => 'ityp_perm_level',
		'td' => '%ityp_row_enabled( #type_enabled#, #ityp_ID# )%',
		'th_class' => 'shrinkwrap',
		'td_class' => 'center',
	);

function ityp_row_default( $item_type_ID )
{
	if( ItemType::is_reserved( $item_type_ID ) )
	{ // It is reserved item type, Don't allow to enable this
		return '';
	}

	global $current_User, $admin_url, $Blog;

	if( $Blog->get_setting( 'default_post_type' ) == $item_type_ID )
	{ // The item type is default for current collection:
		$status_icon = get_icon( 'bullet_black', 'imgtag', array( 'title' => sprintf( T_('The item type is the default for %s.'), $Blog->get( 'shortname' ) ) ) );
	}
	else
	{ // The item type is not default:
		if( $current_User->check_perm( 'blog_properties', 'edit', false, $Blog->ID ) )
		{ // URL to use the item type as default if current user has a permission to edit collection properties:
			$status_url = $admin_url.'?ctrl=itemtypes&amp;action=default&amp;ityp_ID='.$item_type_ID.'&amp;blog='.$Blog->ID.'&amp;'.url_crumb( 'itemtype' );
			$status_icon_title = sprintf( T_('Set this item type as the default for %s.'), $Blog->get( 'shortname' ) );
		}
		else
		{
			$status_icon_title = sprintf( T_('The item type is not the default for %s.'), $Blog->get( 'shortname' ) );
		}
		$status_icon = get_icon( 'bullet_empty_grey', 'imgtag', array( 'title' => $status_icon_title ) );
	}

	if( isset( $status_url ) )
	{
		return '<a href="'.$status_url.'">'.$status_icon.'</a>';
	}
	else
	{
		return $status_icon;
	}
}
$Results->cols[] = array(
		'th' => sprintf( T_('Default for<br />%s'), $Blog->get( 'shortname' ) ),
		'order' => 'ityp_perm_level',
		'td' => '%ityp_row_default( #ityp_ID# )%',
		'th_class' => 'shrinkwrap',
		'td_class' => 'center',
	);

$Results->cols[] = array(
		'th' => T_('Name'),
		'order' => 'ityp_name',
		'td' => '%get_name_for_itemtype(#ityp_ID#, #ityp_name#)%',
	);

function ityp_row_perm_level( $level, $id )
{
	if( ItemType::is_reserved( $id ) )
	{ // It is reserved item type, Don't display perm level
		return '';
	}

	$perm_levels = array(
			'standard'   => T_('Standard'),
			'restricted' => T_('Restricted'),
			'admin'      => T_('Admin')
		);

	return isset( $perm_levels[ $level ] ) ? $perm_levels[ $level ] : $level;
}
$Results->cols[] = array(
		'th' => T_('Perm Level'),
		'order' => 'ityp_perm_level',
		'td' => '%ityp_row_perm_level( #ityp_perm_level#, #ityp_ID# )%',
		'th_class' => 'shrinkwrap',
		'td_class' => 'center',
	);

$Results->cols[] = array(
		'th' => T_('Back-office tab'),
		'order' => 'ityp_backoffice_tab',
		'td' => '$ityp_backoffice_tab$',
		'th_class' => 'shrinkwrap',
		'td_class' => 'center',
	);

$Results->cols[] = array(
		'th' => T_('Template name'),
		'order' => 'ityp_template_name',
		'td' => '%conditional( #ityp_template_name# == "", "", #ityp_template_name#.".*.php" )%',
		'th_class' => 'shrinkwrap',
		'td_class' => 'center',
	);

if( $current_User->check_perm( 'options', 'edit', false ) )
{ // We have permission to modify:
	$Results->cols[] = array(
							'th' => T_('Actions'),
							'th_class' => 'shrinkwrap',
							'td_class' => 'shrinkwrap',
							'td' => '%get_actions_for_itemtype( #ityp_ID# )%',
						);

	$Results->global_icon( T_('Create a new element...'), 'new',
				regenerate_url( 'action', 'action=new' ), T_('New Post Type').' &raquo;', 3, 4, array( 'class' => 'action_icon btn-primary' ) );
}

// Display results:
$Results->display();

?>