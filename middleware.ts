import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';

  // Redirect www to non-www
  if (hostname.startsWith('www.')) {
    const newHostname = hostname.replace('www.', '');
    const newUrl = new URL(request.nextUrl);
    newUrl.host = newHostname;
    return NextResponse.redirect(newUrl, { status: 301 });
  }
}

export const config = {
  matcher: ['/((?!_next).*)'],
};
