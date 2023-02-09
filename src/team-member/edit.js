import { isBlobURL, revokeBlobURL } from '@wordpress/blob';
import {
	BlockControls,
	InspectorControls,
	MediaPlaceholder,
	MediaReplaceFlow,
	RichText,
	store as blockEditorStore,
	useBlockProps,
} from '@wordpress/block-editor';
import {
	Button,
	Icon,
	PanelBody,
	SelectControl,
	Spinner,
	TextareaControl,
	TextControl,
	ToolbarButton,
	Tooltip,
	withNotices,
} from '@wordpress/components';
import { usePrevious } from '@wordpress/compose';
import { useSelect } from '@wordpress/data';
import { useEffect, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

function Edit( {
	attributes,
	setAttributes,
	noticeOperations,
	noticeUI,
	isSelected,
} ) {
	const { name, bio, url, alt, id, socialLinks } = attributes;

	const [ blobURL, setBlobURL ] = useState();
	const [ selectedLink, setSelectedLink ] = useState();

	const prevURL = usePrevious( url );
	const prevIsSelected = usePrevious( isSelected );

	const titleRef = useRef();

	const imageObject = useSelect(
		( select ) => {
			const { getMedia } = select( 'core' );
			return id ? getMedia( id ) : null;
		},
		[ id ]
	);

	const imageSizes = useSelect( ( select ) => {
		return select( blockEditorStore ).getSettings().imageSizes;
	}, [] );

	const getImageSizeOptions = () => {
		if ( ! imageObject ) return [];
		const options = [];
		const sizes = imageObject.media_details.sizes;

		for ( const key in sizes ) {
			const size = sizes[ key ];
			const imageSize = imageSizes.find( ( s ) => s.slug === key );
			if ( imageSize ) {
				options.push( {
					label: imageSize.name,
					value: size.source_url,
				} );
			}
		}
		return options;
	};

	const onChangeName = ( newName ) => {
		setAttributes( { name: newName } );
	};
	const onChangeBio = ( newBio ) => {
		setAttributes( { bio: newBio } );
	};

	const onChangeAlt = ( newAlt ) => {
		setAttributes( { alt: newAlt } );
	};
	const onSelectImage = ( image ) => {
		if ( ! image || ! image.url ) {
			setAttributes( { url: undefined, id: undefined, alt: '' } );
			return;
		}
		setAttributes( { url: image.url, id: image.id, alt: image.alt } );
	};
	const onSelectURL = ( newURL ) => {
		setAttributes( {
			url: newURL,
			id: undefined,
			alt: '',
		} );
	};

	const onChangeImageSize = ( newURL ) => {
		setAttributes( { url: newURL } );
	};

	const onUploadError = ( message ) => {
		noticeOperations.removeAllNotices();
		noticeOperations.createErrorNotice( message );
	};

	const removeImage = () => {
		setAttributes( {
			url: undefined,
			alt: '',
			id: undefined,
		} );
	};

	const addNewSocialItem = () => {
		setAttributes( {
			socialLinks: [ ...socialLinks, { icon: 'wordpress', link: '' } ],
		} );
		setSelectedLink( socialLinks.length );
	};

	useEffect( () => {
		if ( ! id && isBlobURL( url ) ) {
			setAttributes( {
				url: undefined,
				alt: '',
			} );
		}
	}, [] );

	useEffect( () => {
		if ( isBlobURL( url ) ) {
			setBlobURL( url );
		} else {
			revokeBlobURL( blobURL );
			setBlobURL();
		}
	}, [ url ] );

	useEffect( () => {
		if ( url && ! prevURL ) {
			titleRef.current.focus();
		}
	}, [ url, prevURL ] );

	useEffect( () => {
		if ( prevIsSelected && ! isSelected ) {
			setSelectedLink();
		}
	}, [ isSelected, prevIsSelected ] );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Image Settings', 'team-members' ) }>
					{ id && (
						<SelectControl
							label={ __( 'Image Size', 'team-members' ) }
							options={ getImageSizeOptions() }
							value={ url }
							onChange={ onChangeImageSize }
						/>
					) }

					{ url && ! isBlobURL( url ) && (
						<TextareaControl
							label={ __( 'Alt Text', 'team-members' ) }
							value={ alt }
							onChange={ onChangeAlt }
							help={ __(
								'The purpose of the alt tag is to provide information about the image for visually impaired users who are using screen readers, as well as for search engines that use this information to understand the content of the page. ',
								'team-membrs'
							) }
						/>
					) }
				</PanelBody>
			</InspectorControls>

			{ url && (
				<BlockControls group="inline">
					<MediaReplaceFlow
						name={ __( 'Replace Image', 'team-members' ) }
						onSelect={ onSelectImage }
						onSelectURL={ onSelectURL }
						onError={ onUploadError }
						accept="image/*"
						allowedTypes={ [ 'image' ] }
						mediaId={ id }
						mediaURL={ url }
					/>
					<ToolbarButton onClick={ removeImage }>
						{ __( 'Remove Image', 'team-members' ) }
					</ToolbarButton>
				</BlockControls>
			) }
			<div { ...useBlockProps() }>
				{ url && (
					<div
						className={ `wp-block-blocks-course-team-member-img${
							isBlobURL( url ) ? ' is-loading' : ''
						}` }
					>
						<img src={ url } alt={ alt } />
						{ isBlobURL( url ) && <Spinner /> }
					</div>
				) }
				<MediaPlaceholder
					icon="admin-users"
					onSelect={ onSelectImage }
					onSelectURL={ onSelectURL }
					onError={ onUploadError }
					accept="image/*"
					allowedTypes={ [ 'image' ] }
					disableMediaButtons={ url }
					notices={ noticeUI }
				/>
				<RichText
					ref={ titleRef }
					placeholder={ __( 'Member Name', 'team-member' ) }
					tagName="h4"
					onChange={ onChangeName }
					value={ name }
					allowedFormats={ [] }
				/>
				<RichText
					placeholder={ __( 'Member Bio', 'team-member' ) }
					tagName="p"
					onChange={ onChangeBio }
					value={ bio }
					allowedFormats={ [] }
				/>

				<div className="wp-block-blocks-course-team-member-social-links">
					<ul>
						{ socialLinks.map( ( item, index ) => {
							return (
								<li
									key={ index }
									className={
										selectedLink === index
											? 'is-selected'
											: null
									}
								>
									<button
										aria-label={ __(
											'Edit Social Link',
											'team-members'
										) }
										onClick={ () =>
											setSelectedLink( index )
										}
									>
										<Icon icon={ item.icon } />
									</button>
								</li>
							);
						} ) }
						{ isSelected && (
							<li className="wp-block-blocks-course-team-member-add-icon-li">
								<Tooltip
									text={ __(
										'Add Social Link',
										'team-members'
									) }
								>
									<button
										aria-label={ __(
											'Add Social Link',
											'team-members'
										) }
										onClick={ addNewSocialItem }
									>
										<Icon icon="plus" />
									</button>
								</Tooltip>
							</li>
						) }
					</ul>
				</div>
				{ selectedLink !== undefined && (
					<div className="wp-block-blocks-course-team-member-link-form">
						<TextControl label={ __( 'Icon', 'team-members' ) } />
						<TextControl label={ __( 'URL', 'team-members' ) } />
						<br />
						<Button isDestructive>
							{ __( 'Remove Link', 'team-members' ) }
						</Button>
					</div>
				) }
			</div>
		</>
	);
}

export default withNotices( Edit );
