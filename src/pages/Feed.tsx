import { useCurrentUser } from '../blog/AuthContext';
import * as api from '../blog/mockApi';
import TweetList from '../ui/components/TweetList';

export default function Feed() {
  const currentUser = useCurrentUser();
  return (
    <section>
      <h1>Feed</h1>
      <TweetList tweets={api.getFeed(currentUser.id)} />
    </section>
  );
}
