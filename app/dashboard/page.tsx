'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { User, Heart, Clock, Star, Settings, Crown, Gamepad2, Eye, Lock, CreditCard, Zap, Shield, Sparkles } from 'lucide-react';
import { ContentCard } from '@/components/ContentCard';
import type { Content } from '@/types';

export default function DashboardPage() {
  const { user, profile, loading: authLoading, updateProfile, changePassword, upgradeToPremium } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams?.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  const [favorites, setFavorites] = useState<Content[]>([]);
  const [history, setHistory] = useState<Content[]>([]);
  const [ratings, setRatings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalViews: 0,
    totalRatings: 0,
    averageRating: 0,
    totalPlayTime: 0,
  });
  const [editMode, setEditMode] = useState(false);
  const [passwordChangeMode, setPasswordChangeMode] = useState(false);
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    display_name: '',
    birth_year: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    } else if (user && profile) {
      setFormData({
        display_name: profile.display_name || '',
        birth_year: profile.birth_year?.toString() || '',
      });
      loadDashboardData();
    }
  }, [user, profile, authLoading, router]);

  useEffect(() => {
    // URL'den tab parametresini oku
    const tab = searchParams?.get('tab');
    if (tab && ['profile', 'favorites', 'history', 'ratings'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  async function loadDashboardData() {
    if (!user) return;
    
    setLoading(true);
    try {
      // Load favorites
      const favoriteIds = profile?.favorite_content || [];
      if (favoriteIds.length > 0) {
        const { data: favData } = await supabase
          .from('content')
          .select('*')
          .in('id', favoriteIds)
          .eq('published', true);
        
        if (favData) setFavorites(favData as any);
      }

      // Load history (from analytics)
      const { data: historyData } = await supabase
        .from('content_analytics')
        .select('content_id, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (historyData && historyData.length > 0) {
        const contentIds = Array.from(new Set((historyData as any[]).map((h: any) => h.content_id)));
        const { data: contentData } = await supabase
          .from('content')
          .select('*')
          .in('id', contentIds)
          .eq('published', true);
        
        if (contentData) setHistory(contentData as any);
      }

      // Load ratings
      const { data: ratingsData } = await supabase
        .from('ratings')
        .select('*, content(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (ratingsData) setRatings(ratingsData as any);

      // Load statistics
      const { count: viewsCount } = await supabase
        .from('content_analytics')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { data: allRatings } = await supabase
        .from('ratings')
        .select('rating')
        .eq('user_id', user.id);

      const totalRatings = allRatings?.length || 0;
      const avgRating = totalRatings > 0
        ? (allRatings as any[]).reduce((sum, r) => sum + (r.rating || 0), 0) / totalRatings
        : 0;

      // Calculate total play time (estimated)
      const { data: analyticsData } = await supabase
        .from('content_analytics')
        .select('content_id, content(duration_minutes)')
        .eq('user_id', user.id);

      const totalPlayTime = analyticsData
        ? (analyticsData as any[]).reduce((sum, a) => {
            const duration = (a.content as any)?.duration_minutes || 0;
            return sum + duration;
          }, 0)
        : 0;

      setStats({
        totalViews: viewsCount || 0,
        totalRatings,
        averageRating: avgRating,
        totalPlayTime,
      });
    } catch (error: any) {
      console.error('Dashboard data error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProfile() {
    if (!user) return;

    try {
      await updateProfile({
        display_name: formData.display_name,
        birth_year: formData.birth_year ? parseInt(formData.birth_year) : null,
      });
      toast.success('Profil güncellendi!');
      setEditMode(false);
    } catch (error: any) {
      toast.error('Profil güncellenemedi: ' + error.message);
    }
  }

  async function toggleFavorite(contentId: string) {
    if (!user || !profile) return;

    const currentFavorites = profile.favorite_content || [];
    const isFavorite = currentFavorites.includes(contentId);
    const newFavorites = isFavorite
      ? currentFavorites.filter(id => id !== contentId)
      : [...currentFavorites, contentId];

    try {
      await updateProfile({ favorite_content: newFavorites });
      toast.success(isFavorite ? 'Favorilerden kaldırıldı' : 'Favorilere eklendi');
      loadDashboardData();
    } catch (error: any) {
      toast.error('Hata: ' + error.message);
    }
  }

  async function handleChangePassword() {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Yeni şifreler eşleşmiyor');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır');
      return;
    }

    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      toast.success('Şifre başarıyla değiştirildi!');
      setPasswordChangeMode(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      toast.error('Şifre değiştirilemedi: ' + error.message);
    }
  }

  async function handleUpgradePremium(months: number) {
    try {
      await upgradeToPremium(months);
      toast.success(`${months} aylık premium üyelik başarıyla aktif edildi!`);
      setPremiumModalOpen(false);
    } catch (error: any) {
      toast.error('Premium üyelik aktifleştirilemedi: ' + error.message);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Yükleniyor...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-16 lg:pt-20">
        <div className="container py-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-gray-400">Profilinizi ve aktivitelerinizi yönetin</p>
          </div>

          {/* İstatistikler */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-card border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Toplam İzlenme</p>
                    <p className="text-2xl font-bold">{stats.totalViews}</p>
                  </div>
                  <Eye className="w-8 h-8 text-blue-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Favoriler</p>
                    <p className="text-2xl font-bold">{favorites.length}</p>
                  </div>
                  <Heart className="w-8 h-8 text-red-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Ortalama Puan</p>
                    <p className="text-2xl font-bold">
                      {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '-'}
                    </p>
                  </div>
                  <Star className="w-8 h-8 text-yellow-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Toplam Oyun Süresi</p>
                    <p className="text-2xl font-bold">
                      {stats.totalPlayTime > 60 
                        ? `${Math.floor(stats.totalPlayTime / 60)}s ${stats.totalPlayTime % 60}dk`
                        : `${stats.totalPlayTime}dk`}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-green-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Profil</TabsTrigger>
              <TabsTrigger value="favorites">Favoriler</TabsTrigger>
              <TabsTrigger value="history">Geçmiş</TabsTrigger>
              <TabsTrigger value="ratings">Puanlarım</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card className="bg-card border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Profil Bilgileri</CardTitle>
                    {!editMode ? (
                      <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
                        <Settings className="w-4 h-4 mr-2" />
                        Düzenle
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => {
                          setEditMode(false);
                          setFormData({
                            display_name: profile?.display_name || '',
                            birth_year: profile?.birth_year?.toString() || '',
                          });
                        }}>
                          İptal
                        </Button>
                        <Button size="sm" onClick={handleSaveProfile} className="bg-orange-500 hover:bg-orange-600">
                          Kaydet
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback>
                        {profile?.display_name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-bold">{profile?.display_name || 'Kullanıcı'}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={profile?.role === 'user' ? 'bg-gray-500' : 'bg-blue-500'}>
                          {profile?.role || 'user'}
                        </Badge>
                        {profile?.is_premium && (
                          <Badge className="bg-orange-500">
                            <Crown className="w-3 h-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {editMode ? (
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label htmlFor="display_name">İsim</Label>
                        <Input
                          id="display_name"
                          value={formData.display_name}
                          onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                          placeholder="İsminiz"
                        />
                      </div>
                      <div>
                        <Label htmlFor="birth_year">Doğum Yılı (Opsiyonel)</Label>
                        <Input
                          id="birth_year"
                          type="number"
                          value={formData.birth_year}
                          onChange={(e) => setFormData({ ...formData, birth_year: e.target.value })}
                          placeholder="2010"
                          min="1900"
                          max={new Date().getFullYear()}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 pt-4">
                      <div>
                        <span className="text-sm text-gray-400">Email:</span>
                        <p>{user.email}</p>
                      </div>
                      {profile?.birth_year && (
                        <div>
                          <span className="text-sm text-gray-400">Yaş:</span>
                          <p>{new Date().getFullYear() - profile.birth_year} yaşında</p>
                        </div>
                      )}
                      <div>
                        <span className="text-sm text-gray-400">Kayıt Tarihi:</span>
                        <p>{new Date(user.created_at || '').toLocaleDateString('tr-TR')}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Şifre Değiştirme */}
              <Card className="bg-card border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="w-5 h-5" />
                      Güvenlik
                    </CardTitle>
                    {!passwordChangeMode && (
                      <Button variant="outline" size="sm" onClick={() => setPasswordChangeMode(true)}>
                        Şifre Değiştir
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {passwordChangeMode ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="currentPassword">Mevcut Şifre</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          placeholder="Mevcut şifrenizi girin"
                        />
                      </div>
                      <div>
                        <Label htmlFor="newPassword">Yeni Şifre</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          placeholder="Yeni şifrenizi girin (min 6 karakter)"
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword">Yeni Şifre Tekrar</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          placeholder="Yeni şifrenizi tekrar girin"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setPasswordChangeMode(false);
                            setPasswordData({
                              currentPassword: '',
                              newPassword: '',
                              confirmPassword: '',
                            });
                          }}
                        >
                          İptal
                        </Button>
                        <Button onClick={handleChangePassword} className="bg-orange-500 hover:bg-orange-600">
                          Şifreyi Değiştir
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-400">Hesabınızın güvenliği için düzenli olarak şifrenizi değiştirmenizi öneririz.</p>
                  )}
                </CardContent>
              </Card>

              {/* Premium Üyelik */}
              {profile?.is_premium ? (
                <Card className="bg-card border-white/10 border-orange-500/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-orange-500" />
                      Premium Üyelik
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-gray-400">
                        Premium üyeliğiniz aktif! Tüm premium içeriklere erişebilirsiniz.
                      </p>
                      {profile.premium_expires_at && (
                        <div>
                          <p className="text-sm text-gray-500">
                            Bitiş Tarihi: {new Date(profile.premium_expires_at).toLocaleDateString('tr-TR')}
                          </p>
                          {new Date(profile.premium_expires_at) > new Date() && (
                            <p className="text-xs text-orange-500 mt-1">
                              {Math.ceil((new Date(profile.premium_expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} gün kaldı
                            </p>
                          )}
                        </div>
                      )}
                      <Button
                        variant="outline"
                        onClick={() => setPremiumModalOpen(true)}
                        className="w-full"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Süreyi Uzat
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-orange-500" />
                      Premium'a Yükselt
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-gray-300">
                        Premium üyelik ile tüm özel içeriklere erişin ve daha fazlasını keşfedin!
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Zap className="w-4 h-4 text-orange-500" />
                          <span>Sınırsız erişim</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Crown className="w-4 h-4 text-orange-500" />
                          <span>Özel içerikler</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Shield className="w-4 h-4 text-orange-500" />
                          <span>Reklamsız deneyim</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Sparkles className="w-4 h-4 text-orange-500" />
                          <span>Öncelikli destek</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => setPremiumModalOpen(true)}
                        className="w-full bg-orange-500 hover:bg-orange-600"
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        Premium'a Yükselt
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Premium Modal */}
              <Dialog open={premiumModalOpen} onOpenChange={setPremiumModalOpen}>
                <DialogContent className="bg-card border-white/10 max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-orange-500" />
                      Premium Üyelik Planları
                    </DialogTitle>
                    <DialogDescription>
                      Premium üyeliğinizi seçin ve özel içeriklere erişin
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 mt-4">
                    <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/30 cursor-pointer hover:border-orange-500/50 transition-all"
                      onClick={() => handleUpgradePremium(1)}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-bold text-lg">1 Aylık</h3>
                            <p className="text-sm text-gray-400">Hızlı deneme</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-orange-500">₺49</p>
                            <p className="text-xs text-gray-400">/ay</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-500/50 cursor-pointer hover:border-orange-500/70 transition-all relative"
                      onClick={() => handleUpgradePremium(3)}>
                      <Badge className="absolute -top-2 right-4 bg-green-500">Popüler</Badge>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-bold text-lg">3 Aylık</h3>
                            <p className="text-sm text-gray-400">%15 indirim</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-orange-500">₺125</p>
                            <p className="text-xs text-gray-400">₺41.67/ay</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/30 cursor-pointer hover:border-orange-500/50 transition-all"
                      onClick={() => handleUpgradePremium(6)}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-bold text-lg">6 Aylık</h3>
                            <p className="text-sm text-gray-400">%25 indirim</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-orange-500">₺220</p>
                            <p className="text-xs text-gray-400">₺36.67/ay</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-500/50 cursor-pointer hover:border-orange-500/70 transition-all"
                      onClick={() => handleUpgradePremium(12)}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-bold text-lg">12 Aylık</h3>
                            <p className="text-sm text-gray-400">%40 indirim - En iyi fiyat</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-orange-500">₺350</p>
                            <p className="text-xs text-gray-400">₺29.17/ay</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-4">
                    * Ödeme simülasyonu - Gerçek ödeme entegrasyonu için ödeme gateway'i eklenebilir
                  </p>
                </DialogContent>
              </Dialog>
            </TabsContent>

            <TabsContent value="favorites" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Heart className="w-6 h-6 text-red-500" />
                  Favorilerim
                </h2>
                <Badge>{favorites.length} oyun</Badge>
              </div>
              {favorites.length === 0 ? (
                <Card className="bg-card border-white/10">
                  <CardContent className="py-12 text-center">
                    <Heart className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Henüz favori oyununuz yok</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {favorites.map((content) => (
                    <ContentCard key={content.id} content={content} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Clock className="w-6 h-6 text-blue-500" />
                  İzleme Geçmişi
                </h2>
                <Badge>{history.length} oyun</Badge>
              </div>
              {history.length === 0 ? (
                <Card className="bg-card border-white/10">
                  <CardContent className="py-12 text-center">
                    <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Henüz oyun oynamadınız</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {history.map((content) => (
                    <ContentCard key={content.id} content={content} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="ratings" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Star className="w-6 h-6 text-yellow-500" />
                  Puanlarım
                </h2>
                <Badge>{ratings.length} puanlama</Badge>
              </div>
              {ratings.length === 0 ? (
                <Card className="bg-card border-white/10">
                  <CardContent className="py-12 text-center">
                    <Star className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Henüz puan vermediniz</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {(ratings as any[]).map((rating: any) => (
                    <Card key={rating.id} className="bg-card border-white/10">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Gamepad2 className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="font-medium">{(rating.content as any)?.title || 'Bilinmeyen'}</p>
                              <p className="text-sm text-gray-400">
                                {new Date(rating.created_at).toLocaleDateString('tr-TR')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < (rating.rating || 0)
                                    ? 'fill-yellow-500 text-yellow-500'
                                    : 'text-gray-600'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {(rating.comment || (rating as any).review) && (
                          <p className="text-sm text-gray-400 mt-2">{rating.comment || (rating as any).review}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}

