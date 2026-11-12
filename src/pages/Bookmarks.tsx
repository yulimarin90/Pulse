import { useCurrentUser } from '../blog/AuthContext';
import * as api from '../blog/dataStore';
import useDataVersion from '../blog/useDataVersion';
import TweetList from '../ui/components/TweetList';

// The tweets the person saved with the bookmark button. Only the person can see them.
export default function Bookmarks() {
  const currentUser = useCurrentUser();
  // Removing a bookmark takes the tweet out of the list right away.
  useDataVersion();
  const tweets = api.getBookmarkedTweets(currentUser.id);

  return (
    <section>
      <h1>Bookmarks</h1>
      {tweets.length === 0
        ? <p className="empty-tab muted">Save posts with the bookmark button to find them again here.</p>
        : <TweetList tweets={tweets} />}
    </section>
  );
}
