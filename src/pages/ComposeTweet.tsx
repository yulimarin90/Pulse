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
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [notice, setNotice] = useState<NoticeState | null>(null);

  const remaining = api.MAX_TWEET_LENGTH - text.length;
  const tooLong = remaining < 0;

 
  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
      setNotice(null);
    }
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
  };

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const mediaType = mediaFile?.type.startsWith('video/') ? 'video' : 'image';
      const mediaUrl = mediaFile ? URL.createObjectURL(mediaFile) : undefined;

      api.addTweet(currentUser.id, text, mediaUrl, mediaType);

      setText('');
      setMediaFile(null);
      setMediaPreview(null);
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
          placeholder="What are you thinking about?"
          required={!mediaFile}
        />

        {mediaPreview && (
          <div style={{ position: 'relative', margin: '10px 0' }}>
            <button
              type="button"
              onClick={handleRemoveMedia}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                background: 'rgba(0,0,0,0.7)',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              ✕
            </button>
            {mediaFile?.type.startsWith('video/') ? (
              <video src={mediaPreview} controls style={{ width: '100%', maxHeight: '250px', borderRadius: '12px', objectFit: 'cover' }} />
            ) : (
              <img src={mediaPreview} alt="Preview" style={{ width: '100%', maxHeight: '250px', borderRadius: '12px', objectFit: 'cover' }} />
            )}
          </div>
        )}

        <div className="row compose-footer">
          <div className="compose-tools">
  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
    <input
      type="file"
      id="media-input"
      accept="image/*,video/*"
      style={{ display: 'none' }}
      onChange={handleMediaChange}
    />
    <label htmlFor="media-input" className="tool-icon" title="Adjuntar foto o video">
      <svg viewBox="0 0 24 24" aria-hidden="true" className="tweet-icon-svg">
        <path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM5 5h14v11.17l-3.29-3.29c-.39-.39-1.02-.39-1.41 0L12 15.59l-2.29-2.3c-.39-.39-1.02-.39-1.41 0L5 16.17V5zm14 14H5v-1.17l3.29-3.29c.39-.39 1.02-.39 1.41 0L12 16.41l4.29-4.3c.39-.39 1.02-.39 1.41 0L19 17.83V19z" />
      </svg>
    </label>

    <label htmlFor="media-input" className="tool-gif" title="Adjuntar GIF">
      GIF
    </label>
  </div>
</div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span className={`char-count ${tooLong ? 'over' : ''}`}>{remaining}</span>
            <button type="submit" className="btn" disabled={tooLong || (!text.trim() && !mediaFile)}>[Post]</button>
          </div>
        </div>
      </form>
      {notice && <Notice type={notice.type} message={notice.message} />}
      {notice?.type === 'success' && (
        <p className="notice-link"><Link to="/feed" className="accent">See it in your feed</Link></p>
      )}
    </section>
  );
}