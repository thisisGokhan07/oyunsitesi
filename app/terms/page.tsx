import { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Kullanım Şartları - SeriGame',
  description: 'SeriGame kullanım şartları ve koşulları.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16 lg:pt-20">
        <div className="container py-12">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <FileText className="w-12 h-12 text-orange-500" />
                <h1 className="text-4xl font-bold">Kullanım Şartları</h1>
              </div>
              <p className="text-gray-400">Son güncelleme: {new Date().toLocaleDateString('tr-TR')}</p>
            </div>

            <Card className="bg-card border-white/10">
              <CardContent className="p-8 space-y-6">
                <section>
                  <h2 className="text-2xl font-bold mb-4">1. Genel Koşullar</h2>
                  <p className="text-gray-300 mb-4">
                    SeriGame platformunu kullanarak, aşağıdaki kullanım şartlarını kabul etmiş sayılırsınız.
                    Bu şartlara uymamanız durumunda hesabınız askıya alınabilir veya kapatılabilir.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">2. Hesap Sorumluluğu</h2>
                  <p className="text-gray-300 mb-4">
                    Hesabınızın güvenliğinden siz sorumlusunuz. Şifrenizi kimseyle paylaşmayın
                    ve şüpheli aktivite gördüğünüzde derhal bildirin.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">3. Kullanım Kuralları</h2>
                  <p className="text-gray-300 mb-4">Platformumuzda yasak olan davranışlar:</p>
                  <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                    <li>Uygunsuz içerik paylaşmak</li>
                    <li>Diğer kullanıcıları rahatsız etmek</li>
                    <li>Spam veya sahte hesap oluşturmak</li>
                    <li>Platformun güvenliğini tehdit eden eylemler</li>
                    <li>Telif hakkı ihlali yapmak</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">4. İçerik Hakları</h2>
                  <p className="text-gray-300 mb-4">
                    Platformumuzdaki tüm içerikler telif hakkı ile korunmaktadır.
                    İçerikleri izinsiz kopyalamak, dağıtmak veya ticari amaçla kullanmak yasaktır.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">5. Hizmet Kesintileri</h2>
                  <p className="text-gray-300 mb-4">
                    Platform bakımı, teknik sorunlar veya zorunlu durumlar nedeniyle
                    hizmetlerimizde geçici kesintiler olabilir. Bu durumlardan sorumlu değiliz.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">6. Değişiklikler</h2>
                  <p className="text-gray-300 mb-4">
                    Kullanım şartlarını istediğimiz zaman güncelleyebiliriz.
                    Önemli değişiklikler size bildirilecektir.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">7. İletişim</h2>
                  <p className="text-gray-300">
                    Sorularınız için:{' '}
                    <a href="/contact" className="text-orange-500 hover:text-orange-600">
                      İletişim sayfamızı
                    </a>{' '}
                    ziyaret edebilirsiniz.
                  </p>
                </section>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

