import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import save from './save';
import './style.scss';
import './team-member';

registerBlockType('blocks-course/team-members', {
	edit: Edit,
	save,
});
