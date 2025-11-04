'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Shield, Crown, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
import type { UserProfileRow } from '@/types/database';

export default function KullanicilarPage() {
  const [users, setUsers] = useState<UserProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');

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

  return (<div className="space-y-6"><div><h1 className="text-3xl font-bold">Kullanıcı Yönetimi</h1><p className="text-gray-400 mt-1">Kullanıcıları görüntüle ve yönet</p></div><Card className="bg-card border-white/10"><CardContent className="pt-6"><div className="flex flex-col md:flex-row gap-4 mb-6"><div className="flex-1 relative"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><Input placeholder="Kullanıcı ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div><Select value={filterRole} onValueChange={setFilterRole}><SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Tüm Roller</SelectItem><SelectItem value="super_admin">Super Admin</SelectItem><SelectItem value="admin">Admin</SelectItem><SelectItem value="editor">Editor</SelectItem><SelectItem value="moderator">Moderator</SelectItem><SelectItem value="premium">Premium</SelectItem><SelectItem value="user">User</SelectItem></SelectContent></Select></div><Table><TableHeader><TableRow><TableHead>Kullanıcı</TableHead><TableHead>Role</TableHead><TableHead>Premium</TableHead><TableHead>Kayıt</TableHead><TableHead className="text-right">İşlemler</TableHead></TableRow></TableHeader><TableBody>{filteredUsers.length === 0 ? (<TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-400">Kullanıcı bulunamadı</TableCell></TableRow>) : (filteredUsers.map(user => (<TableRow key={user.id}><TableCell><div className="flex items-center gap-2">{getRoleIcon(user.role)}<span className="font-medium">{user.display_name || 'İsimsiz'}</span></div></TableCell><TableCell>{getRoleBadge(user.role)}</TableCell><TableCell>{user.is_premium ? <Badge className="bg-orange-500">Premium</Badge> : <Badge variant="outline">Free</Badge>}</TableCell><TableCell className="text-sm text-gray-400">{new Date(user.created_at).toLocaleDateString('tr-TR')}</TableCell><TableCell className="text-right"><div className="flex justify-end gap-2"><Select value={user.role} onValueChange={(v) => updateUserRole(user.id, v)}><SelectTrigger className="w-[140px] h-8"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="user">User</SelectItem><SelectItem value="premium">Premium</SelectItem><SelectItem value="moderator">Moderator</SelectItem><SelectItem value="editor">Editor</SelectItem><SelectItem value="admin">Admin</SelectItem><SelectItem value="super_admin">Super Admin</SelectItem></SelectContent></Select><Button size="sm" variant={user.is_premium ? "outline" : "default"} onClick={() => togglePremium(user.id, user.is_premium)} className={user.is_premium ? "" : "bg-orange-500 hover:bg-orange-600"}>{user.is_premium ? "Kaldır" : "Premium"}</Button></div></TableCell></TableRow>)))}</TableBody></Table></CardContent></Card></div>);
}
