import { useEffect, useReducer, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCurrentUser } from '../blog/AuthContext';
import * as api from '../blog/dataStore';
import usePagination from '../blog/usePagination';
import useDataVersion from '../blog/useDataVersion';
import Pagination from '../ui/components/Pagination';
import FollowButton from '../ui/components/FollowButton';
import ProfileHeader from '../ui/components/ProfileHeader';
import ProfileStats from '../ui/components/ProfileStats';
import ProfileTabs from '../ui/components/ProfileTabs';
import type { ProfileTab } from '../ui/components/ProfileTabs';
import type { StatsView } from '../ui/components/ProfileStats';
import TweetList from '../ui/components/TweetList';
import UserList from '../ui/components/UserList';
import type { TweetWithAuthor } from '../blog/types';

// Shown when a tab has nothing yet.
const EMPTY_TAB_MESSAGES: Record<Exclude<ProfileTab, 'posts'>, string> = {
  replies: 'No replies yet',
  reposts: 'No reposts yet',
  media: 'No photos or videos yet',
};

// Media tab: a grid with the photos and GIFs the user posted, like X. Each one opens its tweet.
function MediaGrid({ tweets }: { tweets: TweetWithAuthor[] }) {
  const { pageItems, page, totalPages, setPage } = usePagination(tweets);
  return (
    <>
      <div className="media-grid">
        {pageItems.map((tweet) => (
          <Link key={tweet.id} to={`/tweets/${tweet.id}`} aria-label={`Open the post of @${tweet.author.username}`}>
            <img src={tweet.imageUrl} alt={tweet.text || 'Photo of the post'} />
          </Link>
        ))}
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </>
  );
}

// Replies written by the user, tweets the user reposted, or tweets with a photo.
function ProfileTabContent({ tab, userId }: { tab: Exclude<ProfileTab, 'posts'>; userId: number }) {
  const tweets = tab === 'replies' ? api.getRepliesByUser(userId) : tab === 'reposts' ? api.getRepostedTweets(userId) : api.getMediaTweetsByUser(userId);
  if (tweets.length === 0) return <p className="empty-tab muted">{EMPTY_TAB_MESSAGES[tab]}</p>;
  return tab === 'media' ? <MediaGrid tweets={tweets} /> : <TweetList tweets={tweets} />;
}

export default function UserTweets() {
  const { username = '' } = useParams();
  const currentUser = useCurrentUser();
  const [, refresh] = useReducer((n: number) => n + 1, 0);
  // Reposts and likes change the lists of the tabs.
  useDataVersion();
  const [view, setView] = useState<StatsView>('tweets');
  const [tab, setTab] = useState<ProfileTab>('posts');
  const user = api.getUserByUsername(username);

  // Back to the tweets when another profile is opened.
  useEffect(() => {
    setView('tweets');
    setTab('posts');
  }, [username]);

  if (!user) return <p>User not found</p>;

  const canFollow = user.id !== currentUser.id && !api.isFollowing(currentUser.id, user.id);

  return (
    <section>
      <ProfileHeader
        user={user}
        isOwn={user.id === currentUser.id}
        action={canFollow ? <FollowButton targetId={user.id} onFollow={refresh} onUnfollow={refresh} /> : undefined}
      >
        <ProfileStats
          userId={user.id}
          active={view}
          onSelect={(next) => setView(view === next ? 'tweets' : next)}
        />
      </ProfileHeader>
      <ProfileTabs
        active={view === 'tweets' ? tab : null}
        onSelect={(next) => {
          setTab(next);
          setView('tweets');
        }}
      />
      {view === 'tweets' && tab === 'posts' && <TweetList tweets={api.getTweetsByUser(user.id)} />}
      {view === 'tweets' && tab !== 'posts' && <ProfileTabContent tab={tab} userId={user.id} />}
      {view === 'followers' && <UserList users={api.getFollowers(user.id)} showFollow onFollow={refresh} onUnfollow={refresh} />}
      {view === 'following' && <UserList users={api.getFollowing(user.id)} showFollow onFollow={refresh} onUnfollow={refresh} />}
    </section>
  );
}