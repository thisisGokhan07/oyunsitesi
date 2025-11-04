import Image from 'next/image';
import { Eye, Star } from 'lucide-react';
import { Content } from '@/types';
import { getAgeGroupColor } from '@/lib/mock-data';

interface ContentCardProps {
  content: Content;
}

export function ContentCard({ content }: ContentCardProps) {
  const formatViewCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <a
      href={`/oyunlar/${content.slug}`}
      className="group block bg-card rounded-lg overflow-hidden card-hover border border-border/50 hover:border-primary/50"
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        <Image
          src={content.thumbnail_url}
          alt={content.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {content.is_premium && (
          <div className="absolute top-2 left-2">
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-500 text-white shadow-lg">
              Premium
            </span>
          </div>
        )}
      </div>

      <div className="p-3 space-y-2">
        <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
          {content.title}
        </h3>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            <span>{formatViewCount(content.play_count)}</span>
          </div>

          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
            <span className="font-medium">{content.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </a>
  );
}
