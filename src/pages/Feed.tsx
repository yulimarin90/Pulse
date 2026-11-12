import { useState } from 'react';
import { useCurrentUser } from '../blog/AuthContext';
import * as api from '../blog/dataStore';
import TweetList from '../ui/components/TweetList';

type Tab = 'forYou' | 'following'; //'followers';

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'forYou', label: 'For You' },
  { id: 'following', label: 'Following' },
  //{ id: 'followers', label: 'Followers' },
];

export default function Feed() {
  const currentUser = useCurrentUser();
  const [activeTab, setActiveTab] = useState<Tab>('forYou');

  // For You: your tweets and the ones from people you follow. The other tabs only show one group.
  const tweetsByTab = {
    forYou: () => api.getTweets(),
    following: () => api.getFollowingTweets(currentUser.id),
    //followers: () => api.getFollowersTweets(currentUser.id),
  };

  const EMPTY: Record<Tab, string> = {
    forYou: 'There are no posts yet.',
    following: 'The people you follow have not posted yet. Follow people from the search to see their posts here.',
  };
  const tweets = tweetsByTab[activeTab]();

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

      {tweets.length === 0 ? <p className="empty-tab muted">{EMPTY[activeTab]}</p> : <TweetList key={activeTab} tweets={tweets} />}
    </section>
  );
}
