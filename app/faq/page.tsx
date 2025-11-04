import { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sık Sorulan Sorular - SeriGame',
  description: 'SeriGame hakkında sık sorulan sorular ve cevapları.',
};

const faqs = [
  {
    question: 'SeriGame nedir?',
    answer: 'SeriGame, 0-45 yaş arası herkes için güvenli, eğitici ve eğlenceli içerikler sunan bir oyun ve eğlence platformudur. Platformumuzda 1000+ ücretsiz oyun, video, hikaye ve boyama kitabı bulunmaktadır.',
  },
  {
    question: 'Oyunlar ücretsiz mi?',
    answer: 'Evet, platformumuzdaki temel içerikler tamamen ücretsizdir. Premium üyelik ile özel içeriklere de erişebilirsiniz.',
  },
  {
    question: 'Çocuklar için güvenli mi?',
    answer: 'Evet, tüm içeriklerimiz aile dostu ve yaş gruplarına göre kategorize edilmiştir. Eğitimciler tarafından incelenmiş, güvenli içerikler sunuyoruz.',
  },
  {
    question: 'Premium üyelik nedir?',
    answer: 'Premium üyelik ile özel içeriklere erişebilir, reklamsız deneyim yaşayabilir ve öncelikli destek alabilirsiniz.',
  },
  {
    question: 'Nasıl hesap oluşturabilirim?',
    answer: 'Ana sayfanın sağ üst köşesindeki "Giriş Yap" butonuna tıklayarak kayıt olabilirsiniz. Email ve şifre ile kolayca hesap oluşturabilirsiniz.',
  },
  {
    question: 'Şifremi unuttum, ne yapmalıyım?',
    answer: 'Giriş sayfasında "Şifremi Unuttum" linkine tıklayarak email adresinize şifre sıfırlama linki gönderebilirsiniz.',
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16 lg:pt-20">
        <div className="container py-12">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <HelpCircle className="w-12 h-12 text-orange-500" />
                <h1 className="text-4xl font-bold">Sık Sorulan Sorular</h1>
              </div>
              <p className="text-xl text-gray-400">
                Merak ettiğiniz soruların cevaplarını burada bulabilirsiniz
              </p>
            </div>

            <Card className="bg-card border-white/10">
              <CardContent className="p-8">
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-400">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            <Card className="bg-card border-white/10">
              <CardContent className="p-8 text-center">
                <p className="text-gray-400 mb-4">
                  Aradığınız soruyu bulamadınız mı?
                </p>
                <a
                  href="/contact"
                  className="text-orange-500 hover:text-orange-600 font-medium"
                >
                  Bizimle iletişime geçin →
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

