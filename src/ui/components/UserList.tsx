import { Link } from 'react-router-dom';
import usePagination from '../../blog/usePagination';
import type { User } from '../../blog/types';
import Pagination from './Pagination';
import FollowButton from './FollowButton';
import Avatar from './Avatar';

interface UserListProps {
  users: User[];
  showFollow?: boolean;
}

export default function UserList({ users, showFollow = false }: UserListProps) {
  const { pageItems, page, totalPages, setPage } = usePagination(users);

  return (
    <>
      <ul className="list">
        {pageItems.map((user) => (
          <li key={user.id} className="list-item row">
            <Link to={`/users/${user.username}`} className="user-link">
              <Avatar name={user.fullName} />
              <span className="user-names">
                <strong>{user.fullName}</strong>
                <span className="muted">@{user.username}</span>
              </span>
            </Link>
            {showFollow && <FollowButton targetId={user.id} />}
          </li>
        ))}
      </ul>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </>
  );
}
