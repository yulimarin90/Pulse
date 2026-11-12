import { useState } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../../blog/dataStore';
import usePagination   from '../../blog/usePagination';
import type { TweetWithAuthor } from "../../blog/types";
import { formatRelativeTime } from '../../blog/formatTime';
import Avatar from './Avatar';
import Pagination   from "./Pagination";
import TweetActions from './TweetActions';
import TweetText from './TweetText';
import VerifiedBadge from './VerifiedBadge';

// Full date and time, shown when the mouse is over the time, e.g. "21/10/2026, 5:00 p. m."
const formatDateTime = (timestamp: number): string => new Date(timestamp)
  .toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });

function ReplyingTo({ tweet }: { tweet: TweetWithAuthor }) {
    const parent = tweet.replyToId === undefined ? undefined : api.getTweetById(tweet.replyToId);
    if (!parent) return null;
    return (
        <p className="replying-to muted">
            Replying to <Link to={`/tweets/${parent.id}`} className="accent">@{parent.author.username}</Link>
        </p>
    );
}

export default function TweetList({ tweets }: { tweets: TweetWithAuthor[] }) {
    const { pageItems, page, totalPages, setPage } = usePagination(tweets);
    // Moment used to write the "2h" of each tweet.
    const [now] = useState(() => Date.now());

  return (
    <>
        <ul className="list">
            {pageItems.map((tweet) => (
                <li key={tweet.id} className="list-item">
                    <Avatar name={tweet.author.fullName} src={tweet.author.avatarUrl} />
                    <div className="tweet-body">
                        <p className="tweet-header">
                            <Link to={`/users/${tweet.author.username}`} className="tweet-author">
                                <strong>{tweet.author.fullName}</strong>{tweet.author.verified && <VerifiedBadge size={16} />} <span className="muted">@{tweet.author.username}</span>
                            </Link>
                            <span className="muted"> · </span>
                            <time className="muted" dateTime={new Date(tweet.createdAt).toISOString()} title={formatDateTime(tweet.createdAt)}>{formatRelativeTime(tweet.createdAt, now)}</time>
                        </p>
                        <ReplyingTo tweet={tweet} />
                        {tweet.text && <p><TweetText text={tweet.text} /></p>}
                        {tweet.imageUrl && <img className="tweet-image" src={tweet.imageUrl} alt="Photo of the tweet" />}
                        <TweetActions tweet={tweet} />
                    </div>
                </li>
            ))}
        </ul>
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </>
  );
}
