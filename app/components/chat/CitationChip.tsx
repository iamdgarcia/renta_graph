type CitationChipProps = {
  name: string
  onClick: () => void
}

export function CitationChip({ name, onClick }: CitationChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mx-0.5 inline-flex items-center rounded bg-[#eef2fb] px-1.5 py-0.5 text-xs transition-colors hover:bg-[#dce6f7]"
      style={{
        color: 'var(--color-accent)',
        fontFamily: 'var(--font-mono)',
      }}
    >
      {name}
    </button>
  )
}