'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gamepad2, Users, Eye, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalContent: 0,
    totalUsers: 0,
    totalViews: 0,
    activeLanguages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const [content, users, analytics] = await Promise.all([
        supabase.from('content').select('*', { count: 'exact', head: true }),
        supabase
          .from('user_profiles')
          .select('*', { count: 'exact', head: true }),
        supabase
          .from('content_analytics')
          .select('*', { count: 'exact', head: true }),
      ]);

      setStats({
        totalContent: content.count || 0,
        totalUsers: users.count || 0,
        totalViews: analytics.count || 0,
        activeLanguages: 2,
      });
    } catch (error) {
      console.error('Stats fetch error:', error);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    {
      title: 'Toplam İçerik',
      value: stats.totalContent,
      icon: Gamepad2,
      color: 'text-blue-500',
    },
    {
      title: 'Toplam Kullanıcı',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-green-500',
    },
    {
      title: 'Toplam Görüntülenme',
      value: stats.totalViews,
      icon: Eye,
      color: 'text-purple-500',
    },
    {
      title: 'Aktif Diller',
      value: stats.activeLanguages,
      icon: TrendingUp,
      color: 'text-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-400 mt-1">
          SeriGame yönetim paneline hoş geldiniz
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="bg-card border-white/10">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  {stat.title}
                </CardTitle>
                <Icon className={cn('w-5 h-5', stat.color)} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {loading ? '...' : stat.value.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-white/10">
          <CardHeader>
            <CardTitle>Son Eklenen İçerikler</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 text-sm">Yakında eklenecek...</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-white/10">
          <CardHeader>
            <CardTitle>Son Aktiviteler</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 text-sm">Yakında eklenecek...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
