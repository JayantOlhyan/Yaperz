import { NextRequest, NextResponse } from 'next/server';

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'yaperz-admin-2026';
const COOKIE_NAME = 'yaperz_admin_session';

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get(COOKIE_NAME)?.value;
  const isAuthenticated = sessionCookie === 'authenticated';
  return NextResponse.json({ authenticated: isAuthenticated });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { passcode, action } = body;

    if (action === 'logout') {
      const response = NextResponse.json({ success: true, message: 'Logged out' });
      response.cookies.set({
        name: COOKIE_NAME,
        value: '',
        path: '/',
        maxAge: 0,
        httpOnly: true,
        sameSite: 'lax',
      });
      return response;
    }

    if (passcode === ADMIN_SECRET) {
      const response = NextResponse.json({ success: true, message: 'Authenticated' });
      response.cookies.set({
        name: COOKIE_NAME,
        value: 'authenticated',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        httpOnly: true,
        sameSite: 'lax',
      });
      return response;
    }

    return NextResponse.json(
      { success: false, error: 'Invalid admin passcode' },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to process authentication request' },
      { status: 500 }
    );
  }
}
