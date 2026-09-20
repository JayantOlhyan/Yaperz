import { NextRequest, NextResponse } from 'next/server';
import { getStories, saveStories } from '@/lib/data-store';
import { StoryItem } from '@/types';

export async function GET() {
  const stories = getStories();
  return NextResponse.json({ success: true, data: stories });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { label, thumbnail, media, mediaType, ctaText, ctaLink, duration } = body;

    if (!label || !thumbnail || !media) {
      return NextResponse.json(
        { success: false, error: 'Label, thumbnail DP, and media URL are required' },
        { status: 400 }
      );
    }

    const stories = getStories();
    const newStory: StoryItem = {
      id: `story-${Date.now()}`,
      label,
      thumbnail,
      media,
      mediaType: mediaType || (media.match(/\.(mp4|webm|mov)$/i) ? 'video' : 'image'),
      ctaText: ctaText || 'Explore',
      ctaLink: ctaLink || '/collections/new-in',
      duration: duration || (mediaType === 'video' ? 10 : 5),
      isActive: true,
    };

    stories.unshift(newStory);
    const saved = saveStories(stories);

    if (!saved) {
      return NextResponse.json({ success: false, error: 'Failed to persist story' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: newStory }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Malformed request' }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Story ID is required' }, { status: 400 });
    }

    const stories = getStories();
    const index = stories.findIndex((s) => s.id === id);

    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Story not found' }, { status: 404 });
    }

    stories[index] = {
      ...stories[index],
      ...updates,
    };

    saveStories(stories);
    return NextResponse.json({ success: true, data: stories[index] });
  } catch {
    return NextResponse.json({ success: false, error: 'Malformed request' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Story ID is required' }, { status: 400 });
    }

    const stories = getStories();
    const filtered = stories.filter((s) => s.id !== id);

    saveStories(filtered);
    return NextResponse.json({ success: true, message: 'Story deleted successfully' });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to delete story' }, { status: 500 });
  }
}
