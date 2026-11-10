import { useEffect, useRef, useState } from 'react';

// "Share profile" button with a small menu, like X: copy the link or open the share sheet of the device.
export default function ShareProfileButton({ username }: { username: string }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const container = useRef<HTMLDivElement>(null);
  const url = `${window.location.origin}/users/${username}`;

  // Close the menu when the person clicks outside or presses Escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (container.current && !container.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const show = (text: string) => {
    setOpen(false);
    setMessage(text);
    window.setTimeout(() => setMessage(''), 2500);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      show('Copied to clipboard');
    } catch {
      show('Could not copy the link');
    }
  };

  const shareVia = async () => {
    try {
      await navigator.share({ title: `@${username} on Pulse`, url });
      setOpen(false);
    } catch {
      // The person closed the share sheet: nothing to do.
      setOpen(false);
    }
  };

  return (
    <div className="share-profile" ref={container}>
      <button type="button" className="btn-outline" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}>
        Share profile
      </button>
      {open && (
        <div className="share-menu" role="menu">
          <button type="button" role="menuitem" onClick={copyLink}>Copy link to profile</button>
          {typeof navigator.share === 'function' && (
            <button type="button" role="menuitem" onClick={shareVia}>Share via...</button>
          )}
        </div>
      )}
      {message && <p className="share-toast" role="status">{message}</p>}
    </div>
  );
}
