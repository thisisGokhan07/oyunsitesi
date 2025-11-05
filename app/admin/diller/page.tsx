'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Edit, Globe, Star } from 'lucide-react';

type Language = {
  id: string;
  code: string;
  name: string;
  native_name: string;
  flag_emoji: string | null;
  is_active: boolean;
  is_default: boolean;
  sort_order: number;
};

export default function DillerPage() {
  const { profile } = useAuth();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingLanguage, setEditingLanguage] = useState<Language | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    native_name: '',
    flag_emoji: '',
    is_active: true,
    is_default: false,
    sort_order: 0,
  });

  useEffect(() => {
    if (profile?.role && ['super_admin', 'admin'].includes(profile.role)) {
      loadLanguages();
    }
  }, [profile]);

  async function loadLanguages() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('languages')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setLanguages(data || []);
    } catch (error: any) {
      toast.error('Diller yüklenemedi: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  function openEditDialog(language?: Language) {
    if (language) {
      setEditingLanguage(language);
      setFormData({
        code: language.code,
        name: language.name,
        native_name: language.native_name,
        flag_emoji: language.flag_emoji || '',
        is_active: language.is_active,
        is_default: language.is_default,
        sort_order: language.sort_order,
      });
    } else {
      setEditingLanguage(null);
      setFormData({
        code: '',
        name: '',
        native_name: '',
        flag_emoji: '',
        is_active: true,
        is_default: false,
        sort_order: languages.length + 1,
      });
    }
    setEditDialogOpen(true);
  }

  async function saveLanguage() {
    try {
      if (!formData.code || !formData.name || !formData.native_name) {
        toast.error('Lütfen tüm zorunlu alanları doldurun!');
        return;
      }

      // If setting as default, unset other defaults
      if (formData.is_default) {
        await supabase
          .from('languages')
          .update({ is_default: false } as any)
          .neq('id', editingLanguage?.id || '');
      }

      const languageData = {
        code: formData.code.toLowerCase().trim(),
        name: formData.name,
        native_name: formData.native_name,
        flag_emoji: formData.flag_emoji || null,
        is_active: formData.is_active,
        is_default: formData.is_default,
        sort_order: formData.sort_order,
      };

      if (editingLanguage) {
        const { error } = await (supabase
          .from('languages')
          .update as any)(languageData)
          .eq('id', editingLanguage.id);

        if (error) throw error;
        toast.success('Dil güncellendi!');
      } else {
        const { error } = await (supabase
          .from('languages')
          .insert as any)([languageData]);

        if (error) throw error;
        toast.success('Dil eklendi!');
      }

      setEditDialogOpen(false);
      loadLanguages();
    } catch (error: any) {
      toast.error('Dil kaydedilemedi: ' + error.message);
    }
  }

  async function toggleActive(id: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from('languages')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success(currentStatus ? 'Dil pasif edildi!' : 'Dil aktif edildi!');
      loadLanguages();
    } catch (error: any) {
      toast.error('Durum değiştirilemedi: ' + error.message);
    }
  }

  async function setAsDefault(id: string) {
    try {
      // Unset all defaults
      await supabase
        .from('languages')
        .update({ is_default: false });

      // Set this as default
      const { error } = await supabase
        .from('languages')
        .update({ is_default: true })
        .eq('id', id);

      if (error) throw error;
      toast.success('Varsayılan dil ayarlandı!');
      loadLanguages();
    } catch (error: any) {
      toast.error('Varsayılan dil ayarlanamadı: ' + error.message);
    }
  }

  if (!profile?.role || !['super_admin', 'admin'].includes(profile.role)) {
    return (
      <div className="p-6">
        <Card className="bg-card border-white/10">
          <CardContent className="p-6">
            <p className="text-center text-gray-400">Bu sayfaya erişim yetkiniz yok.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dil Yönetimi</h1>
          <p className="text-gray-400 mt-1">Dilleri yönetin ve yapılandırın</p>
        </div>
        <Button onClick={() => openEditDialog()} className="gap-2">
          <Plus className="h-4 w-4" />
          Yeni Dil Ekle
        </Button>
      </div>

      <Card className="bg-card border-white/10">
        <CardHeader>
          <CardTitle>Diller ({languages.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-400">Yükleniyor...</div>
          ) : languages.length === 0 ? (
            <div className="text-center py-8 text-gray-400">Henüz dil eklenmemiş.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sıra</TableHead>
                    <TableHead>Bayrak</TableHead>
                    <TableHead>Kod</TableHead>
                    <TableHead>İsim</TableHead>
                    <TableHead>Yerel İsim</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Varsayılan</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {languages.map((language) => (
                    <TableRow key={language.id}>
                      <TableCell>{language.sort_order}</TableCell>
                      <TableCell>
                        <span className="text-2xl">{language.flag_emoji || '🌐'}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{language.code}</Badge>
                      </TableCell>
                      <TableCell>{language.name}</TableCell>
                      <TableCell>{language.native_name}</TableCell>
                      <TableCell>
                        <Switch
                          checked={language.is_active}
                          onCheckedChange={() => toggleActive(language.id, language.is_active)}
                        />
                      </TableCell>
                      <TableCell>
                        {language.is_default ? (
                          <Badge className="bg-primary">Varsayılan</Badge>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setAsDefault(language.id)}
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(language)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingLanguage ? 'Dil Düzenle' : 'Yeni Dil Ekle'}
            </DialogTitle>
            <DialogDescription>
              Dil bilgilerini girin ve ayarlarını yapılandırın.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Dil Kodu *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="tr, en, de..."
                  disabled={!!editingLanguage}
                />
                <p className="text-xs text-gray-400">ISO 639-1 formatı (örn: tr, en)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="flag">Bayrak Emoji</Label>
                <Input
                  id="flag"
                  value={formData.flag_emoji}
                  onChange={(e) => setFormData({ ...formData, flag_emoji: e.target.value })}
                  placeholder="🇹🇷"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">İngilizce İsim *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Turkish, English..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="native_name">Yerel İsim *</Label>
              <Input
                id="native_name"
                value={formData.native_name}
                onChange={(e) => setFormData({ ...formData, native_name: e.target.value })}
                placeholder="Türkçe, English..."
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sort_order">Sıra</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="flex items-center space-x-2 pt-8">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Aktif</Label>
              </div>

              <div className="flex items-center space-x-2 pt-8">
                <Switch
                  id="is_default"
                  checked={formData.is_default}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_default: checked })}
                />
                <Label htmlFor="is_default">Varsayılan</Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={saveLanguage}>
              {editingLanguage ? 'Güncelle' : 'Ekle'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
