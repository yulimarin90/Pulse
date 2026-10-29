import { useState } from 'react';
import type { SyntheticEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '../blog/AuthContext';
import * as api from '../blog/mockApi';

export default function ComposeTweet() {
  const currentUser = useCurrentUser();
  const navigate = useNavigate();
  const [text, setText] = useState('');

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    api.addTweet(currentUser.id, text);
    navigate('/');
  };

  return (
    <section>
      <h1>Post tweet</h1>
      <form onSubmit={handleSubmit}>
        <textarea rows={5} value={text} onChange={(e) => setText(e.target.value)} required />
        <button type="submit" className="btn">[Post]</button>
      </form>
    </section>
  );
}