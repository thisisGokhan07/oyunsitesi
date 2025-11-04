import * as Icons from 'lucide-react';
import { Category } from '@/types';

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const IconComponent = Icons[(category.icon_name || 'Gamepad2') as keyof typeof Icons] as React.ComponentType<{ className?: string }>;

  return (
    <a
      href={`/kategori/${category.slug}`}
      className="group block bg-card rounded-lg p-4 card-hover border border-border/50 hover:border-primary/50"
      style={{
        '--hover-color': category.color_hex || '#f97316',
      } as React.CSSProperties}
    >
      <div className="flex flex-col items-center text-center space-y-2">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
          style={{ backgroundColor: category.color_hex || '#f97316' }}
        >
          {IconComponent && (
            <IconComponent className="h-6 w-6 text-white" />
          )}
        </div>

        <div className="space-y-0.5">
          <h3 className="font-semibold text-xs group-hover:text-primary transition-colors">
            {category.name}
          </h3>
          <p className="text-xs text-muted-foreground">
            {category.content_count} oyun
          </p>
        </div>
      </div>
    </a>
  );
}
