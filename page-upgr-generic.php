<?php
/* Template Name: UPGR Generic (No Builder) */
get_header();
$tpl = get_template_directory() . '/templates/landing-v1.html';
if ( file_exists( get_stylesheet_directory() . '/templates/landing-v1.html' ) ) {
  $tpl = get_stylesheet_directory() . '/templates/landing-v1.html';
}
$html = file_exists($tpl) ? file_get_contents($tpl) : '<main><h1>UPGR Generic</h1></main>';
// Simple replacement of placeholders from meta (optional)
$title = get_the_title();
$repl = [
  '{{PAGE_TITLE}}' => esc_html($title),
  '{{PAGE_SLUG}}'  => esc_html(basename(get_permalink())),
];
echo strtr($html, $repl);
get_footer();
?>
