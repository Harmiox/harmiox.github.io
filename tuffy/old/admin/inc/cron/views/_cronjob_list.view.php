<?php
/**
 * This file implements the UI view for the general settings.
 *
 * This file is part of the evoCore framework - {@link http://evocore.net/}
 * See also {@link https://github.com/b2evolution/b2evolution}.
 *
 * @license GNU GPL v2 - {@link http://b2evolution.net/about/gnu-gpl-license}
 *
 * @copyright (c)2003-2015 by Francois Planque - {@link http://fplanque.com/}
 *
 * @package admin
 */
if( !defined('EVO_MAIN_INIT') ) die( 'Please, do not access this page directly.' );


// Get filters:
global $ctst_pending, $ctst_started, $ctst_timeout, $ctst_error, $ctst_finished;
global $datestartinput, $datestart, $timestart, $datestopinput, $datestop, $timestop;

// Name filter:
$s = param( 's', 'string', '', true );

// Date/time filters:
if( param_date( 'datestartinput', T_('Invalid date'), false,  NULL ) !== NULL )
{ // We have a user provided localized date:
	memorize_param( 'datestart', 'string', NULL, trim( form_date( $datestartinput ) ) );
	memorize_param( 'datestartinput', 'string', NULL, empty( $datestartinput ) ? NULL : date( locale_datefmt(), strtotime( $datestartinput ) ) );
	param_time( 'timestart', '00:00:00', true, false, true, true );
}
else
{ // We may have an automated param transmission date:
	param( 'datestart', 'string', '', true );
}
if( param_date( 'datestopinput', T_('Invalid date'), false, NULL ) !== NULL )
{ // We have a user provided localized date:
	memorize_param( 'datestop', 'string', NULL, trim( form_date( $datestopinput ) ) );
	memorize_param( 'datestopinput', 'string', NULL, empty( $datestopinput ) ? NULL : date( locale_datefmt(), strtotime( $datestopinput ) ) );
	param_time( 'timestop', '23:59:59', true, false, true, true );
}
else
{ // We may have an automated param transmission date:
	param( 'datestop', 'string', '', true );
}

if( !$ctst_pending && !$ctst_started && !$ctst_timeout && !$ctst_error && !$ctst_finished )
{	// Set default status filters:
	$ctst_pending = 1;
	$ctst_started = 1;
	$ctst_timeout = 1;
	$ctst_error = 1;
}

// Create cron job names SELECT query from crong_jobs_config array
$cron_job_name_query = cron_job_sql_query();

/*
 * Create result set :
 */
