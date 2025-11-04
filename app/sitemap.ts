import { MetadataRoute } from 'next';
import { getAllContent, getAllCategories } from '@/lib/data-service';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://serigame.com';

  try {
    const [content, categories] = await Promise.all([
      getAllContent(),
      getAllCategories(),
    ]);

    const contentUrls = (content as any[]).map((item) => ({
      url: `${baseUrl}/oyunlar/${item.slug}`,
      lastModified: new Date(item.updated_at || item.created_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    const categoryUrls = (categories as any[]).map((category) => ({
      url: `${baseUrl}/kategori/${category.slug}`,
      lastModified: new Date(category.updated_at || category.created_at),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }));

    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/arama`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.5,
      },
      ...categoryUrls,
      ...contentUrls,
    ];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Fallback sitemap
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ];
  }
}

