'use client';

import { useState, useRef } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';

interface GameIframeProps {
  src: string;
  title: string;
}

export function GameIframe({ src, title }: GameIframeProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = async () => {
    if (!iframeRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await iframeRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  return (
    <div ref={iframeRef} className="relative w-full aspect-video bg-muted rounded-xl overflow-hidden border-2 border-white/10">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-card animate-pulse">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Oyun yükleniyor...</p>
          </div>
        </div>
      )}

      <iframe
        src={src}
        title={title}
        className="w-full h-full"
        allow="fullscreen; autoplay; encrypted-media"
        allowFullScreen
        loading="lazy"
        sandbox="allow-scripts allow-same-origin"
        onLoad={() => setIsLoading(false)}
      />

      <button
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 z-10 p-2 bg-black/60 hover:bg-black/80 rounded-lg transition-colors"
        aria-label={isFullscreen ? 'Tam ekrandan çık' : 'Tam ekran'}
      >
        {isFullscreen ? (
          <Minimize2 className="w-5 h-5 text-white" />
        ) : (
          <Maximize2 className="w-5 h-5 text-white" />
        )}
      </button>
    </div>
  );
}
