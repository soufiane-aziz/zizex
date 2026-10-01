import TVShowPage from './[episodeId]/page';

export async function generateStaticParams() {
    return [
        { locale: 'en', slug: 'watch-trending-1', seasonId: 'season-1' },
        { locale: 'fr', slug: 'watch-trending-1', seasonId: 'season-1' },
        { locale: 'ar', slug: 'watch-trending-1', seasonId: 'season-1' },
    ];
}

export default async function TVSeasonDefaultPage(props) {
    const resolvedParams = await props.params;
    const augmentedProps = {
        ...props,
        params: Promise.resolve({
            ...resolvedParams,
            episodeId: 'episode-1',
        }),
    };
    return <TVShowPage {...augmentedProps} />;
}
