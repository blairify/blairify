import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = searchParams.get('page') || '1';
  const per_page = searchParams.get('per_page') || '100';
  const query = searchParams.get('query') || 'developer'; // keyword search

  try {
    const url = `https://www.themuse.com/api/public/jobs?page=${page}&per_page=${per_page}&q=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const now = new Date();
    const ninetyDaysAgo = new Date(now);
    ninetyDaysAgo.setDate(now.getDate() - 90);

    // Keep only jobs with a landing page and recently published
    const activeJobs = (data.results || []).filter((job: any) => {
      const hasLanding = job.refs?.landing_page?.startsWith('https');
      const pubDate = job.publication_date ? new Date(job.publication_date) : null;
      const isRecent = pubDate && pubDate > ninetyDaysAgo;
      return hasLanding && isRecent;
    });

    return NextResponse.json({
      ...data,
      results: activeJobs,
      page: data.page,
      page_count: data.page_count,
    });
  } catch (err: any) {
    console.error('API /jobs error:', err);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}
