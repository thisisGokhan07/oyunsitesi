'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AnaliticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-gray-400 mt-1">İstatistikleri görüntüleyin</p>
      </div>

      <Card className="bg-card border-white/10">
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-sm">
            Analytics sistemi yakında eklenecek...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
