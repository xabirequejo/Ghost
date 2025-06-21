import FeedList from './components/FeedList';
import React from 'react';
import {useFeatureFlags} from '@src/lib/feature-flags';
import {
    useFeedForUser,
    useUserDataForUser
} from '@hooks/use-activity-pub-queries';
import {useFeedStore} from '../../stores/feed-store';
import {useSyncFeedWithZustand} from '../../stores/sync-feed-zustand';

const Feed: React.FC = () => {
    const {isEnabled} = useFeatureFlags();

    // Always fetch data with React Query
    const {feedQuery} = useFeedForUser({enabled: true});
    const feedQueryData = feedQuery;
    const {data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading} = feedQueryData;

    // Get data from Zustand store
    const zustandPosts = useFeedStore(state => state.posts);

    // Sync data to Zustand store
    useSyncFeedWithZustand(data);

    // Choose which data source to use based on flag
    const activities = isEnabled('zustand')
        ? zustandPosts
        : (data?.pages.flatMap(page => page.posts) ?? []);

    // Show skeleton items when loading and no data yet
    const displayActivities = (isLoading && activities.length === 0)
        ? Array.from({length: 5}, (_, index) => ({id: `skeleton-${index}`, object: {}, actor: {}, type: 'Note'}))
        : activities;

    const {data: user} = useUserDataForUser('index');

    return <FeedList
        activities={displayActivities}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage!}
        isFetchingNextPage={isFetchingNextPage}
        isLoading={isLoading}
        user={user!}
    />;
};

export default Feed;
