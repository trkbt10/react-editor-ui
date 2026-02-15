/**
 * @file SVG icons for stroke settings components
 */

// Cap icons
export function CapButtIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="4" y1="12" x2="20" y2="12" strokeLinecap="butt" />
      <line x1="4" y1="8" x2="4" y2="16" strokeWidth="1" opacity="0.5" />
      <line x1="20" y1="8" x2="20" y2="16" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

export function CapRoundIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="6" y1="12" x2="18" y2="12" strokeLinecap="round" strokeWidth="4" />
    </svg>
  );
}

export function CapSquareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="4" y1="12" x2="20" y2="12" strokeLinecap="square" />
      <line x1="2" y1="8" x2="2" y2="16" strokeWidth="1" opacity="0.5" />
      <line x1="22" y1="8" x2="22" y2="16" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

// Join icons
export function JoinMiterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 20L4 4L20 4" strokeLinejoin="miter" strokeDasharray="2 2" />
      <path d="M6 18L6 6L18 6" strokeLinejoin="miter" />
    </svg>
  );
}

export function JoinRoundIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 20L4 8C4 5.79 5.79 4 8 4L20 4" strokeDasharray="2 2" />
      <path d="M6 18L6 8C6 6.9 6.9 6 8 6L18 6" />
    </svg>
  );
}

export function JoinBevelIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 20L4 8L8 4L20 4" strokeDasharray="2 2" />
      <path d="M6 18L6 8L10 6L18 6" />
    </svg>
  );
}

// Align stroke icons
export function AlignInsideIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
      <rect x="4" y="4" width="16" height="16" strokeDasharray="2 2" />
      <rect x="6" y="6" width="12" height="12" strokeWidth="3" />
    </svg>
  );
}

export function AlignCenterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
      <rect x="6" y="6" width="12" height="12" strokeDasharray="2 2" />
      <rect x="6" y="6" width="12" height="12" strokeWidth="3" />
    </svg>
  );
}

export function AlignOutsideIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
      <rect x="8" y="8" width="8" height="8" strokeDasharray="2 2" />
      <rect x="6" y="6" width="12" height="12" strokeWidth="3" />
    </svg>
  );
}

// Arrowhead icons
export function ArrowNoneIcon() {
  return (
    <svg width="32" height="12" viewBox="0 0 48 12" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="4" y1="6" x2="44" y2="6" />
    </svg>
  );
}

export function ArrowTriangleIcon() {
  return (
    <svg width="32" height="12" viewBox="0 0 48 12" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="4" y1="6" x2="32" y2="6" />
      <polygon points="44,6 32,1 32,11" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ArrowOpenIcon() {
  return (
    <svg width="32" height="12" viewBox="0 0 48 12" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="4" y1="6" x2="32" y2="6" />
      <polyline points="34,1 44,6 34,11" fill="none" />
    </svg>
  );
}

export function ArrowCircleIcon() {
  return (
    <svg width="32" height="12" viewBox="0 0 48 12" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="4" y1="6" x2="32" y2="6" />
      <circle cx="38" cy="6" r="4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ArrowSquareIcon() {
  return (
    <svg width="32" height="12" viewBox="0 0 48 12" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="4" y1="6" x2="32" y2="6" />
      <rect x="34" y="2" width="8" height="8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ArrowDiamondIcon() {
  return (
    <svg width="32" height="12" viewBox="0 0 48 12" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="4" y1="6" x2="30" y2="6" />
      <polygon points="38,1 44,6 38,11 32,6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ArrowBarIcon() {
  return (
    <svg width="32" height="12" viewBox="0 0 48 12" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="4" y1="6" x2="40" y2="6" />
      <line x1="44" y1="1" x2="44" y2="11" strokeWidth="2" />
    </svg>
  );
}

// Utility icons
export function SwapIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h3" />
      <path d="M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3" />
      <line x1="12" y1="20" x2="12" y2="4" />
    </svg>
  );
}

export function FlipIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 16V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8" />
      <polyline points="3 16 12 22 21 16" />
    </svg>
  );
}

export function ChevronUpIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}

export function ChevronDownIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function LinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}
