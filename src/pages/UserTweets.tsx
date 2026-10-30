import { useReducer } from 'react';
import { useParams } from 'react-router-dom';
import { useCurrentUser } from '../blog/AuthContext';
import * as api from '../blog/mockApi';
import TweetList from '../ui/components/TweetList';
import ProfileStats from '../ui/components/ProfileStats';
import FollowButton from '../ui/components/FollowButton';

export default function UserTweets() {
  const { username = '' } = useParams();
  const currentUser = useCurrentUser();
  const [, refresh] = useReducer((n: number) => n + 1, 0);
  const user = api.getUserByUsername(username);

  if (!user) return <p>User not found</p>;

  const canFollow = user.id !== currentUser.id && !api.isFollowing(currentUser.id, user.id);

  return (
    <section>
      <div className="row">
        <h1>{user.fullName}</h1>
        {canFollow && <FollowButton targetId={user.id} onFollow={refresh} />}
      </div>
      <ProfileStats userId={user.id} />
      <TweetList tweets={api.getTweetsByUser(user.id)} />
    </section>
  );
}