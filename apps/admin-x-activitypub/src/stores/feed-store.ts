import {Activity} from '../api/activitypub';
import {create} from 'zustand';

interface FeedStore {
    posts: Activity[];
    setPosts: (posts: Activity[]) => void;
}

export const useFeedStore = create<FeedStore>(set => ({
    posts: [],
    setPosts: posts => set({posts})
}));