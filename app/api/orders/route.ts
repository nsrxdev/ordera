import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getAuthedSupabase, jsonError } from '@/app/api/_utils';
import { orderCreateSchema } from '@/lib/validations/order';

export async function GET(request: Request) {
  const { supabase, user, unauthorized } = await getAuthedSupabase();
  if (unauthorized || !user) return jsonError(401, 'Unauthorized');

  const url = new URL(request.url);
  const search = url.searchParams.get('search')?.trim() || '';
  const status = url.searchParams.get('status')?.trim() || '';

  let query = supabase
    .from('orders')
    .select('*')
    .order('order_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('order_status', status);
  }

  if (search) {
    const escaped = search.replaceAll(',', '\\,');
    query = query.or(
      `customer_name.ilike.%${escaped}%,phone_number.ilike.%${escaped}%`
    );
  }

  const { data, error } = await query;
  if (error) return jsonError(400, error.message);

  return NextResponse.json({ orders: data ?? [] });
}

export async function POST(request: Request) {
  const { supabase, user, unauthorized } = await getAuthedSupabase();
  if (unauthorized || !user) return jsonError(401, 'Unauthorized');

  const body = await request.json().catch(() => null);
  const parsed = orderCreateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(400, parsed.error.issues[0]?.message || 'Invalid input');
  }

  const { data, error } = await supabase
    .from('orders')
    .insert({ ...parsed.data, user_id: user.id })
    .select('*')
    .single();

  if (error) return jsonError(400, error.message);
  return NextResponse.json({ order: data });
}

