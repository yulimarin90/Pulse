import { useCurrentUser } from '../blog/AuthContext';
import * as api from '../blog/mockApi';
import UserList from '../ui/components/UserList';

export default function Following() {
  const currentUser = useCurrentUser();
  return (
    <section>
      <h1>Following</h1>
      <UserList users={api.getFollowing(currentUser.id)} />
    </section>
  );
}
