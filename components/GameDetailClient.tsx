'use client';

import { useState, useEffect } from 'react';
import { Star, Eye, Share2, Copy, Gamepad2, MessageSquare, Send } from 'lucide-react';
import { GameIframe } from '@/components/GameIframe';
import { AdUnit } from '@/components/AdUnit';
import { ContentCard } from '@/components/ContentCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from '@/components/StarRating';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { Content } from '@/types';
import { toast } from 'sonner';

interface GameDetailClientProps {
  game: Content;
  relatedGames: Content[];
}

export function GameDetailClient({ game, relatedGames }: GameDetailClientProps) {
  const { user } = useAuth();
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [existingRating, setExistingRating] = useState<any>(null);

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

  useEffect(() => {
    loadComments();
    if (user) {
      loadUserRating();
    }
  }, [game.id, user]);

  async function loadComments() {
    try {
      const { data, error } = await supabase
        .from('ratings')
        .select('*, user_profiles(display_name, avatar_url)')
        .eq('content_id', game.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setComments(data || []);
    } catch (error: any) {
      console.error('Comments load error:', error);
    }
  }

  async function loadUserRating() {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('ratings')
        .select('*')
        .eq('content_id', game.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        const ratingData = data as any;
        setExistingRating(ratingData);
        setUserRating(ratingData.rating || 0);
        setUserComment(ratingData.comment || ratingData.review || '');
      }
    } catch (error) {
      console.error('User rating load error:', error);
    }
  }

  async function submitRating() {
    if (!user) {
      toast.error('Yorum yapmak için giriş yapmalısınız!');
      return;
    }

    if (!userRating) {
      toast.error('Lütfen bir puan verin!');
      return;
    }

    setLoading(true);
    try {
      if (existingRating) {
        // Update existing rating
        const { error } = await (supabase
          .from('ratings')
          .update as any)({
          rating: userRating,
          comment: userComment || null,
          updated_at: new Date().toISOString(),
        })
          .eq('id', existingRating.id);

        if (error) throw error;
        toast.success('Yorumunuz güncellendi!');
      } else {
        // Create new rating
        const { error } = await (supabase
          .from('ratings')
          .insert as any)([{
          content_id: game.id,
          user_id: user.id,
          rating: userRating,
          comment: userComment || null,
        }]);

        if (error) throw error;
        toast.success('Yorumunuz eklendi!');
      }

      loadComments();
      loadUserRating();
    } catch (error: any) {
      toast.error('Yorum eklenemedi: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Pre-roll Video Ad */}
      <AdUnit
        position="game-preroll"
        pageType="game"
        gameUrl={game.content_url || ''}
        onAdImpression={() => {
          // Analytics tracking
        }}
      />

      {/* Sayfa Başı Banner */}
      <div className="hidden md:flex justify-center mb-4">
        <AdUnit position="game-top" pageType="game" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          {/* Mobil Üst Banner */}
          <div className="md:hidden">
            <AdUnit position="game-mobile-top" pageType="game" />
          </div>

          <GameIframe
            src={game.content_url || 'https://example.com/game-placeholder'}
            title={game.title}
          />

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
                        star <= Math.round(game.rating || 0)
                          ? 'fill-yellow-500 text-yellow-500'
                          : 'text-gray-500'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-gray-400 ml-2">
                    {(game.rating || 0).toFixed(1)} ({(game.rating_count || 0)} oy)
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

            {user ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Puanınız</label>
                  <StarRating
                    rating={userRating}
                    onRatingChange={setUserRating}
                    size="lg"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Yorumunuz (Opsiyonel)</label>
                  <Textarea
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    placeholder="Oyun hakkında düşüncelerinizi paylaşın..."
                    rows={3}
                    className="bg-gray-900 border-white/10"
                  />
                </div>

                <Button
                  onClick={submitRating}
                  disabled={!userRating || loading}
                  className="w-full bg-orange-500 hover:bg-orange-600"
                >
                  {loading ? 'Gönderiliyor...' : existingRating ? 'Yorumu Güncelle' : 'Yorum Gönder'}
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-400 mb-4">Yorum yapmak için giriş yapmalısınız</p>
                <Button
                  onClick={() => window.location.href = '/'}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  Giriş Yap
                </Button>
              </div>
            )}
          </div>

          <div className="bg-card rounded-lg p-4 md:p-6 border border-white/10">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Yorumlar ({comments.length})
            </h2>

            {comments.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Henüz yorum yapılmamış</p>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="border-b border-white/10 pb-4 last:border-0">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                        <span className="text-sm font-semibold">
                          {(comment.user_profiles as any)?.display_name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">
                            {(comment.user_profiles as any)?.display_name || 'Anonim'}
                          </span>
                          <StarRating
                            rating={comment.rating}
                            readonly
                            size="sm"
                          />
                          <span className="text-xs text-gray-500">
                            {new Date(comment.created_at).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                        {(comment.comment || (comment as any).review) && (
                          <p className="text-gray-300 text-sm">{comment.comment || (comment as any).review}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Oyun Altı Banner */}
          <div className="hidden md:flex justify-center">
            <AdUnit position="game-bottom" pageType="game" />
          </div>
        </div>

        <aside className="hidden lg:block space-y-4">
          {/* Sidebar Reklam */}
          <AdUnit position="game-sidebar" pageType="game" />

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

      {/* Mobil Alt Banner */}
      <div className="md:hidden mt-6">
        <AdUnit position="game-mobile-bottom" pageType="game" />
      </div>
    </>
  );
}
