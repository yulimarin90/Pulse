import { useEffect, useReducer, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCurrentUser } from '../blog/AuthContext';
import * as api from '../blog/mockApi';
import FollowButton from '../ui/components/FollowButton';
import ProfileStats from '../ui/components/ProfileStats';
import type { StatsView } from '../ui/components/ProfileStats';
import TweetList from '../ui/components/TweetList';
import UserList from '../ui/components/UserList';

export default function UserTweets() {
  const { username = '' } = useParams();
  const currentUser = useCurrentUser();
  const [, refresh] = useReducer((n: number) => n + 1, 0);
  const [view, setView] = useState<StatsView>('tweets');
  const user = api.getUserByUsername(username);

  // Back to the tweets when another profile is opened.
  useEffect(() => {
    setView('tweets');
  }, [username]);

  if (!user) return <p>User not found</p>;

  const canFollow = user.id !== currentUser.id && !api.isFollowing(currentUser.id, user.id);

  return (
    <section>
      <div className="row">
        <h1>{user.fullName}</h1>
        {canFollow && <FollowButton targetId={user.id} onFollow={refresh} />}
      </div>
      <ProfileStats
        userId={user.id}
        active={view}
        onSelect={(next) => setView(view === next ? 'tweets' : next)}
      />
      {view === 'tweets' && <TweetList tweets={api.getTweetsByUser(user.id)} />}
      {view === 'followers' && <UserList users={api.getFollowers(user.id)} showFollow onFollow={refresh} />}
      {view === 'following' && <UserList users={api.getFollowing(user.id)} onFollow={refresh} />}
    </section>
  );
}