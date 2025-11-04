import { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Gizlilik Politikası - SeriGame',
  description: 'SeriGame gizlilik politikası ve kişisel verilerin korunması.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16 lg:pt-20">
        <div className="container py-12">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Shield className="w-12 h-12 text-orange-500" />
                <h1 className="text-4xl font-bold">Gizlilik Politikası</h1>
              </div>
              <p className="text-gray-400">Son güncelleme: {new Date().toLocaleDateString('tr-TR')}</p>
            </div>

            <Card className="bg-card border-white/10">
              <CardContent className="p-8 space-y-6">
                <section>
                  <h2 className="text-2xl font-bold mb-4">1. Genel Bilgiler</h2>
                  <p className="text-gray-300 mb-4">
                    SeriGame olarak, kullanıcılarımızın gizliliğini korumak en öncelikli konularımızdan biridir.
                    Bu gizlilik politikası, kişisel verilerinizin nasıl toplandığını, kullanıldığını ve korunduğunu açıklar.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">2. Toplanan Bilgiler</h2>
                  <p className="text-gray-300 mb-4">
                    Platformumuzda topladığımız bilgiler:
                  </p>
                  <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                    <li>Kayıt sırasında sağladığınız email adresi ve isim bilgisi</li>
                    <li>Oyun oynama geçmişi ve favoriler</li>
                    <li>Puanlama ve yorumlar</li>
                    <li>Teknik veriler (IP adresi, tarayıcı bilgisi)</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">3. Verilerin Kullanımı</h2>
                  <p className="text-gray-300 mb-4">
                    Toplanan bilgiler sadece aşağıdaki amaçlar için kullanılır:
                  </p>
                  <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                    <li>Hesap yönetimi ve kimlik doğrulama</li>
                    <li>Kişiselleştirilmiş içerik önerileri</li>
                    <li>Platform geliştirme ve iyileştirme</li>
                    <li>Güvenlik ve yasal yükümlülükler</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">4. Çocuk Gizliliği</h2>
                  <p className="text-gray-300 mb-4">
                    Platformumuz 13 yaş altı çocuklar için tasarlanmıştır. Çocukların kişisel verileri
                    özellikle korunur ve yalnızca ebeveyn izni ile toplanır.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">5. Veri Güvenliği</h2>
                  <p className="text-gray-300 mb-4">
                    Tüm verileriniz şifreli olarak saklanır ve güvenli sunucularda barındırılır.
                    Verilerinize yetkisiz erişimi önlemek için gerekli tüm teknik önlemler alınmıştır.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">6. İletişim</h2>
                  <p className="text-gray-300">
                    Gizlilik politikamız hakkında sorularınız için:{' '}
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

