import { NextResponse } from 'next/server';
import { subDays } from 'date-fns';

import { getAuthedSupabase, jsonError } from '@/app/api/_utils';

export async function GET() {
  const { supabase, user, unauthorized } = await getAuthedSupabase();
  if (unauthorized || !user) return jsonError(401, 'Unauthorized');

  const { count: totalOrders, error: ordersCountError } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true });
  if (ordersCountError) return jsonError(400, ordersCountError.message);

  const { count: totalFeedback, error: feedbackCountError } = await supabase
    .from('feedback')
    .select('id', { count: 'exact', head: true });
  if (feedbackCountError) return jsonError(400, feedbackCountError.message);

  const { data: completedOrders, error: completedError } = await supabase
    .from('orders')
    .select('total_amount')
    .eq('order_status', 'Completed');
  if (completedError) return jsonError(400, completedError.message);

  const totalRevenue =
    completedOrders?.reduce((sum, o) => sum + Number(o.total_amount ?? 0), 0) ??
    0;
  const completedCount = completedOrders?.length ?? 0;
  const avgOrderValue = completedCount > 0 ? totalRevenue / completedCount : 0;

  // recent
  const { data: recentOrders, error: recentOrdersError } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);
  if (recentOrdersError) return jsonError(400, recentOrdersError.message);

  const { data: recentFeedback, error: recentFeedbackError } = await supabase
    .from('feedback')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);
  if (recentFeedbackError) return jsonError(400, recentFeedbackError.message);

  // simple timeframe hint for client charts
  const fromDate = subDays(new Date(), 30).toISOString().slice(0, 10);

  return NextResponse.json({
    totalRevenue,
    totalOrders: totalOrders ?? 0,
    avgOrderValue,
    totalFeedback: totalFeedback ?? 0,
    recentOrders: recentOrders ?? [],
    recentFeedback: recentFeedback ?? [],
    fromDate,
  });
}

