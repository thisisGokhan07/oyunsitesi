'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DillerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dil Yönetimi</h1>
        <p className="text-gray-400 mt-1">Dilleri yönetin</p>
      </div>

      <Card className="bg-card border-white/10">
        <CardHeader>
          <CardTitle>Diller</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-sm">
            Dil yönetim sistemi yakında eklenecek...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
