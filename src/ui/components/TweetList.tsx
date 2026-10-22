import { Link } from 'react-router-dom';
import usePagination   from '../../blog/usePagination';
import type { TweetWithAuthor } from "../../blog/types";
import Pagination   from "./Pagination";

export default function TweetList({ tweets }: { tweets: TweetWithAuthor[] }) {
    const { pageItems, page, totalPages, setPage } = usePagination(tweets);

  return (
    <>
        <ul className="list">
            {pageItems.map((tweet) => (
                <li key={tweet.id} className="list-item">
                    <Link to={`/users/${tweet.author.username}`}>{tweet.author.fullName}</Link>
                    <p>{tweet.text}</p>
                </li>
            ))}
        </ul>
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </>
  );
}
