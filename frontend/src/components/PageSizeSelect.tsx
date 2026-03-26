import React from 'react'
import { useTheme } from '../context/ThemeContext'
import SearchableSelect from './SearchableSelect'

/** Same options as Outbox toolbar */
export const ITEMS_PER_PAGE_OPTIONS = [10, 20, 50, 100] as const
export const DEFAULT_ITEMS_PER_PAGE = 10

export interface PageSizeSelectProps {
  value: number
  onChange: (next: number) => void
}

/**
 * Per-page row count (SearchableSelect + label), matching modal dropdown styling.
 */
const PageSizeSelect: React.FC<PageSizeSelectProps> = ({ value, onChange }) => {
  const { theme } = useTheme()
  const inputBorderModal = theme === 'dark' ? '#262626' : '#e5e5e5'
  const textSecondary = theme === 'dark' ? '#a3a3a3' : '#525252'

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium" style={{ color: textSecondary }}>
        Per page
      </span>
      <SearchableSelect
        className="w-[4.5rem] shrink-0"
        options={ITEMS_PER_PAGE_OPTIONS.map((n) => ({
          id: n,
          value: String(n),
          label: String(n),
        }))}
        value={String(value)}
        onChange={(v) => onChange(Number(v))}
        placeholder="—"
        showSearch={false}
        style={{ borderColor: inputBorderModal }}
        onFocus={() => {}}
        onBlur={() => {}}
      />
    </div>
  )
}

export default PageSizeSelect
