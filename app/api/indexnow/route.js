const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || process.env.TMDB_API_KEY || 'f82feeca535cc0132d1ab38948a70405';
const BASE_URL = 'https://api.themoviedb.org/3';
const SITE_HOST = 'zizex.vercel.app';
const SITE_URL = `https://${SITE_HOST}`;
const INDEXNOW_KEY = '2eb2044748994acca0ef609dba36cd43';
const LOCALES = ['en', 'fr', 'ar'];

function createSlug(title, id) {
  if (!id) return '';
  if (!title) return String(id);
  const clean = String(title)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  return clean ? `watch-${clean}-${id}` : `watch-${id}`;
}

async function fetchTMDB(endpoint, pages = 3) {
  const nums = Array.from({ length: pages }, (_, i) => i + 1);
  const responses = await Promise.all(
    nums.map(p =>
      fetch(`${BASE_URL}${endpoint}?api_key=${API_KEY}&page=${p}`)
        .then(res => (res.ok ? res.json() : null))
        .catch(() => null)
    )
  );
  return responses.flatMap(r => r?.results ?? []);
}

export async function GET() {
  return handleSubmission();
}

export async function POST() {
  return handleSubmission();
}

async function handleSubmission() {
  try {
    const [popularMovies, popularTV] = await Promise.all([
      fetchTMDB('/movie/popular', 4),
      fetchTMDB('/tv/popular', 4),
    ]);

    const primaryBrandUrls = [
      `${SITE_URL}/`,
      `${SITE_URL}/en`,
      `${SITE_URL}/fr`,
      `${SITE_URL}/ar`,
    ];

    const urlSet = new Set(primaryBrandUrls);

    LOCALES.forEach(loc => {
      urlSet.add(`${SITE_URL}/${loc}`);
      urlSet.add(`${SITE_URL}/${loc}/movies`);
      urlSet.add(`${SITE_URL}/${loc}/tv`);
      urlSet.add(`${SITE_URL}/${loc}/top-rated`);
    });

    popularMovies.forEach(movie => {
      if (!movie?.id || !movie?.title) return;
      const slug = createSlug(movie.title, movie.id);
      LOCALES.forEach(loc => {
        urlSet.add(`${SITE_URL}/${loc}/movie/${slug}`);
      });
    });

    popularTV.forEach(show => {
      if (!show?.id || !show?.name) return;
      const slug = createSlug(show.name, show.id);
      LOCALES.forEach(loc => {
        urlSet.add(`${SITE_URL}/${loc}/tv/${slug}/season-1/episode-1`);
      });
    });

    const urlList = Array.from(urlSet);

    const payload = {
      host: SITE_HOST,
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: urlList,
    };

    const res = await fetch('https://www.bing.com/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    return Response.json({
      success: res.ok || res.status === 200 || res.status === 202,
      status: res.status,
      submittedUrls: urlList.length,
    });
  } catch (error) {
    return Response.json({ success: false, error: String(error) }, { status: 500 });
  }
}
