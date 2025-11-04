'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Globe,
  Languages,
  DollarSign,
  Settings,
  Shield,
  Activity,
  Home,
  Gamepad2,
  FolderTree,
  Users,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { title: 'Site Anasayfa', href: '/', icon: Home, external: true },
  { section: 'Genel' },
  { title: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
  { title: 'İçerikler', href: '/admin/icerikler', icon: Gamepad2 },
  { title: 'Kategoriler', href: '/admin/kategoriler', icon: FolderTree },
  { title: 'Kullanıcılar', href: '/admin/kullanicilar', icon: Users },
  { title: 'Analytics', href: '/admin/analitics', icon: BarChart3 },
  { section: 'Sistem' },
  {
    title: 'Dil Yönetimi',
    href: '/admin/diller',
    icon: Globe,
    roles: ['super_admin', 'admin'],
  },
  {
    title: 'Çeviri Yönetimi',
    href: '/admin/ceviriler',
    icon: Languages,
    roles: ['super_admin', 'admin', 'editor'],
  },
  {
    title: 'Reklam Yönetimi',
    href: '/admin/reklamlar',
    icon: DollarSign,
    roles: ['super_admin', 'admin'],
  },
  {
    title: 'Site Ayarları',
    href: '/admin/ayarlar',
    icon: Settings,
    roles: ['super_admin'],
  },
  {
    title: 'Yönetici Rolleri',
    href: '/admin/yoneticiler',
    icon: Shield,
    roles: ['super_admin'],
  },
  {
    title: 'Aktivite Kayıtları',
    href: '/admin/aktivite',
    icon: Activity,
    roles: ['super_admin', 'admin'],
  },
];

function AdminSidebar() {
  const pathname = usePathname();
  const { profile } = useAuth();

  return (
    <aside className="w-64 bg-gray-900 border-r border-white/10 flex flex-col">
      <div className="p-6 border-b border-white/10">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-cyan-400 bg-clip-text text-transparent">
          SeriGame
        </h1>
        <p className="text-xs text-gray-400 mt-1">Admin Panel</p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item, idx) => {
          if ('section' in item && item.section) {
            return (
              <div key={idx} className="px-4 py-2 mt-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase">
                  {item.section}
                </h3>
              </div>
            );
          }

          if ('roles' in item && item.roles && !item.roles.includes(profile?.role || '')) {
            return null;
          }

          if (!('icon' in item) || !item.icon) return null;

          const Icon = item.icon;
          const href = item.href || '';
          const isActive = item.exact
            ? pathname === href
            : pathname === href ||
              (href !== '/admin' && pathname.startsWith(href));

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <p className="text-xs text-gray-500 text-center">© 2025 SeriGame</p>
      </div>
    </aside>
  );
}

function AdminHeader() {
  const { profile, signOut } = useAuth();

  return (
    <header className="h-16 bg-gray-900 border-b border-white/10 flex items-center justify-between px-6">
      <h2 className="text-xl font-semibold">Admin Panel</h2>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium">{profile?.display_name}</p>
          <p className="text-xs text-gray-400 capitalize">{profile?.role}</p>
        </div>
        <button
          onClick={() => signOut()}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm transition-colors"
        >
          Çıkış
        </button>
      </div>
    </header>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="text-center max-w-md p-8">
          <h1 className="text-3xl font-bold text-white mb-4">Admin Paneli</h1>
          <p className="text-gray-400 mb-6">
            Bu sayfaya erişmek için giriş yapmalısınız.
          </p>
          <div className="space-y-4">
            <Link
              href="/"
              className="block px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
            >
              Ana Sayfaya Dön
            </Link>
            <p className="text-sm text-gray-500">
              Test için: admin@serigame.com / Admin123!@#
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-950">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
