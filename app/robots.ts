import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/login'],
    },
    sitemap: 'https://meu-projeto-ten-rose.vercel.app/sitemap.xml',
  };
}
