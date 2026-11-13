import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCurrentUser } from '../blog/AuthContext';
import * as api from '../blog/dataStore';
import Avatar from '../ui/components/Avatar';

export default function ChatScreen() {
  const { username = '' } = useParams();
  const currentUser = useCurrentUser();
  const targetUser = api.getUserByUsername(username);

  const [messages, setMessages] = useState(() => 
    targetUser ? api.getConversation(currentUser.id, targetUser.id) : []
  );
  const [text, setText] = useState('');

  if (!targetUser) return <p style={{ padding: '20px', color: '#fff' }}>User not found</p>;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    api.sendDirectMessage(currentUser.id, targetUser.id, text);
    setMessages(api.getConversation(currentUser.id, targetUser.id));
    setText('');
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '16px', color: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #2f3336', paddingBottom: '12px' }}>
        <Link to={`/users/${targetUser.username}`} style={{ color: '#1d9bf0', textDecoration: 'none' }}>← Go back</Link>
        <Avatar name={targetUser.fullName} />
        <h2 style={{ fontSize: '1.1rem', margin: 0 }}>{targetUser.fullName}</h2>
      </div>

      <div style={{ minHeight: '300px', maxHeight: '400px', overflowY: 'auto', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {messages.map((m) => {
          const isMe = m.senderId === currentUser.id;
          return (
            <div key={m.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', background: isMe ? '#1d9bf0' : '#2f3336', padding: '10px 14px', borderRadius: '12px', maxWidth: '70%' }}>
              <p style={{ margin: 0 }}>{m.text}</p>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Message..."
          style={{ flex: 1, background: '#16181c', border: '1px solid #2f3336', borderRadius: '9999px', padding: '10px 16px', color: '#fff', outline: 'none' }}
        />
        <button type="submit" style={{ background: '#1d9bf0', color: '#fff', border: 'none', borderRadius: '9999px', padding: '10px 20px', fontWeight: 'bold', cursor: 'pointer' }}>Send</button>
      </form>
    </div>
  );
}