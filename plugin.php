<?php

/**
 * Plugin Name:       Team Members
 * Description:       A team members grid.required.
 * Requires at least: 5.7
 * Requires PHP:      7.0
 * Version:           0.1.0
 * Author:            Foysal Imran
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       team-members
 *
 * @package           blocks-course
 */


function blocks_course_team_members_block_init()
{
	register_block_type_from_metadata(__DIR__);
}
add_action('init', 'blocks_course_team_members_block_init');