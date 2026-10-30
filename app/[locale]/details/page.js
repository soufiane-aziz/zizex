import { redirect, RedirectType } from 'next/navigation';
import { createSlug, extractIdFromSlug } from '../../../lib/slug';
import { fetchFromTMDB } from '../../../lib/tmdb';

export default async function DetailsRedirectPage(props) {
    const params = await props.params;
    const searchParams = await props.searchParams;
    const locale = params?.locale || 'en';

    const id = searchParams?.id || searchParams?.movie_id || searchParams?.tv_id || extractIdFromSlug(searchParams?.slug);
    const query = searchParams?.title || searchParams?.query || searchParams?.q || searchParams?.name || searchParams?.slug;
    const mediaType = searchParams?.type || searchParams?.media_type || 'movie';

    if (id) {
        if (mediaType === 'tv') {
            const showData = await fetchFromTMDB(`/tv/${id}`);
            if (showData && showData.name) {
                const slug = createSlug(showData.name, showData.id, 'tv');
                redirect(`/${locale}/tv/${slug}/season-1/episode-1`, RedirectType.replace);
            }
        } else {
            const movieData = await fetchFromTMDB(`/movie/${id}`);
            if (movieData && movieData.title) {
                const slug = createSlug(movieData.title, movieData.id, 'movie');
                redirect(`/${locale}/movie/${slug}`, RedirectType.replace);
            }
        }
    }

    if (query) {
        const searchData = await fetchFromTMDB('/search/multi', `&query=${encodeURIComponent(query)}`);
        if (searchData && searchData.results && searchData.results.length > 0) {
            const first = searchData.results[0];
            if (first.media_type === 'tv' || (!first.title && first.name)) {
                const slug = createSlug(first.name, first.id, 'tv');
                redirect(`/${locale}/tv/${slug}/season-1/episode-1`, RedirectType.replace);
            } else {
                const slug = createSlug(first.title, first.id, 'movie');
                redirect(`/${locale}/movie/${slug}`, RedirectType.replace);
            }
        }
    }

    // Default fallback to home
    redirect(`/${locale}`, RedirectType.replace);
}
