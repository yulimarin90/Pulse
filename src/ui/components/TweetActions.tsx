import { Link } from 'react-router-dom';
import { useCurrentUser } from '../../blog/AuthContext';
import * as api from '../../blog/dataStore';
import useDataVersion from '../../blog/useDataVersion';
import type { Tweet } from '../../blog/types';

const iconProps = { viewBox: '0 0 24 24', width: 18, height: 18, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const;

const countLabel = (count: number): string => (count > 0 ? String(count) : '');

// Reply, repost, like and bookmark buttons of a tweet, with their counters. They update by themselves when somebody else
// reacts (the numbers come from Firestore).
export default function TweetActions({ tweet }: { tweet: Tweet }) {
  const currentUser = useCurrentUser();
  useDataVersion();
  const liked = api.isLiked(currentUser.id, tweet.id);
  const reposted = api.isReposted(currentUser.id, tweet.id);
  const bookmarked = api.isBookmarked(currentUser.id, tweet.id);

  const run = (action: () => unknown) => {
    try {
      action();
    } catch (error) {
      console.error('Could not save the reaction', error);
    }
  };

  return (
    <div className="tweet-actions">
      <Link to={`/tweets/${tweet.id}`} className="tweet-action action-reply" aria-label="Reply">
        <svg {...iconProps}><path d="M4 4h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-8l-5 4v-4H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z" /></svg>
        <span className="action-count">{countLabel(api.getReplyCount(tweet.id))}</span>
      </Link>
      <button type="button" className={`tweet-action action-repost ${reposted ? 'active' : ''}`} aria-pressed={reposted} aria-label={reposted ? 'Undo repost' : 'Repost'} onClick={() => run(() => api.toggleRepost(currentUser.id, tweet.id))}>
        <svg {...iconProps}><path d="M17 2l4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3" /></svg>
        <span className="action-count">{countLabel(api.getRepostCount(tweet.id))}</span>
      </button>
      <button type="button" className={`tweet-action action-like ${liked ? 'active' : ''}`} aria-pressed={liked} aria-label={liked ? 'Remove like' : 'Like'} onClick={() => run(() => api.toggleLike(currentUser.id, tweet.id))}>
        <svg {...iconProps} fill={liked ? 'currentColor' : 'none'}><path d="M20.800 4.600a5.500 5.500 0 0 0-7.800 0L12 5.700l-1-1.100a5.500 5.500 0 0 0-7.800 7.800l1 1.100L12 21l7.800-7.500 1-1.100a5.500 5.500 0 0 0 0-7.800z" /></svg>
        <span className="action-count">{countLabel(api.getLikeCount(tweet.id))}</span>
      </button>
      <button type="button" className={`tweet-action action-bookmark ${bookmarked ? 'active' : ''}`} aria-pressed={bookmarked} aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'} onClick={() => run(() => api.toggleBookmark(currentUser.id, tweet.id))}>
        <svg {...iconProps} fill={bookmarked ? 'currentColor' : 'none'}><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.500L5 21V4a1 1 0 0 1 1-1z" /></svg>
      </button>
    </div>
  );
}
