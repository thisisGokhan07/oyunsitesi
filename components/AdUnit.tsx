'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { AdBanner } from './AdBanner';
import { AdPlaceholder } from './AdPlaceholder';
import { VideoAdPreroll } from './VideoAdPreroll';

interface AdUnitProps {
  position: string;
  pageType?: 'game' | 'home' | 'category' | 'search';
  gameUrl?: string;
  onAdImpression?: () => void;
  onAdClick?: () => void;
  className?: string;
}

export function AdUnit({
  position,
  pageType = 'game',
  gameUrl,
  onAdImpression,
  onAdClick,
  className = '',
}: AdUnitProps) {
  const [placement, setPlacement] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPreroll, setShowPreroll] = useState(false);
  const [gameReady, setGameReady] = useState(false);

  useEffect(() => {
    loadPlacement();
  }, [position, pageType]);

  async function loadPlacement() {
    try {
      const { data, error } = await supabase
        .from('ad_placements')
        .select('*')
        .eq('position', position)
        .eq('enabled', true)
        .contains('show_on_pages', [pageType])
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPlacement(data);
        
        // Pre-roll için özel kontrol
        if (data.ad_type === 'video_preroll' && gameUrl && !gameReady) {
          setShowPreroll(true);
        }
      }
    } catch (error) {
      console.error('Ad placement load error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function trackImpression() {
    if (!placement) return;

    try {
      await supabase.from('ad_analytics').insert({
        placement_id: placement.id,
        event_type: 'impression',
      });

      // Placement impression count güncelle
      await supabase
        .from('ad_placements')
        .update({ impressions: (placement.impressions || 0) + 1 })
        .eq('id', placement.id);

      onAdImpression?.();
    } catch (error) {
      console.error('Ad impression tracking error:', error);
    }
  }

  async function trackClick() {
    if (!placement) return;

    try {
      await supabase.from('ad_analytics').insert({
        placement_id: placement.id,
        event_type: 'click',
      });

      // Placement click count güncelle
      await supabase
        .from('ad_placements')
        .update({ clicks: (placement.clicks || 0) + 1 })
        .eq('id', placement.id);

      onAdClick?.();
    } catch (error) {
      console.error('Ad click tracking error:', error);
    }
  }

  if (loading) {
    return null;
  }

  if (!placement) {
    return null; // Placeholder göstermiyoruz, sadece enabled olanlar
  }

  // Video Pre-roll
  if (placement.ad_type === 'video_preroll' && showPreroll) {
    return (
      <VideoAdPreroll
        onComplete={() => {
          setShowPreroll(false);
          setGameReady(true);
        }}
        onSkip={() => {
          setShowPreroll(false);
          setGameReady(true);
        }}
        duration={placement.duration || 15}
        skipable={placement.skipable || false}
        skipAfter={5}
        adTagUrl={placement.custom_code || undefined}
        gameUrl={gameUrl || ''}
      />
    );
  }

  // Banner Ad
  if (placement.ad_type === 'banner') {
    const sizeMap: Record<string, '728x90' | '300x250' | '320x100' | '160x600'> = {
      '728x90': '728x90',
      '300x250': '300x250',
      '320x100': '320x100',
      '160x600': '160x600',
    };

    const size = sizeMap[`${placement.width}x${placement.height}`] || '728x90';

    if (placement.ad_network === 'adsense' && placement.publisher_id && placement.ad_slot_id) {
      return (
        <div className={className}>
          <AdBanner
            slot={placement.ad_slot_id}
            format={placement.format as any}
            responsive={placement.responsive}
            publisherId={placement.publisher_id}
            size={size}
            position={position}
            onImpression={trackImpression}
            onClick={trackClick}
          />
        </div>
      );
    }

    // Custom ad code
    if (placement.ad_network === 'custom' && placement.custom_code) {
      return (
        <div
          className={className}
          dangerouslySetInnerHTML={{ __html: placement.custom_code }}
          onLoad={trackImpression}
        />
      );
    }

    // Placeholder
    return (
      <div className={className}>
        <AdPlaceholder size={size} position={position} label={placement.name} />
      </div>
    );
  }

  return null;
}

