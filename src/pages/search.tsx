import { useReducer, useState } from 'react';
import { useCurrentUser } from '../blog/AuthContext';
import * as api from '../blog/dataStore';
import FollowByUsername from '../ui/components/FollowByUsername';
import UserList from '../ui/components/UserList';

// Page opened by the magnifier icon in the bottom bar: follow by username and look for people to follow
export default function Search() {
  const currentUser = useCurrentUser();
  const [query, setQuery] = useState('');
  // Re-render after following someone so that person leaves the list.
  const [, refresh] = useReducer((n: number) => n + 1, 0);

    // Typing something shows every match (also the people you already follow); empty shows the people to follow
  const searching = query.trim() !== '';
  const suggestions = searching ? api.searchUsers(currentUser.id, query) : api.getUsersToFollow(currentUser.id);

  return (
    <section>
      <h1>Search</h1>
      <FollowByUsername onFollowed={refresh} />

      <div className="search-box">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search people and companies"
          aria-label="Search people and companies"
        />
      </div>
      <h2 className="section-title">{searching ? 'Results' : 'Who to follow'}</h2>
      {suggestions.length === 0 ? (
        <p className="empty-tab muted">{searching ? 'No people found' : 'There is nobody else to follow'}</p>
      ) : (
        <UserList key={query} users={suggestions} showFollow onFollow={refresh} />
      )}
    </section>
  );
}