'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2, Search, Eye, ChevronLeft, ChevronRight, CheckSquare } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
import { generateSlug } from '@/lib/utils/slug';
import { FileUpload } from '@/components/FileUpload';
import type { Content, Category, ContentType, AgeGroup } from '@/types';

export default function IceriklerPage() {
  const [contents, setContents] = useState<Content[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterAgeGroup, setFilterAgeGroup] = useState<string>('all');
  const [filterContentType, setFilterContentType] = useState<string>('all');
  const [filterPublished, setFilterPublished] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [formData, setFormData] = useState<{
    title: string;
    slug: string;
    description: string;
    instructions: string;
    content_type: ContentType;
    age_group: AgeGroup;
    category_id: string;
    thumbnail_url: string;
    content_url: string;
    duration_minutes: number;
    is_premium: boolean;
    is_featured: boolean;
    published: boolean;
    meta_title: string;
    meta_description: string;
    keywords: string[];
  }>({
    title: '',
    slug: '',
    description: '',
    instructions: '',
    content_type: 'game',
    age_group: 'child',
    category_id: '',
    thumbnail_url: '',
    content_url: '',
    duration_minutes: 0,
    is_premium: false,
    is_featured: false,
    published: true,
    meta_title: '',
    meta_description: '',
    keywords: [],
  });

  useEffect(() => {
    fetchContents();
    fetchCategories();
  }, []);

  async function fetchContents() {
    try {
      const { data, error } = await supabase
        .from('content')
        .select('*, categories(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContents(data || []);
    } catch (error: any) {
      toast.error('İçerikler yüklenemedi: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('published', true)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error('Kategoriler yüklenemedi:', error);
    }
  }

  async function handleAdd() {
    try {
      const { data, error } = await (supabase
        .from('content')
        .insert as any)([
          {
            ...formData,
            slug: formData.slug || generateSlug(formData.title),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      toast.success('İçerik başarıyla eklendi!');
      setIsAddDialogOpen(false);
      resetForm();
      fetchContents();
    } catch (error: any) {
      toast.error('İçerik eklenemedi: ' + error.message);
    }
  }

  async function handleEdit() {
    if (!editingContent) return;

    try {
      const { error } = await (supabase
        .from('content')
        .update as any)({
          ...formData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingContent.id);

      if (error) throw error;

      toast.success('İçerik güncellendi!');
      setIsEditDialogOpen(false);
      setEditingContent(null);
      resetForm();
      fetchContents();
    } catch (error: any) {
      toast.error('İçerik güncellenemedi: ' + error.message);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;

    try {
      const { error } = await supabase.from('content').delete().eq('id', deleteId);

      if (error) throw error;

      toast.success('İçerik silindi!');
      setDeleteId(null);
      fetchContents();
    } catch (error: any) {
      toast.error('İçerik silinemedi: ' + error.message);
    }
  }

  async function togglePublished(id: string, currentStatus: boolean) {
    try {
      const { error } = await (supabase
        .from('content')
        .update as any)({ published: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast.success(currentStatus ? 'İçerik yayından kaldırıldı' : 'İçerik yayınlandı');
      fetchContents();
    } catch (error: any) {
      toast.error('Durum değiştirilemedi: ' + error.message);
    }
  }

  function resetForm() {
    setFormData({
      title: '',
      slug: '',
      description: '',
      instructions: '',
      content_type: 'game',
      age_group: 'child',
      category_id: '',
      thumbnail_url: '',
      content_url: '',
      duration_minutes: 0,
      is_premium: false,
      is_featured: false,
      published: true,
      meta_title: '',
      meta_description: '',
      keywords: [],
    });
  }

  function openEditDialog(content: Content) {
    setEditingContent(content);
    setFormData({
      title: content.title,
      slug: content.slug,
      description: content.description || '',
      instructions: content.instructions || '',
      content_type: content.content_type,
      age_group: content.age_group,
      category_id: content.category_id || '',
      thumbnail_url: content.thumbnail_url,
      content_url: content.content_url,
      duration_minutes: content.duration_minutes || 0,
      is_premium: content.is_premium,
      is_featured: content.is_featured,
      published: content.published,
      meta_title: content.meta_title || '',
      meta_description: content.meta_description || '',
      keywords: content.keywords || [],
    });
    setIsEditDialogOpen(true);
  }

  const filteredContents = contents.filter((content) => {
    const matchesSearch =
      content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || content.category_id === filterCategory;
    const matchesAge = filterAgeGroup === 'all' || content.age_group === filterAgeGroup;
    const matchesType = filterContentType === 'all' || content.content_type === filterContentType;
    const matchesPublished = 
      filterPublished === 'all' || 
      (filterPublished === 'published' && content.published) ||
      (filterPublished === 'draft' && !content.published);
    return matchesSearch && matchesCategory && matchesAge && matchesType && matchesPublished;
  });

  // Pagination
  const totalPages = Math.ceil(filteredContents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedContents = filteredContents.slice(startIndex, endIndex);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory, filterAgeGroup, filterContentType, filterPublished]);

  // Toplu işlemler
  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedContents.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedContents.map(c => c.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  async function handleBulkDelete() {
    if (selectedIds.size === 0) return;
    try {
      const { error } = await supabase
        .from('content')
        .delete()
        .in('id', Array.from(selectedIds));
      
      if (error) throw error;
      toast.success(`${selectedIds.size} içerik silindi!`);
      setSelectedIds(new Set());
      fetchContents();
    } catch (error: any) {
      toast.error('Toplu silme başarısız: ' + error.message);
    }
  }

  async function handleBulkPublish(publish: boolean) {
    if (selectedIds.size === 0) return;
    try {
      const { error } = await (supabase
        .from('content')
        .update as any)({ published: publish })
        .in('id', Array.from(selectedIds));
      
      if (error) throw error;
      toast.success(`${selectedIds.size} içerik ${publish ? 'yayınlandı' : 'yayından kaldırıldı'}!`);
      setSelectedIds(new Set());
      fetchContents();
    } catch (error: any) {
      toast.error('Toplu işlem başarısız: ' + error.message);
    }
  }

  const ContentForm = () => (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="title">Başlık *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => {
              setFormData({ ...formData, title: e.target.value });
              if (!formData.slug) {
                setFormData({
                  ...formData,
                  title: e.target.value,
                  slug: generateSlug(e.target.value),
                });
              }
            }}
            placeholder="Oyun başlığı"
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="slug">Slug *</Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="oyun-basligi"
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="description">Açıklama</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Oyun açıklaması"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="content_type">İçerik Tipi *</Label>
          <Select
            value={formData.content_type}
            onValueChange={(value: any) => setFormData({ ...formData, content_type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="game">Oyun</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="audio_story">Sesli Masal</SelectItem>
              <SelectItem value="coloring_book">Boyama</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="age_group">Yaş Grubu *</Label>
          <Select
            value={formData.age_group}
            onValueChange={(value: any) => setFormData({ ...formData, age_group: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="baby">Bebek (0-3)</SelectItem>
              <SelectItem value="child">Çocuk (4-8)</SelectItem>
              <SelectItem value="adult">Yetişkin (9+)</SelectItem>
              <SelectItem value="family">Aile</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2">
          <Label htmlFor="category">Kategori</Label>
          <Select
            value={formData.category_id}
            onValueChange={(value) => setFormData({ ...formData, category_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Kategori seçin" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2">
          <FileUpload
            value={formData.thumbnail_url}
            onChange={(url) => setFormData({ ...formData, thumbnail_url: url })}
            folder="thumbnails"
            accept="image/*"
            label="Thumbnail *"
            maxSize={5}
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="content_url">İçerik URL *</Label>
          <Input
            id="content_url"
            value={formData.content_url}
            onChange={(e) => setFormData({ ...formData, content_url: e.target.value })}
            placeholder="https://... (iframe URL veya video/audio URL)"
          />
          {formData.content_type === 'video' && (
            <FileUpload
              value={formData.content_url}
              onChange={(url) => setFormData({ ...formData, content_url: url })}
              folder="videos"
              accept="video/*"
              label="Video Dosyası"
              maxSize={100}
            />
          )}
          {formData.content_type === 'audio_story' && (
            <FileUpload
              value={formData.content_url}
              onChange={(url) => setFormData({ ...formData, content_url: url })}
              folder="audio"
              accept="audio/*"
              label="Ses Dosyası"
              maxSize={50}
            />
          )}
        </div>

        <div>
          <Label htmlFor="duration">Süre (dakika)</Label>
          <Input
            id="duration"
            type="number"
            value={formData.duration_minutes}
            onChange={(e) =>
              setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })
            }
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="instructions">Talimatlar/Kurallar</Label>
          <Textarea
            id="instructions"
            value={formData.instructions}
            onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
            placeholder="Oyun kuralları veya talimatları"
            rows={3}
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="meta_title">SEO Meta Başlık</Label>
          <Input
            id="meta_title"
            value={formData.meta_title}
            onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
            placeholder="SEO için özel başlık (opsiyonel)"
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="meta_description">SEO Meta Açıklama</Label>
          <Textarea
            id="meta_description"
            value={formData.meta_description}
            onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
            placeholder="SEO için açıklama (opsiyonel)"
            rows={2}
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="keywords">Keywords (virgülle ayırın)</Label>
          <Input
            id="keywords"
            value={formData.keywords.join(', ')}
            onChange={(e) => {
              const keywords = e.target.value.split(',').map((k) => k.trim()).filter(Boolean);
              setFormData({ ...formData, keywords });
            }}
            placeholder="oyun, eğitici, çocuk, zeka"
          />
        </div>

        <div className="flex items-center space-x-4 pt-6">
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.is_premium}
              onCheckedChange={(checked) => setFormData({ ...formData, is_premium: checked })}
            />
            <Label>Premium</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.is_featured}
              onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
            />
            <Label>Öne Çıkan</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.published}
              onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
            />
            <Label>Yayınla</Label>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">İçerik Yönetimi</h1>
          <p className="text-gray-400 mt-1">Oyunları ve içerikleri yönetin</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plus className="w-4 h-4 mr-2" />
              Yeni İçerik
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Yeni İçerik Ekle</DialogTitle>
              <DialogDescription>Yeni oyun veya içerik ekleyin</DialogDescription>
            </DialogHeader>
            <ContentForm />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                İptal
              </Button>
              <Button onClick={handleAdd} className="bg-orange-500 hover:bg-orange-600">
                Ekle
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-card border-white/10">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Kategoriler</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterAgeGroup} onValueChange={setFilterAgeGroup}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Yaş Grubu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Yaşlar</SelectItem>
                <SelectItem value="baby">Bebek</SelectItem>
                <SelectItem value="child">Çocuk</SelectItem>
                <SelectItem value="adult">Yetişkin</SelectItem>
                <SelectItem value="family">Aile</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterContentType} onValueChange={setFilterContentType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="İçerik Tipi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Tipler</SelectItem>
                <SelectItem value="game">Oyun</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="audio_story">Sesli Masal</SelectItem>
                <SelectItem value="coloring_book">Boyama</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPublished} onValueChange={setFilterPublished}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="published">Yayınlanan</SelectItem>
                <SelectItem value="draft">Taslak</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
              <span className="text-sm text-gray-400">{selectedIds.size} içerik seçildi</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkPublish(true)}
                className="ml-auto"
              >
                Toplu Yayınla
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkPublish(false)}
              >
                Toplu Kaldır
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleBulkDelete}
              >
                Toplu Sil
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleSelectAll}
                    className="h-8 w-8 p-0"
                  >
                    <CheckSquare className={`h-4 w-4 ${selectedIds.size === paginatedContents.length && paginatedContents.length > 0 ? 'text-orange-500' : ''}`} />
                  </Button>
                </TableHead>
                <TableHead>Başlık</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Tip</TableHead>
                <TableHead>Yaş</TableHead>
                <TableHead>Görüntülenme</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedContents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-400">
                    İçerik bulunamadı
                  </TableCell>
                </TableRow>
              ) : (
                paginatedContents.map((content) => (
                  <TableRow key={content.id}>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSelect(content.id)}
                        className="h-8 w-8 p-0"
                      >
                        <CheckSquare className={`h-4 w-4 ${selectedIds.has(content.id) ? 'text-orange-500' : ''}`} />
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">{content.title}</TableCell>
                    <TableCell>
                      {(content as any).categories?.name || 'Kategorisiz'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{content.content_type}</Badge>
                    </TableCell>
                    <TableCell>{content.age_group}</TableCell>
                    <TableCell>{content.play_count}</TableCell>
                    <TableCell>
                      <Switch
                        checked={content.published}
                        onCheckedChange={() => togglePublished(content.id, content.published)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`/oyunlar/${content.slug}`, '_blank')}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(content)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(content.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
              <div className="text-sm text-gray-400">
                {startIndex + 1}-{Math.min(endIndex, filteredContents.length)} / {filteredContents.length} içerik
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={currentPage === pageNum ? "bg-orange-500" : ""}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>İçerik Düzenle</DialogTitle>
            <DialogDescription>İçerik bilgilerini güncelleyin</DialogDescription>
          </DialogHeader>
          <ContentForm />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditingContent(null);
                resetForm();
              }}
            >
              İptal
            </Button>
            <Button onClick={handleEdit} className="bg-orange-500 hover:bg-orange-600">
              Güncelle
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. İçerik kalıcı olarak silinecek.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
