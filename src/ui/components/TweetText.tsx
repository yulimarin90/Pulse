import { Link } from 'react-router-dom';
import * as api from '../../blog/dataStore';

export default function TweetText({ text }: { text: string }) {
  // The parentheses keep the mentions in the result, at the odd positions.
  const parts = text.split(/(@[A-Za-z0-9_]{1,30})/g);
  return (
    <>
      {parts.map((part, index) => {
        const username = part.slice(1).toLowerCase();
        if (index % 2 === 1 && api.getUserByUsername(username)) {
          return <Link key={index} to={`/users/${username}`} className="accent mention">{part}</Link>;
        }
        return part;
      })}
    </>
  );
}
