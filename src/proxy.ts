import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/session';

const PUBLIC_AUTH_ROUTES = ['/login', '/register'];

function isAdminRoute(pathname: string) {
  return pathname === '/admin' || pathname.startsWith('/admin/');
}

function isHomeRoute(pathname: string) {
  return pathname === '/';
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  const isProtected = isAdminRoute(pathname) || isHomeRoute(pathname);
  const isAuthPage = PUBLIC_AUTH_ROUTES.includes(pathname);

  // Belum login tapi mencoba akses rute terproteksi ("/" atau "/admin") -> lempar ke /login
  if (isProtected && !session) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('returnBackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Sudah login tapi bukan admin, coba akses /admin -> lempar ke "/"
  if (session && isAdminRoute(pathname) && session.role !== 'admin') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Sudah login sebagai admin, tapi buka "/" -> lempar ke /admin
  if (session && isHomeRoute(pathname) && session.role === 'admin') {
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  // Sudah login tapi membuka halaman login/register -> arahkan ke area masing-masing
  if (session && isAuthPage) {
    return NextResponse.redirect(new URL(session.role === 'admin' ? '/admin' : '/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
};