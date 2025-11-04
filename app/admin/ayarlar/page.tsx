'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Save, Globe, Mail, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function SiteSettings() {
  const [settings, setSettings] = useState({
    site_name: 'SeriGame',
    site_description: 'Türkiye\'nin En Eğlenceli Oyun Platformu',
    site_url: 'https://serigame.com',
    contact_email: 'info@serigame.com',
    support_email: 'destek@serigame.com',
    meta_keywords: 'oyun, çocuk oyunları, eğitici oyunlar',
    enable_registration: true,
    enable_comments: true,
    enable_ratings: true,
    maintenance_mode: false,
    google_analytics_id: '',
    facebook_pixel_id: '',
  });

  function handleSave() {
    toast.success('Ayarlar kaydedildi!');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Site Ayarları</h1>
        <p className="text-gray-400 mt-1">
          Site genelindeki ayarları yönetin
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Genel Ayarlar */}
        <Card className="bg-card border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Genel Ayarlar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Site Adı</Label>
              <Input
                value={settings.site_name}
                onChange={(e) =>
                  setSettings({ ...settings, site_name: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Site Açıklaması</Label>
              <Textarea
                value={settings.site_description}
                onChange={(e) =>
                  setSettings({ ...settings, site_description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div>
              <Label>Site URL</Label>
              <Input
                value={settings.site_url}
                onChange={(e) =>
                  setSettings({ ...settings, site_url: e.target.value })
                }
                placeholder="https://example.com"
              />
            </div>

            <div>
              <Label>Meta Keywords</Label>
              <Input
                value={settings.meta_keywords}
                onChange={(e) =>
                  setSettings({ ...settings, meta_keywords: e.target.value })
                }
                placeholder="oyun, eğitici, çocuk"
              />
            </div>
          </CardContent>
        </Card>

        {/* İletişim Ayarları */}
        <Card className="bg-card border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              İletişim Ayarları
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>İletişim Email</Label>
              <Input
                type="email"
                value={settings.contact_email}
                onChange={(e) =>
                  setSettings({ ...settings, contact_email: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Destek Email</Label>
              <Input
                type="email"
                value={settings.support_email}
                onChange={(e) =>
                  setSettings({ ...settings, support_email: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Google Analytics ID</Label>
              <Input
                value={settings.google_analytics_id}
                onChange={(e) =>
                  setSettings({ ...settings, google_analytics_id: e.target.value })
                }
                placeholder="G-XXXXXXXXXX"
              />
            </div>

            <div>
              <Label>Facebook Pixel ID</Label>
              <Input
                value={settings.facebook_pixel_id}
                onChange={(e) =>
                  setSettings({ ...settings, facebook_pixel_id: e.target.value })
                }
                placeholder="123456789"
              />
            </div>
          </CardContent>
        </Card>

        {/* Özellik Ayarları */}
        <Card className="bg-card border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Özellik Ayarları
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div>
                <Label>Kayıt Olma Aktif</Label>
                <p className="text-xs text-gray-500">Yeni üye kaydına izin ver</p>
              </div>
              <Switch
                checked={settings.enable_registration}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, enable_registration: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div>
                <Label>Yorumlar Aktif</Label>
                <p className="text-xs text-gray-500">Kullanıcılar yorum yapabilir</p>
              </div>
              <Switch
                checked={settings.enable_comments}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, enable_comments: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div>
                <Label>Puanlama Aktif</Label>
                <p className="text-xs text-gray-500">Oyunlar puanlanabilir</p>
              </div>
              <Switch
                checked={settings.enable_ratings}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, enable_ratings: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div>
                <Label className="text-red-500">Bakım Modu</Label>
                <p className="text-xs text-gray-500">Site ziyaretçilere kapalı</p>
              </div>
              <Switch
                checked={settings.maintenance_mode}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, maintenance_mode: checked })
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-primary">
          <Save className="w-4 h-4 mr-2" />
          Ayarları Kaydet
        </Button>
      </div>
    </div>
  );
}
