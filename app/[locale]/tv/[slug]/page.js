import TVShowPage, { generateMetadata as episodeGenerateMetadata } from './[seasonId]/[episodeId]/page';

export async function generateMetadata(props) {
    const resolvedParams = await props.params;
    const augmentedProps = {
        ...props,
        params: Promise.resolve({
            ...resolvedParams,
            seasonId: 'season-1',
            episodeId: 'episode-1',
        }),
    };

    const baseMeta = await episodeGenerateMetadata(augmentedProps);
    const { locale, slug } = resolvedParams;
    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zizex-tv.vercel.app';
    const path = `/tv/${slug}`;

    return {
        ...baseMeta,
        robots: {
            index: true,
            follow: true,
        },
        alternates: {
            canonical: `${SITE_URL}/${locale}${path}`,
            languages: {
                en: `${SITE_URL}/en${path}`,
                fr: `${SITE_URL}/fr${path}`,
                ar: `${SITE_URL}/ar${path}`,
                'x-default': `${SITE_URL}/en${path}`,
            },
        },
    };
}

export default async function TVSeriesDefaultPage(props) {
    const resolvedParams = await props.params;
    const augmentedProps = {
        ...props,
        params: Promise.resolve({
            ...resolvedParams,
            seasonId: 'season-1',
            episodeId: 'episode-1',
        }),
    };
    return <TVShowPage {...augmentedProps} />;
}
