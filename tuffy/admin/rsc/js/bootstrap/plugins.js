/**
 * This file is part of the evoCore framework - {@link http://evocore.net/}
 * See also {@link https://github.com/b2evolution/b2evolution}.
 * @version $Id: plugins.js 8846 2015-04-30 15:01:55Z yura $
 */

	/** Init popover for help icon of plugins **/

var plugin_number = 1;
jQuery( document ).on( 'mouseover', 'a.help_plugin_icon', function()
{
	if( jQuery( this ).hasClass( 'popoverplugin' ) )
	{ // Popover is already initialized on this help icon
		return true;
	}

	jQuery( this ).attr( 'title', '' );
	jQuery( this ).find( 'span' ).removeAttr( 'title' );

	var tip_text = jQuery( this ).attr( 'rel' );
	if( jQuery( '#help_plugin_info_suffix' ).length > 0 )
	{ // Append additional info
		tip_text += jQuery( '#help_plugin_info_suffix' ).html();
	}

	var placement = 'right';
	if( jQuery( 'body' ).width() - jQuery( this ).position().left < 220 )
	{ // Change position of bubbletip if we have no enough space at the right
		placement = 'left';
	}

	jQuery( this ).popover( {
			trigger: 'hover',
			placement: placement,
			html: true,
			content: tip_text,
			template: '<div class="popover popover-plugin"><div class="arrow"></div><div class="popover-content"></div></div>'
		} );
	jQuery( this ).popover( 'show' );

	// Add this class to avoid of the repeating of init bubbletip
	jQuery( this ).addClass( 'popoverplugin' );
	plugin_number++;
} );