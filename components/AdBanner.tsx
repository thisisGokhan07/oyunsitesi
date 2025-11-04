'use client';

import { useEffect, useRef, useState } from 'react';
import { AdPlaceholder } from './AdPlaceholder';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface AdBannerProps {
  slot: string;
  format?: 'auto' | 'horizontal' | 'rectangle' | 'vertical';
  responsive?: boolean;
  publisherId?: string;
  className?: string;
  style?: React.CSSProperties;
  size?: '728x90' | '300x250' | '320x100' | '160x600';
  position?: string;
  onImpression?: () => void;
  onClick?: () => void;
}

export function AdBanner({
  slot,
  format = 'auto',
  responsive = true,
  publisherId,
  className = '',
  style,
  size,
  position,
  onImpression,
  onClick,
}: AdBannerProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const adRef = useRef<HTMLDivElement>(null);
  const publisherIdToUse = publisherId || process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;

  useEffect(() => {
    if (!publisherIdToUse || !slot) {
      setError(true);
      return;
    }

    try {
      // AdSense script yükle
      if (!document.querySelector('script[src*="adsbygoogle"]')) {
        const script = document.createElement('script');
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + publisherIdToUse;
        script.async = true;
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);
      }

      // Reklamı push et
      if (window.adsbygoogle && window.adsbygoogle.loaded !== true) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }

      // AdSense script yüklendikten sonra push et
      setTimeout(() => {
        try {
          if (window.adsbygoogle && Array.isArray(window.adsbygoogle)) {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            setLoaded(true);
            onImpression?.();
          }
        } catch (err) {
          console.error('AdSense push error:', err);
          setError(true);
        }
      }, 100);
    } catch (err) {
      console.error('AdSense error:', err);
      setError(true);
    }
  }, [slot, publisherIdToUse, onImpression]);

  // Click tracking
  useEffect(() => {
    if (!adRef.current || !onClick) return;

    const handleClick = () => {
      onClick();
    };

    adRef.current.addEventListener('click', handleClick);
    return () => {
      adRef.current?.removeEventListener('click', handleClick);
    };
  }, [onClick]);

  // AdSense yoksa placeholder göster
  if (!publisherIdToUse || !slot || error) {
    return size ? (
      <AdPlaceholder size={size} position={position} label="AdSense yapılandırılmamış" />
    ) : null;
  }

  return (
    <div ref={adRef} className={className} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={publisherIdToUse}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : undefined}
      />
    </div>
  );
}

