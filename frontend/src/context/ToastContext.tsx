import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTheme } from './ThemeContext'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastItem {
  id: string
  message: string
  type: ToastType
}

interface ToastContextValue {
  /** Show a toast bottom-right. Default duration 4s; set 0 to disable auto-dismiss. */
  showToast: (message: string, type?: ToastType, durationMs?: number) => void
  showSuccess: (message: string, durationMs?: number) => void
  showError: (message: string, durationMs?: number) => void
  showInfo: (message: string, durationMs?: number) => void
  showWarning: (message: string, durationMs?: number) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[]
  onDismiss: (id: string) => void
}) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const el =
    typeof document !== 'undefined' ? document.body : null
  if (!el || toasts.length === 0) return null

  return createPortal(
    <div
      className="fixed bottom-4 right-4 z-[10050] flex flex-col gap-2 items-end max-w-[min(100vw-2rem,24rem)] pointer-events-none p-0"
      aria-live="polite"
      aria-relevant="additions text"
    >
      {toasts.map((t) => {
        const colors =
          t.type === 'success'
            ? {
                bg: isDark ? '#14532d' : '#ecfdf5',
                border: isDark ? '#22c55e' : '#a7f3d0',
                text: isDark ? '#bbf7d0' : '#065f46',
                icon: '#22c55e',
              }
            : t.type === 'error'
              ? {
                  bg: isDark ? '#450a0a' : '#fef2f2',
                  border: isDark ? '#f87171' : '#fecaca',
                  text: isDark ? '#fecaca' : '#991b1b',
                  icon: '#ef4444',
                }
              : t.type === 'warning'
                ? {
                    bg: isDark ? '#422006' : '#fffbeb',
                    border: isDark ? '#fbbf24' : '#fde68a',
                    text: isDark ? '#fde68a' : '#92400e',
                    icon: '#f59e0b',
                  }
                : {
                    bg: isDark ? '#1e293b' : '#ffffff',
                    border: isDark ? '#475569' : '#e2e8f0',
                    text: isDark ? '#e2e8f0' : '#0f172a',
                    icon: '#3ecf8e',
                  }

        return (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg toast-animate-in w-full"
            style={{
              backgroundColor: colors.bg,
              borderColor: colors.border,
              color: colors.text,
            }}
          >
            <span className="flex-shrink-0 mt-0.5" style={{ color: colors.icon }} aria-hidden>
              {t.type === 'success' && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {t.type === 'error' && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              {t.type === 'warning' && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
              {t.type === 'info' && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                </svg>
              )}
            </span>
            <p className="text-sm font-medium leading-snug flex-1 min-w-0 break-words">{t.message}</p>
            <button
              type="button"
              onClick={() => onDismiss(t.id)}
              className="flex-shrink-0 rounded p-0.5 opacity-70 hover:opacity-100 transition-opacity"
              style={{ color: colors.text }}
              aria-label="Dismiss"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )
      })}
    </div>,
    el
  )
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', durationMs = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      setToasts((prev) => [...prev, { id, message, type }])
      if (durationMs > 0) {
        window.setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id))
        }, durationMs)
      }
    },
    []
  )

  const value = useMemo<ToastContextValue>(
    () => ({
      showToast,
      showSuccess: (m, d) => showToast(m, 'success', d),
      showError: (m, d) => showToast(m, 'error', d),
      showInfo: (m, d) => showToast(m, 'info', d),
      showWarning: (m, d) => showToast(m, 'warning', d),
    }),
    [showToast]
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={remove} />
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return ctx
}

/** Safe hook for optional usage outside provider (returns no-op). */
export function useToastOptional(): ToastContextValue | null {
  return useContext(ToastContext)
}
