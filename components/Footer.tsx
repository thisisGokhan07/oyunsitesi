import { Gamepad2, Instagram, Youtube, Music } from 'lucide-react';

export function Footer() {
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
              <li>
                <a href="/about" className="hover:text-primary transition-colors">
                  Hakkımızda
                </a>
              </li>
              <li>
                <a href="/categories" className="hover:text-primary transition-colors">
                  Kategoriler
                </a>
              </li>
              <li>
                <a href="/new" className="hover:text-primary transition-colors">
                  Yeni Oyunlar
                </a>
              </li>
              <li>
                <a href="/popular" className="hover:text-primary transition-colors">
                  Popüler
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Destek</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="/contact" className="hover:text-primary transition-colors">
                  İletişim
                </a>
              </li>
              <li>
                <a href="/faq" className="hover:text-primary transition-colors">
                  Sık Sorulan Sorular
                </a>
              </li>
              <li>
                <a href="/privacy" className="hover:text-primary transition-colors">
                  Gizlilik Politikası
                </a>
              </li>
              <li>
                <a href="/terms" className="hover:text-primary transition-colors">
                  Kullanım Şartları
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Bizi Takip Edin</h3>
            <div className="flex gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                aria-label="TikTok"
              >
                <Music className="h-5 w-5" />
              </a>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Güncel içeriklerden haberdar olun!
            </p>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 SeriGame.com - Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
}
