'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Download } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ItchioManualImportPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    itchUrl: '',
    embedUrl: '',
    thumbnailUrl: '',
    category: 'arcade',
    ageGroup: 'child' as 'baby' | 'child' | 'adult' | 'family',
  });
  const [importing, setImporting] = useState(false);

  // Itch.io URL'den embed URL oluştur
  function generateEmbedUrl(itchUrl: string) {
    // Format: https://kennymakesgames.itch.io/pin
    // Embed: https://itch.io/embed/xxxxx veya https://kennymakesgames.itch.io/pin/embed
    
    // Itch.io URL formatını kontrol et
    const match = itchUrl.match(/https?:\/\/([^.]+)\.itch\.io\/([^\/\?]+)/);
    if (match) {
      const username = match[1];
      const gameSlug = match[2];
      // Itch.io embed URL formatı
      return `https://${username}.itch.io/${gameSlug}/embed`;
    }
    
    return itchUrl;
  }

  async function handleImport() {
    if (!formData.title || !formData.itchUrl) {
      toast.error('Başlık ve Itch.io URL gerekli!');
      return;
    }

    setImporting(true);

    try {
      // Itch.io provider'ı bul
      const { data: provider } = await supabase
        .from('game_providers')
        .select('id')
        .eq('slug', 'itchio')
        .single();

      if (!provider || !(provider as any).id) {
        toast.error('Itch.io sağlayıcısı bulunamadı!');
        return;
      }

      // Embed URL oluştur
      const embedUrl = formData.embedUrl || generateEmbedUrl(formData.itchUrl);
      
      // Slug oluştur
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Kategori bul veya oluştur
      const categorySlug = formData.category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      let categoryId: string | null = null;

      const { data: catData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .maybeSingle();

      if (catData) {
        categoryId = (catData as any).id;
      } else {
        const categoryName = formData.category.charAt(0).toUpperCase() + formData.category.slice(1);
        const { data: newCat } = await (supabase
          .from('categories')
          .insert as any)({
            name: categoryName,
            slug: categorySlug,
            description: `${categoryName} oyunları`,
            age_group: formData.ageGroup,
            icon_name: 'Gamepad2',
            color_hex: '#f97316',
            content_count: 0,
            sort_order: 0,
            published: true,
          })
          .select('id')
          .single();

            if (newCat) categoryId = (newCat as any).id;
      }

      if (!categoryId) {
        toast.error('Kategori oluşturulamadı!');
        return;
      }

      // Oyunu ekle
      const { error } = await (supabase
        .from('content')
        .insert as any)({
          title: formData.title,
          slug: slug,
          description: formData.description || `${formData.title} - Itch.io oyunu`,
          instructions: 'Oyunu oynamak için fare veya dokunmatik ekranı kullanın.',
          content_type: 'game',
          age_group: formData.ageGroup,
          category_id: categoryId,
          provider_id: (provider as any).id,
          provider_game_id: formData.itchUrl,
          thumbnail_url: formData.thumbnailUrl || 'https://via.placeholder.com/500x300?text=Itch.io+Game',
          content_url: embedUrl,
          duration_minutes: 15,
          is_premium: false,
          is_featured: false,
          published: true,
          meta_title: `${formData.title} - Ücretsiz Online Oyun`,
          meta_description: `${formData.description || formData.title} oyna. Itch.io'dan ücretsiz oyun.`,
          keywords: [formData.category, 'itch.io'],
        });

      if (error) {
        console.error('Import error:', error);
        toast.error('Oyun eklenemedi: ' + error.message);
      } else {
        toast.success('Oyun başarıyla eklendi!');
        // Formu temizle
        setFormData({
          title: '',
          description: '',
          itchUrl: '',
          embedUrl: '',
          thumbnailUrl: '',
          category: 'arcade',
          ageGroup: 'child',
        });
      }

      // Imported count güncelle
      await (supabase.rpc as any)('increment_provider_imported', { provider_id: (provider as any).id });
    } catch (error: any) {
      toast.error('Import hatası: ' + error.message);
      console.error(error);
    } finally {
      setImporting(false);
    }
  }

  // URL'den otomatik bilgi çek (basit)
  function handleUrlChange(url: string) {
    setFormData({ ...formData, itchUrl: url });
    
    // URL'den başlık çıkarmaya çalış
    const match = url.match(/itch\.io\/([^\/\?]+)/);
    if (match && !formData.title) {
      const gameSlug = match[1];
      const title = gameSlug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      setFormData({ ...formData, itchUrl: url, title });
    }
  }

  if (!profile?.role || !['super_admin', 'admin'].includes(profile.role)) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Bu sayfaya erişim yetkiniz yok.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/oyun-saglayicilari">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Itch.io Oyun Ekle</h1>
          <p className="text-gray-400 mt-1">Itch.io oyunlarını manuel olarak ekleyin</p>
        </div>
      </div>

      <Card className="bg-card border-white/10">
        <CardHeader>
          <CardTitle>Oyun Bilgileri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="itchUrl">Itch.io Oyun URL'i *</Label>
            <Input
              id="itchUrl"
              value={formData.itchUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://kennymakesgames.itch.io/pin"
              className="mt-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              Örnek: https://kennymakesgames.itch.io/pin
            </p>
          </div>

          <div>
            <Label htmlFor="title">Oyun Başlığı *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Cult of PiN"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Oyun hakkında kısa açıklama..."
              rows={3}
              className="mt-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Kategori</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="arcade">Arcade</SelectItem>
                  <SelectItem value="action">Action</SelectItem>
                  <SelectItem value="puzzle">Puzzle</SelectItem>
                  <SelectItem value="pinball">Pinball</SelectItem>
                  <SelectItem value="roguelike">Roguelike</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="strategy">Strategy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="ageGroup">Yaş Grubu</Label>
              <Select
                value={formData.ageGroup}
                onValueChange={(value: any) => setFormData({ ...formData, ageGroup: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baby">Bebek (0-3)</SelectItem>
                  <SelectItem value="child">Çocuk (4-12)</SelectItem>
                  <SelectItem value="family">Aile (Tüm yaşlar)</SelectItem>
                  <SelectItem value="adult">Yetişkin (13+)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="embedUrl">Embed URL (Opsiyonel)</Label>
            <Input
              id="embedUrl"
              value={formData.embedUrl}
              onChange={(e) => setFormData({ ...formData, embedUrl: e.target.value })}
              placeholder="https://kennymakesgames.itch.io/pin/embed"
              className="mt-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              Boş bırakılırsa otomatik oluşturulur
            </p>
          </div>

          <div>
            <Label htmlFor="thumbnailUrl">Thumbnail URL (Opsiyonel)</Label>
            <Input
              id="thumbnailUrl"
              value={formData.thumbnailUrl}
              onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
              placeholder="https://img.itch.zone/..."
              className="mt-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              Itch.io oyun sayfasından thumbnail URL'ini kopyalayın
            </p>
          </div>

          <Button
            onClick={handleImport}
            disabled={importing || !formData.title || !formData.itchUrl}
            className="w-full bg-orange-500 hover:bg-orange-600"
          >
            {importing ? (
              <>
                <Download className="w-4 h-4 mr-2 animate-spin" />
                Ekleniyor...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Oyunu Ekle
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-card border-white/10">
        <CardHeader>
          <CardTitle>💡 Nasıl Kullanılır?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-400">
          <p>1. Itch.io oyun sayfasına gidin (örn: https://kennymakesgames.itch.io/pin)</p>
          <p>2. Oyun URL'ini kopyalayın ve yukarıdaki forma yapıştırın</p>
          <p>3. Oyun bilgilerini doldurun (başlık, açıklama, kategori)</p>
          <p>4. Thumbnail URL'ini oyun sayfasından kopyalayın (opsiyonel)</p>
          <p>5. "Oyunu Ekle" butonuna tıklayın</p>
          <p className="text-orange-500 mt-4">
            ⚠️ Not: Geliştirici izni olmadan oyunları eklemeyin. Telif haklarına saygı gösterin.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

