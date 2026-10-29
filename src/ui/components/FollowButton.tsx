import { useState } from 'react';
import { useCurrentUser } from '../../blog/AuthContext';
import * as api from '../../blog/mockApi';

interface FollowButtonProps {
  targetId: number;
  onFollow?: () => void;
}

export default function FollowButton({ targetId, onFollow }: FollowButtonProps) {
  const currentUser = useCurrentUser();
  const [following, setFollowing] = useState(api.isFollowing(currentUser.id, targetId));

  if (following) return null;
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