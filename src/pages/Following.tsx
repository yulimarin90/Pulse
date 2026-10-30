import { useCurrentUser } from '../blog/AuthContext';
import * as api from '../blog/mockApi';
import UserList from '../ui/components/UserList';
import ProfileStats from '../ui/components/ProfileStats';


export default function Following() {
  const currentUser = useCurrentUser();
  return (
    <section>
      <h1>Following</h1>
      <ProfileStats userId={currentUser.id} linked />
      <UserList users={api.getFollowing(currentUser.id)} />
    </section>
  );
}
