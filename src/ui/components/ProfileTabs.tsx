import type { ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export type ProfileTab = 'posts' | 'replies' | 'reposts' | 'media';

interface ProfileTabsProps {
  active: ProfileTab | null;
  onSelect: (tab: ProfileTab) => void;
}

const svgProps = { viewBox: '0 0 24 24', width: 22, height: 22, fill: 'none', 
    stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', 
    strokeLinejoin: 'round', 'aria-hidden': true } as const;

const TABS: Array<{ id: ProfileTab; label: string; icon: ReactNode }> = [
  {
    id: 'posts',
    label: 'Posts',
    icon: (
      <svg {...svgProps}>
        <rect x="3" y="3" width="18" height="18" rx="4" />
        <path d="M8 9h8M8 13h5" />
      </svg>
    ),
  },
  {
    id: 'replies',
    label: 'Message',
    icon: (
      <svg {...svgProps}>
        <path d="M12 4C7.3 4 3.5 7.1 3.5 11c0 2 1 3.8 2.7 5.1L5.5 20l4-2c.8.2 1.6.3 2.5.3 4.7 0 8.5-3.1 8.5-7S16.700 4 12 4z" />
      </svg>
    ),
  },
  {
    id: 'reposts',
    label: 'Reposts',
    icon: (
      <svg {...svgProps}>
        <path d="M4 11V9a3 3 0 0 1 3-3h11M15 3l3 3-3 3M20 13v2a3 3 0 0 1-3 3H6M9 21l-3-3 3-3" />
      </svg>
    ),
  },
  {
    id: 'media',
    label: 'Media',
    icon: (
      <svg {...svgProps}>
        <path d="M6 4h12M4 7h16" />
        <rect x="4" y="10" width="16" height="10" rx="2" />
        <path d="M11 13.500v4l3.500-2z" />
      </svg>
    ),
  },
];

export default function ProfileTabs({ active, onSelect }: ProfileTabsProps) {
  const navigate = useNavigate();
  const { username } = useParams<{ username: string }>();

  return (
    <div className="feed-tabs profile-tabs" role="tablist">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          aria-label={tab.label}
          title={tab.label}
          className={`tab-btn ${tab.id === 'posts' ? 'tab-posts' : 'tab-icon'} ${active === tab.id ? 'active' : ''}`}
          onClick={() => {
            if (tab.id === 'replies') {
              if (username) {
                navigate(`/messages/${username}`);
              }
            } else {
              onSelect(tab.id);
            }
          }}
        >
          {tab.icon}
          {tab.id === 'posts' && (
            <>
              <span className="tab-label">Posts</span>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" 
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </>
          )}
        </button>
      ))}
    </div>
  );
}