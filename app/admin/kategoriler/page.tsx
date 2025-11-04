'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2, Gamepad2 } from 'lucide-react';
import * as Icons from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
import { generateSlug } from '@/lib/utils/slug';
import type { Category, AgeGroup } from '@/types';

const iconList = ['Gamepad2', 'Brain', 'Palette', 'Music', 'Trophy', 'Book', 'Heart', 'Star', 'Sparkles', 'Zap', 'Target', 'Award', 'Flag', 'Crown', 'Puzzle', 'Users', 'Baby', 'Home', 'Calculator', 'Lightbulb'];

export default function KategorilerPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    slug: string;
    description: string;
    age_group: AgeGroup;
    icon_name: string;
    color_hex: string;
    sort_order: number;
    published: boolean;
  }>({ name: '', slug: '', description: '', age_group: 'child', icon_name: 'Gamepad2', color_hex: '#f97316', sort_order: 0, published: true });

  useEffect(() => { fetchCategories(); }, []);

  async function fetchCategories() {
    try {
      const { data, error } = await supabase.from('categories').select('*').order('sort_order');
      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      toast.error('Kategoriler yüklenemedi: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    try {
      const { error } = await (supabase.from('categories').insert as any)([{ ...formData, slug: formData.slug || generateSlug(formData.name) }]);
      if (error) throw error;
      toast.success('Kategori eklendi!');
      setIsAddDialogOpen(false);
      resetForm();
      fetchCategories();
    } catch (error: any) {
      toast.error('Hata: ' + error.message);
    }
  }

  async function handleEdit() {
    if (!editingCategory) return;
    try {
      const { error } = await (supabase.from('categories').update as any)(formData).eq('id', editingCategory.id);
      if (error) throw error;
      toast.success('Kategori güncellendi!');
      setIsEditDialogOpen(false);
      setEditingCategory(null);
      resetForm();
      fetchCategories();
    } catch (error: any) {
      toast.error('Hata: ' + error.message);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      const { error } = await supabase.from('categories').delete().eq('id', deleteId);
      if (error) throw error;
      toast.success('Kategori silindi!');
      setDeleteId(null);
      fetchCategories();
    } catch (error: any) {
      toast.error('Hata: ' + error.message);
    }
  }

  async function togglePublished(id: string, currentStatus: boolean) {
    try {
      const { error } = await (supabase.from('categories').update as any)({ published: !currentStatus }).eq('id', id);
      if (error) throw error;
      toast.success(currentStatus ? 'Kategori gizlendi' : 'Kategori yayınlandı');
      fetchCategories();
    } catch (error: any) {
      toast.error('Hata: ' + error.message);
    }
  }

  function resetForm() { setFormData({ name: '', slug: '', description: '', age_group: 'child', icon_name: 'Gamepad2', color_hex: '#f97316', sort_order: 0, published: true }); }

  function openEditDialog(category: Category) {
    setEditingCategory(category);
    setFormData({ name: category.name, slug: category.slug, description: category.description || '', age_group: category.age_group, icon_name: category.icon_name || 'Gamepad2', color_hex: category.color_hex || '#f97316', sort_order: category.sort_order || 0, published: category.published });
    setIsEditDialogOpen(true);
  }

  const CategoryForm = () => {
    const IconComponent = Icons[formData.icon_name as keyof typeof Icons] as any;
    return (<div className="space-y-4"><div className="grid grid-cols-2 gap-4"><div className="col-span-2"><Label>Kategori Adı *</Label><Input value={formData.name} onChange={(e) => { setFormData({ ...formData, name: e.target.value }); if (!formData.slug) { setFormData({ ...formData, name: e.target.value, slug: generateSlug(e.target.value) }); } }} placeholder="Matematik Oyunları" /></div><div className="col-span-2"><Label>Slug *</Label><Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="matematik-oyunlari" /></div><div className="col-span-2"><Label>Açıklama</Label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} /></div><div><Label>Yaş Grubu</Label><Select value={formData.age_group} onValueChange={(value: any) => setFormData({ ...formData, age_group: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="baby">Bebek</SelectItem><SelectItem value="child">Çocuk</SelectItem><SelectItem value="adult">Yetişkin</SelectItem><SelectItem value="family">Aile</SelectItem></SelectContent></Select></div><div><Label>Sıra</Label><Input type="number" value={formData.sort_order} onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })} /></div><div><Label>İkon</Label><Select value={formData.icon_name} onValueChange={(v) => setFormData({ ...formData, icon_name: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{iconList.map(icon => <SelectItem key={icon} value={icon}>{icon}</SelectItem>)}</SelectContent></Select></div><div><Label>Renk</Label><div className="flex gap-2"><Input type="color" value={formData.color_hex} onChange={(e) => setFormData({ ...formData, color_hex: e.target.value })} className="w-20 h-10" /><Input value={formData.color_hex} onChange={(e) => setFormData({ ...formData, color_hex: e.target.value })} /></div></div><div className="col-span-2"><Switch checked={formData.published} onCheckedChange={(c) => setFormData({ ...formData, published: c })} /><Label className="ml-2">Yayınla</Label></div><div className="col-span-2 p-4 bg-gray-800 rounded-lg"><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: formData.color_hex }}>{IconComponent && <IconComponent className="w-6 h-6 text-white" />}</div><div><p className="font-semibold">{formData.name || 'Kategori'}</p><p className="text-sm text-gray-400">{formData.description}</p></div></div></div></div></div>);
  };

  if (loading) return (<div className="flex items-center justify-center h-96"><div className="text-center"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div><p className="text-gray-400">Yükleniyor...</p></div></div>);

  return (<div className="space-y-6"><div className="flex justify-between items-start"><div><h1 className="text-3xl font-bold">Kategori Yönetimi</h1><p className="text-gray-400 mt-1">Oyun kategorilerini düzenleyin</p></div><Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}><DialogTrigger asChild><Button className="bg-orange-500 hover:bg-orange-600"><Plus className="w-4 h-4 mr-2" />Yeni Kategori</Button></DialogTrigger><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Yeni Kategori</DialogTitle><DialogDescription>Yeni kategori oluşturun</DialogDescription></DialogHeader><CategoryForm /><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>İptal</Button><Button onClick={handleAdd} className="bg-orange-500 hover:bg-orange-600">Ekle</Button></div></DialogContent></Dialog></div><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{categories.map(category => { const IconComponent = Icons[category.icon_name as keyof typeof Icons] as any; return (<Card key={category.id} className="bg-card border-white/10"><CardContent className="p-6"><div className="flex items-start justify-between mb-4"><div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: category.color_hex || '#f97316' }}>{IconComponent && <IconComponent className="w-6 h-6 text-white" />}</div><div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => openEditDialog(category)}><Pencil className="w-4 h-4" /></Button><Button variant="ghost" size="sm" onClick={() => setDeleteId(category.id)} className="text-red-500"><Trash2 className="w-4 h-4" /></Button></div></div><h3 className="font-semibold text-lg mb-1">{category.name}</h3><p className="text-sm text-gray-400 mb-3">{category.description}</p><div className="flex items-center justify-between"><div className="flex gap-2"><Badge variant="outline">{category.age_group}</Badge><Badge variant="outline">{category.content_count || 0} oyun</Badge></div><Switch checked={category.published} onCheckedChange={() => togglePublished(category.id, category.published)} /></div></CardContent></Card>); })}{categories.length === 0 && (<Card className="bg-card border-white/10 col-span-full"><CardContent className="p-12 text-center"><Gamepad2 className="w-12 h-12 text-gray-600 mx-auto mb-4" /><p className="text-gray-400">Henüz kategori yok</p></CardContent></Card>)}</div><Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Kategori Düzenle</DialogTitle></DialogHeader><CategoryForm /><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => { setIsEditDialogOpen(false); setEditingCategory(null); resetForm(); }}>İptal</Button><Button onClick={handleEdit} className="bg-orange-500 hover:bg-orange-600">Güncelle</Button></div></DialogContent></Dialog><AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Emin misiniz?</AlertDialogTitle><AlertDialogDescription>Kategori silinecek</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>İptal</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-red-500">Sil</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></div>);
}
