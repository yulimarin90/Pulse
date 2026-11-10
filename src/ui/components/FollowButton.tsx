import { useState } from 'react';
import { useCurrentUser } from '../../blog/AuthContext';
import * as api from '../../blog/dataStore';

interface FollowButtonProps {
  targetId: number;
  onFollow?: () => void;
  onUnfollow?: () => void;
}

export default function FollowButton({ targetId, onFollow, onUnfollow }: FollowButtonProps) {
  const currentUser = useCurrentUser();
  const [following, setFollowing] = useState(api.isFollowing(currentUser.id, targetId));

  if (targetId === currentUser.id) return null;

  if (following) {
    return (
      <button
        type="button"
        className="btn btn-small btn-following"
        aria-label="Following. Press to unfollow"
        onClick={() => {
          api.unfollow(currentUser.id, targetId);
          setFollowing(false);
          if (onUnfollow) onUnfollow();
        }}
      >
        <span className="label-following">Following</span>
        <span className="label-unfollow">Unfollow</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      className="btn btn-small"
      onClick={() => {
        api.follow(currentUser.id, targetId);
        setFollowing(true);
        if (onFollow) onFollow();
      }}
    >
      [Follow]
    </button>
  );
}
