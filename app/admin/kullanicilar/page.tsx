'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Shield, Crown, User as UserIcon, Eye, Download, Ban, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { UserProfileRow } from '@/types/database';

export default function KullanicilarPage() {
  const [users, setUsers] = useState<UserProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UserProfileRow | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [userStats, setUserStats] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => { fetchUsers(); }, []);

  async function fetchUsers() {
    try {
      const { data, error } = await supabase.from('user_profiles').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      toast.error('Kullanıcılar yüklenemedi: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateUserRole(userId: string, newRole: string) {
    try {
      const { error } = await (supabase.from('user_profiles').update as any)({ role: newRole }).eq('id', userId);
      if (error) throw error;
      toast.success('Kullanıcı rolü güncellendi!');
      fetchUsers();
    } catch (error: any) {
      toast.error('Hata: ' + error.message);
    }
  }

  async function togglePremium(userId: string, current: boolean) {
    try {
      const { error } = await (supabase.from('user_profiles').update as any)({ is_premium: !current, premium_expires_at: !current ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : null }).eq('id', userId);
      if (error) throw error;
      toast.success(current ? 'Premium kaldırıldı' : 'Premium verildi!');
      fetchUsers();
    } catch (error: any) {
      toast.error('Hata: ' + error.message);
    }
  }

  async function openUserDetail(user: UserProfileRow) {
    setSelectedUser(user);
    setIsDetailDialogOpen(true);
    
    // Fetch user statistics
    try {
      const [analytics, ratings] = await Promise.all([
        supabase
          .from('content_analytics')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id),
        supabase
          .from('ratings')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id),
      ]);

      setUserStats({
        totalViews: analytics.count || 0,
        totalRatings: ratings.count || 0,
      });
    } catch (error: any) {
      console.error('Stats fetch error:', error);
    }
  }

  async function handleBulkPremium(give: boolean) {
    if (selectedIds.size === 0) return;
    try {
      const updates = {
        is_premium: give,
        premium_expires_at: give ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : null,
      };

      const { error } = await (supabase
        .from('user_profiles')
        .update as any)(updates)
        .in('id', Array.from(selectedIds));

      if (error) throw error;
      toast.success(`${selectedIds.size} kullanıcıya ${give ? 'premium verildi' : 'premium kaldırıldı'}!`);
      setSelectedIds(new Set());
      fetchUsers();
    } catch (error: any) {
      toast.error('Toplu işlem başarısız: ' + error.message);
    }
  }

  function exportToCSV() {
    const headers = ['Email', 'Display Name', 'Role', 'Premium', 'Kayıt Tarihi'];
    const rows = filteredUsers.map(user => [
      user.display_name || 'İsimsiz',
      user.role || 'user',
      user.is_premium ? 'Evet' : 'Hayır',
      new Date(user.created_at).toLocaleDateString('tr-TR'),
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `kullanicilar-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.display_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleIcon = (role: string) => {
    if (role === 'super_admin') return <Crown className="w-4 h-4 text-yellow-500" />;
    if (role === 'admin' || role === 'editor' || role === 'moderator') return <Shield className="w-4 h-4 text-blue-500" />;
    return <UserIcon className="w-4 h-4 text-gray-400" />;
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = { super_admin: 'bg-yellow-500', admin: 'bg-blue-500', editor: 'bg-green-500', moderator: 'bg-purple-500', premium: 'bg-orange-500', user: 'bg-gray-500' };
    return <Badge className={colors[role] || 'bg-gray-500'}>{role}</Badge>;
  };

  if (loading) return (<div className="flex items-center justify-center h-96"><div className="text-center"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div><p className="text-gray-400">Yükleniyor...</p></div></div>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Kullanıcı Yönetimi</h1>
          <p className="text-gray-400 mt-1">Kullanıcıları görüntüle ve yönet</p>
        </div>
        <Button variant="outline" onClick={exportToCSV}>
          <Download className="w-4 h-4 mr-2" />
          CSV Export
        </Button>
      </div>

      <Card className="bg-card border-white/10">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Kullanıcı ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Roller</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/10">
              <span className="text-sm text-gray-400">{selectedIds.size} kullanıcı seçildi</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkPremium(true)}
                className="ml-auto"
              >
                Toplu Premium Ver
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkPremium(false)}
              >
                Toplu Premium Kaldır
              </Button>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Kullanıcı</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Premium</TableHead>
                <TableHead>Kayıt</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                    Kullanıcı bulunamadı
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(user.id)}
                        onChange={() => {
                          const newSelected = new Set(selectedIds);
                          if (newSelected.has(user.id)) {
                            newSelected.delete(user.id);
                          } else {
                            newSelected.add(user.id);
                          }
                          setSelectedIds(newSelected);
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getRoleIcon(user.role)}
                        <span className="font-medium">{user.display_name || 'İsimsiz'}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      {user.is_premium ? (
                        <Badge className="bg-orange-500">Premium</Badge>
                      ) : (
                        <Badge variant="outline">Free</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-400">
                      {new Date(user.created_at).toLocaleDateString('tr-TR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openUserDetail(user)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Select
                          value={user.role}
                          onValueChange={(v) => updateUserRole(user.id, v)}
                        >
                          <SelectTrigger className="w-[140px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="premium">Premium</SelectItem>
                            <SelectItem value="moderator">Moderator</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="super_admin">Super Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          variant={user.is_premium ? 'outline' : 'default'}
                          onClick={() => togglePremium(user.id, user.is_premium)}
                          className={user.is_premium ? '' : 'bg-orange-500 hover:bg-orange-600'}
                        >
                          {user.is_premium ? 'Kaldır' : 'Premium'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Kullanıcı Detayları</DialogTitle>
            <DialogDescription>
              {selectedUser?.display_name || 'Kullanıcı'} bilgileri ve istatistikleri
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <Tabs defaultValue="info" className="w-full">
              <TabsList>
                <TabsTrigger value="info">Bilgiler</TabsTrigger>
                <TabsTrigger value="stats">İstatistikler</TabsTrigger>
                <TabsTrigger value="activity">Aktivite</TabsTrigger>
              </TabsList>
              <TabsContent value="info" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Kullanıcı Bilgileri</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-400">ID:</span>
                      <p className="font-mono text-xs">{selectedUser.id}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-400">İsim:</span>
                      <p>{selectedUser.display_name || 'İsimsiz'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-400">Role:</span>
                      <p>{getRoleBadge(selectedUser.role)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-400">Premium:</span>
                      <p>{selectedUser.is_premium ? 'Evet' : 'Hayır'}</p>
                      {selectedUser.premium_expires_at && (
                        <p className="text-xs text-gray-500">
                          Bitiş: {new Date(selectedUser.premium_expires_at).toLocaleDateString('tr-TR')}
                        </p>
                      )}
                    </div>
                    <div>
                      <span className="text-sm text-gray-400">Kayıt Tarihi:</span>
                      <p>{new Date(selectedUser.created_at).toLocaleString('tr-TR')}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="stats" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>İstatistikler</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userStats ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-400">Toplam Görüntülenme</p>
                          <p className="text-2xl font-bold">{userStats.totalViews}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Toplam Puanlama</p>
                          <p className="text-2xl font-bold">{userStats.totalRatings}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-400">Yükleniyor...</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="activity">
                <Card>
                  <CardHeader>
                    <CardTitle>Aktivite Log</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 text-sm">Aktivite log özelliği yakında eklenecek...</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
