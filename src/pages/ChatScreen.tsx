import { useEffect, useRef, useState } from 'react';
import type { SyntheticEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCurrentUser } from '../blog/AuthContext';
import * as api from '../blog/dataStore';
import useDataVersion from '../blog/useDataVersion';
import Avatar from '../ui/components/Avatar';

export default function ChatScreen() {
  const { username = '' } = useParams();
  const currentUser = useCurrentUser();
  // The messages of the other person arrive from Firestore while the chat is open: this draws the chat again
  // every time the data changes, so nobody has to refresh the page.
  useDataVersion();
  const targetUser = api.getUserByUsername(username);
  const messages = targetUser ? api.getConversation(currentUser.id, targetUser.id) : [];
  const partnerId = targetUser?.id;

  const [text, setText] = useState('');
  const [error, setError] = useState('');
  // The message waiting for the second click that confirms the delete.
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const messagesBox = useRef<HTMLDivElement>(null);

  // Shows the last message: when the chat opens, when you send one and when you receive one.
  useEffect(() => {
    const box = messagesBox.current;
    if (box) box.scrollTop = box.scrollHeight;
  }, [messages.length]);

    // The messages of this chat count as read while it is open (also the ones that arrive while you look at it).
  useEffect(() => {
    if (partnerId !== undefined) api.markConversationRead(currentUser.id, partnerId);
  }, [messages.length, currentUser.id, partnerId]);

  if (!targetUser) return <p style={{ padding: '20px', color: '#fff' }}>User not found</p>;

  const handleSend = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      api.sendDirectMessage(currentUser.id, targetUser.id, text);
      setText('');
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the message');
    }
  };

  const handleDelete = (messageId: number) => {
    if (confirmingId !== messageId) {
      setConfirmingId(messageId);
      return;
    }
    try {
      api.deleteDirectMessage(currentUser.id, messageId);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete the message');
    }
    setConfirmingId(null);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '16px', color: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #2f3336', paddingBottom: '12px' }}>
        <Link to={`/users/${targetUser.username}`} style={{ color: '#1d9bf0', textDecoration: 'none' }}>← Go back</Link>
        <Avatar name={targetUser.fullName} src={targetUser.avatarUrl} />
        <h2 style={{ fontSize: '1.1rem', margin: 0 }}>{targetUser.fullName}</h2>
      </div>

      <div ref={messagesBox} className="chat-messages" style={{ minHeight: '300px', maxHeight: '400px', overflowY: 'auto', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {messages.map((m) => {
          const isMe = m.senderId === currentUser.id;
          return (
            <div key={m.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', background: isMe ? '#1d9bf0' : '#2f3336', padding: '10px 14px', borderRadius: '12px', maxWidth: '70%' }}>
              <p style={{ margin: 0, overflowWrap: 'anywhere' }}>{m.text}</p>
              {isMe && (
                <button
                  type="button"
                  className="delete-message"
                  onClick={() => handleDelete(m.id)}
                  onBlur={() => setConfirmingId(null)}
                  style={{ display: 'block', marginLeft: 'auto', marginTop: '4px', padding: 0, background: 'none', border: 0, color: confirmingId === m.id ? '#ffd1d6' : 'rgba(255,255,255,0.7)', font: 'inherit', fontSize: '0.75rem', fontWeight: confirmingId === m.id ? 700 : 400, cursor: 'pointer' }}
                >
                  {confirmingId === m.id ? 'Confirm delete' : 'Delete'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {error && <p className="notice notice-error" role="alert" style={{ margin: '8px 0 0' }}>{error}</p>}
      <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
        <input
          type="text"
          value={text}
          onChange={(e) => { setText(e.target.value); setError(''); }}
          placeholder="Message..."
          aria-label="Message"
          style={{ flex: 1, background: '#16181c', border: '1px solid #2f3336', borderRadius: '9999px', padding: '10px 16px', color: '#fff', outline: 'none' }}
        />
        <button type="submit" style={{ background: '#1d9bf0', color: '#fff', border: 'none', borderRadius: '9999px', padding: '10px 20px', fontWeight: 'bold', cursor: 'pointer' }}>Send</button>
      </form>
    </div>
  );
}
