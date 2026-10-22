import { Link } from 'react-router-dom';
import * as api from '../../blog/mockApi';

interface ProfileStatsProps {
    userId: number;
    linked?: boolean;
}

export default function ProfileStats({ userId, linked = false }: ProfileStatsProps) {
    const followers = api.getFollowers(userId).length;
    const following = api.getFollowing(userId).length;
    const label = (count: number, text: string) => <><strong>{count}</strong> {text}</>;

  return (
    <div className="stats">
        {linked ? <Link to="/followers">{label(followers, 'Seguidores')}</Link> : <span>{label(followers, 'Seguidores')}</span>}
        {linked ? <Link to="/following">{label(following, 'Seguidos')}</Link> : <span>{label(following, 'Seguidos')}</span>}
    </div>
  );
}
