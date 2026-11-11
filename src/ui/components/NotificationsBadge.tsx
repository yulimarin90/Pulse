import { useAuth } from '../../blog/AuthContext';
import * as api from '../../blog/dataStore';
import useDataVersion from '../../blog/useDataVersion';

// Number of unread notifications, shown on the bell of the bottom bar. Nothing when there are none.
export default function NotificationsBadge() {
  const { currentUser } = useAuth();
  // Renders again when Firestore sends something new.
  useDataVersion();
  const count = currentUser ? api.getUnreadNotificationCount(currentUser.id) : 0;
  if (count === 0) return null;
  return <span className="notif-badge" aria-label={`${count} unread notifications`}>{count > 99 ? '99+' : count}</span>;
}
