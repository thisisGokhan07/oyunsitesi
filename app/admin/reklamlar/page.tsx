'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Plus, Edit, Trash2, DollarSign, Eye, TrendingUp, Video, Image as ImageIcon } from 'lucide-react';

type AdPlacement = {
  id: string;
  name: string;
  position: string;
  ad_type: 'banner' | 'video_preroll' | 'video_interstitial' | 'custom';
  ad_network: string;
  publisher_id: string | null;
  ad_slot_id: string | null;
  custom_code: string | null;
  width: number | null;
  height: number | null;
  format: string;
  responsive: boolean;
  enabled: boolean;
  show_on_pages: string[];
  priority: number;
  layout_type: string;
  skipable: boolean | null;
  duration: number | null;
  impressions: number;
  clicks: number;
  revenue: number;
};

const POSITION_OPTIONS = [
  { value: 'game-top', label: 'Oyun Sayfası - Üst' },
  { value: 'game-bottom', label: 'Oyun Sayfası - Alt' },
  { value: 'game-sidebar', label: 'Oyun Sayfası - Sidebar' },
  { value: 'game-mobile-top', label: 'Mobil - Üst' },
  { value: 'game-mobile-bottom', label: 'Mobil - Alt' },
  { value: 'game-preroll', label: 'Pre-roll Video' },
  { value: 'home-top', label: 'Ana Sayfa - Üst' },
  { value: 'home-middle', label: 'Ana Sayfa - Orta' },
  { value: 'category-top', label: 'Kategori - Üst' },
];

