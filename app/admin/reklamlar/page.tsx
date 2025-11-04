'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, DollarSign, Eye, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function AdManagement() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    placement_name: '',
    ad_network: 'adsense',
    placement_type: 'banner_top',
    publisher_id: '',
    ad_slot_id: '',
    width: 728,
    height: 90,
    is_active: true,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    toast.success('Reklam eklendi! (Demo)');
    setDialogOpen(false);
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

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Yeni Reklam Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Yeni Reklam Ekle</DialogTitle>
              <DialogDescription>
                Reklam yerleşimi ve AdSense ayarlarını yapılandırın
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Yerleşim Adı</Label>
                <Input
                  value={formData.placement_name}
                  onChange={(e) =>
                    setFormData({ ...formData, placement_name: e.target.value })
                  }
                  placeholder="Örn: Homepage Top Banner"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Reklam Ağı</Label>
                  <Select
                    value={formData.ad_network}
                    onValueChange={(v) =>
                      setFormData({ ...formData, ad_network: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="adsense">Google AdSense</SelectItem>
                      <SelectItem value="custom">Özel Reklam</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Yerleşim Tipi</Label>
                  <Select
                    value={formData.placement_type}
                    onValueChange={(v) =>
                      setFormData({ ...formData, placement_type: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="banner_top">
                        Top Banner (728x90)
                      </SelectItem>
                      <SelectItem value="banner_bottom">
                        Bottom Banner (728x90)
                      </SelectItem>
                      <SelectItem value="sidebar_medium">
                        Sidebar Rectangle (300x250)
                      </SelectItem>
                      <SelectItem value="mobile_banner">
                        Mobile Banner (320x100)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.ad_network === 'adsense' && (
                <>
                  <div>
                    <Label>AdSense Publisher ID</Label>
                    <Input
                      value={formData.publisher_id}
                      onChange={(e) =>
                        setFormData({ ...formData, publisher_id: e.target.value })
                      }
                      placeholder="ca-pub-xxxxxxxxxxxxxxxxx"
                    />
                  </div>

                  <div>
                    <Label>Ad Slot ID</Label>
                    <Input
                      value={formData.ad_slot_id}
                      onChange={(e) =>
                        setFormData({ ...formData, ad_slot_id: e.target.value })
                      }
                      placeholder="1234567890"
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Genişlik (px)</Label>
                  <Input
                    type="number"
                    value={formData.width}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        width: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Yükseklik (px)</Label>
                  <Input
                    type="number"
                    value={formData.height}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        height: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <Label>Reklam Aktif</Label>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked })
                  }
                />
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  İptal
                </Button>
                <Button type="submit" className="bg-primary">
                  Ekle
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-white/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Toplam Reklam
            </CardTitle>
            <DollarSign className="w-5 h-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
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
            <div className="text-3xl font-bold">0</div>
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
            <div className="text-3xl font-bold">0</div>
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
            <div className="text-3xl font-bold">₺0.00</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-white/10">
        <CardHeader>
          <CardTitle>Reklam Listesi</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-center py-8">
            Henüz reklam eklenmemiş. Yukarıdaki butonu kullanarak ilk reklamınızı
            ekleyin.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
