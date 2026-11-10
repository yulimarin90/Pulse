import { useState } from 'react';
import { useCurrentUser } from '../blog/AuthContext';
import * as api from '../blog/dataStore';
import TweetList from '../ui/components/TweetList';

type Tab = 'forYou' | 'following' | 'followers';

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'forYou', label: 'For You' },
  { id: 'following', label: 'Following' },
  { id: 'followers', label: 'Followers' },
];

export default function Feed() {
  const currentUser = useCurrentUser();
  const [activeTab, setActiveTab] = useState<Tab>('forYou');

  // For You: your tweets and the ones from people you follow. The other tabs only show one group.
  const tweetsByTab = {
    forYou: () => api.getFeed(currentUser.id),
    following: () => api.getFollowingTweets(currentUser.id),
    followers: () => api.getFollowersTweets(currentUser.id),
  };

  return (
    <section>
      <div className="feed-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <TweetList key={activeTab} tweets={tweetsByTab[activeTab]()} />
    </section>
  );
}
