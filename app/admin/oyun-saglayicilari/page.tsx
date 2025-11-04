'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Settings, Download, CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

type GameProvider = {
  id: string;
  name: string;
  slug: string;
  api_endpoint: string;
  api_key: string | null;
  api_secret: string | null;
  auth_type: 'header' | 'query' | 'bearer';
  auth_header_name: string;
  enabled: boolean;
  revenue_share: number;
  total_games: number;
  imported_games: number;
  config: any;
  created_at: string;
  updated_at: string;
};

export default function OyunSaglayicilariPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const [providers, setProviders] = useState<GameProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<GameProvider | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    api_endpoint: '',
    api_key: '',
    api_secret: '',
    auth_type: 'header' as 'header' | 'query' | 'bearer',
    auth_header_name: 'X-Api-Key',
    enabled: true,
    revenue_share: 70,
    config: '{}',
  });

  useEffect(() => {
    if (profile?.role && ['super_admin', 'admin'].includes(profile.role)) {
      loadProviders();
    }
  }, [profile]);

  async function loadProviders() {
    try {
      const { data, error } = await supabase
        .from('game_providers')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setProviders((data as any) || []);
    } catch (error: any) {
      toast.error('Sağlayıcılar yüklenemedi: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  function openEditDialog(provider?: GameProvider) {
    if (provider) {
      setEditingProvider(provider);
      setFormData({
        name: provider.name,
        slug: provider.slug,
        api_endpoint: provider.api_endpoint,
        api_key: provider.api_key || '',
        api_secret: provider.api_secret || '',
        auth_type: provider.auth_type,
        auth_header_name: provider.auth_header_name,
        enabled: provider.enabled,
        revenue_share: provider.revenue_share,
        config: JSON.stringify(provider.config || {}, null, 2),
      });
    } else {
      setEditingProvider(null);
      setFormData({
        name: '',
        slug: '',
        api_endpoint: '',
        api_key: '',
        api_secret: '',
        auth_type: 'header',
        auth_header_name: 'X-Api-Key',
        enabled: true,
        revenue_share: 70,
        config: '{}',
      });
    }
    setEditDialogOpen(true);
  }

  async function saveProvider() {
    try {
      let configObj = {};
      try {
        configObj = JSON.parse(formData.config);
      } catch (e) {
        toast.error('Config JSON formatı geçersiz!');
        return;
      }

      const providerData = {
        name: formData.name,
        slug: formData.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        api_endpoint: formData.api_endpoint,
        api_key: formData.api_key || null,
        api_secret: formData.api_secret || null,
        auth_type: formData.auth_type,
        auth_header_name: formData.auth_header_name,
        enabled: formData.enabled,
        revenue_share: formData.revenue_share,
        config: configObj,
      };

      if (editingProvider) {
        const { error } = await supabase
          .from('game_providers')
          .update(providerData)
          .eq('id', editingProvider.id);

        if (error) throw error;
        toast.success('Sağlayıcı güncellendi!');
      } else {
        const { error } = await supabase
          .from('game_providers')
          .insert([providerData]);

        if (error) throw error;
        toast.success('Sağlayıcı eklendi!');
      }

      setEditDialogOpen(false);
      loadProviders();
    } catch (error: any) {
      toast.error('Sağlayıcı kaydedilemedi: ' + error.message);
    }
  }

  async function deleteProvider(id: string) {
    if (!confirm('Bu sağlayıcıyı silmek istediğinize emin misiniz?')) return;

    try {
      const { error } = await supabase
        .from('game_providers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Sağlayıcı silindi!');
      loadProviders();
    } catch (error: any) {
      toast.error('Sağlayıcı silinemedi: ' + error.message);
    }
  }

  async function toggleEnabled(id: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from('game_providers')
        .update({ enabled: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success(currentStatus ? 'Sağlayıcı devre dışı bırakıldı' : 'Sağlayıcı etkinleştirildi');
      loadProviders();
    } catch (error: any) {
      toast.error('Durum değiştirilemedi: ' + error.message);
    }
  }

  function handleImport(providerId: string) {
    router.push(`/admin/oyun-saglayicilari/${providerId}/import`);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile?.role || !['super_admin', 'admin'].includes(profile.role)) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Bu sayfaya erişim yetkiniz yok.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Oyun Sağlayıcıları</h1>
          <p className="text-gray-400 mt-1">Oyun sağlayıcılarını yönetin ve içerik aktarın</p>
        </div>
        <Button onClick={() => openEditDialog()} className="bg-orange-500 hover:bg-orange-600">
          <Plus className="w-4 h-4 mr-2" />
          Yeni Sağlayıcı
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {providers.map((provider) => (
          <Card key={provider.id} className="bg-card border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{provider.name}</CardTitle>
                <Switch
                  checked={provider.enabled}
                  onCheckedChange={() => toggleEnabled(provider.id, provider.enabled)}
                />
              </div>
              <CardDescription>{provider.slug}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Revenue Share:</span>
                  <span className="font-bold text-orange-500">%{provider.revenue_share}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">İçe Aktarılan:</span>
                  <span>{provider.imported_games}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Toplam Oyun:</span>
                  <span>{provider.total_games || 'N/A'}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleImport(provider.id)}
                  className="flex-1"
                  disabled={!provider.enabled || !provider.api_key}
                >
                  <Download className="w-4 h-4 mr-2" />
                  İçe Aktar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditDialog(provider)}
                >
                  <Settings className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteProvider(provider.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {!provider.api_key && (
                <Badge variant="outline" className="w-full justify-center text-yellow-500">
                  API Key gerekli
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {providers.length === 0 && (
        <Card className="bg-card border-white/10">
          <CardContent className="py-12 text-center">
            <p className="text-gray-400">Henüz sağlayıcı eklenmemiş</p>
            <Button
              onClick={() => openEditDialog()}
              className="mt-4 bg-orange-500 hover:bg-orange-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              İlk Sağlayıcıyı Ekle
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-card border-white/10 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProvider ? 'Sağlayıcı Düzenle' : 'Yeni Sağlayıcı Ekle'}</DialogTitle>
            <DialogDescription>
              Oyun sağlayıcısı bilgilerini girin
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Sağlayıcı Adı *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="GameDistribution"
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase() })}
                  placeholder="gamedistribution"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="api_endpoint">API Endpoint *</Label>
              <Input
                id="api_endpoint"
                value={formData.api_endpoint}
                onChange={(e) => setFormData({ ...formData, api_endpoint: e.target.value })}
                placeholder="https://api.example.com/games"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="auth_type">Auth Tipi</Label>
                <Select
                  value={formData.auth_type}
                  onValueChange={(value: any) => setFormData({ ...formData, auth_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="header">Header</SelectItem>
                    <SelectItem value="query">Query Parameter</SelectItem>
                    <SelectItem value="bearer">Bearer Token</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="auth_header_name">Auth Header/Param Name</Label>
                <Input
                  id="auth_header_name"
                  value={formData.auth_header_name}
                  onChange={(e) => setFormData({ ...formData, auth_header_name: e.target.value })}
                  placeholder="X-Api-Key"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="api_key">API Key</Label>
                <Input
                  id="api_key"
                  type="password"
                  value={formData.api_key}
                  onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                  placeholder="API Key girin"
                />
              </div>
              <div>
                <Label htmlFor="api_secret">API Secret (Opsiyonel)</Label>
                <Input
                  id="api_secret"
                  type="password"
                  value={formData.api_secret}
                  onChange={(e) => setFormData({ ...formData, api_secret: e.target.value })}
                  placeholder="API Secret girin"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="revenue_share">Revenue Share (%)</Label>
                <Input
                  id="revenue_share"
                  type="number"
                  value={formData.revenue_share}
                  onChange={(e) => setFormData({ ...formData, revenue_share: parseFloat(e.target.value) || 0 })}
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>
              <div className="flex items-center justify-between pt-8">
                <Label htmlFor="enabled">Aktif</Label>
                <Switch
                  id="enabled"
                  checked={formData.enabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="config">Config (JSON)</Label>
              <Textarea
                id="config"
                value={formData.config}
                onChange={(e) => setFormData({ ...formData, config: e.target.value })}
                rows={8}
                className="font-mono text-sm"
                placeholder='{"categoryMapping": {...}, "responsePath": "data", "fields": {...}}'
              />
              <p className="text-xs text-gray-500 mt-1">
                Category mapping, response path ve field mapping ayarları
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                className="flex-1"
              >
                İptal
              </Button>
              <Button
                onClick={saveProvider}
                className="flex-1 bg-orange-500 hover:bg-orange-600"
              >
                Kaydet
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

