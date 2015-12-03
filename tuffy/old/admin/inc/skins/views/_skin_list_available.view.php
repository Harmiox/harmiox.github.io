<?php
/**
 * This file implements the UI view for the Available skins.
 *
 * This file is part of the b2evolution/evocms project - {@link http://b2evolution.net/}.
 * See also {@link https://github.com/b2evolution/b2evolution}.
 *
 * @license GNU GPL v2 - {@link http://b2evolution.net/about/gnu-gpl-license}
 *
 * @copyright (c)2003-2015 by Francois Planque - {@link http://fplanque.com/}.
 *
 * @package admin
 */
if( !defined('EVO_MAIN_INIT') ) die( 'Please, do not access this page directly.' );

global $skins_path, $admin_url, $redirect_to, $action, $kind;

$skin_type = param( 'skin_type', 'string', '' );

/**
 * @var SkinCache
 */
$SkinCache = & get_SkinCache();
$SkinCache->load_all();

$block_item_Widget = new Widget( 'block_item' );

$block_item_Widget->title = T_('Skins available for installation').get_manual_link('installing_skins');

if( $current_User->check_perm( 'options', 'edit', false ) )
{ // We have permission to modify:
	$block_item_Widget->global_icon( T_('Cancel install!'), 'close', $redirect_to );
}

$block_item_Widget->disp_template_replaced( 'block_start' );

// Skin type selector:
$Form = new Form( $admin_url, '', 'get', 'blockspan' );
$Form->hidden_ctrl();
$Form->hidden( 'action', $action );
$Form->hidden( 'redirect_to', $redirect_to );
$Form->hidden( 'kind', get_param( 'kind' ) );
$Form->begin_form( 'skin_selector_filters' );
$Form->select_input_array( 'skin_type', $skin_type, array(
		''        => T_('All skins'),
		'normal'  => T_('Normal skins'),
		'mobile'  => T_('Mobile skins'),
		'tablet'  => T_('Tablet skins'),
		'feed'    => T_('Feed skins'),
		'sitemap' => T_('Sitemap skins'),
	), T_('Show'), '', array(
		'force_keys_as_values' => true,
		'onchange' => 'this.form.submit()'
	) );
$Form->end_form();

$filename_params = array(
		'inc_files' => false,
		'recurse'   => false,
		'basename'  => true,
	);
// Get all skin folder names:
$skin_folders = get_filenames( $skins_path, $filename_params );

$Form = new Form( $admin_url, '', 'post', 'blockspan' );
$Form->hidden_ctrl();
$Form->hidden( 'action', 'install' );
if( isset($tab) ) $Form->hidden( 'tab', $tab ); // fp> do we need this?
$Form->hidden( 'redirect_to', $redirect_to );
$Form->add_crumb( 'skin' );

$Form->begin_form( 'skin_selector_form' );

echo '<div class="skin_selector_block">';

$skins_exist = false;
// Go through all skin folders:
foreach( $skin_folders as $skin_folder )
{
	if( !strlen( $skin_folder ) || $skin_folder[0] == '.' || $skin_folder == 'CVS' )
	{	// Skip system folders:
		continue;
	}
	if( $SkinCache->get_by_folder( $skin_folder, false ) )
	{ // Skip already installed:
		continue;
	}

	// What xxx_Skin class name do we expect from this skin? 
	// (remove optional "_skin" and always append "_Skin"):
	$skin_class_name = preg_replace( '/_skin$/', '', $skin_folder ).'_Skin';	

	// Check if we already have such a skin
	if( class_exists($skin_class_name) )
	{	// This class already exists!
		$disp_params = array(
				'function'        => 'broken',	
				'msg'             => T_('DUPLICATE SKIN NAME'),
			);
	}
	elseif( ! @$skin_class_file_contents = file_get_contents( $skins_path.$skin_folder.'/_skin.class.php' ) )
	{ 	// Could not load the contents of the skin file:
		$disp_params = array(
				'function'        => 'broken',	
				'msg'             => T_('_skin.class.php NOT FOUND!'),
			);
	}
	elseif( strpos( $skin_class_file_contents, 'class '.$skin_class_name.' extends Skin' ) === false )
	{
		$disp_params = array(
				'function'        => 'broken',	
				'msg'             => T_('MALFORMED _skin.class.php'),
			);

	}
	elseif( ! $folder_Skin = & $SkinCache->new_obj( NULL, $skin_folder ) )
	{ // We could not load the Skin class:
		$disp_params = array(
				'function'        => 'broken',	
				'msg'             => T_('_skin.class.php could not be loaded!'),
			);
	}
	else
	{	// Skin class seems fine...

		if( ! empty( $skin_type ) && $folder_Skin->type != $skin_type )
		{ // Filter skin by selected type:
			continue;
		}

		$redirect_to_after_install = $redirect_to;
		$skin_compatible = ( empty( $kind ) || $folder_Skin->type == 'normal' );
		if( ! empty( $kind ) && $skin_compatible )
		{ // If we are installing skin for a new collection we're currently creating:
			$redirect_to_after_install = $admin_url.'?ctrl=collections&action=new-name&kind='.$kind.'&skin_ID=$skin_ID$';
		}

		$disp_params = array(
			'function'        => 'install',
			'function_url'    => $admin_url.'?ctrl=skins&amp;action=create&amp;skin_folder='.rawurlencode( $skin_folder ).'&amp;redirect_to='.rawurlencode( $redirect_to_after_install ).'&amp;'.url_crumb( 'skin' ),
			'skin_compatible' => $skin_compatible,
		);
	}

	// Display skinshot:
	Skin::disp_skinshot( $skin_folder, $skin_folder, $disp_params );
	
	$skins_exist = true;
}

echo '<div class="clear"></div>';
echo '</div>';

if( $skins_exist && empty( $kind ) )
{ // Display form buttons only when at least one skin exists for installation
	$form_buttons = array(
		array( 'type' => 'button', 'id'  => 'check_all_skins', 'value' => T_('Check All'), 'class' => 'btn btn-default' ),
		array( 'type' => 'submit', 'value' => T_('Install Checked'), 'class' => 'btn btn-primary' ),
	);
}
else
{
	$form_buttons = array();
}
$Form->end_form( $form_buttons );

$block_item_Widget->disp_template_replaced( 'block_end' );

?>
<script type="text/javascript">
jQuery( '#check_all_skins' ).click( function() {
	jQuery( 'input[name="skin_folders[]"]' ).attr( 'checked', 'checked' );
} );
</script>