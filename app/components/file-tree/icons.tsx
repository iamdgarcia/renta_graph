export function IconList() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <line x1="3" y1="4" x2="13" y2="4" />
      <line x1="3" y1="8" x2="13" y2="8" />
      <line x1="3" y1="12" x2="13" y2="12" />
    </svg>
  )
}

export function IconGraph() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <circle cx="3" cy="8" r="2" />
      <circle cx="13" cy="3" r="2" />
      <circle cx="13" cy="13" r="2" />
      <line x1="5" y1="7" x2="11" y2="4" />
      <line x1="5" y1="9" x2="11" y2="12" />
    </svg>
  )
}

export function IconSearch() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <circle cx="7" cy="7" r="5" />
      <line x1="11" y1="11" x2="15" y2="15" />
    </svg>
  )
}

export function IconFile() {
  return (
    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5L9 1z" />
      <polyline points="9,1 9,5 13,5" />
    </svg>
  )
}

export function IconChevron({ open }: { open: boolean }) {
  return (
    <svg
      width="10" height="10"
      viewBox="0 0 16 16"
      fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 150ms ease', flexShrink: 0 }}
    >
      <polyline points="5,2 11,8 5,14" />
    </svg>
  )
}
