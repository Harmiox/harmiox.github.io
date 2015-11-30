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

// Load Userfield class:
load_class( 'users/model/_userfield.class.php', 'Userfield' );

/**
 * @var User
 */
global $current_User;

// Check minimum permission:
$current_User->check_perm( 'users', 'view', true );

// Set options path:
$AdminUI->set_path( 'users', 'usersettings', 'userfields' );

// Get action parameter from request:
param_action();

if( param( 'ufdf_ID', 'integer', '', true) )
{// Load userfield from cache:
	$UserfieldCache = & get_UserFieldCache();
	if( ($edited_Userfield = & $UserfieldCache->get_by_ID( $ufdf_ID, false )) === false )
	{	// We could not find the user field to edit:
		unset( $edited_Userfield );
		forget_param( 'ufdf_ID' );
		$Messages->add( sprintf( T_('Requested &laquo;%s&raquo; object does not exist any longer.'), T_('User field') ), 'error' );
		$action = 'nil';
	}
}


switch( $action )
{

	case 'new':
		// Check permission:
		$current_User->check_perm( 'users', 'edit', true );

		if( ! isset($edited_Userfield) )
		{	// We don't have a model to use, start with blank object:
			$edited_Userfield = new Userfield();
		}
		else
		{	// Duplicate object in order no to mess with the cache:
			$edited_Userfield = duplicate( $edited_Userfield ); // PHP4/5 abstraction
			$edited_Userfield->ID = 0;
		}
		break;

	case 'edit':
		// Check permission:
		$current_User->check_perm( 'users', 'edit', true );

		// Make sure we got an ufdf_ID:
		param( 'ufdf_ID', 'integer', true );
		break;

	case 'create': // Record new Userfield
	case 'create_new': // Record Userfield and create new
	case 'create_copy': // Record Userfield and create similar
		// Insert new user field...:
		$edited_Userfield = new Userfield();

		// Check that this action request is not a CSRF hacked request:
		$Session->assert_received_crumb( 'userfield' );

		// Check permission:
		$current_User->check_perm( 'users', 'edit', true );

		// load data from request
		if( $edited_Userfield->load_from_Request() )
		{ // We could load data from form without errors:

			// Insert in DB:
			$DB->begin();

			$edited_Userfield->dbinsert();
			$Messages->add( T_('New User field created.'), 'success' );

			$DB->commit();

			switch( $action )
			{
				case 'create_copy':
					// Redirect so that a reload doesn't write to the DB twice:
					header_redirect( '?ctrl=userfields&action=new&ufdf_ID='.$edited_Userfield->ID, 303 ); // Will EXIT
					// We have EXITed already at this point!!
					break;
				case 'create_new':
					// Redirect so that a reload doesn't write to the DB twice:
					header_redirect( '?ctrl=userfields&action=new', 303 ); // Will EXIT
					// We have EXITed already at this point!!
					break;
				case 'create':
					// Redirect so that a reload doesn't write to the DB twice:
					header_redirect( '?ctrl=userfields', 303 ); // Will EXIT
					// We have EXITed already at this point!!
					break;
			}
		}
		break;

	case 'update':
		// Edit user field form...:

		// Check that this action request is not a CSRF hacked request:
		$Session->assert_received_crumb( 'userfield' );

		// Check permission:
		$current_User->check_perm( 'users', 'edit', true );

		// Make sure we got an ufdf_ID:
		param( 'ufdf_ID', 'integer', true );

		// load data from request
		if( $edited_Userfield->load_from_Request() )
		{	// We could load data from form without errors:

			// Update in DB:
			$DB->begin();

			$edited_Userfield->dbupdate();
			$Messages->add( T_('User field updated.'), 'success' );

			$DB->commit();

			header_redirect( '?ctrl=userfields', 303 ); // Will EXIT
			// We have EXITed already at this point!!
		}
		break;

	case 'delete':
		// Delete user field:

		// Check that this action request is not a CSRF hacked request:
		$Session->assert_received_crumb( 'userfield' );

		// Check permission:
		$current_User->check_perm( 'users', 'edit', true );

		// Make sure we got an ufdf_ID:
		param( 'ufdf_ID', 'integer', true );

		if( param( 'confirm', 'integer', 0 ) )
		{ // confirmed, Delete from DB:
			$msg = sprintf( T_('User field &laquo;%s&raquo; deleted.'), $edited_Userfield->dget('name') );
			$edited_Userfield->dbdelete();
			unset( $edited_Userfield );
			forget_param( 'ufdf_ID' );
			$Messages->add( $msg, 'success' );
			// Redirect so that a reload doesn't write to the DB twice:
			header_redirect( '?ctrl=userfields', 303 ); // Will EXIT
			// We have EXITed already at this point!!

		}
		else
		{	// not confirmed, Check for restrictions:
			if( ! $edited_Userfield->check_delete( sprintf( T_('Cannot delete user field &laquo;%s&raquo;'), $edited_Userfield->dget('name') ) ) )
			{	// There are restrictions:
				$action = 'view';
			}
		}
		break;

	case 'move_up':
	case 'move_down':
		// Move up/down user field...:

		// Check that this action request is not a CSRF hacked request:
		$Session->assert_received_crumb( 'userfield' );

		// Check permission:
		$current_User->check_perm( 'users', 'edit', true );

		// Make sure we got an ufdf_ID:
		param( 'ufdf_ID', 'integer', true );

		if( $action == 'move_up' )
		{	// Set variables for "move up" action
			$order_condition = '<';
			$order_direction = 'DESC';
		}
		else
		{	// move down
			$order_condition = '>';
			$order_direction = 'ASC';
		}

		$DB->begin( 'SERIALIZABLE' );

		// Get near field, We should exchange the order with this field
		$switched_Userfield = $DB->get_row( 'SELECT ufdf_ID, ufdf_order
			FROM T_users__fielddefs
			WHERE ufdf_ufgp_ID = '.$edited_Userfield->ufgp_ID.'
				AND ufdf_order '.$order_condition.' '.$edited_Userfield->order.'
			ORDER BY ufdf_order '.$order_direction.'
			LIMIT 1' );

		if( is_null( $switched_Userfield ) )
		{	// Current field is first or last in group, no change ordering
			$DB->commit(); // This is required only to not leave open transaction
			break;
		}

		// Updare order of editing field
		$result = $DB->query( 'UPDATE T_users__fielddefs
			SET ufdf_order = '.$switched_Userfield->ufdf_order.'
			WHERE ufdf_ID = '.$edited_Userfield->ID );

		// Update order of near field
		$result = ( $result !== false ) && ( $DB->query( 'UPDATE T_users__fielddefs
			SET ufdf_order = '.$edited_Userfield->order.'
			WHERE ufdf_ID = '.$switched_Userfield->ufdf_ID ) !== false );

		if( $result !== false )
		{ // Update was successful
			$DB->commit();
			$Messages->add( T_('Order has been changed.'), 'success' );
		}
		else
		{ // Couldn't update successfully, probably because of concurrent modification
			// Note: In this case we may try again to execute the same queries.
			$DB->rollback();
			// The message is not localized because it may appear very rarely
			$Messages->add( 'Order could not be changed. Please try again.', 'error' );
		}

		break;

}

$AdminUI->breadcrumbpath_init( false );  // fp> I'm playing with the idea of keeping the current blog in the path here...
$AdminUI->breadcrumbpath_add( T_('Users'), '?ctrl=users' );
$AdminUI->breadcrumbpath_add( T_('Settings'), '?ctrl=usersettings' );
$AdminUI->breadcrumbpath_add( T_('User fields configuration'), '?ctrl=userfields' );

// Set an url for manual page:
switch( $action )
{
	case 'delete':
	case 'new':
	case 'create':
	case 'create_new':
	case 'create_copy':
	case 'edit':
	case 'update':
		$AdminUI->set_page_manual_link( 'user-field-form' );
		break;
	default:
		$AdminUI->set_page_manual_link( 'user-fields-list' );
		break;
}

if( in_array( $action, array( 'delete', 'new', 'create', 'create_new', 'create_copy', 'edit', 'update' ) ) )
{ // Init JS for icon color field on the edit form
	init_colorpicker_js();
}

// Display <html><head>...</head> section! (Note: should be done early if actions do not redirect)
$AdminUI->disp_html_head();

// Display title, menu, messages, etc. (Note: messages MUST be displayed AFTER the actions)
$AdminUI->disp_body_top();

$AdminUI->disp_payload_begin();

/**
 * Display payload:
 */
switch( $action )
{
	case 'nil':
		// Do nothing
		break;


	case 'delete':
		// We need to ask for confirmation:
		$edited_Userfield->confirm_delete(
				sprintf( T_('Delete user field &laquo;%s&raquo;?'), $edited_Userfield->dget('name') ),
				'userfield', $action, get_memorized( 'action' ) );
		/* no break */
	case 'new':
	case 'create':
	case 'create_new':
	case 'create_copy':
	case 'edit':
	case 'update':	// we return in this state after a validation error
		$AdminUI->disp_view( 'users/views/_userfield.form.php' );
		break;


	default:
		// No specific request, list all user fields:
		// Cleanup context:
		forget_param( 'ufdf_ID' );
		// Display user fields list:
		$AdminUI->disp_view( 'users/views/_userfields.view.php' );
		break;

}

$AdminUI->disp_payload_end();

// Display body bottom, debug info and close </html>:
$AdminUI->disp_global_footer();

?>