import { useState, useReducer } from 'react';
import { useCurrentUser } from '../blog/AuthContext';
import * as api from '../blog/dataStore';
import FollowByUsername from '../ui/components/FollowByUsername';
import UserList from '../ui/components/UserList';

type Tab = 'followers' | 'following';

export default function Home() {
  const currentUser = useCurrentUser();
  const [activeTab, setActiveTab] = useState<Tab>('followers');
  
  //Update following counters

  const [, refresh] = useReducer((n: number) => n + 1, 0);

  const followers = api.getFollowers(currentUser.id);
  const following = api.getFollowing(currentUser.id);

  const tabs: Array<{ id: Tab; label: string; count: number }> = [
    { id: 'followers', label: 'Followers', count: followers.length },
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

      {activeTab === 'followers' ? (
        <UserList users={followers} showFollow onFollow={refresh} />
      ) : (
        <UserList users={following} onFollow={refresh} />
      )}
    </section>
  );
}
