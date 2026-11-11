import usePagination from '../../blog/usePagination';
import type { TweetWithAuthor } from "../../blog/types";
import Avatar from './Avatar';
import Pagination from "./Pagination";
import VerifiedBadge from './VerifiedBadge';
import { Link } from 'react-router-dom';

const formatDateTime = (timestamp: number): string => new Date(timestamp)
    .toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });

export default function TweetList({ tweets }: { tweets: TweetWithAuthor[] }) {
    const { pageItems, page, totalPages, setPage } = usePagination(tweets);

  return (
    <>
        <ul className="list">
            {pageItems.map((tweet) => (
                <li key={tweet.id} className="list-item">
                    <Avatar name={tweet.author.fullName} />
                    <div className="tweet-body">
                        <p className="tweet-header">
                            <Link to={`/users/${tweet.author.username}`} className="tweet-author">
                                <strong>{tweet.author.fullName}</strong>{tweet.author.verified && <VerifiedBadge size={16} />},<span className="muted">@{tweet.author.username}</span>
                            </Link>
                            {' - '}
                            <time className="muted" dateTime={new Date(tweet.createdAt).toISOString()}>{formatDateTime(tweet.createdAt)}</time>
                        </p>
                        <p>{tweet.text}</p>

                       
                        {tweet.mediaUrl && (
                          <div className="tweet-media-container" style={{ marginTop: '10px' }}>
                            {tweet.mediaType === 'video' ? (
                              <video 
                                src={tweet.mediaUrl} 
                                controls 
                                style={{ width: '100%', maxHeight: '300px', borderRadius: '12px', objectFit: 'cover' }} 
                              />
                            ) : (
                              <img 
                                src={tweet.mediaUrl} 
                                alt="Tweet media" 
                                style={{ width: '100%', maxHeight: '300px', borderRadius: '12px', objectFit: 'cover' }} 
                              />
                            )}
                          </div>
                        )}
                    </div>
                </li>
            ))}
        </ul>
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </>
  );
}