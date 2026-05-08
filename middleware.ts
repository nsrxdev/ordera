import { NextResponse, type NextRequest } from 'next/server';
import { updateSupabaseSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSupabaseSession(request);

  const { pathname } = request.nextUrl;
  const isProtected =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/api/orders') ||
    pathname.startsWith('/api/feedback') ||
    pathname.startsWith('/api/profile') ||
    pathname.startsWith('/api/dashboard');

  if (!isProtected) return response;

  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
};

