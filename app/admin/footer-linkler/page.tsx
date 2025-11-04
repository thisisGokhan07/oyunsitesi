'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, ExternalLink, Link as LinkIcon } from 'lucide-react';

type FooterLink = {
  id: string;
  title: string;
  url: string;
  section: 'quick_links' | 'support' | 'social';
  icon_name: string | null;
  sort_order: number;
  is_external: boolean;
  published: boolean;
  created_at: string;
  updated_at: string;
};

const SECTIONS = {
  quick_links: 'Hızlı Linkler',
  support: 'Destek',
  social: 'Sosyal Medya',
};

const ICONS = [
  'Info', 'FolderTree', 'Sparkles', 'TrendingUp', 'Mail', 'HelpCircle', 'Shield', 'FileText',
  'Instagram', 'Youtube', 'Music', 'Twitter', 'Facebook', 'Linkedin', 'Github', 'Globe',
];

export default function FooterLinklerPage() {
  const { profile } = useAuth();
  const [links, setLinks] = useState<FooterLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<FooterLink | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    section: 'quick_links' as 'quick_links' | 'support' | 'social',
    icon_name: '',
    sort_order: 0,
    is_external: false,
    published: true,
  });

  useEffect(() => {
    if (profile?.role && ['super_admin', 'admin'].includes(profile.role)) {
      loadLinks();
    }
  }, [profile]);

  async function loadLinks() {
    try {
      const { data, error } = await supabase
        .from('footer_links')
        .select('*')
        .order('section', { ascending: true })
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setLinks((data as any) || []);
    } catch (error: any) {
      toast.error('Linkler yüklenemedi: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  function openEditDialog(link?: FooterLink) {
    if (link) {
      setEditingLink(link);
      setFormData({
        title: link.title,
        url: link.url,
        section: link.section,
        icon_name: link.icon_name || '',
        sort_order: link.sort_order,
        is_external: link.is_external,
        published: link.published,
      });
    } else {
      setEditingLink(null);
      setFormData({
        title: '',
        url: '',
        section: 'quick_links',
        icon_name: '',
        sort_order: links.filter(l => l.section === 'quick_links').length + 1,
        is_external: false,
        published: true,
      });
    }
    setEditDialogOpen(true);
  }

  async function saveLink() {
    try {
      if (editingLink) {
        const { error } = await supabase
          .from('footer_links')
          .update(formData)
          .eq('id', editingLink.id);

        if (error) throw error;
        toast.success('Link güncellendi!');
      } else {
        const { error } = await supabase
          .from('footer_links')
          .insert([formData]);

        if (error) throw error;
        toast.success('Link eklendi!');
      }
      setEditDialogOpen(false);
      loadLinks();
    } catch (error: any) {
      toast.error('Link kaydedilemedi: ' + error.message);
    }
  }

  async function deleteLink(id: string) {
    if (!confirm('Bu linki silmek istediğinize emin misiniz?')) return;

    try {
      const { error } = await supabase
        .from('footer_links')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Link silindi!');
      loadLinks();
    } catch (error: any) {
      toast.error('Link silinemedi: ' + error.message);
    }
  }

  async function togglePublished(id: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from('footer_links')
        .update({ published: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success(currentStatus ? 'Link gizlendi' : 'Link yayınlandı');
      loadLinks();
    } catch (error: any) {
      toast.error('Durum değiştirilemedi: ' + error.message);
    }
  }

  async function updateSortOrder(id: string, direction: 'up' | 'down') {
    const link = links.find(l => l.id === id);
    if (!link) return;

    const sameSectionLinks = links
      .filter(l => l.section === link.section)
      .sort((a, b) => a.sort_order - b.sort_order);

    const currentIndex = sameSectionLinks.findIndex(l => l.id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= sameSectionLinks.length) return;

    const targetLink = sameSectionLinks[newIndex];
    const newSortOrder = targetLink.sort_order;
    const targetNewSortOrder = link.sort_order;

    try {
      await supabase
        .from('footer_links')
        .update({ sort_order: newSortOrder })
        .eq('id', id);

      await supabase
        .from('footer_links')
        .update({ sort_order: targetNewSortOrder })
        .eq('id', targetLink.id);

      toast.success('Sıralama güncellendi');
      loadLinks();
    } catch (error: any) {
      toast.error('Sıralama güncellenemedi: ' + error.message);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const groupedLinks = {
    quick_links: links.filter(l => l.section === 'quick_links').sort((a, b) => a.sort_order - b.sort_order),
    support: links.filter(l => l.section === 'support').sort((a, b) => a.sort_order - b.sort_order),
    social: links.filter(l => l.section === 'social').sort((a, b) => a.sort_order - b.sort_order),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Footer Linkleri</h1>
          <p className="text-gray-400 mt-1">Footer'daki linkleri yönetin</p>
        </div>
        <Button onClick={() => openEditDialog()} className="bg-orange-500 hover:bg-orange-600">
          <Plus className="w-4 h-4 mr-2" />
          Yeni Link
        </Button>
      </div>

      {Object.entries(groupedLinks).map(([section, sectionLinks]) => (
        <Card key={section} className="bg-card border-white/10">
          <CardHeader>
            <CardTitle>{SECTIONS[section as keyof typeof SECTIONS]}</CardTitle>
          </CardHeader>
          <CardContent>
            {sectionLinks.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Bu bölümde link yok</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sıra</TableHead>
                    <TableHead>Başlık</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Icon</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sectionLinks.map((link, index) => (
                    <TableRow key={link.id}>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateSortOrder(link.id, 'up')}
                            disabled={index === 0}
                          >
                            <ArrowUp className="w-4 h-4" />
                          </Button>
                          <span className="text-sm">{link.sort_order}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateSortOrder(link.id, 'down')}
                            disabled={index === sectionLinks.length - 1}
                          >
                            <ArrowDown className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{link.title}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-400 truncate max-w-xs">{link.url}</span>
                          {link.is_external && <ExternalLink className="w-4 h-4 text-gray-500" />}
                        </div>
                      </TableCell>
                      <TableCell>
                        {link.icon_name && (
                          <Badge variant="outline">{link.icon_name}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={link.published}
                          onCheckedChange={() => togglePublished(link.id, link.published)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(link)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteLink(link.id)}
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
      ))}

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-card border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle>{editingLink ? 'Link Düzenle' : 'Yeni Link Ekle'}</DialogTitle>
            <DialogDescription>
              Footer linkini düzenleyin
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="title">Başlık</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Hakkımızda"
              />
            </div>
            <div>
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="/about veya https://..."
              />
            </div>
            <div>
              <Label htmlFor="section">Bölüm</Label>
              <Select
                value={formData.section}
                onValueChange={(value: any) => setFormData({ ...formData, section: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quick_links">Hızlı Linkler</SelectItem>
                  <SelectItem value="support">Destek</SelectItem>
                  <SelectItem value="social">Sosyal Medya</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="icon_name">Icon (Lucide)</Label>
              <Select
                value={formData.icon_name}
                onValueChange={(value) => setFormData({ ...formData, icon_name: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Icon seçin (opsiyonel)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Icon Yok</SelectItem>
                  {ICONS.map((icon) => (
                    <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sort_order">Sıra</Label>
              <Input
                id="sort_order"
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="is_external">Harici Link</Label>
              <Switch
                id="is_external"
                checked={formData.is_external}
                onCheckedChange={(checked) => setFormData({ ...formData, is_external: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="published">Yayınla</Label>
              <Switch
                id="published"
                checked={formData.published}
                onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
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
                onClick={saveLink}
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

