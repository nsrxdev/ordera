import { NextResponse } from 'next/server';

import { getAuthedSupabase, jsonError } from '@/app/api/_utils';
import { profileUpdateSchema } from '@/lib/validations/profile';

export async function GET() {
  const { supabase, user, unauthorized } = await getAuthedSupabase();
  if (unauthorized || !user) return jsonError(401, 'Unauthorized');

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) return jsonError(400, error.message);
  return NextResponse.json({ profile: data });
}

export async function PUT(request: Request) {
  const { supabase, user, unauthorized } = await getAuthedSupabase();
  if (unauthorized || !user) return jsonError(401, 'Unauthorized');

  const body = await request.json().catch(() => null);
  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(400, parsed.error.issues[0]?.message || 'Invalid input');
  }

  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: user.id, ...parsed.data })
    .select('*')
    .single();

  if (error) return jsonError(400, error.message);
  return NextResponse.json({ profile: data });
}

