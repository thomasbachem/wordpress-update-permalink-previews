<?php
/*
Plugin Name: Update Permalink/Slug Previews in Admin
Plugin URI:  https://github.com/thomasbachem/wordpress-update-permalink-previews/
Description: Automatically reloads permalink/slug previews in admin edit view when changing a page's parent or the categories of a post.
Version:     1.0
Author:      Thomas Bachem
Author URI:  https://thomasbachem.com
License:     MIT
*/


if ( !defined( 'ABSPATH' ) ) exit;

if ( is_admin() ) {

	// Include JS to trigger and extend "sample-permalink" XHR/AJAX requests
	add_action( 'admin_head', function() {
		
		wp_enqueue_script(
			'update-permalink-previews',
			plugin_dir_url( __FILE__ ) . 'update-permalink-previews.js',
			array( 'jquery' ),
			'1.0',
			true
		);

	} );

	// When a new permalink URI gets requested through our extended XHR/AJAX request
	// (see update-permalink-previews.js)
	add_action( 'wp_ajax_sample-permalink', function() {

		// For page parents:
		// Generate permalink URI considering the supplied new parent page
		add_filter( 'get_page_uri', function( $uri, $page ) {
			
			if ( isset( $_REQUEST['page_parent'] ) ) {
				if ( $page->ID == $_REQUEST['post_id'] ) {
					
					$uri = $page->post_name;
					
					foreach ( array_merge( array( $_REQUEST['page_parent'] ), get_post_ancestors( $_REQUEST['page_parent'] ) ) as $parent ) {
						$parent = get_post( $parent );
						if ( $parent && $parent->post_name ) {
							$uri = $parent->post_name . '/' . $uri;
						}
					}

				}
			}
			
			return $uri;

		}, 10, 2 );

		// For post categories:
		// Generate permalink URI considering the supplied new post categories
		add_filter( 'post_link_category', function( $cat, $cats, $post ) {
			
			if ( isset( $_REQUEST['post_terms']['category'] ) ) {
				if ( $post->ID == $_REQUEST['post_id'] ) {
					
					if ( $post_cats = array_values( array_filter( $_REQUEST['post_terms']['category'] ) ) ) {
						sort( $post_cats, SORT_NUMERIC );
						return get_term( $post_cats[0] );
					} else {
						return get_term( get_option( 'default_category' ) );
					}

				}
			}
			
			return $cat;

		}, 10, 3 );

	}, 0 );

}