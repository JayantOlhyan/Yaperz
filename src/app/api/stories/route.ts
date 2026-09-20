import { NextResponse } from 'next/server';
import { getStories } from '@/lib/data-store';

export async function GET() {
  try {
    const stories = getStories();
    const activeStories = stories.filter((s) => s.isActive !== false);
    return NextResponse.json({ success: true, data: activeStories });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch stories' }, { status: 500 });
  }
}
