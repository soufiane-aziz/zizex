import TVShowPage from './[seasonId]/[episodeId]/page';

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
