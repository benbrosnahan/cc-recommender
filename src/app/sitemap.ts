import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';
import { TERMS_CHECKED } from '@/data/cards';

// /results is left out: it only has content once the quiz is answered.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(TERMS_CHECKED);
  return [
    { url: `${SITE_URL}/`, lastModified },
    { url: `${SITE_URL}/cards`, lastModified },
  ];
}
