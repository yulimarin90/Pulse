
import { Link, useNavigate } from 'react-router-dom';
import { formatRelativeTime } from '../../blog/formatTime';
import type { AppNotification } from '../../blog/types';
import Avatar from './Avatar';
import TweetText from './TweetText';
import VerifiedBadge from './VerifiedBadge';

interface NotificationItemProps {
  notification: AppNotification;
  now: number;
  isNew: boolean;
}

const iconProps = { viewBox: '0 0 24 24', width: 28, height: 28, 'aria-hidden': true } as const;

function NotificationIcon({ kind }: { kind: AppNotification['kind'] }) {
  if (kind === 'like') {
    return (
      <svg {...iconProps} fill="#f91880">
        <path d="M20.800 4.600a5.500 5.500 0 0 0-7.800 0L12 5.700l-1-1.100a5.500 5.500 0 0 0-7.800 7.800l1 1.100L12 21l7.800-7.500 1-1.100a5.500 5.500 0 0 0 0-7.800z" />
      </svg>
    );
  }
  if (kind === 'repost') {
    return (
      <svg {...iconProps} fill="none" stroke="#00ba7c" strokeWidth="2.200" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 2l4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3" />
      </svg>
    );
  }
  if (kind === 'reply') {
    return (
      <svg {...iconProps} fill="none" stroke="#1d9bf0" strokeWidth="2.200" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-8l-5 4v-4H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z" />
      </svg>
    );
  }
  if (kind === 'follow') {
    return (
      <svg {...iconProps} fill="#1d9bf0">
        <path d="M12 12.2a4.1 4.1 0 1 0 0-8.2 4.1 4.1 0 0 0 0 8.2zm0 1.8c-4.4 0-8 2.6-8 5.8V21h16v-1.2c0-3.2-3.6-5.800-8-5.800z" />
      </svg>
    );
  }
  if (kind === 'mention') {
    return (
      <svg {...iconProps} fill="none" stroke="#1d9bf0" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="3.5" />
        <path d="M15.500 12v1.500a2.500 2.500 0 0 0 5 0V12a8.500 8.500 0 1 0-3.400 6.800" />
      </svg>
    );
  }
  return (
    <svg {...iconProps} fill="#7856ff">
      <path d="M12 2l2.200 6.300 6.300 2.200-6.300 2.200L12 19l-2.200-6.300L3.500 10.500l6.300-2.200L12 2zm7 12l.9 2.600 2.600.9-2.600.9L19 21l-.9-2.600-2.600-.9 2.600-.9L19 14z" />
    </svg>
  );
}

const ACTIONS: Partial<Record<AppNotification['kind'], string>> = {
  follow: ' followed you',
  like: ' liked your tweet',
  repost: ' reposted your tweet',
  reply: ' replied to your tweet',
};

// follow posted something. Clicking it opens the tweet (or the profile for a follow), except on the links inside.
export default function NotificationItem({ notification, now, isNew }: NotificationItemProps) {
  const { kind, actor, tweet, target, createdAt } = notification;
  const time = formatRelativeTime(createdAt, now);
  const navigate = useNavigate();
  const shown = kind === 'like' || kind === 'repost' ? target : tweet;
  const destination = kind === 'follow' ? `/users/${actor.username}` : `/tweets/${(tweet ?? target)?.id}`;

  return (
    <li
      className={`notif-item notif-clickable ${isNew ? 'notif-new' : ''}`}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('a')) return;
        navigate(destination);
      }}
    >
      <span className="notif-icon"><NotificationIcon kind={kind} /></span>
      <div className="notif-main">
        <Link to={`/users/${actor.username}`} className="notif-avatar" aria-label={`Profile of ${actor.fullName}`}>
          <Avatar name={actor.fullName} src={actor.avatarUrl} />
        </Link>
        <p className="notif-head">
          <Link to={`/users/${actor.username}`}><strong>{actor.fullName}</strong>{actor.verified && <VerifiedBadge size={16} />}</Link>
          {ACTIONS[kind]}
          <span className="muted"> · {time}</span>
        </p>
        {kind === 'mention' && <p className="muted">Mentioned you</p>}
        {shown?.text && <p className={`notif-text ${kind === 'like' || kind === 'repost' ? 'muted' : ''}`}><TweetText text={shown.text} /></p>}
      </div>
      {shown?.imageUrl && <img className="notif-thumb" src={shown.imageUrl} alt="Photo of the tweet" />}
    </li>
  );
}
