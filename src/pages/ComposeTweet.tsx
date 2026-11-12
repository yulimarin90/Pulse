import { useState } from 'react';
import type { ChangeEvent, SyntheticEvent } from 'react';
import { Link } from 'react-router-dom';
import { useCurrentUser } from '../blog/AuthContext';
import * as api from '../blog/dataStore';
import Notice from '../ui/components/Notice';
import type { NoticeState } from '../ui/components/Notice';
import { resizeImageToFit } from '../blog/images';

const toolStyle = { color: 'var(--blue, #1d9bf0)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' } as const;

export default function ComposeTweet() {
  const currentUser = useCurrentUser();
  const [text, setText] = useState('');
  const [notice, setNotice] = useState<NoticeState | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [showGifs, setShowGifs] = useState(false);
  const [gifLink, setGifLink] = useState('');

  const remaining = api.MAX_TWEET_LENGTH - text.length;
  const tooLong = remaining < 0;

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      api.addTweet(currentUser.id, text, imageUrl || undefined);
      setText('');
      setImageUrl('');
      setNotice({ type: 'success', message: 'Tweet posted successfully' });
    } catch (err) {
      setNotice({ type: 'error', message: err instanceof Error ? err.message : 'Could not post the tweet' });
    }
  };

  // Reads the chosen file with the given function and shows it as the preview of the tweet.
  const pick = (read: (file: File) => Promise<string>) => async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      setImageUrl(await read(file));
      setNotice(null);
    } catch (err) {
      setNotice({ type: 'error', message: err instanceof Error ? err.message : 'Could not use the file' });
    }
  };
  const pickPhoto = pick((file) => resizeImageToFit(file, 1024, api.MAX_TWEET_IMAGE_LENGTH));

  // The person chooses the GIF in GIPHY, copies its link and pastes it here.
  const handleGifLink = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const url = api.parseGiphyLink(gifLink);
    if (!url) {
      setNotice({ type: 'error', message: 'Paste a GIPHY link, like https://giphy.com/gifs/...' });
      return;
    }
    setImageUrl(url);
    setGifLink('');
    setShowGifs(false);
    setNotice(null);
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
          placeholder="What are you thinking about?"
          required={!imageUrl}
        />

        {imageUrl && (
          <div className="compose-photo">
            <img src={imageUrl} alt="Photo to post" />
            <button type="button" className="link-button" onClick={() => setImageUrl('')}>Remove photo</button>
          </div>
        )}

        <div className="row compose-footer">
          <div className="compose-tools" style={{ display: 'flex', gap: '12px', alignItems: 'center', marginRight: 'auto' }}>
            <input type="file" id="photo-input" accept="image/*" style={{ display: 'none' }} onChange={pickPhoto} aria-label="Add a photo" />
            <label htmlFor="photo-input" className="tool-icon" style={toolStyle} title="Add a photo">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="tweet-icon-svg" width="20" height="20">
                <path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM5 5h14v11.17l-3.29-3.29c-.39-.39-1.02-.39-1.41 0L12 15.59l-2.29-2.3c-.39-.39-1.02-.39-1.41 0L5 16.17V5zm14 14H5v-1.17l3.29-3.29c.39-.39 1.02-.39 1.41 0L12 16.41l4.29-4.3c.39-.39 1.02-.39 1.41 0L19 17.83V19z" />
              </svg>
            </label>

            <button type="button" className="tool-gif" aria-expanded={showGifs} aria-label="Add a GIF" onClick={() => setShowGifs((open) => !open)} style={{ ...toolStyle, background: 'none', font: 'inherit', fontWeight: 700, fontSize: '13px', cursor: 'pointer', border: '1px solid currentColor', borderRadius: '4px', padding: '1px 5px' }} title="Add a GIF">GIF</button>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span className={`char-count ${tooLong ? 'over' : ''}`}>{remaining}</span>
            <button type="submit" className="btn" disabled={tooLong || (!text.trim() && !imageUrl)}>[Post]</button>
          </div>
        </div>
      </form>
      {showGifs && (
        <div className="gif-link-box">
          <a href="https://giphy.com/explore/gratis" target="_blank" rel="noopener noreferrer" className="accent">1. Open GIPHY and choose a GIF</a>
          <p className="muted">2. Press "Copy link" on that GIF and paste the link here:</p>
          <form className="gif-link" onSubmit={handleGifLink}>
            <input type="url" placeholder="https://giphy.com/gifs/..." aria-label="GIPHY link" value={gifLink} onChange={(e) => setGifLink(e.target.value)} />
            <button type="submit" className="btn-outline">Add GIF</button>
          </form>
        </div>
      )}
      {notice && <Notice type={notice.type} message={notice.message} />}
      {notice?.type === 'success' && (
        <p className="notice-link"><Link to="/feed" className="accent">See it in your feed</Link></p>
      )}
    </section>
  );
}
