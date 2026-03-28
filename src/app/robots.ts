import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Block sensitive routes from search engine crawlers
        disallow: ['/admin', '/api/'],
      },
    ],
    sitemap: 'https://kmicare.ca/sitemap.xml',
    host: 'https://kmicare.ca',
  };
}
