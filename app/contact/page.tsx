'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // Simüle edilmiş gönderim
    setTimeout(() => {
      toast.success('Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setLoading(false);
    }, 1000);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16 lg:pt-20">
        <div className="container py-12">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">İletişim</h1>
              <p className="text-xl text-gray-400">
                Sorularınız, önerileriniz veya destek talepleriniz için bizimle iletişime geçin
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-card border-white/10">
                <CardContent className="p-6 text-center">
                  <Mail className="w-8 h-8 text-orange-500 mx-auto mb-4" />
                  <h3 className="font-bold mb-2">Email</h3>
                  <p className="text-sm text-gray-400">info@serigame.com</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-white/10">
                <CardContent className="p-6 text-center">
                  <Phone className="w-8 h-8 text-blue-500 mx-auto mb-4" />
                  <h3 className="font-bold mb-2">Telefon</h3>
                  <p className="text-sm text-gray-400">0850 XXX XX XX</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-white/10">
                <CardContent className="p-6 text-center">
                  <MapPin className="w-8 h-8 text-green-500 mx-auto mb-4" />
                  <h3 className="font-bold mb-2">Adres</h3>
                  <p className="text-sm text-gray-400">İstanbul, Türkiye</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card border-white/10">
              <CardHeader>
                <CardTitle>Bize Yazın</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Ad Soyad</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="subject">Konu</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">Mesaj</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={6}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-orange-500 hover:bg-orange-600"
                  >
                    {loading ? 'Gönderiliyor...' : 'Gönder'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

