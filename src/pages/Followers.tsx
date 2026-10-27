import { useCurrentUser } from '../blog/AuthContext';
import * as api from '../blog/mockApi';
import UserList from '../ui/components/UserList';

export default function Followers() {
  const currentUser = useCurrentUser();
  return (
    <section>
      <h1>Followers</h1>
      <UserList users={api.getFollowers(currentUser.id)} showFollow />
    </section>
  );
}