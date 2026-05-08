import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function getAuthedSupabase() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return { supabase, user: null, unauthorized: true as const };
  }
  return { supabase, user: data.user, unauthorized: false as const };
}

export function jsonError(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}

