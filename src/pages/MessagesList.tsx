import { Link } from 'react-router-dom';
import { useCurrentUser } from '../blog/AuthContext';
import * as api from '../blog/dataStore';
import Avatar from '../ui/components/Avatar';

export default function MessagesList() {
  const currentUser = useCurrentUser();
  const conversations = api.getConversationsList(currentUser.id);

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '16px', color: '#fff' }}>
      <h1>Messages</h1>
      {conversations.length === 0 ? (
        <p style={{ color: '#71767b', textAlign: 'center', marginTop: '40px' }}>You don’t have any conversations yet. Visit someone’s profile to send them a message.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {conversations.map(({ user, lastMessage }) => (
            <Link 
              key={user.id} 
              to={`/messages/${user.username}`} 
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#16181c', borderRadius: '12px', textDecoration: 'none', color: 'inherit', border: '1px solid #2f3336' }}
            >
              <Avatar name={user.fullName} />
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{user.fullName}</strong>
                  <span style={{ fontSize: '0.8rem', color: '#71767b' }}>{new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p style={{ margin: '4px 0 0', color: '#71767b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lastMessage.text}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}