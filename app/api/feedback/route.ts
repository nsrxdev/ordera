import { NextResponse } from 'next/server';

import { getAuthedSupabase, jsonError } from '@/app/api/_utils';
import { feedbackCreateSchema } from '@/lib/validations/feedback';

export async function GET(request: Request) {
  const { supabase, user, unauthorized } = await getAuthedSupabase();
  if (unauthorized || !user) return jsonError(401, 'Unauthorized');

  const url = new URL(request.url);
  const search = url.searchParams.get('search')?.trim() || '';
  const rating = url.searchParams.get('rating')?.trim() || '';

  let query = supabase
    .from('feedback')
    .select('*')
    .order('feedback_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (rating && rating !== 'all') {
    const r = Number(rating);
    if (!Number.isNaN(r)) query = query.eq('rating', r);
  }

  if (search) {
    const escaped = search.replaceAll(',', '\\,');
    query = query.or(
      `customer_name.ilike.%${escaped}%,feedback_message.ilike.%${escaped}%`
    );
  }

  const { data, error } = await query;
  if (error) return jsonError(400, error.message);

  return NextResponse.json({ feedback: data ?? [] });
}

export async function POST(request: Request) {
  const { supabase, user, unauthorized } = await getAuthedSupabase();
  if (unauthorized || !user) return jsonError(401, 'Unauthorized');

  const body = await request.json().catch(() => null);
  const parsed = feedbackCreateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(400, parsed.error.issues[0]?.message || 'Invalid input');
  }

  const { data, error } = await supabase
    .from('feedback')
    .insert({ ...parsed.data, user_id: user.id })
    .select('*')
    .single();

  if (error) return jsonError(400, error.message);
  return NextResponse.json({ feedback: data });
}

