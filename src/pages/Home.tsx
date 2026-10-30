import { useState } from 'react';
import { useCurrentUser } from '../blog/AuthContext';
import * as api from '../blog/mockApi';
import UserList from '../ui/components/UserList';

type Tab = 'followers' | 'following';

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'followers', label: 'Followers' },
  { id: 'following', label: 'Following' },
];

export default function Home() {
  const currentUser = useCurrentUser();
  const [activeTab, setActiveTab] = useState<Tab>('followers');

  return (
    <section className="home-page">
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

      {activeTab === 'followers' ? (
        <UserList users={api.getFollowers(currentUser.id)} showFollow />
      ) : (
        <UserList users={api.getFollowing(currentUser.id)} />
      )}
    </section>
  );
}