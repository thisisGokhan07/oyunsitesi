'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, Play, SkipForward } from 'lucide-react';

interface VideoAdPrerollProps {
  onComplete: () => void;
  onSkip?: () => void;
  duration?: number; // saniye
  skipable?: boolean;
  skipAfter?: number; // Kaç saniye sonra skip butonu gösterilsin
  adTagUrl?: string;
  gameUrl: string;
}

export function VideoAdPreroll({
  onComplete,
  onSkip,
  duration = 15,
  skipable = true,
  skipAfter = 5,
  adTagUrl,
  gameUrl,
}: VideoAdPrerollProps) {
  const [showAd, setShowAd] = useState(true);
  const [countdown, setCountdown] = useState(duration);
  const [canSkip, setCanSkip] = useState(false);
  const [adError, setAdError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showAd) return;

    // Countdown
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Skip butonu aktifleştir
    if (skipable) {
      setTimeout(() => {
        setCanSkip(true);
      }, skipAfter * 1000);
    }

    return () => clearInterval(interval);
  }, [showAd, skipable, skipAfter]);

  function handleComplete() {
    setShowAd(false);
    onComplete();
    // Analytics: Ad completed
    trackAdEvent('complete');
  }

  function handleSkip() {
    setShowAd(false);
    onSkip?.();
    onComplete(); // Oyunu başlat
    // Analytics: Ad skipped
    trackAdEvent('skip');
  }

  function handleClose() {
    setShowAd(false);
    onComplete();
    trackAdEvent('close');
  }

  async function trackAdEvent(eventType: 'view' | 'complete' | 'skip' | 'close') {
    try {
      await fetch('/api/analytics/ad-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: eventType,
          placement_id: 'preroll',
          duration: duration - countdown,
        }),
      });
    } catch (error) {
      console.error('Ad analytics error:', error);
    }
  }

  if (!showAd) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
    >
      <div className="relative w-full max-w-4xl aspect-video bg-gray-900 rounded-lg overflow-hidden">
        {/* Video Ad Container */}
        {adTagUrl ? (
          <div
            id="ad-container"
            className="w-full h-full"
            style={{ minHeight: '400px' }}
          >
            {/* IMA SDK will inject video here */}
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <Play className="w-16 h-16 text-orange-500 mx-auto mb-4 animate-pulse" />
                <p className="text-white text-lg">Reklam yükleniyor...</p>
              </div>
            </div>
          </div>
        ) : (
          // Placeholder ad
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-500/20 to-cyan-500/20">
            <div className="text-center">
              <div className="text-6xl mb-4">🎯</div>
              <p className="text-white text-xl font-bold mb-2">Reklam</p>
              <p className="text-gray-300">Oyun başlamadan önce reklam gösteriliyor</p>
            </div>
          </div>
        )}

        {/* Countdown */}
        <div className="absolute top-4 right-4 bg-black/60 rounded-full px-4 py-2">
          <span className="text-white font-bold">{countdown}s</span>
        </div>

        {/* Skip Button */}
        {canSkip && skipable && (
          <div className="absolute bottom-4 right-4">
            <Button
              onClick={handleSkip}
              variant="outline"
              className="bg-white/10 hover:bg-white/20 border-white/30"
            >
              <SkipForward className="w-4 h-4 mr-2" />
              Reklamı Atla ({countdown}s)
            </Button>
          </div>
        )}

        {/* Close Button (small) */}
        <button
          onClick={handleClose}
          className="absolute top-4 left-4 w-8 h-8 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition-colors"
          aria-label="Kapat"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}

