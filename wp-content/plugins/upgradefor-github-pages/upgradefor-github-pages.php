<?php
/**
 * Plugin Name: UpgradeFor – GitHub Pages Sync (Advanced)
 * Description: Создает/обновляет WP-страницы по pages.json, назначает HTML-шаблоны, проставляет SEO, hreflang и JSON-LD.
 * Version: 1.1.0
 */

if (!defined('ABSPATH')) exit;

class UpgradeFor_GitHub_Pages_Advanced {
  const JSON_PATH    = '/wp-content/themes/upgradefor-child/pages.json';
  const TEMPLATE_DIR = '/wp-content/themes/upgradefor-child/templates';

  private $pages = [];

  public function __construct() {
    add_filter('theme_page_templates', [$this, 'register_templates']);
    add_action('init', [$this, 'maybe_sync_via_query']);            // auto sync via query parameter
    add_action('admin_post_upgradefor_sync', [$this, 'sync_pages']); // manual sync via admin action
    add_action('wp_head', [$this, 'inject_seo_tags'], 1);            // insert SEO meta tags
    add_action('wp_head', [$this, 'inject_schema'], 2);              // insert JSON-LD schema
    add_action('init', [$this, 'maybe_update_sitemap']);             // update sitemap
    add_action('admin_menu', [$this, 'status_page']);                // status page in admin
  }

  private function load_pages_json() {
    $file = ABSPATH . self::JSON_PATH;
    if (!file_exists($file)) return [];
    $json = json_decode(file_get_contents($file), true);
    return is_array($json) ? $json : [];
  }

  public function register_templates($templates){
    $dir = ABSPATH . self::TEMPLATE_DIR;
    if (!is_dir($dir)) return $templates;
    foreach (glob($dir.'/*.html') as $f) {
      $base  = basename($f);
      $label = preg_replace('/\.html$/', '', $base);
      $templates["templates/$base"] = "UF: $label";
    }
    return $templates;
  }

  public function maybe_sync_via_query(){
    if (!isset($_GET['upgradefor_sync'])) return;
    $token = $_SERVER['HTTP_X_DEPLOY_TOKEN'] ?? '';
    $saved = get_option('upgradefor_sync_token', '');
    if ($saved && hash_equals($saved, $token)) {
      $this->sync_pages();
      wp_die('OK');
    }
    status_header(403);
    wp_die('Forbidden');
  }

  public function sync_pages(){
    $data = $this->load_pages_json();
    foreach ($data as $item) {
      $slug  = sanitize_title($item['slug'] ?? '');
      $title = sanitize_text_field($item['title'] ?? $slug);
      $tpl   = sanitize_text_field($item['template'] ?? '');
      if (!$slug || !$tpl) continue;

      $page = get_page_by_path($slug, OBJECT, 'page');
      $arr = [
        'post_title'  => $title,
        'post_name'   => $slug,
        'post_status' => 'publish',
        'post_type'   => 'page',
      ];
      $pageId = $page ? $page->ID : wp_insert_post($arr);
      if ($pageId) {
        update_post_meta($pageId, '_wp_page_template', "templates/$tpl");
      }

      // Example: update Yoast SEO meta if available
      if (!empty($item['seo']['title'])) {
        update_post_meta($pageId, '_yoast_wpseo_title', $item['seo']['title']);
      }
      if (!empty($item['seo']['description'])) {
        update_post_meta($pageId, '_yoast_wpseo_metadesc', $item['seo']['description']);
      }
    }
    update_option('upgradefor_last_sync', current_time('mysql'));
  }

  public function inject_seo_tags(){
    if (!is_page()) return;
    global $post;
    $this->pages = $this->pages ?: $this->load_pages_json();
    $slug = $post->post_name ?? '';
    $cfg  = $this->find_cfg($slug);
    if (!$cfg) return;

    $seo = $cfg['seo'] ?? [];
    if (!empty($seo['title'])) {
      echo '<meta name="title" content="'.esc_attr($seo['title']).'">' . "\n";
    }
    if (!empty($seo['description'])) {
      echo '<meta name="description" content="'.esc_attr($seo['description']).'">' . "\n";
    }
    if (!empty($seo['canonical'])) {
      echo '<link rel="canonical" href="'.esc_url($seo['canonical']).'">' . "\n";
    }
    if (!empty($seo['hreflang']) && is_array($seo['hreflang'])) {
      foreach ($seo['hreflang'] as $lang => $url) {
        echo '<link rel="alternate" hreflang="'.esc_attr($lang).'" href="'.esc_url($url).'">' . "\n";
      }
    }
  }

  public function inject_schema(){
    if (!is_page()) return;
    global $post;
    $this->pages = $this->pages ?: $this->load_pages_json();
    $slug = $post->post_name ?? '';
    $cfg  = $this->find_cfg($slug);
    if (!$cfg) return;

    $schema = $cfg['seo']['schema'] ?? null;
    if ($schema) {
      echo '<script type="application/ld+json">'.wp_json_encode($schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES).'</script>' . "\n";
    }
  }

  public function maybe_update_sitemap(){
    if (!isset($_GET['upgradefor_sitemap'])) return;
    $pages = $this->load_pages_json();
    if (!$pages) return;

    $xml  = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
    $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
    foreach ($pages as $item) {
      $slug = sanitize_title($item['slug'] ?? '');
      $loc  = esc_url(home_url('/'.$slug));
      $xml .= "<url><loc>{$loc}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>" . "\n";
    }
    $xml .= '</urlset>';
    file_put_contents(ABSPATH.'sitemap.xml', $xml);
    update_option('upgradefor_last_sitemap', current_time('mysql'));
    wp_die('Sitemap updated');
  }

  public function status_page(){
    add_menu_page(
      'UpgradeFor Sync',
      'UpgradeFor Sync',
      'manage_options',
      'upgradefor-sync',
      function() {
        echo '<h1>UpgradeFor CI/CD Status</h1>';
        echo '<p>Last sync: '.esc_html(get_option('upgradefor_last_sync')).'</p>';
        echo '<p>Last sitemap: '.esc_html(get_option('upgradefor_last_sitemap')).'</p>';
      }
    );
  }

  private function find_cfg($slug){
    foreach ($this->pages as $row) {
      if (($row['slug'] ?? '') === $slug) {
        return $row;
      }
    }
    return null;
  }
}

new UpgradeFor_GitHub_Pages_Advanced();

add_action('admin_init', function(){
  if (current_user_can('manage_options') && isset($_GET['set_upgradefor_sync_token'])) {
    $tok = get_option('upgradefor_sync_token', '');
    if (!$tok) {
      $tok = wp_generate_password(32, false);
      update_option('upgradefor_sync_token', $tok);
    }
    wp_die('Sync token: ' . esc_html($tok));
  }
});
