import { NextRequest, NextResponse } from 'next/server';
import { OtakudesuScraper } from '@/lib/scraper';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  const scraper = new OtakudesuScraper();

  try {
    if (action === 'home') {
      const data = await scraper.home();
      return NextResponse.json(data);
    }
    if (action === 'ongoing') {
      const page = parseInt(searchParams.get('page') || '1');
      const data = await scraper.ongoing(page);
      return NextResponse.json(data);
    }
    if (action === 'complete') {
      const page = parseInt(searchParams.get('page') || '1');
      const data = await scraper.complete(page);
      return NextResponse.json(data);
    }
    if (action === 'genrelist') {
      const data = await scraper.genreList();
      return NextResponse.json(data);
    }
    if (action === 'genre') {
      const slug = searchParams.get('slug');
      if (!slug) {
        return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
      }
      const page = parseInt(searchParams.get('page') || '1');
      const data = await scraper.genre(slug, page);
      return NextResponse.json(data);
    }
    if (action === 'jadwal') {
      const data = await scraper.jadwalRilis();
      return NextResponse.json(data);
    }
    if (action === 'search') {
      const q = searchParams.get('q');
      if (!q) {
        return NextResponse.json({ error: 'Query q is required' }, { status: 400 });
      }
      const data = await scraper.search(q);
      return NextResponse.json(data);
    }
    if (action === 'detail') {
      const slug = searchParams.get('slug');
      if (!slug) {
        return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
      }
      const data = await scraper.detail(slug);
      return NextResponse.json(data);
    }
    if (action === 'episode') {
      const slug = searchParams.get('slug');
      if (!slug) {
        return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
      }
      const data = await scraper.episode(slug);
      return NextResponse.json(data);
    }
    if (action === 'stream') {
      const postId = parseInt(searchParams.get('postId') || '');
      const i = parseInt(searchParams.get('i') || '');
      const q = searchParams.get('q') || '';
      const nonce = searchParams.get('nonce') || '';

      if (!postId || isNaN(i) || !q || !nonce) {
        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
      }

      const url = await scraper.getStreamUrl(postId, i, q, nonce);
      return NextResponse.json({ url });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
