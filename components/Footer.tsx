'use client';

import { useEffect, useState } from 'react';
import { Gamepad2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import * as Icons from 'lucide-react';

type FooterLink = {
  id: string;
  title: string;
  url: string;
  section: 'quick_links' | 'support' | 'social';
  icon_name: string | null;
  is_external: boolean;
};

export function Footer() {
  const [quickLinks, setQuickLinks] = useState<FooterLink[]>([]);
  const [supportLinks, setSupportLinks] = useState<FooterLink[]>([]);
  const [socialLinks, setSocialLinks] = useState<FooterLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFooterLinks();
  }, []);

  async function loadFooterLinks() {
    try {
      const { data, error } = await supabase
        .from('footer_links')
        .select('*')
        .eq('published', true)
        .order('section', { ascending: true })
        .order('sort_order', { ascending: true });

      if (error) throw error;

      const links = (data as any) || [];
      setQuickLinks(links.filter((l: FooterLink) => l.section === 'quick_links'));
      setSupportLinks(links.filter((l: FooterLink) => l.section === 'support'));
      setSocialLinks(links.filter((l: FooterLink) => l.section === 'social'));
    } catch (error) {
      console.error('Footer links error:', error);
      // Fallback to default links if database fails
      setQuickLinks([
        { id: '1', title: 'Hakkımızda', url: '/about', section: 'quick_links', icon_name: null, is_external: false },
        { id: '2', title: 'Kategoriler', url: '/kategori', section: 'quick_links', icon_name: null, is_external: false },
      ]);
      setSupportLinks([
        { id: '3', title: 'İletişim', url: '/contact', section: 'support', icon_name: null, is_external: false },
        { id: '4', title: 'SSS', url: '/faq', section: 'support', icon_name: null, is_external: false },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function getIcon(iconName: string | null) {
    if (!iconName) return null;
    const IconComponent = (Icons as any)[iconName];
    return IconComponent ? <IconComponent className="h-5 w-5" /> : null;
  }

  function renderLink(link: FooterLink) {
    const icon = link.icon_name ? getIcon(link.icon_name) : null;
    const linkContent = (
      <>
        {icon && <span className="mr-2">{icon}</span>}
        {link.title}
      </>
    );

    if (link.is_external) {
      return (
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors flex items-center"
        >
          {linkContent}
        </a>
      );
    }

    return (
      <Link href={link.url} className="hover:text-primary transition-colors flex items-center">
        {linkContent}
      </Link>
    );
  }

  if (loading) {
    return (
      <footer className="bg-card border-t border-border mt-20">
        <div className="container py-12">
          <div className="text-center text-gray-400">Yükleniyor...</div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Gamepad2 className="h-8 w-8 text-primary" />
              <span className="text-2xl font-extrabold text-foreground">
                Seri<span className="text-primary">Game</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Tüm Aile İçin Eğlence ve Oyun
            </p>
            <p className="text-xs text-muted-foreground">
              Türkiye&apos;nin en büyük aile dostu oyun ve eğlence platformu.
              0-45 yaş arası herkes için 1000+ ücretsiz içerik.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Hızlı Linkler</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {quickLinks.length > 0 ? (
                quickLinks.map((link) => (
                  <li key={link.id}>
                    {renderLink(link)}
                  </li>
                ))
              ) : (
                <li className="text-gray-500">Henüz link eklenmemiş</li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Destek</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {supportLinks.length > 0 ? (
                supportLinks.map((link) => (
                  <li key={link.id}>
                    {renderLink(link)}
                  </li>
                ))
              ) : (
                <li className="text-gray-500">Henüz link eklenmemiş</li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Bizi Takip Edin</h3>
            {socialLinks.length > 0 ? (
              <>
                <div className="flex gap-3 mb-4">
                  {socialLinks.map((link) => {
                    const icon = link.icon_name ? getIcon(link.icon_name) : null;
                    return (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                        aria-label={link.title}
                      >
                        {icon || <span className="text-xs">{link.title[0]}</span>}
                      </a>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Güncel içeriklerden haberdar olun!
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-500">Henüz sosyal medya linki eklenmemiş</p>
            )}
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 SeriGame.com - Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
}
