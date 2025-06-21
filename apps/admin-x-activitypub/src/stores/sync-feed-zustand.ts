import {Activity} from '../api/activitypub';
import {useEffect} from 'react';
import {useFeedStore} from './feed-store';

interface PaginatedResponse {
    pages: {posts: Activity[]}[];
}

export function useSyncFeedWithZustand(data: PaginatedResponse | undefined) {
    const setPosts = useFeedStore(state => state.setPosts);

    useEffect(() => {
        if (data?.pages) {
            const allPosts = data.pages.flatMap(page => page.posts);
            setPosts(allPosts);
        }
    }, [data, setPosts]);
}