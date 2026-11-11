import { useState } from 'react';
import type { SyntheticEvent } from 'react';
import { useParams } from 'react-router-dom';
import { useCurrentUser } from '../blog/AuthContext';
import * as api from '../blog/dataStore';
import useDataVersion from '../blog/useDataVersion';
import Notice from '../ui/components/Notice';
import type { NoticeState } from '../ui/components/Notice';
import TweetList from '../ui/components/TweetList';

// One tweet with its replies (comments) and a form to reply, like opening a post on X.
export default function TweetDetail() {
  const { tweetId = '' } = useParams();
  const currentUser = useCurrentUser();
  // The replies of other people arrive from Firestore while the page is open.
  useDataVersion();
  const [text, setText] = useState('');
  const [notice, setNotice] = useState<NoticeState | null>(null);

  const tweet = api.getTweetById(Number(tweetId));
  if (!tweet) return <p>Tweet not found</p>;

  const remaining = api.MAX_TWEET_LENGTH - text.length;

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      api.addReply(currentUser.id, tweet.id, text);
      setText('');
      setNotice(null);
    } catch (err) {
      setNotice({ type: 'error', message: err instanceof Error ? err.message : 'Could not post the reply' });
    }
  };

  return (
    <section>
      <TweetList tweets={[tweet]} />
      <form className="reply-form" onSubmit={handleSubmit}>
        <label htmlFor="reply-text" className="muted">Replying to @{tweet.author.username}</label>
        <textarea id="reply-text" rows={3} placeholder="Post your reply" value={text} onChange={(e) => { setText(e.target.value); setNotice(null); }} />
        <div className="row compose-footer">
          <span className={`char-count ${remaining < 0 ? 'over' : ''}`}>{remaining}</span>
          <button type="submit" className="btn" disabled={remaining < 0 || !text.trim()}>[Reply]</button>
        </div>
      </form>
      {notice && <Notice type={notice.type} message={notice.message} />}
      <h2 className="section-title">Replies</h2>
      <TweetList tweets={api.getReplies(tweet.id)} />
    </section>
  );
}
