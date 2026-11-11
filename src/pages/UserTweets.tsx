
import { useEffect, useReducer, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCurrentUser } from '../blog/AuthContext';
import * as api from '../blog/dataStore';
import useDataVersion from '../blog/useDataVersion';
import FollowButton from '../ui/components/FollowButton';
import ProfileHeader from '../ui/components/ProfileHeader';
import ProfileStats from '../ui/components/ProfileStats';
import ProfileTabs from '../ui/components/ProfileTabs';
import type { ProfileTab } from '../ui/components/ProfileTabs';
import type { StatsView } from '../ui/components/ProfileStats';
import TweetList from '../ui/components/TweetList';
import UserList from '../ui/components/UserList';

// Replies, reposts and media are not part of Pulse yet, so these tabs only show a message.
const EMPTY_TAB_MESSAGES: Record<Exclude<ProfileTab, 'posts'>, string> = {
  replies: 'No replies yet',
  reposts: 'No reposts yet',
  media: 'No photos or videos yet',
};

// Replies written by the user, tweets the user reposted, or tweets with a photo.
function ProfileTabContent({ tab, userId }: { tab: Exclude<ProfileTab, 'posts'>; userId: number }) {
  const tweets = tab === 'replies' ? api.getRepliesByUser(userId) : tab === 'reposts' ? api.getRepostedTweets(userId) : api.getMediaTweetsByUser(userId);
  if (tweets.length === 0) return <p className="empty-tab muted">{EMPTY_TAB_MESSAGES[tab]}</p>;
  return <TweetList tweets={tweets} />;
}

export default function UserTweets() {
  const { username = '' } = useParams();
  const currentUser = useCurrentUser();
  const [, refresh] = useReducer((n: number) => n + 1, 0);
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
      {view === 'tweets' && tab !== 'posts' && <p className="empty-tab muted">{EMPTY_TAB_MESSAGES[tab]}</p>}
      {view === 'followers' && <UserList users={api.getFollowers(user.id)} showFollow onFollow={refresh} />}
      {view === 'following' && <UserList users={api.getFollowing(user.id)} showFollow onFollow={refresh} onUnfollow={refresh} />}
    </section>
  );
}