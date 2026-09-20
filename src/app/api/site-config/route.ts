import { NextResponse } from 'next/server';
import { getSiteConfig } from '@/lib/data-store';

export async function GET() {
  try {
    const config = getSiteConfig();
    return NextResponse.json({ success: true, data: config });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to retrieve site configuration' }, { status: 500 });
  }
}
