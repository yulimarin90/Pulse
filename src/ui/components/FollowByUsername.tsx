import { useState } from 'react';
import type { SyntheticEvent } from 'react';
import { useCurrentUser } from '../../blog/AuthContext';
import * as api from '../../blog/dataStore';
import Notice from './Notice';
import type { NoticeState } from './Notice';

interface FollowByUsernameProps {
  onFollowed?: () => void;
}

// Form to follow another user by typing their username
export default function FollowByUsername({ onFollowed }: FollowByUsernameProps) {
  const currentUser = useCurrentUser();
  const [username, setUsername] = useState('');
  const [notice, setNotice] = useState<NoticeState | null>(null);

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const followed = api.followByUsername(currentUser.id, username);
      setNotice({ type: 'success', message: `You are now following @${followed.username}` });
      setUsername('');
      if (onFollowed) onFollowed();
    } catch (err) {
      setNotice({ type: 'error', message: err instanceof Error ? err.message : 'Could not follow the user' });
    }
  };

  return (
    <div className="follow-form">
      <form onSubmit={handleSubmit}>
        <label>
          Follow a user by username
          <input
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setNotice(null);
            }}
            placeholder="@username"
            required
          />
        </label>
        <button type="submit" className="btn">[Follow]</button>
      </form>
      {notice && <Notice type={notice.type} message={notice.message} />}
    </div>
  );
}
