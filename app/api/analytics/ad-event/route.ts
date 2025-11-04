import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event_type, placement_id, content_id, revenue, duration } = body;

    // Get user IP and user agent
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Insert analytics event
    const { error } = await supabase.from('ad_analytics').insert({
      placement_id,
      content_id,
      event_type,
      revenue: revenue || 0,
      user_agent: userAgent,
      ip_address: ip,
    });

    if (error) {
      console.error('Ad analytics error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update placement stats if impression or click
    if (event_type === 'impression' || event_type === 'click') {
      const { data: placement } = await supabase
        .from('ad_placements')
        .select('impressions, clicks')
        .eq('id', placement_id)
        .single();

      if (placement) {
        const updates: any = {};
        if (event_type === 'impression') {
          updates.impressions = (placement.impressions || 0) + 1;
        }
        if (event_type === 'click') {
          updates.clicks = (placement.clicks || 0) + 1;
        }
        if (revenue) {
          updates.revenue = (placement.revenue || 0) + revenue;
        }

        await supabase
          .from('ad_placements')
          .update(updates)
          .eq('id', placement_id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Ad event tracking error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

