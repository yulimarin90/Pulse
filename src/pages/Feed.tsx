import { useState } from 'react';
import type { SyntheticEvent } from 'react';
import { Link } from 'react-router-dom';
import { useCurrentUser } from '../blog/AuthContext';
import * as api from '../blog/dataStore';
import Notice from '../ui/components/Notice';
import type { NoticeState } from '../ui/components/Notice';

export default function ComposeTweet() {
  const currentUser = useCurrentUser();
  const [text, setText] = useState('');
  const [notice, setNotice] = useState<NoticeState | null>(null);

  const remaining = api.MAX_TWEET_LENGTH - text.length;
  const tooLong = remaining < 0;

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      api.addTweet(currentUser.id, text);
      setText('');
      setNotice({ type: 'success', message: 'Tweet posted successfully' });
    } catch (err) {
      setNotice({ type: 'error', message: err instanceof Error ? err.message : 'Could not post the tweet' });
    }
  };

  return (
    <section>
      <h1>Post tweet</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          rows={5}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setNotice(null);
          }}
          required
        />
        <div className="row compose-footer">
          <span className={`char-count ${tooLong ? 'over' : ''}`}>{remaining}</span>
          <button type="submit" className="btn" disabled={tooLong || !text.trim()}>[Post]</button>
        </div>
      </form>
      {notice && <Notice type={notice.type} message={notice.message} />}
      {notice?.type === 'success' && (
        <p className="notice-link"><Link to="/feed" className="accent">See it in your feed</Link></p>
      )}
    </section>
  );
}
