import { useState } from 'react';
import { useCurrentUser } from '../blog/AuthContext';
import * as api from '../blog/mockApi';
import TweetList from '../ui/components/TweetList';

export default function Feed() {
  const currentUser = useCurrentUser();
  const [activeTab, setActiveTab] = useState('forYou');

  const tweetsToDisplay =
    activeTab === 'forYou'
      ? api.getFeed(currentUser.id)
      : api.getFeed(currentUser.id); 

  return (
    <section>
      
      <div className="tabs-container">
        <button
          onClick={() => setActiveTab('forYou')}
          className={`tab-item ${activeTab === 'forYou' ? 'active' : ''}`}
        >
          For You
        </button>
        <button
          onClick={() => setActiveTab('following')}
          className={`tab-item ${activeTab === 'following' ? 'active' : ''}`}
        >
          Following
        </button>
      </div>

    
      <TweetList tweets={tweetsToDisplay} />
    </section>
  );
}