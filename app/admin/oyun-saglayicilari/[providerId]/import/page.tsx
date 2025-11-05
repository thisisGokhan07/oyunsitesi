'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Download, RefreshCw, CheckCircle, XCircle, SkipForward } from 'lucide-react';
import Link from 'next/link';

type GameProvider = {
  id: string;
  name: string;
  slug: string;
  api_endpoint: string;
  api_key: string | null;
  auth_type: 'header' | 'query' | 'bearer';
  auth_header_name: string;
  imported_games: number;
  config: any;
};

export default function ImportPage() {
  const params = useParams();
  const router = useRouter();
  const { profile } = useAuth();
  const providerId = params.providerId as string;
  
  const [provider, setProvider] = useState<GameProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [limit, setLimit] = useState(20);
  const [importResult, setImportResult] = useState<{
    success: number;
    skipped: number;
    error: number;
    total: number;
  } | null>(null);

  useEffect(() => {
    if (profile?.role && ['super_admin', 'admin'].includes(profile.role)) {
      loadProvider();
    }
  }, [providerId, profile]);

  async function loadProvider() {
    try {
      const { data, error } = await supabase
        .from('game_providers')
        .select('*')
        .eq('id', providerId)
        .single();

      if (error) throw error;
      setProvider(data as any);
    } catch (error: any) {
      toast.error('Sağlayıcı yüklenemedi: ' + error.message);
      router.push('/admin/oyun-saglayicilari');
    } finally {
      setLoading(false);
    }
  }

  function getNestedValue(obj: any, path: string) {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }

  async function handleImport() {
    if (!provider || !provider.api_key) {
      toast.error('API Key eksik!');
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      // API request oluştur
      const url = new URL(provider.api_endpoint);
      const headers: HeadersInit = {
        'Accept': 'application/json',
      };

      // Auth ekle
      if (provider.auth_type === 'header') {
        headers[provider.auth_header_name] = provider.api_key;
      } else if (provider.auth_type === 'bearer') {
        headers['Authorization'] = `Bearer ${provider.api_key}`;
      } else if (provider.auth_type === 'query') {
        url.searchParams.append(provider.auth_header_name, provider.api_key);
      }

      const response = await fetch(url.toString(), { headers });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      
      // Response path'e göre oyunları çıkar
      const responsePath = provider.config?.responsePath || 'data';
      const games = getNestedValue(data, responsePath) || data.data || data.games || [];

      if (!Array.isArray(games) || games.length === 0) {
        toast.error('Hiç oyun bulunamadı');
        setImporting(false);
        return;
      }

      const gamesToImport = games.slice(0, limit);
      const config = provider.config || {};
      const categoryMapping = config.categoryMapping || {};
      const fields = config.fields || {};

      let successCount = 0;
      let skipCount = 0;
      let errorCount = 0;

      // Her oyunu import et
      for (const game of gamesToImport) {
        try {
          const title = getNestedValue(game, fields.title || 'title') || 'Untitled Game';
          const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

          // Zaten var mı kontrol et
          const { data: existing } = await supabase
            .from('content')
            .select('id')
            .eq('slug', slug)
            .maybeSingle();

          if (existing) {
            skipCount++;
            continue;
          }

          // Kategori belirle
          const gameCategory = getNestedValue(game, fields.category || 'category') || 'casual';
          const ageGroup = categoryMapping[gameCategory] || 'child';
          
          // Kategori bul veya oluştur
          const categoryName = gameCategory.charAt(0).toUpperCase() + gameCategory.slice(1);
          const categorySlug = gameCategory.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          
          let categoryId: string | null = null;
          
          const { data: catData } = await supabase
            .from('categories')
            .select('id')
            .eq('slug', categorySlug)
            .maybeSingle();

          if (catData) {
            categoryId = (catData as any).id;
          } else {
            const { data: newCat } = await (supabase
              .from('categories')
              .insert as any)({
                name: categoryName,
                slug: categorySlug,
                description: `${categoryName} oyunları`,
                age_group: ageGroup,
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
            errorCount++;
            continue;
          }

          // Oyun verilerini hazırla
          const thumbnail = getNestedValue(game, fields.thumbnail || 'assets.cover') || 
                          getNestedValue(game, 'thumb') || 
                          'https://via.placeholder.com/500x300';
          
          const gameUrl = getNestedValue(game, fields.url || 'url') || 
                         getNestedValue(game, 'game_link') || '';
          
          const embedUrl = getNestedValue(game, fields.embedUrl || 'embedUrl') || 
                          getNestedValue(game, 'embed_url') || gameUrl;

          const providerGameId = game.id || game.game_id || slug;

          // Oyunu ekle
          const { error: insertError } = await (supabase
            .from('content')
            .insert as any)({
              title: title,
              slug: slug,
              description: getNestedValue(game, fields.description || 'description') || `${title} oyunu.`,
              instructions: 'Oyunu oynamak için fare veya dokunmatik ekranı kullanın.',
              content_type: 'game',
              age_group: ageGroup,
              category_id: categoryId,
              provider_id: provider.id,
              provider_game_id: providerGameId,
              thumbnail_url: thumbnail,
              content_url: embedUrl || gameUrl,
              duration_minutes: getNestedValue(game, fields.duration || 'duration') || 15,
              is_premium: false,
              is_featured: getNestedValue(game, fields.featured || 'featured') || false,
              published: true,
              meta_title: `${title} - Ücretsiz Online Oyun`,
              meta_description: `${title} oyna. Eğlenceli ve ücretsiz oyunlar.`,
              keywords: getNestedValue(game, fields.tags || 'tags') || [gameCategory],
            });

          if (insertError) {
            console.error('Import error:', insertError);
            errorCount++;
          } else {
            successCount++;
          }
        } catch (error: any) {
          console.error('Game import error:', error);
          errorCount++;
        }
      }

      // Imported count güncelle
      await (supabase
        .from('game_providers')
        .update as any)({ imported_games: ((provider as any).imported_games || 0) + successCount })
        .eq('id', provider.id);

      setImportResult({
        success: successCount,
        skipped: skipCount,
        error: errorCount,
        total: gamesToImport.length,
      });

      toast.success(`${successCount} oyun başarıyla eklendi!`);
    } catch (error: any) {
      toast.error('Import hatası: ' + error.message);
      console.error(error);
    } finally {
      setImporting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Sağlayıcı bulunamadı</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/oyun-saglayicilari">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{provider.name} - İçe Aktar</h1>
          <p className="text-gray-400 mt-1">Oyunları içe aktarın</p>
        </div>
      </div>

      <Card className="bg-card border-white/10">
        <CardHeader>
          <CardTitle>Import Ayarları</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="limit">Oyun Sayısı</Label>
            <Input
              id="limit"
              type="number"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value) || 20)}
              min="1"
              max="100"
              className="mt-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              İçe aktarılacak maksimum oyun sayısı (1-100)
            </p>
          </div>

          {!provider.api_key && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-sm text-yellow-500">
                ⚠️ API Key eksik! Sağlayıcı ayarlarından API Key ekleyin.
              </p>
            </div>
          )}

          <Button
            onClick={handleImport}
            disabled={importing || !provider.api_key}
            className="w-full bg-orange-500 hover:bg-orange-600"
          >
            {importing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                İçe Aktarılıyor...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                {limit} Oyunu İçe Aktar
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {importResult && (
        <Card className="bg-card border-white/10">
          <CardHeader>
            <CardTitle>Import Sonuçları</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-500/10 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-500">{importResult.success}</p>
                <p className="text-sm text-gray-400">Başarılı</p>
              </div>
              <div className="text-center p-4 bg-yellow-500/10 rounded-lg">
                <SkipForward className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-yellow-500">{importResult.skipped}</p>
                <p className="text-sm text-gray-400">Atlanan</p>
              </div>
              <div className="text-center p-4 bg-red-500/10 rounded-lg">
                <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-500">{importResult.error}</p>
                <p className="text-sm text-gray-400">Hatalı</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-center text-sm text-gray-400">
                Toplam: <span className="font-bold text-white">{importResult.total}</span> oyun işlendi
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