$SQL = new SQL();
$SQL->SELECT( 'ctsk_ID, ctsk_start_datetime, ctsk_key, ctsk_name, ctsk_params, ctsk_repeat_after,
  IFNULL( clog_status, "pending" ) as status,
  IF( clog_realstop_datetime IS NULL, -1, UNIX_TIMESTAMP( clog_realstop_datetime ) - UNIX_TIMESTAMP( clog_realstart_datetime ) ) as duration,
  IFNULL( ctsk_name, task_name ) as final_name' );
$SQL->FROM( 'T_cron__task LEFT JOIN T_cron__log ON ctsk_ID = clog_ctsk_ID' );
if( !empty( $cron_job_name_query ) )
{ // left join with the predefined cron job names, to be able to order correctly after the after the localized Name fields
	// Note: ctsk_key field always has ascii_bin encoding, so make sure we convert the temp table field to ascii also, to prevent illegal mix of collation issues
	$SQL->FROM_add( 'LEFT JOIN ( '.$cron_job_name_query. ' ) AS temp ON ctsk_key = CONVERT( temp.task_key USING ascii )');
}
// Filter by statuses
$clog_statuses = array();
if( $ctst_started )
{ // Started
	$clog_statuses[] = 'started';
}
if( $ctst_timeout )
{ // Timeout
	$clog_statuses[] = 'timeout';
}
if( $ctst_error )
{ // Error
	$clog_statuses[] = 'error';
}
if( $ctst_finished )
{ // Finished
	$clog_statuses[] = 'finished';
}
$clog_statuses = empty( $clog_statuses ) ? array() : array( 'clog_status IN ( '.$DB->quote( $clog_statuses ).' )' );
if( $ctst_pending )
{ // Pending
	$clog_statuses[] = 'clog_status IS NULL';
}
if( ! empty( $clog_statuses ) )
{
	$SQL->WHERE( '( '.implode( ' OR ', $clog_statuses ).' )' );
}
if( ! empty( $s ) )
{ // Filter by name
	$SQL->WHERE_and( '( ( ctsk_name IS NULL AND task_name LIKE '.$DB->quote( '%'.$s.'%' ).' )
		OR ( ctsk_name IS NOT NULL AND ctsk_name LIKE '.$DB->quote( '%'.$s.'%' ).' ) )' );
}
if( ! empty( $datestart ) )
{ // Filter by start date
	$timestart_value = empty( $timestart ) ? '00:00:00' : $timestart;
	$SQL->WHERE_and( '( ctsk_start_datetime >= '.$DB->quote( $datestart.' '.$timestart_value ).'
		OR clog_realstart_datetime >= '.$DB->quote( $datestart.' '.$timestart_value ).' )' );
}
if( ! empty( $datestop ) )
{ // Filter by end date
	$timestop_value = empty( $timestop ) ? '23:59:59' : $timestop;
	$SQL->WHERE_and( '( ctsk_start_datetime <= '.$DB->quote( $datestop.' '.$timestop_value ).'
		OR clog_realstop_datetime <= '.$DB->quote( $datestop.' '.$timestop_value ).' )' );
}
$SQL->ORDER_BY( '*, ctsk_ID' );

$Results = new Results( $SQL->get(), 'crontab_', '-D' );

$Results->title = T_('Scheduled jobs').get_manual_link('scheduled-jobs-list');


$Results->global_icon( T_('Refresh'), 'refresh', regenerate_url(), T_('Refresh'), 3, 4 );
if( $current_User->check_perm( 'options', 'edit', false, NULL ) )
{	// Permission to edit settings:
	$Results->global_icon( T_('Create a new scheduled job...'), 'new', regenerate_url( 'action,cjob_ID', 'action=new' ), T_('New job').' &raquo;', 3, 4, array( 'class' => 'action_icon btn-primary' ) );
}

/**
 * Callback to add filters on top of the result set
 *
 * @param Form
 */
function filter_crontab( & $Form )
{
	global $ctst_pending, $ctst_started, $ctst_timeout, $ctst_error, $ctst_finished;
	global $datestart, $timestart, $datestop, $timestop;

	$Form->checkbox( 'ctst_pending', $ctst_pending, T_('Pending') );
	$Form->checkbox( 'ctst_started', $ctst_started, T_('Started') );
	$Form->checkbox( 'ctst_timeout', $ctst_timeout, T_('Timed out') );
	$Form->checkbox( 'ctst_error', $ctst_error, T_('Error') );
	$Form->checkbox( 'ctst_finished', $ctst_finished, T_('Finished') );

	// New line separator
	echo '<div class="clear"></div>';

	// Search:
	$Form->text( 's', get_param( 's' ), 20, T_('Search'), '', 255 );

	// Date/time filters:
	$Form->date_input( 'datestartinput', $datestart, T_('Start Date') );
	echo T_('at').' &nbsp;';
	$Form->time_input( 'timestart', '           '.$timestart, '' );

	$Form->date_input( 'datestopinput', $datestop, T_('End Date') );
	echo T_('at').' &nbsp;';
	$Form->time_input( 'timestop', '           '.$timestop, '' );
}
$Results->filter_area = array(
	'callback' => 'filter_crontab',
	'url_ignore' => 'results_crontab_page,ctst_pending,ctst_started,ctst_timeout,ctst_error,ctst_finished',	// ignor epage param and checkboxes
	'presets' => array(
			'schedule' => array( T_('Schedule'), '?ctrl=crontab&amp;ctst_pending=1&amp;ctst_started=1&amp;ctst_timeout=1&amp;ctst_error=1' ),
			'finished' => array( T_('Finished'), '?ctrl=crontab&amp;ctst_finished=1' ),
			'attention' => array( T_('Attention'), '?ctrl=crontab&amp;ctst_timeout=1&amp;ctst_error=1' ),
			'all' => array( T_('All'), '?ctrl=crontab&amp;ctst_pending=1&amp;ctst_started=1&amp;ctst_timeout=1&amp;ctst_error=1&amp;ctst_finished=1' ),
		)
	);


$Results->cols[] = array(
						'th' => T_('ID'),
						'order' => 'ctsk_ID',
						'th_class' => 'shrinkwrap',
						'td_class' => 'shrinkwrap',
						'td' => '$ctsk_ID$'
					);

$Results->cols[] = array(
						'th' => T_('Planned at'),
						'order' => 'ctsk_start_datetime',
						'td_class' => 'shrinkwrap',
						'td' => '$ctsk_start_datetime$',
					);

$Results->cols[] = array(
						'th' => T_('Name'),
						'order' => 'final_name',
						'td' => '<a href="%regenerate_url(\'action,cjob_ID\',\'action=view&amp;cjob_ID=$ctsk_ID$\')%">%cron_job_name( #ctsk_key#, #ctsk_name#, #ctsk_params# )%</a>%cron_job_manual_link( #ctsk_key# )%',
					);

$Results->cols[] = array(
						'th' => T_('Status'),
						'order' => 'status',
						'td_class' => 'shrinkwrap cron_$status$',
						'td' => '$status$',
						'extra' => array ( 'style' => 'background-color: %cron_status_color( "#status#" )%;', 'format_to_output' => false )
					);

/**
 * Get a title for cron execution time
 *
 * @param integer Seconds
 * @return string
 */
function crontab_duration( $seconds )
{
	if( $seconds == -1 )
	{ // This crontab is pending or timed out, No duration time is available
		return T_('none');
	}
	else
	{ // Inform about duration in seconds
		return sprintf( T_('%s seconds'), $seconds );
	}
}
$Results->cols[] = array(
						'th' => T_('Duration'),
						'order' => 'duration',
						'default_dir' => 'D',
						'th_class' => 'shrinkwrap',
						'td_class' => 'right nowrap',
						'td' => '%crontab_duration( #duration# )%',
					);

$Results->cols[] = array(
						'th' => T_('Repeat'),
						'order' => 'ctsk_repeat_after',
						'td_class' => 'shrinkwrap',
						'td' => '%seconds_to_period( #ctsk_repeat_after# )%',
					);

function crontab_actions( $ctsk_ID, $status )
{
	global $current_User, $admin_url;

	$col = '';

	if( $current_User->check_perm( 'options', 'edit', false, NULL ) )
	{	// User can edit options:
		if( $status == 'pending' )
		{	// Icon for edit action
			$col .= action_icon( T_('Edit this job'), 'edit', $admin_url.'?ctrl=crontab&amp;action=edit&amp;ctsk_ID='.$ctsk_ID );
		}
		elseif( $status == 'error' )
		{	// Icon for copy action
			$col .= action_icon( T_('Duplicate this job'), 'copy', $admin_url.'?ctrl=crontab&amp;action=copy&amp;ctsk_ID='.$ctsk_ID );
		}

		if( $status != 'started' )
		{	// Icon for delete action
			$col .= action_icon( T_('Delete this job!'), 'delete',
													regenerate_url( 'action', 'ctsk_ID='.$ctsk_ID.'&amp;action=delete&amp;'.url_crumb('crontask') ) );
		}
	}

	return $col;
}
$Results->cols[] = array(
					'th' => T_('Actions'),
					'td_class' => 'shrinkwrap',
					'td' => '%crontab_actions( #ctsk_ID#, #status# )%',
				);



// Display results :
$Results->display();


global $cron_url;
echo '<p>[<a href="'.$cron_url.'cron_exec.php" onclick="return pop_up_window( \''.$cron_url.'cron_exec.php\', \'evo_cron\' )" target="evo_cron">'.T_('Execute pending jobs in a popup window now!').'</a>]</p>';

?>