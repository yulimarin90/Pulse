import { Link } from 'react-router-dom';
import usePagination   from '../../blog/usePagination';
import type { TweetWithAuthor } from "../../blog/types";
import Avatar from './Avatar';
import Pagination   from "./Pagination";

export default function TweetList({ tweets }: { tweets: TweetWithAuthor[] }) {
    const { pageItems, page, totalPages, setPage } = usePagination(tweets);

  return (
    <>
        <ul className="list">
            {pageItems.map((tweet) => (
                <li key={tweet.id} className="list-item">
                    <Avatar name={tweet.author.fullName} />
                    <div className="tweet-body">
                        <Link to={`/users/${tweet.author.username}`} className="tweet-author">
                            <strong>{tweet.author.fullName}</strong><span className="muted">@{tweet.author.username}</span>
                        </Link>
                        <p>{tweet.text}</p>
                    </div>
                </li>
            ))}
        </ul>
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </>
  );
}
