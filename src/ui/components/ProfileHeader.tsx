import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { getJoinedAt } from '../../blog/dataStore';
import type { User } from '../../blog/types';
import Avatar from './Avatar';
import ShareProfileButton from './ShareProfileButton';

interface ProfileHeaderProps {
  user: User;
  // The signed-in person is looking at their own profile: shows "Edit profile".
  isOwn: boolean;
  // Counters (followers / following), shown under the details.
  children?: ReactNode;
  // Extra button for other people's profiles, such as [Follow].
  action?: ReactNode;
}

const formatJoined = (timestamp: number): string => new Date(timestamp).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

// Top of a profile, like X: banner, photo bubble, name, details, counters and the buttons.
export default function ProfileHeader({ user, isOwn, children, action }: ProfileHeaderProps) {
  const joinedAt = getJoinedAt(user);

  return (
    <div className="profile-header">
      <div className="profile-banner" style={user.bannerUrl ? { backgroundImage: `url(${user.bannerUrl})` } : undefined} />
      <div className="profile-photo">
        <Avatar name={user.fullName} src={user.avatarUrl} />
      </div>

      <div className="profile-details">
        <h1 className="profile-name">{user.fullName}</h1>
        <p className="muted">@{user.username}</p>
        {user.bio && <p className="profile-bio">{user.bio}</p>}
        <p className="profile-meta muted">
          {user.location && <span>{user.location}</span>}
          {user.website && <span className="accent">{user.website}</span>}
          {joinedAt !== null && (
            <span className="profile-joined">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M3 10h18M8 3v4M16 3v4" />
              </svg>
              Joined {formatJoined(joinedAt)}
            </span>
          )}
        </p>
      </div>

      {children}

      <div className="profile-actions">
        <ShareProfileButton username={user.username} />
        {isOwn ? <Link to="/profile/edit" className="btn-outline">Edit profile</Link> : action}
      </div>
    </div>
  );
}
