<?php
// Enqueue base CSS file for Upgrade themes
add_action('wp_enqueue_scripts', function() {
  wp_enqueue_style('upgr-style', get_stylesheet_directory_uri() . '/assets/upgr.css', [], '1.0');
});

// Add page template to the list
add_filter('theme_page_templates', function($templates){
  $templates['page-upgr-generic.php'] = 'UPGR Generic (No Builder)';
  return $templates;
});

// Register a simple block pattern for the hero section
add_action('init', function(){
  if ( function_exists('register_block_pattern_category') ) {
    register_block_pattern_category('upgr', ['label' => 'UPGR Patterns']);
  }
  if ( function_exists('register_block_pattern') ) {
    register_block_pattern('upgr/hero-cta', [
      'title'   => 'UPGR Hero + CTA',
      'content' => '<section class="hero"><h1>{{PAGE_TITLE}}</h1><p>Описание</p><a class="btn" href="#cta">Связаться</a></section>'
    ]);
  }
});
