( function( doc ) {

	// Hook into jQuery.post() to send currently selected parent page or categories
	// along with permalink preview XHR/AJAX requests
	jQuery.post = ( function( jqPost ) {
		
		return function( url, data, success, dataType ) {
			
			if ( data.action === 'sample-permalink' ) {
				
				let parentInput = jQuery( 'select[name="parent_id"]' )[0];
				if ( parentInput ) {
					data['page_parent'] = parentInput.value;
				}

				data['post_terms[category][]'] = ['0']
				jQuery('input[name="post_category[]"]').each( ( i, input ) => {
					if ( input.checked ) {
						data['post_terms[category][]'].push( input.value );
					}
				});

			}

			// Delegate to original jQuery.post() function
			return jqPost( url, data, success, dataType );
		};

	} )( jQuery.post );


	let editBox = doc.getElementById( 'edit-slug-box' );
	if ( editBox ) {
		
		// Event handler to suppress scrolling
		let scrollPos;
		function scrollStop() { doc.documentElement.scrollTop = scrollPos; };

		// Mutation observer to remove scroll lock once the permalink was reloaded
		let observer = new MutationObserver( () => {
			let postName = doc.getElementById( 'editable-post-name-full' );
			if ( !postName || postName.textContent ) {
				setTimeout( () => doc.removeEventListener( 'scroll', scrollStop ), 100 );
			}
		} );
		observer.observe( editBox, { characterData: true, subtree: true, childList: true } );


		// Reload permalink preview when changing page parent or category inputs
		doc.querySelectorAll( 'select[name="parent_id"], input[name="post_category[]"]' ).forEach( input => {
			
			input.addEventListener( 'change', () => {

				if ( doc.querySelector( '#edit-slug-buttons' ) ) {

					// Lock scroll position due to focus changes in WP's post.js editPermalink()
					scrollPos = doc.documentElement.scrollTop;
					doc.addEventListener( 'scroll', scrollStop );

					// Click permalink edit button
					doc.querySelector( '#edit-slug-buttons .edit-slug' )?.click();
					
					// Reset current post name to force reload of permalink on save in WP's post.js editPermalink()
					doc.getElementById( 'editable-post-name-full' ).textContent = '';
					
					// Click permalink ok/save button
					setTimeout( () => {
						doc.querySelector('#edit-slug-buttons .save' )?.click();
					}, 100 );

				}

			} );

		} );

	}

} )( document );