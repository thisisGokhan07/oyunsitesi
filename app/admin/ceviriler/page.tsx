'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Edit, Search, Globe, Languages } from 'lucide-react';

type Language = {
  id: string;
  code: string;
  name: string;
  native_name: string;
  flag_emoji: string | null;
};

type Translation = {
  id: string;
  language_code: string;
  namespace: string;
  key: string;
  value: string;
};

const NAMESPACES = [
  { value: 'common', label: 'Ortak (Common)' },
  { value: 'header', label: 'Header' },
  { value: 'footer', label: 'Footer' },
  { value: 'games', label: 'Oyunlar' },
  { value: 'admin', label: 'Admin' },
  { value: 'auth', label: 'Kimlik Doğrulama' },
  { value: 'profile', label: 'Profil' },
  { value: 'settings', label: 'Ayarlar' },
];

export default function CevirilerPage() {
  const { profile } = useAuth();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTranslation, setEditingTranslation] = useState<Translation | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [selectedNamespace, setSelectedNamespace] = useState<string>('common');
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    language_code: '',
    namespace: 'common',
    key: '',
    value: '',
  });

  useEffect(() => {
    if (profile?.role && ['super_admin', 'admin', 'editor'].includes(profile.role)) {
      loadLanguages();
    }
  }, [profile]);

  useEffect(() => {
    if (selectedLanguage && selectedNamespace) {
      loadTranslations();
    }
  }, [selectedLanguage, selectedNamespace]);

  async function loadLanguages() {
    try {
      const { data, error } = await supabase
        .from('languages')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      const languages = (data || []) as Language[];
      setLanguages(languages);
      if (languages.length > 0 && !selectedLanguage) {
        setSelectedLanguage(languages[0].code);
        setFormData({ ...formData, language_code: languages[0].code });
      }
    } catch (error: any) {
      toast.error('Diller yüklenemedi: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadTranslations() {
    try {
      setLoading(true);
      let query = supabase
        .from('translations')
        .select('*')
        .eq('language_code', selectedLanguage)
        .eq('namespace', selectedNamespace)
        .order('key', { ascending: true });

      if (searchQuery) {
        query = query.or(`key.ilike.%${searchQuery}%,value.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTranslations(data || []);
    } catch (error: any) {
      toast.error('Çeviriler yüklenemedi: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  function openEditDialog(translation?: Translation) {
    if (translation) {
      setEditingTranslation(translation);
      setFormData({
        language_code: translation.language_code,
        namespace: translation.namespace,
        key: translation.key,
        value: translation.value,
      });
    } else {
      setEditingTranslation(null);
      setFormData({
        language_code: selectedLanguage,
        namespace: selectedNamespace,
        key: '',
        value: '',
      });
    }
    setEditDialogOpen(true);
  }

  async function saveTranslation() {
    try {
      if (!formData.language_code || !formData.namespace || !formData.key || !formData.value) {
        toast.error('Lütfen tüm alanları doldurun!');
        return;
      }

      const translationData = {
        language_code: formData.language_code,
        namespace: formData.namespace,
        key: formData.key,
        value: formData.value,
      };

      if (editingTranslation) {
        const { error } = await (supabase
          .from('translations')
          .update as any)(translationData)
          .eq('id', editingTranslation.id);

        if (error) throw error;
        toast.success('Çeviri güncellendi!');
      } else {
        const { error } = await (supabase
          .from('translations')
          .insert as any)([translationData]);

        if (error) throw error;
        toast.success('Çeviri eklendi!');
      }

      setEditDialogOpen(false);
      loadTranslations();
    } catch (error: any) {
      toast.error('Çeviri kaydedilemedi: ' + error.message);
    }
  }

  async function deleteTranslation(id: string) {
    if (!confirm('Bu çeviriyi silmek istediğinize emin misiniz?')) return;

    try {
      const { error } = await supabase
        .from('translations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Çeviri silindi!');
      loadTranslations();
    } catch (error: any) {
      toast.error('Çeviri silinemedi: ' + error.message);
    }
  }

  if (!profile?.role || !['super_admin', 'admin', 'editor'].includes(profile.role)) {
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

  const filteredTranslations = translations.filter(
    (t) =>
      !searchQuery ||
      t.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Çeviri Yönetimi</h1>
          <p className="text-gray-400 mt-1">UI metinlerini çevirin ve düzenleyin</p>
        </div>
        <Button onClick={() => openEditDialog()} className="gap-2" disabled={!selectedLanguage}>
          <Plus className="h-4 w-4" />
          Yeni Çeviri Ekle
        </Button>
      </div>

      <Card className="bg-card border-white/10">
        <CardHeader>
          <CardTitle>Çeviriler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Dil Seç</Label>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Dil seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.id} value={lang.code}>
                        <span className="flex items-center gap-2">
                          <span>{lang.flag_emoji}</span>
                          <span>{lang.native_name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Namespace</Label>
                <Select value={selectedNamespace} onValueChange={setSelectedNamespace}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NAMESPACES.map((ns) => (
                      <SelectItem key={ns.value} value={ns.value}>
                        {ns.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Ara</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Key veya değer ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-400">Yükleniyor...</div>
          ) : !selectedLanguage ? (
            <div className="text-center py-8 text-gray-400">Lütfen bir dil seçin.</div>
          ) : filteredTranslations.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              {searchQuery ? 'Arama sonucu bulunamadı.' : 'Bu namespace için çeviri bulunamadı.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Namespace</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Değer</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTranslations.map((translation) => (
                    <TableRow key={translation.id}>
                      <TableCell>
                        <Badge variant="outline">{translation.namespace}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{translation.key}</TableCell>
                      <TableCell className="max-w-md truncate">{translation.value}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(translation)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTranslation(translation.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            Sil
                          </Button>
                        </div>
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
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingTranslation ? 'Çeviri Düzenle' : 'Yeni Çeviri Ekle'}
            </DialogTitle>
            <DialogDescription>
              Çeviri bilgilerini girin. Key formatı: namespace.key (örn: header.login)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="language_code">Dil *</Label>
                <Select
                  value={formData.language_code}
                  onValueChange={(value) => setFormData({ ...formData, language_code: value })}
                  disabled={!!editingTranslation}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Dil seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.id} value={lang.code}>
                        {lang.flag_emoji} {lang.native_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="namespace">Namespace *</Label>
                <Select
                  value={formData.namespace}
                  onValueChange={(value) => setFormData({ ...formData, namespace: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NAMESPACES.map((ns) => (
                      <SelectItem key={ns.value} value={ns.value}>
                        {ns.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="key">Key *</Label>
              <Input
                id="key"
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                placeholder="login, search, play..."
                disabled={!!editingTranslation}
              />
              <p className="text-xs text-gray-400">
                Örnek: header.login, games.play, common.save
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">Çeviri *</Label>
              <Textarea
                id="value"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder="Çeviri metnini buraya yazın..."
                rows={4}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={saveTranslation}>
              {editingTranslation ? 'Güncelle' : 'Ekle'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
