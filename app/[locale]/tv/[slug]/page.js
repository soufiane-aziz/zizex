import { redirect } from 'next/navigation';

export default async function TVSeriesRedirect(props) {
    const params = await props.params;
    const { locale, slug } = params;

    // Clean redirect to the first episode player
    redirect(`/${locale}/tv/${slug}/season-1/episode-1`);
}