export default function AdManagement() {
  const { profile } = useAuth();
  const [placements, setPlacements] = useState<AdPlacement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPlacement, setEditingPlacement] = useState<AdPlacement | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    totalImpressions: 0,
    totalRevenue: 0,
  });
  const [formData, setFormData] = useState({
    name: '',
    position: 'game-top',
    ad_type: 'banner' as 'banner' | 'video_preroll' | 'video_interstitial' | 'custom',
    ad_network: 'adsense',
    publisher_id: '',
    ad_slot_id: '',
    custom_code: '',
    width: 728,
    height: 90,
    format: 'auto',
    responsive: true,
    enabled: true,
    show_on_pages: ['game'] as string[],
    priority: 0,
    layout_type: 'balanced',
    skipable: false,
    duration: 15,
    show_interval: 5,
  });

  useEffect(() => {
    if (profile?.role && ['super_admin', 'admin'].includes(profile.role)) {
      loadPlacements();
      loadStats();
    }
  }, [profile]);

  async function loadPlacements() {
    try {
      const { data, error } = await supabase
        .from('ad_placements')
        .select('*')
        .order('priority', { ascending: true });

      if (error) throw error;
      setPlacements((data as any) || []);
    } catch (error: any) {
      toast.error('Reklamlar yüklenemedi: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      const { data: placementsData } = await supabase
        .from('ad_placements')
        .select('impressions, clicks, revenue');

      if (placementsData) {
        const totalImpressions = placementsData.reduce((sum: number, p: any) => sum + (p.impressions || 0), 0);
        const totalClicks = placementsData.reduce((sum: number, p: any) => sum + (p.clicks || 0), 0);
        const totalRevenue = placementsData.reduce((sum: number, p: any) => sum + parseFloat(String(p.revenue || 0)), 0);

        setStats({
          total: placementsData.length,
          active: placementsData.filter((p: any) => p.enabled).length,
          totalImpressions,
          totalRevenue,
        });
      }
    } catch (error) {
      console.error('Stats load error:', error);
    }
  }

  function openEditDialog(placement?: AdPlacement) {
    if (placement) {
      setEditingPlacement(placement);
      setFormData({
        name: placement.name,
        position: placement.position,
        ad_type: placement.ad_type,
        ad_network: placement.ad_network,
        publisher_id: placement.publisher_id || '',
        ad_slot_id: placement.ad_slot_id || '',
        custom_code: placement.custom_code || '',
        width: placement.width || 728,
        height: placement.height || 90,
        format: placement.format || 'auto',
        responsive: placement.responsive,
        enabled: placement.enabled,
        show_on_pages: placement.show_on_pages || ['game'],
        priority: placement.priority,
        layout_type: placement.layout_type || 'balanced',
        skipable: placement.skipable || false,
        duration: placement.duration || 15,
        show_interval: 5,
      });
    } else {
      setEditingPlacement(null);
      setFormData({
        name: '',
        position: 'game-top',
        ad_type: 'banner',
        ad_network: 'adsense',
        publisher_id: '',
        ad_slot_id: '',
        custom_code: '',
        width: 728,
        height: 90,
        format: 'auto',
        responsive: true,
        enabled: true,
        show_on_pages: ['game'],
        priority: 0,
        layout_type: 'balanced',
        skipable: false,
        duration: 15,
        show_interval: 5,
      });
    }
    setEditDialogOpen(true);
  }

  async function savePlacement() {
    try {
      const placementData: any = {
        name: formData.name,
        position: formData.position,
        ad_type: formData.ad_type,
        ad_network: formData.ad_network,
        width: formData.width,
        height: formData.height,
        format: formData.format,
        responsive: formData.responsive,
        enabled: formData.enabled,
        show_on_pages: formData.show_on_pages,
        priority: formData.priority,
        layout_type: formData.layout_type,
      };

      if (formData.ad_network === 'adsense') {
        placementData.publisher_id = formData.publisher_id || null;
        placementData.ad_slot_id = formData.ad_slot_id || null;
      } else if (formData.ad_network === 'custom') {
        placementData.custom_code = formData.custom_code || null;
      }

      if (formData.ad_type === 'video_preroll' || formData.ad_type === 'video_interstitial') {
        placementData.skipable = formData.skipable;
        placementData.duration = formData.duration;
        if (formData.ad_type === 'video_interstitial') {
          placementData.show_interval = formData.show_interval;
        }
      }

      if (editingPlacement) {
        const { error } = await (supabase
          .from('ad_placements')
          .update as any)(placementData)
          .eq('id', editingPlacement.id);

        if (error) throw error;
        toast.success('Reklam güncellendi!');
      } else {
        const { error } = await (supabase
          .from('ad_placements')
          .insert as any)([placementData]);

        if (error) throw error;
        toast.success('Reklam eklendi!');
      }

      setEditDialogOpen(false);
      loadPlacements();
      loadStats();
    } catch (error: any) {
      toast.error('Reklam kaydedilemedi: ' + error.message);
    }
  }

  async function deletePlacement(id: string) {
    if (!confirm('Bu reklamı silmek istediğinize emin misiniz?')) return;

    try {
      const { error } = await supabase
        .from('ad_placements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Reklam silindi!');
      loadPlacements();
      loadStats();
    } catch (error: any) {
      toast.error('Reklam silinemedi: ' + error.message);
    }
  }

  async function toggleEnabled(id: string, currentStatus: boolean) {
    try {
      const { error } = await (supabase
        .from('ad_placements')
        .update as any)({ enabled: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success(currentStatus ? 'Reklam devre dışı bırakıldı' : 'Reklam etkinleştirildi');
      loadPlacements();
      loadStats();
    } catch (error: any) {
      toast.error('Durum değiştirilemedi: ' + error.message);
    }
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
          <h1 className="text-3xl font-bold">Reklam Yönetimi</h1>
          <p className="text-gray-400 mt-1">
            Google AdSense ve özel reklam yerleşimlerini yönetin
          </p>
        </div>
        <Button onClick={() => openEditDialog()} className="bg-orange-500 hover:bg-orange-600">
          <Plus className="w-4 h-4 mr-2" />
          Yeni Reklam
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-white/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Toplam Reklam
            </CardTitle>
            <ImageIcon className="w-5 h-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-white/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Aktif Reklamlar
            </CardTitle>
            <Eye className="w-5 h-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-white/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Toplam Gösterim
            </CardTitle>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalImpressions.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-white/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Toplam Gelir
            </CardTitle>
            <DollarSign className="w-5 h-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₺{stats.totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-white/10">
        <CardHeader>
          <CardTitle>Reklam Yerleşimleri</CardTitle>
        </CardHeader>
        <CardContent>
          {placements.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">Henüz reklam eklenmemiş</p>
              <Button onClick={() => openEditDialog()} className="bg-orange-500 hover:bg-orange-600">
                <Plus className="w-4 h-4 mr-2" />
                İlk Reklamı Ekle
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ad</TableHead>
                  <TableHead>Pozisyon</TableHead>
                  <TableHead>Tip</TableHead>
                  <TableHead>Boyut</TableHead>
                  <TableHead>Gösterim</TableHead>
                  <TableHead>Tıklama</TableHead>
                  <TableHead>Gelir</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {placements.map((placement) => (
                  <TableRow key={placement.id}>
                    <TableCell className="font-medium">{placement.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{placement.position}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {placement.ad_type === 'video_preroll' || placement.ad_type === 'video_interstitial' ? (
                          <Video className="w-4 h-4" />
                        ) : (
                          <ImageIcon className="w-4 h-4" />
                        )}
                        <span className="text-sm">{placement.ad_type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {placement.width && placement.height
                        ? `${placement.width}x${placement.height}`
                        : 'Auto'}
                    </TableCell>
                    <TableCell>{placement.impressions.toLocaleString()}</TableCell>
                    <TableCell>{placement.clicks.toLocaleString()}</TableCell>
                    <TableCell>₺{parseFloat(String(placement.revenue || 0)).toFixed(2)}</TableCell>
                    <TableCell>
                      <Switch
                        checked={placement.enabled}
                        onCheckedChange={() => toggleEnabled(placement.id, placement.enabled)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(placement)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deletePlacement(placement.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-card border-white/10 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPlacement ? 'Reklam Düzenle' : 'Yeni Reklam Ekle'}</DialogTitle>
            <DialogDescription>
              Reklam yerleşimi ve ayarlarını yapılandırın
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="name">Reklam Adı *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Sayfa Başı Banner"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="position">Pozisyon *</Label>
                <Select
                  value={formData.position}
                  onValueChange={(value) => setFormData({ ...formData, position: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {POSITION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="ad_type">Reklam Tipi *</Label>
                <Select
                  value={formData.ad_type}
                  onValueChange={(value: any) => setFormData({ ...formData, ad_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="banner">Banner</SelectItem>
                    <SelectItem value="video_preroll">Pre-roll Video</SelectItem>
                    <SelectItem value="video_interstitial">Interstitial Video</SelectItem>
                    <SelectItem value="custom">Özel Reklam</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="ad_network">Reklam Ağı</Label>
              <Select
                value={formData.ad_network}
                onValueChange={(value) => setFormData({ ...formData, ad_network: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="adsense">Google AdSense</SelectItem>
                  <SelectItem value="custom">Özel Reklam</SelectItem>
                  <SelectItem value="gamedistribution">GameDistribution</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.ad_network === 'adsense' && (
              <>
                <div>
                  <Label htmlFor="publisher_id">AdSense Publisher ID</Label>
                  <Input
                    id="publisher_id"
                    value={formData.publisher_id}
                    onChange={(e) => setFormData({ ...formData, publisher_id: e.target.value })}
                    placeholder="ca-pub-xxxxxxxxxxxxxxxxx"
                  />
                </div>

                <div>
                  <Label htmlFor="ad_slot_id">Ad Slot ID</Label>
                  <Input
                    id="ad_slot_id"
                    value={formData.ad_slot_id}
                    onChange={(e) => setFormData({ ...formData, ad_slot_id: e.target.value })}
                    placeholder="1234567890"
                  />
                </div>
              </>
            )}

            {formData.ad_network === 'custom' && (
              <div>
                <Label htmlFor="custom_code">Özel Reklam Kodu (HTML/JS)</Label>
                <Textarea
                  id="custom_code"
                  value={formData.custom_code}
                  onChange={(e) => setFormData({ ...formData, custom_code: e.target.value })}
                  rows={6}
                  className="font-mono text-sm"
                  placeholder="<script>...</script>"
                />
              </div>
            )}

            {formData.ad_type === 'banner' && (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="width">Genişlik (px)</Label>
                  <Input
                    id="width"
                    type="number"
                    value={formData.width}
                    onChange={(e) => setFormData({ ...formData, width: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="height">Yükseklik (px)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="format">Format</Label>
                  <Select
                    value={formData.format}
                    onValueChange={(value) => setFormData({ ...formData, format: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto</SelectItem>
                      <SelectItem value="horizontal">Horizontal</SelectItem>
                      <SelectItem value="rectangle">Rectangle</SelectItem>
                      <SelectItem value="vertical">Vertical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {(formData.ad_type === 'video_preroll' || formData.ad_type === 'video_interstitial') && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration">Süre (saniye)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 15 })}
                      min="5"
                      max="60"
                    />
                  </div>
                  {formData.ad_type === 'video_interstitial' && (
                    <div>
                      <Label htmlFor="show_interval">Gösterim Aralığı (dakika)</Label>
                      <Input
                        id="show_interval"
                        type="number"
                        value={formData.show_interval}
                        onChange={(e) => setFormData({ ...formData, show_interval: parseInt(e.target.value) || 5 })}
                        min="1"
                      />
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="skipable">Atlanabilir</Label>
                  <Switch
                    id="skipable"
                    checked={formData.skipable}
                    onCheckedChange={(checked) => setFormData({ ...formData, skipable: checked })}
                  />
                </div>
              </>
            )}

            <div>
              <Label>Sayfalarda Göster</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {['game', 'home', 'category', 'search'].map((page) => (
                  <Button
                    key={page}
                    type="button"
                    variant={formData.show_on_pages.includes(page) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      const pages = formData.show_on_pages.includes(page)
                        ? formData.show_on_pages.filter((p) => p !== page)
                        : [...formData.show_on_pages, page];
                      setFormData({ ...formData, show_on_pages: pages });
                    }}
                  >
                    {page}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Öncelik</Label>
                <Input
                  id="priority"
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="layout_type">Layout Tipi</Label>
                <Select
                  value={formData.layout_type}
                  onValueChange={(value) => setFormData({ ...formData, layout_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aggressive">Agresif (Daha Fazla Gelir)</SelectItem>
                    <SelectItem value="balanced">Dengeli (Önerilen)</SelectItem>
                    <SelectItem value="minimal">Minimal (En İyi UX)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="responsive">Responsive</Label>
              <Switch
                id="responsive"
                checked={formData.responsive}
                onCheckedChange={(checked) => setFormData({ ...formData, responsive: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="enabled">Aktif</Label>
              <Switch
                id="enabled"
                checked={formData.enabled}
                onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
              />
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
                onClick={savePlacement}
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
