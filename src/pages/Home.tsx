
import { useReducer, useState } from 'react';
import { useCurrentUser } from '../blog/AuthContext';
import * as api from '../blog/dataStore';
import FollowByUsername from '../ui/components/FollowByUsername';
import UserList from '../ui/components/UserList';

type Tab = 'foryou' | 'following';

export default function Home() {
  const currentUser = useCurrentUser();
  const [activeTab, setActiveTab] = useState<Tab>('foryou');

  // Update following counters
  const [, refresh] = useReducer((n: number) => n + 1, 0);

  const foryou = api.getFollowers(currentUser.id);
  const following = api.getFollowing(currentUser.id);

  const tabs: Array<{ id: Tab; label: string; count: number }> = [
    { id: 'foryou', label: 'For You', count: foryou.length },
    { id: 'following', label: 'Following', count: following.length },
  ];

  return (
    <section className="home-page">
      <div className="feed-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label} <span className="tab-count">{tab.count}</span>
          </button>
        ))}
      </div>

      {activeTab === 'foryou' ? (
        <UserList users={foryou} showFollow onFollow={refresh} />
      ) : (
        <UserList users={following} onFollow={refresh} />
      )}
    </section>
  );
}
