'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Content } from '@/types';
import { Button } from '@/components/ui/button';

interface FeaturedCarouselProps {
  items: Content[];
}

export function FeaturedCarousel({ items }: FeaturedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [items.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const currentItem = items[currentIndex];

  return (
    <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden group">
      <Image
        src={currentItem.thumbnail_url}
        alt={currentItem.title}
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
        <div className="max-w-2xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-primary rounded-full text-sm font-semibold">
            </span>
            <span className="px-3 py-1 bg-accent/20 backdrop-blur-sm rounded-full text-sm font-semibold">
              Öne Çıkan
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl font-extrabold text-white drop-shadow-lg">
            {currentItem.title}
          </h2>

          <p className="text-lg text-white/90 line-clamp-2">
            {currentItem.description}
          </p>

          <div className="flex gap-3">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white font-semibold gap-2"
            >
              <Play className="h-5 w-5 fill-white" />
              Hemen Oyna
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
            >
              Daha Fazla
            </Button>
          </div>
        </div>
      </div>

      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
        aria-label="Previous"
      >
        <ChevronLeft className="h-6 w-6 text-white" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
        aria-label="Next"
      >
        <ChevronRight className="h-6 w-6 text-white" />
      </button>

      <div className="absolute bottom-6 right-6 flex gap-2">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex
                ? 'w-8 bg-primary'
                : 'w-2 bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
