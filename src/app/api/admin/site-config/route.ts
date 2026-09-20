import { NextRequest, NextResponse } from 'next/server';
import { getSiteConfig, saveSiteConfig } from '@/lib/data-store';

export async function GET() {
  const config = getSiteConfig();
  return NextResponse.json({ success: true, data: config });
}

export async function PUT(request: NextRequest) {
  try {
    const updates = await request.json();
    const currentConfig = getSiteConfig();

    const newConfig = {
      ...currentConfig,
      ...updates,
      brand: {
        ...currentConfig.brand,
        ...(updates.brand || {}),
        announcement: {
          ...currentConfig.brand.announcement,
          ...(updates.brand?.announcement || {}),
        },
      },
      hero: {
        ...currentConfig.hero,
        ...(updates.hero || {}),
      },
    };

    const saved = saveSiteConfig(newConfig);
    if (!saved) {
      return NextResponse.json({ success: false, error: 'Failed to persist site configuration' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: newConfig });
  } catch {
    return NextResponse.json({ success: false, error: 'Malformed request payload' }, { status: 400 });
  }
}
