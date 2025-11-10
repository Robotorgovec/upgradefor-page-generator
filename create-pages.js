const fs = require('fs');
const fetch = require('node-fetch');

const pages = JSON.parse(fs.readFileSync('pages.json', 'utf8'));
const username = process.env.WP_USER || '';
const password = process.env.WP_PASSWORD || '';
const token = Buffer.from(`${username}:${password}`).toString('base64');
const baseUrl = process.env.WP_API_URL || 'https://example.com/wp-json/wp/v2';

async function createPage(page) {
  const body = {
    title: page.title,
    status: 'publish',
    slug: page.slug,
    template: 'page-upgr-generic.php',
    // assign parent by slug if provided
    ...(page.parent && { parent: await getPageId(page.parent) }),
    meta: {
      _upgr_html_file: page.template
    }
  };
  const res = await fetch(`${baseUrl}/pages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${token}`
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    console.error(`Error creating page ${page.slug}:`, res.statusText);
  } else {
    console.log(`Created page ${page.slug}`);
  }
}

async function getPageId(slug) {
  const res = await fetch(`${baseUrl}/pages?slug=${slug}`, {
    headers: {
      'Authorization': `Basic ${token}`
    }
  });
  const data = await res.json();
  if (Array.isArray(data) && data.length > 0) {
    return data[0].id;
  }
  return 0;
}

(async () => {
  for (const page of pages) {
    await createPage(page);
  }
})();
