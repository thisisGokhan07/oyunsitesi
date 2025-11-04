import { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gamepad2, Users, Heart, Award } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Hakkımızda - SeriGame',
  description: 'SeriGame hakkında bilgiler. Tüm aile için eğlence ve oyun platformu.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16 lg:pt-20">
        <div className="container py-12">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">Hakkımızda</h1>
              <p className="text-xl text-gray-400">
                Türkiye&apos;nin en büyük aile dostu oyun ve eğlence platformu
              </p>
            </div>

            <Card className="bg-card border-white/10">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">Biz Kimiz?</h2>
                <p className="text-gray-300 mb-4">
                  SeriGame, 0-45 yaş arası herkes için güvenli, eğitici ve eğlenceli içerikler sunan bir platformdur.
                  Amacımız, ailelerin birlikte kaliteli zaman geçirebileceği, çocukların öğrenirken eğlenebileceği
                  bir ortam yaratmaktır.
                </p>
                <p className="text-gray-300">
                  Platformumuzda 1000+ ücretsiz oyun, video, hikaye ve boyama kitabı bulunmaktadır.
                  Tüm içeriklerimiz yaş gruplarına göre kategorize edilmiş ve eğitimciler tarafından
                  incelenmiştir.
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-card border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gamepad2 className="w-6 h-6 text-orange-500" />
                    Oyunlar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">
                    1000+ ücretsiz oyun. Eğitici, zeka oyunları, aksiyon ve daha fazlası.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-6 h-6 text-blue-500" />
                    Aile Dostu
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">
                    Tüm içeriklerimiz aile dostu. Güvenli ve eğitici içerikler.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-6 h-6 text-yellow-500" />
                    Kalite
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">
                    Eğitimciler tarafından incelenmiş, yaş gruplarına uygun içerikler.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card border-white/10">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">Misyonumuz</h2>
                <p className="text-gray-300">
                  Teknolojinin doğru kullanımı ile ailelerin birlikte kaliteli zaman geçirmesini sağlamak,
                  çocukların öğrenirken eğlenmesine olanak tanımak ve güvenli bir dijital oyun ortamı sunmaktır.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

