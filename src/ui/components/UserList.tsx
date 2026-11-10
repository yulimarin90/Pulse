import { Link } from 'react-router-dom';
import usePagination from '../../blog/usePagination';
import type { User } from '../../blog/types';
import Pagination from './Pagination';
import FollowButton from './FollowButton';
import Avatar from './Avatar';
import VerifiedBadge from './VerifiedBadge';

interface UserListProps {
  users: User[];
  showFollow?: boolean;
  onFollow?: () => void;
  onUnfollow?: () => void;
}

export default function UserList({ users, showFollow = false, onFollow, onUnfollow }: UserListProps) {
  const { pageItems, page, totalPages, setPage } = usePagination(users);

  return (
    <>
      <ul className="list">
        {pageItems.map((user) => (
          <li key={user.id} className="list-item row">
            <Link to={`/users/${user.username}`} className="user-link">
              <Avatar name={user.fullName} src={user.avatarUrl} />
              <span className="user-names">
                <strong>{user.fullName}{user.verified && <VerifiedBadge size={16} />}</strong>
                <span className="muted">@{user.username}</span>
              </span>
            </Link>
            {showFollow && <FollowButton targetId={user.id} onFollow={onFollow} onUnfollow={onUnfollow} />}
          </li>
        ))}
      </ul>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </>
  );
}