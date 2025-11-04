'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase/client';
import { Gamepad2, Users, Eye, TrendingUp, Clock, Calendar, Download } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#f59e0b'];

export default function AnaliticsPage() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7');
  const [stats, setStats] = useState({
    today: {
      visitors: 0,
      plays: 0,
      registrations: 0,
    },
    total: {
      content: 0,
      users: 0,
      views: 0,
      categories: 0,
    },
  });
  const [charts, setCharts] = useState({
    visitorTrend: [] as any[],
    popularContent: [] as any[],
    popularCategories: [] as any[],
    ageGroupDistribution: [] as any[],
    registrationTrend: [] as any[],
  });

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  async function fetchAnalytics() {
    setLoading(true);
    try {
      // Genel istatistikler
      const [contentCount, userCount, analyticsCount, categoryCount] = await Promise.all([
        supabase.from('content').select('*', { count: 'exact', head: true }),
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('content_analytics').select('*', { count: 'exact', head: true }),
        supabase.from('categories').select('*', { count: 'exact', head: true }),
      ]);

      // Bugünkü istatistikler
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString();

      const [todayAnalytics, todayUsers] = await Promise.all([
        supabase
          .from('content_analytics')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', todayStr),
        supabase
          .from('user_profiles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', todayStr),
      ]);

      // Ziyaretçi trendi (son 7/30 gün)
      const days = parseInt(dateRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const startDateStr = startDate.toISOString();

      const { data: analyticsData } = await supabase
        .from('content_analytics')
        .select('created_at')
        .gte('created_at', startDateStr)
        .order('created_at', { ascending: true });

      // Günlük gruplama
      const dailyData: Record<string, number> = {};
      (analyticsData as any)?.forEach((item: any) => {
        const date = new Date(item.created_at).toLocaleDateString('tr-TR');
        dailyData[date] = (dailyData[date] || 0) + 1;
      });

      const visitorTrend = Object.entries(dailyData).map(([date, count]) => ({
        date,
        ziyaretçi: count,
      }));

      // Popüler içerikler
      const { data: popularContentData } = await supabase
        .from('content')
        .select('title, play_count')
        .order('play_count', { ascending: false })
        .limit(10);

      const popularContent = ((popularContentData as any) || []).map((item: any) => ({
        name: item.title.substring(0, 20) + (item.title.length > 20 ? '...' : ''),
        oynama: item.play_count || 0,
      }));

      // Popüler kategoriler
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('name, content_count')
        .order('content_count', { ascending: false })
        .limit(6);

      const popularCategories = ((categoriesData as any) || []).map((item: any) => ({
        name: item.name,
        değer: item.content_count || 0,
      }));

      // Yaş grubu dağılımı
      const { data: contentByAge } = await supabase
        .from('content')
        .select('age_group')
        .eq('published', true);

      const ageGroupCounts: Record<string, number> = {};
      (contentByAge as any)?.forEach((item: any) => {
        ageGroupCounts[item.age_group] = (ageGroupCounts[item.age_group] || 0) + 1;
      });

      const ageGroupDistribution = Object.entries(ageGroupCounts).map(([name, değer]) => ({
        name: name === 'baby' ? 'Bebek' : name === 'child' ? 'Çocuk' : name === 'adult' ? 'Yetişkin' : 'Aile',
        değer,
      }));

      // Kayıt trendi
      const { data: usersData } = await supabase
        .from('user_profiles')
        .select('created_at')
        .gte('created_at', startDateStr)
        .order('created_at', { ascending: true });

      const registrationDaily: Record<string, number> = {};
      (usersData as any)?.forEach((item: any) => {
        const date = new Date(item.created_at).toLocaleDateString('tr-TR');
        registrationDaily[date] = (registrationDaily[date] || 0) + 1;
      });

      const registrationTrend = Object.entries(registrationDaily).map(([date, kayıt]) => ({
        date,
        kayıt,
      }));

      setStats({
        today: {
          visitors: todayAnalytics.count || 0,
          plays: todayAnalytics.count || 0,
          registrations: todayUsers.count || 0,
        },
        total: {
          content: contentCount.count || 0,
          users: userCount.count || 0,
          views: analyticsCount.count || 0,
          categories: categoryCount.count || 0,
        },
      });

      setCharts({
        visitorTrend,
        popularContent,
        popularCategories,
        ageGroupDistribution,
        registrationTrend,
      });
    } catch (error) {
      console.error('Analytics fetch error:', error);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    {
      title: 'Bugünkü Ziyaretçi',
      value: stats.today.visitors,
      icon: Eye,
      color: 'text-blue-500',
    },
    {
      title: 'Bugünkü Oynama',
      value: stats.today.plays,
      icon: Gamepad2,
      color: 'text-green-500',
    },
    {
      title: 'Yeni Kayıtlar (Bugün)',
      value: stats.today.registrations,
      icon: Users,
      color: 'text-purple-500',
    },
    {
      title: 'Toplam İçerik',
      value: stats.total.content,
      icon: Gamepad2,
      color: 'text-orange-500',
    },
    {
      title: 'Toplam Kullanıcı',
      value: stats.total.users,
      icon: Users,
      color: 'text-green-500',
    },
    {
      title: 'Toplam Görüntülenme',
      value: stats.total.views,
      icon: Eye,
      color: 'text-blue-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-400 mt-1">Platform istatistikleri ve analizler</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Son 7 Gün</SelectItem>
              <SelectItem value="30">Son 30 Gün</SelectItem>
              <SelectItem value="90">Son 90 Gün</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchAnalytics}>
            <Download className="w-4 h-4 mr-2" />
            Yenile
          </Button>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => {
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
                <div className="text-3xl font-bold">
                  {loading ? '...' : stat.value.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Grafikler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ziyaretçi Trendi */}
        <Card className="bg-card border-white/10">
          <CardHeader>
            <CardTitle>Ziyaretçi Trendi</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-gray-400">Yükleniyor...</div>
              </div>
            ) : charts.visitorTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={charts.visitorTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="ziyaretçi"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={{ fill: '#f97316' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                Veri yok
              </div>
            )}
          </CardContent>
        </Card>

        {/* En Popüler İçerikler */}
        <Card className="bg-card border-white/10">
          <CardHeader>
            <CardTitle>En Popüler İçerikler</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-gray-400">Yükleniyor...</div>
              </div>
            ) : charts.popularContent.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={charts.popularContent}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" angle={-45} textAnchor="end" height={100} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  />
                  <Bar dataKey="oynama" fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                Veri yok
              </div>
            )}
          </CardContent>
        </Card>

        {/* En Popüler Kategoriler */}
        <Card className="bg-card border-white/10">
          <CardHeader>
            <CardTitle>En Popüler Kategoriler</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-gray-400">Yükleniyor...</div>
              </div>
            ) : charts.popularCategories.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={charts.popularCategories}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="değer"
                  >
                    {charts.popularCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                Veri yok
              </div>
            )}
          </CardContent>
        </Card>

        {/* Yaş Grubu Dağılımı */}
        <Card className="bg-card border-white/10">
          <CardHeader>
            <CardTitle>Yaş Grubu Dağılımı</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-gray-400">Yükleniyor...</div>
              </div>
            ) : charts.ageGroupDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={charts.ageGroupDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="değer"
                  >
                    {charts.ageGroupDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                Veri yok
              </div>
            )}
          </CardContent>
        </Card>

        {/* Kayıt Trendi */}
        <Card className="bg-card border-white/10 lg:col-span-2">
          <CardHeader>
            <CardTitle>Kayıt Trendi</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-gray-400">Yükleniyor...</div>
              </div>
            ) : charts.registrationTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={charts.registrationTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="kayıt"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                Veri yok
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
