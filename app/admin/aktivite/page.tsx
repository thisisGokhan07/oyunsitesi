'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Activity, FileEdit, Trash2, Plus, Settings } from 'lucide-react';

export default function ActivityLog() {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const activities = [
    {
      id: '1',
      user: 'Admin User',
      action: 'create',
      description: 'Yeni oyun eklendi: Matematik Kahramanı',
      timestamp: new Date().toISOString(),
      icon: Plus,
      color: 'text-green-500',
    },
    {
      id: '2',
      user: 'Editor',
      action: 'update',
      description: 'Oyun güncellendi: Puzzle Master',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      icon: FileEdit,
      color: 'text-blue-500',
    },
    {
      id: '3',
      user: 'Super Admin',
      action: 'delete',
      description: 'Kullanıcı silindi: test@example.com',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      icon: Trash2,
      color: 'text-red-500',
    },
    {
      id: '4',
      user: 'Admin User',
      action: 'update',
      description: 'Site ayarları güncellendi',
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      icon: Settings,
      color: 'text-orange-500',
    },
  ];

  const stats = [
    { title: 'Bugün', value: activities.length, icon: Activity, color: 'text-blue-500' },
    { title: 'Bu Hafta', value: 45, icon: Activity, color: 'text-green-500' },
    { title: 'Bu Ay', value: 234, icon: Activity, color: 'text-purple-500' },
    { title: 'Toplam', value: 1567, icon: Activity, color: 'text-orange-500' },
  ];

  function formatTime(timestamp: string) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return 'Az önce';
    if (diff < 3600) return `${Math.floor(diff / 60)} dakika önce`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} saat önce`;
    return date.toLocaleDateString('tr-TR');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Aktivite Kayıtları</h1>
        <p className="text-gray-400 mt-1">Sistem genelindeki tüm işlemleri takip edin</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="bg-card border-white/10">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  {stat.title}
                </CardTitle>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-card border-white/10">
        <CardHeader>
          <CardTitle>Filtreler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Arama</Label>
              <Input
                placeholder="Aktivite ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <Label>İşlem Tipi</Label>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="create">Ekleme</SelectItem>
                  <SelectItem value="update">Güncelleme</SelectItem>
                  <SelectItem value="delete">Silme</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-white/10">
        <CardHeader>
          <CardTitle>Aktivite Listesi</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>İşlem</TableHead>
                <TableHead>Kullanıcı</TableHead>
                <TableHead>Açıklama</TableHead>
                <TableHead>Zaman</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <TableRow key={activity.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${activity.color}`} />
                        <span className="capitalize">{activity.action}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm">
                          {activity.user.charAt(0)}
                        </div>
                        {activity.user}
                      </div>
                    </TableCell>
                    <TableCell>{activity.description}</TableCell>
                    <TableCell className="text-gray-400">
                      {formatTime(activity.timestamp)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
