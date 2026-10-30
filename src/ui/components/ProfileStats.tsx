import { NavLink } from 'react-router-dom';
import * as api from '../../blog/mockApi';

interface ProfileStatsProps {
    userId: number;
    linked?: boolean;
}

export default function ProfileStats({ userId, linked = false }: ProfileStatsProps) {
    const followers = api.getFollowers(userId).length;
    const following = api.getFollowing(userId).length;

    const stat = (to: string, count: number, text: string) => {
    const content = <><strong>{count}</strong> {text}</>;
    return linked ? <NavLink to={to}>{content}</NavLink> : <span>{content}</span>;
  };

  return (
    <div className="stats">
      {stat('/followers', followers, 'followers')}
      {stat('/following', following, 'following')}
    </div>
  );
}
