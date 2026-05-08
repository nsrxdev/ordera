import { NextResponse } from 'next/server';
import { format, subDays } from 'date-fns';

import { getAuthedSupabase, jsonError } from '@/app/api/_utils';

type ChartPoint = { name: string; revenue: number; count: number };

export async function GET(request: Request) {
  const { supabase, user, unauthorized } = await getAuthedSupabase();
  if (unauthorized || !user) return jsonError(401, 'Unauthorized');

  const url = new URL(request.url);
  const days = Math.min(Math.max(Number(url.searchParams.get('days') || 7), 1), 60);
  const from = subDays(new Date(), days - 1);
  const fromDate = from.toISOString().slice(0, 10);

  const { data: orders, error } = await supabase
    .from('orders')
    .select('order_date,total_amount,order_status')
    .gte('order_date', fromDate);

  if (error) return jsonError(400, error.message);

  const points: ChartPoint[] = Array.from({ length: days }, (_, i) => {
    const d = subDays(new Date(), days - 1 - i);
    return { name: format(d, 'MMM dd'), revenue: 0, count: 0 };
  });

  const indexByName = new Map(points.map((p, idx) => [p.name, idx]));

  for (const o of orders ?? []) {
    const name = format(new Date(o.order_date), 'MMM dd');
    const idx = indexByName.get(name);
    if (idx === undefined) continue;

    points[idx].count += 1;
    if (o.order_status === 'Completed') {
      points[idx].revenue += Number(o.total_amount ?? 0);
    }
  }

  return NextResponse.json({ revenueByDay: points });
}

