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

async function fetchTMDB(endpoint, pageCount = 5) {
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);
  const responses = await Promise.all(
    pages.map(p =>
      fetch(`${BASE_URL}${endpoint}?api_key=${API_KEY}&page=${p}`)
        .then(res => (res.ok ? res.json() : null))
        .catch(() => null)
    )
  );
  return responses.flatMap(r => r?.results ?? []);
}

async function main() {
  console.log('Fetching movies and TV shows from TMDB for IndexNow submission...');

  const [popularMovies, topMovies, popularTV, topTV] = await Promise.all([
    fetchTMDB('/movie/popular', 5),
    fetchTMDB('/movie/top_rated', 5),
    fetchTMDB('/tv/popular', 5),
    fetchTMDB('/tv/top_rated', 5),
  ]);

  const urlSet = new Set();

  // Root & category pages
  LOCALES.forEach(loc => {
    urlSet.add(`${SITE_URL}/${loc}`);
    urlSet.add(`${SITE_URL}/${loc}/movies`);
    urlSet.add(`${SITE_URL}/${loc}/tv`);
    urlSet.add(`${SITE_URL}/${loc}/top-rated`);
  });

  // Movie URLs
  [...popularMovies, ...topMovies].forEach(movie => {
    if (!movie?.id || !movie?.title) return;
    const slug = createSlug(movie.title, movie.id);
    LOCALES.forEach(loc => {
      urlSet.add(`${SITE_URL}/${loc}/movie/${slug}`);
    });
  });

  // TV URLs (Season 1 & 2 Episode 1)
  [...popularTV, ...topTV].forEach(show => {
    if (!show?.id || !show?.name) return;
    const slug = createSlug(show.name, show.id);
    LOCALES.forEach(loc => {
      urlSet.add(`${SITE_URL}/${loc}/tv/${slug}/season-1/episode-1`);
      urlSet.add(`${SITE_URL}/${loc}/tv/${slug}/season-2/episode-1`);
    });
  });

  const urlList = Array.from(urlSet);
  console.log(`Generated ${urlList.length} unique URLs to submit to IndexNow.`);

  const BATCH_SIZE = 100;
  const chunks = [];
  for (let i = 0; i < urlList.length; i += BATCH_SIZE) {
    chunks.push(urlList.slice(i, i + BATCH_SIZE));
  }

  console.log(`Sending ${chunks.length} streaming batches of up to ${BATCH_SIZE} URLs each...`);

  const endpoints = [
    'https://www.bing.com/indexnow',
    'https://api.indexnow.org/IndexNow',
    'https://yandex.com/indexnow'
  ];

  for (let cIdx = 0; cIdx < chunks.length; cIdx++) {
    const chunk = chunks[cIdx];
    const payload = {
      host: SITE_HOST,
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: chunk,
    };

    console.log(`[Batch ${cIdx + 1}/${chunks.length}] Submitting ${chunk.length} URLs...`);

    for (const endpoint of endpoints) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: JSON.stringify(payload),
        });

        if (res.ok || res.status === 200 || res.status === 202) {
          console.log(`  -> OK [${res.status}] on ${endpoint}`);
          break;
        }
      } catch (err) {
        console.log(`  -> Error on ${endpoint}: ${err.message || err}`);
      }
    }
  }

  console.log('✅ ALL IndexNow streaming batches completed successfully!');
}

main();
