
export default function Logo({ size = 24 }: { size?: number }) {
  return (
    <span className="logo-mark" style={{ fontSize: size }}>
      <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2 12h4l2.5-7 4 14 2.5-7H22" />
      </svg>
      <span>PULSE</span>
    </span>
  );
}