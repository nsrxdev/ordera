import { NextResponse } from 'next/server';

import { getAuthedSupabase, jsonError } from '@/app/api/_utils';
import { orderUpdateSchema } from '@/lib/validations/order';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, unauthorized } = await getAuthedSupabase();
  if (unauthorized) return jsonError(401, 'Unauthorized');

  const { id } = await params;
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return jsonError(404, error.message);
  return NextResponse.json({ order: data });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, unauthorized } = await getAuthedSupabase();
  if (unauthorized) return jsonError(401, 'Unauthorized');

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = orderUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(400, parsed.error.issues[0]?.message || 'Invalid input');
  }

  const { data, error } = await supabase
    .from('orders')
    .update(parsed.data)
    .eq('id', id)
    .select('*')
    .single();

  if (error) return jsonError(400, error.message);
  return NextResponse.json({ order: data });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, unauthorized } = await getAuthedSupabase();
  if (unauthorized) return jsonError(401, 'Unauthorized');

  const { id } = await params;
  const { error } = await supabase.from('orders').delete().eq('id', id);
  if (error) return jsonError(400, error.message);
  return NextResponse.json({ ok: true });
}

