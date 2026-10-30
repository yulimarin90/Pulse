import { NavLink } from 'react-router-dom';
import * as api from '../../blog/mockApi';

export type StatsView = 'tweets' | 'followers' | 'following';

interface ProfileStatsProps {
  userId: number;
  linked?: boolean;
  active?: StatsView;
  onSelect?: (view: 'followers' | 'following') => void;
}

export default function ProfileStats({ userId, linked = false, active, onSelect }: ProfileStatsProps) {
  const followers = api.getFollowers(userId).length;
  const following = api.getFollowing(userId).length;

  const stat = (view: 'followers' | 'following', to: string, count: number, text: string) => {
    const content = <><strong>{count}</strong> {text}</>;
    // With onSelect the counters are buttons that switch the view of the page.
    if (onSelect) {
      return (
        <button type="button" className={`stat-btn ${active === view ? 'active' : ''}`} onClick={() => onSelect(view)}>
          {content}
        </button>
      );
    }
    return linked ? <NavLink to={to}>{content}</NavLink> : <span>{content}</span>;
  };

  return (
    <div className="stats">
      {stat('followers', '/followers', followers, 'followers')}
      {stat('following', '/following', following, 'following')}
    </div>
  );
}