'use client';

import { useState } from 'react';
import { Star, Eye, Share2, Copy, Gamepad2 } from 'lucide-react';
import { GameIframe } from '@/components/GameIframe';
import { AdPlaceholder } from '@/components/AdPlaceholder';
import { ContentCard } from '@/components/ContentCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Content } from '@/types';
import { toast } from 'sonner';

interface GameDetailClientProps {
  game: Content;
  relatedGames: Content[];
}

export function GameDetailClient({ game, relatedGames }: GameDetailClientProps) {
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const formatViews = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const getCategoryColor = (age_group: string): string => {
    const colors: Record<string, string> = {
      baby: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      child: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
      adult: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      family: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    };
    return colors[age_group] || colors.child;
  };

  const copyToClipboard = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link kopyalandı!');
    } catch (error) {
      toast.error('Link kopyalanamadı');
    }
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`${game.title} - ${window.location.href}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareTwitter = () => {
    const text = encodeURIComponent(game.title);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const submitRating = () => {
    if (!userRating) return;
    toast.success(`${userRating} yıldız verdiniz!`);
  };

  return (
    <>
      <div className="hidden md:flex justify-center mb-4">
        <AdPlaceholder size="728x90" position="top" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          <GameIframe
            src={game.content_url || 'https://example.com/game-placeholder'}
            title={game.title}
          />

          <div className="md:hidden">
            <AdPlaceholder size="320x100" position="mobile-top" />
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card rounded-lg p-4 md:p-6 border border-white/10">
            <div className="flex-1">
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-3">
                {game.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.round(game.rating)
                          ? 'fill-yellow-500 text-yellow-500'
                          : 'text-gray-500'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-gray-400 ml-2">
                    {game.rating} ({game.rating_count || 0} oy)
                  </span>
                </div>

                <div className="flex items-center gap-1 text-gray-400">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">{formatViews(game.play_count)}</span>
                </div>

                <Badge className={getCategoryColor(game.age_group)}>
                </Badge>
              </div>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={shareWhatsApp}
                className="flex-1 md:flex-initial"
              >
                <Share2 className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">WhatsApp</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={shareTwitter}
                className="flex-1 md:flex-initial"
              >
                <Share2 className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Twitter</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="flex-1 md:flex-initial"
              >
                <Copy className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Kopyala</span>
              </Button>
            </div>
          </div>

          <div className="bg-card rounded-lg p-4 md:p-6 border border-white/10">
            <h2 className="text-xl font-bold mb-3">Oyun Hakkında</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              {game.description}
            </p>

            {game.instructions && (
              <>
                <h3 className="text-lg font-semibold mb-2">Nasıl Oynanır?</h3>
                <p className="text-gray-400 text-sm">{game.instructions}</p>
              </>
            )}
          </div>

          <div className="bg-card rounded-lg p-4 md:p-6 border border-white/10">
            <h2 className="text-xl font-bold mb-4">Bu Oyunu Değerlendir</h2>

            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setUserRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoverRating || userRating)
                        ? 'fill-yellow-500 text-yellow-500'
                        : 'text-gray-500'
                    }`}
                  />
                </button>
              ))}
            </div>

            <Button
              onClick={submitRating}
              disabled={!userRating}
              className="w-full"
            >
              Oyla
            </Button>
          </div>

          <div className="hidden md:flex justify-center">
            <AdPlaceholder size="728x90" position="bottom" />
          </div>
        </div>

        <aside className="hidden lg:block space-y-4">
          <AdPlaceholder size="300x250" position="sidebar" />

          {relatedGames.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-3">İlgili Oyunlar</h3>
              <div className="space-y-3">
                {relatedGames.slice(0, 4).map((relatedGame) => (
                  <a
                    key={relatedGame.id}
                    href={`/oyunlar/${relatedGame.slug}`}
                    className="block bg-card rounded-lg p-2 hover:bg-muted transition-colors border border-white/10"
                  >
                    <div className="flex gap-2">
                      <img
                        src={relatedGame.thumbnail_url}
                        alt={relatedGame.title}
                        className="w-20 h-14 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold line-clamp-2">
                          {relatedGame.title}
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Eye className="w-3 h-3" />
                          <span>{formatViews(relatedGame.play_count)}</span>
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {relatedGames.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-primary" />
            Benzer Oyunlar
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {relatedGames.map((relatedGame) => (
              <ContentCard key={relatedGame.id} content={relatedGame} />
            ))}
          </div>
        </div>
      )}

      <div className="md:hidden mt-6">
        <AdPlaceholder size="320x100" position="mobile-bottom" />
      </div>
    </>
  );
}
