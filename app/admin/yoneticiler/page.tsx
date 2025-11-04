'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Shield, Crown, Edit, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminRoles() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newRole, setNewRole] = useState('editor');

  useEffect(() => {
    fetchAdmins();
  }, []);

  async function fetchAdmins() {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .in('role', ['super_admin', 'admin', 'editor'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdmins(data || []);
    } catch (error: any) {
      toast.error('Yöneticiler yüklenemedi');
    } finally {
      setLoading(false);
    }
  }

  async function updateRole(userId: string, role: string) {
    try {
      const { error } = await (supabase
        .from('user_profiles')
        .update as any)({ role })
        .eq('id', userId);

      if (error) throw error;
      toast.success('Rol güncellendi!');
      fetchAdmins();
      setDialogOpen(false);
    } catch (error: any) {
      toast.error('Güncelleme başarısız: ' + error.message);
    }
  }

  function openRoleDialog(user: any) {
    setSelectedUser(user);
    setNewRole(user.role);
    setDialogOpen(true);
  }

  const roleColors: Record<string, string> = {
    super_admin: 'text-red-500 bg-red-500/10',
    admin: 'text-orange-500 bg-orange-500/10',
    editor: 'text-blue-500 bg-blue-500/10',
  };

  const roleLabels: Record<string, string> = {
    super_admin: 'Süper Admin',
    admin: 'Admin',
    editor: 'Editör',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Yönetici Rolleri</h1>
          <p className="text-gray-400 mt-1">
            Admin, editör ve süper admin rollerini yönetin
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rol Güncelle</DialogTitle>
              <DialogDescription>
                {selectedUser?.display_name} kullanıcısının rolünü değiştirin
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Yeni Rol</Label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="editor">
                      <div className="flex items-center gap-2">
                        <Edit className="w-4 h-4" />
                        Editör
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Admin
                      </div>
                    </SelectItem>
                    <SelectItem value="super_admin">
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4" />
                        Süper Admin
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  İptal
                </Button>
                <Button
                  onClick={() => updateRole(selectedUser?.id, newRole)}
                  className="bg-primary"
                >
                  Güncelle
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-white/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Süper Adminler
            </CardTitle>
            <Crown className="w-5 h-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {admins.filter((a) => a.role === 'super_admin').length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-white/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Adminler
            </CardTitle>
            <Shield className="w-5 h-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {admins.filter((a) => a.role === 'admin').length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-white/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Editörler
            </CardTitle>
            <Edit className="w-5 h-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {admins.filter((a) => a.role === 'editor').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-white/10">
        <CardHeader>
          <CardTitle>Yönetici Listesi</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kullanıcı</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Kayıt Tarihi</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    Yükleniyor...
                  </TableCell>
                </TableRow>
              ) : admins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-400">
                    Yönetici bulunamadı
                  </TableCell>
                </TableRow>
              ) : (
                admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                          {admin.display_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-medium">{admin.display_name}</p>
                          <p className="text-xs text-gray-500">{admin.id.substring(0, 8)}...</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          roleColors[admin.role] || ''
                        }`}
                      >
                        {roleLabels[admin.role] || admin.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(admin.created_at).toLocaleDateString('tr-TR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openRoleDialog(admin)}
                      >
                        Rol Değiştir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="bg-card border-white/10">
        <CardHeader>
          <CardTitle>Rol İzinleri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Crown className="w-5 h-5 text-red-500" />
                  <h3 className="font-semibold">Süper Admin</h3>
                </div>
                <ul className="space-y-1 text-sm text-gray-400">
                  <li>• Tüm yetkilere sahip</li>
                  <li>• Sistem ayarları</li>
                  <li>• Yönetici rolleri</li>
                  <li>• Aktivite kayıtları</li>
                </ul>
              </div>

              <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-orange-500" />
                  <h3 className="font-semibold">Admin</h3>
                </div>
                <ul className="space-y-1 text-sm text-gray-400">
                  <li>• İçerik yönetimi</li>
                  <li>• Kullanıcı yönetimi</li>
                  <li>• Reklam yönetimi</li>
                  <li>• Dil yönetimi</li>
                </ul>
              </div>

              <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Edit className="w-5 h-5 text-blue-500" />
                  <h3 className="font-semibold">Editör</h3>
                </div>
                <ul className="space-y-1 text-sm text-gray-400">
                  <li>• İçerik düzenleme</li>
                  <li>• Çeviri yönetimi</li>
                  <li>• Kategori yönetimi</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
