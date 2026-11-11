import { useEffect, useState } from 'react';
import { useAuth, useCurrentUser } from '../blog/AuthContext';
import * as api from '../blog/dataStore';
import usePagination from '../blog/usePagination';
import useDataVersion from '../blog/useDataVersion';
import NotificationItem from '../ui/components/NotificationItem';
import Pagination from '../ui/components/Pagination';
import type { AppNotification } from '../blog/types';

type Tab = 'all' | 'mentions';

const EMPTY_MESSAGES: Record<Tab, string> = {
  all: 'When someone follows you or the people you follow post something, you will see it here.',
  mentions: 'When someone mentions you in a tweet, you will find it here.',
};

// One page of notifications. The key of the tab sends the pagination back to the first page.
function NotificationList({ notifications, now, seenAt, tab }: { notifications: AppNotification[]; now: number; seenAt: number; tab: Tab }) {
  const { pageItems, page, totalPages, setPage } = usePagination(notifications);
  if (notifications.length === 0) {
    return (
      <div className="notif-empty">
        <h2>Nothing to see here — yet</h2>
        <p className="muted">{EMPTY_MESSAGES[tab]}</p>
      </div>
    );
  }
  return (
    <>
      <ul className="notif-list">
        {pageItems.map((n) => <NotificationItem key={n.id} notification={n} now={now} isNew={n.createdAt > seenAt} />)}
      </ul>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </>
  );
}

// Notifications, in the style of X: "All" includes follows, likes, reposts, replies, and tweets from people you follow;
// "Mentions" includes only tweets in which you are mentioned and replies to your tweets. It updates automatically when something new arrives.
export default function Notifications() {
  const currentUser = useCurrentUser();
  const { markNotificationsSeen } = useAuth();
  const version = useDataVersion();
  const [tab, setTab] = useState<Tab>('all');
  const [now, setNow] = useState(() => Date.now());
  // What was unread when the page was opened stays highlighted while the person is here.
  const [seenAt] = useState(() => api.getNotificationsSeenAt(api.getUserById(currentUser.id) ?? currentUser));

  // Keeps the "5m", "2h" labels fresh.
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  // Being here reads everything, also what arrives while the page is open.
  useEffect(() => {
    if (api.getUnreadNotificationCount(currentUser.id) > 0) {
      markNotificationsSeen().catch((error) => console.error('Could not save that the notifications were read', error));
    }
  }, [version, currentUser.id, markNotificationsSeen]);

  const all = api.getNotifications(currentUser.id);
  const notifications = tab === 'all' ? all : all.filter((n) => n.kind === 'mention' || n.kind === 'reply');

  return (
    <section>
      <h1 className="notif-title">Notifications</h1>
      <div className="feed-tabs notif-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'all'} className={`tab-btn ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
            <path d="M19.29 17.29L18 16.03V11c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5.03l-1.29 1.26c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L7 17.88V11c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6.88l1.88 1.82c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41zM12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2z" />
          </svg>
          All
        </button>
        <button type="button" role="tab" aria-selected={tab === 'mentions'} className={`tab-btn ${tab === 'mentions' ? 'active' : ''}`} onClick={() => setTab('mentions')}>
          Mentions
        </button>
      </div>
      <NotificationList key={tab} notifications={notifications} now={now} seenAt={seenAt} tab={tab} />
    </section>
  );
}
