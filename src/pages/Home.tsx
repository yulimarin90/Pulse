import { useState } from 'react';
import { useCurrentUser } from '../blog/AuthContext';
import ProfileStats from '../ui/components/ProfileStats';
import TweetList from '../ui/components/TweetList';
import * as api from '../blog/mockApi';
import { useLocation } from 'react-router-dom';

export default function Home() {
  const currentUser = useCurrentUser();
  const [activeTab, setActiveTab] = useState<'foryou' | 'following'>('foryou');
  const location = useLocation();

  const isFeedView = location.pathname.includes('/feed');

  // Obtiene los tweets guardados en la API
  const tweets = api.getTweets ? api.getTweets() : [];

  return (
    <section className="home-page">
      {/* 'For You' and 'Following' tabs */}
      <div className="feed-tabs">
        <button 
          className={`tab-btn ${activeTab === 'foryou' ? 'active' : ''}`}
          onClick={() => setActiveTab('foryou')}
        >
          For you
        </button>
        <button 
          className={`tab-btn ${activeTab === 'following' ? 'active' : ''}`}
          onClick={() => setActiveTab('following')}
        >
          Following
        </button>
      </div>

      {/* page content */}
      <div className="home-content">
        {activeTab === 'foryou' && (
          <div className="tweets-feed">
            <TweetList tweets={tweets} />
          </div>
        )}

        {activeTab === 'following' && (
          <div className="following-empty">
            <p>Publicaciones de las personas que sigues.</p>
          </div>
        )}

        {isFeedView && (
          <div className="conditional-stats">
            <ProfileStats userId={currentUser.id} linked />
          </div>
        )}
      </div>
    </section>
  );
}