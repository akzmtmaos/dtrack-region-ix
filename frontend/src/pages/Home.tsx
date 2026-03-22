import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { apiService } from '../services/api'

/** Parse required date/time from a document destination row for overdue checks. */
function parseRequiredDateTime(dest: { dateRequired?: string; timeRequired?: string }): Date | null {
  const dr = (dest.dateRequired || '').trim()
  if (!dr) return null
  const tr = (dest.timeRequired || '').trim()
  const combined = new Date(`${dr}T${tr || '23:59:59'}`)
  if (!Number.isNaN(combined.getTime())) return combined
  const dOnly = new Date(dr)
  return Number.isNaN(dOnly.getTime()) ? null : dOnly
}

function isDestinationOverdue(dest: Record<string, unknown>): boolean {
  if (dest.dateActedUpon) return false
  const req = parseRequiredDateTime(dest as { dateRequired?: string; timeRequired?: string })
  if (!req) return false
  return req.getTime() < Date.now()
}

const Home: React.FC = () => {
  const { theme } = useTheme()
  const { user } = useAuth()
  const navigate = useNavigate()

  const isDark = theme === 'dark'

  const border = isDark ? '#1f2937' : '#e5e7eb'
  const textPrimary = isDark ? '#e5e7eb' : '#111827'
  const textSecondary = isDark ? '#9ca3af' : '#6b7280'
  const inputBg = isDark ? '#111827' : '#ffffff'
  const inputBorder = isDark ? '#262626' : '#e5e5e5'

  interface RecentDocument {
    id: number
    documentControlNo: string
    routeNo: string
    subject: string
    documentType: string
    sourceType: string
    remarks: string
    createdAt?: string
  }

  const quickLinks = [
    {
      to: '/outbox',
      label: 'Outbox',
      description: 'Create and track outgoing documents.',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 10h4l3-6 4 12 3-6h4" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 19h18" />
        </svg>
      ),
    },
    {
      to: '/inbox',
      label: 'Inbox',
      description: 'View documents routed to you.',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 4h16v12H4z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 10l8 4 8-4" />
        </svg>
      ),
    },
    {
      to: '/reports/overdue-report',
      label: 'Overdue Reports',
      description: 'Monitor documents past their required date/time.',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l2.5 2.5" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3a9 9 0 100 18 9 9 0 000-18z" />
        </svg>
      ),
    },
    {
      to: '/registered-users',
      label: 'Registered Users',
      description: 'Manage user accounts and access levels.',
      adminOnly: true,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 11a4 4 0 100-8 4 4 0 000 8z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M23 20v-2a4 4 0 00-3-3.87" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 3.13a4 4 0 010 7.75" />
        </svg>
      ),
    },
  ]

  const level = (user?.userLevel ?? '').toLowerCase()
  const isEndUser = level === 'end-user' || level === 'end-users'

  const visibleLinks = quickLinks.filter((link) => !(link as any).adminOnly || !isEndUser)

  const [recentDocs, setRecentDocs] = useState<RecentDocument[]>([])
  const [recentLoading, setRecentLoading] = useState(false)
  const [recentError, setRecentError] = useState<string | null>(null)

  const [quickMetrics, setQuickMetrics] = useState<{
    outbox: number | null
    inbox: number | null
    overdue: number | null
    users: number | null
  }>({
    outbox: null,
    inbox: null,
    overdue: null,
    users: null,
  })

  const fetchRecentDocs = async () => {
    setRecentLoading(true)
    setRecentError(null)
    try {
      const employeeCode = isEndUser ? (user?.employeeCode ?? '') : undefined
      const res = await apiService.getDocumentSource(employeeCode)
      if (!res || !res.success) {
        setRecentDocs([])
        setRecentError(res?.error || 'Failed to load recent documents')
        return
      }
      const raw = Array.isArray(res.data) ? res.data : []
      const mapped: RecentDocument[] = raw.map((d: any) => ({
        id: Number(d.id),
        documentControlNo: d.documentControlNo ?? '',
        routeNo: d.routeNo ?? '',
        subject: d.subject ?? '',
        documentType: d.documentType ?? '',
        sourceType: d.sourceType ?? '',
        remarks: d.remarks ?? '',
        createdAt: d.createdAt ?? undefined,
      }))
      setRecentDocs(mapped)
    } catch {
      setRecentDocs([])
      setRecentError('An error occurred while loading recent documents')
    } finally {
      setRecentLoading(false)
    }
  }

  useEffect(() => {
    // Protected route ensures user exists, but keep it safe.
    if (!user) return
    fetchRecentDocs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.employeeCode, user?.userLevel])

  useEffect(() => {
    if (!user) return
    let cancelled = false
    const run = async () => {
      setQuickMetrics({ outbox: null, inbox: null, overdue: null, users: null })
      const ecRaw = (user.employeeCode ?? '').trim()
      const ecLower = ecRaw.toLowerCase()
      const hasEc = ecRaw.length > 0
      const srcEmployee = isEndUser ? ecRaw : undefined

      try {
        const [srcRes, destRes, usersRes, inboxRes] = await Promise.all([
          apiService.getDocumentSource(srcEmployee),
          apiService.getDocumentDestination(),
          !isEndUser ? apiService.getUsers() : Promise.resolve({ success: true as const, data: [] as unknown[] }),
          hasEc ? apiService.getInboxDocuments(ecRaw) : Promise.resolve({ success: true as const, data: [] as unknown[] }),
        ])
        if (cancelled) return

        const sources = srcRes?.success && Array.isArray(srcRes.data) ? srcRes.data : []
        const dests = destRes?.success && Array.isArray(destRes.data) ? destRes.data : []
        const usersList = usersRes?.success && Array.isArray(usersRes.data) ? usersRes.data : []

        const outboxCount = sources.length

        const matchesInbox = (d: Record<string, unknown>) => {
          if (!hasEc) return true
          const officer = String(d.employeeActionOfficer ?? '')
            .trim()
            .toLowerCase()
          return officer === ecLower
        }
        const inboxDests = hasEc ? dests.filter(matchesInbox) : dests
        const inboxCount = hasEc
          ? (inboxRes?.success && Array.isArray(inboxRes.data) ? inboxRes.data.length : 0)
          : inboxDests.length

        const overduePool = hasEc ? inboxDests : dests
        const overdueCount = overduePool.filter((d) => isDestinationOverdue(d as Record<string, unknown>)).length

        const usersCount = !isEndUser ? usersList.length : 0

        setQuickMetrics({
          outbox: outboxCount,
          inbox: inboxCount,
          overdue: overdueCount,
          users: usersCount,
        })
      } catch {
        if (!cancelled) {
          setQuickMetrics({ outbox: 0, inbox: 0, overdue: 0, users: 0 })
        }
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [user, isEndUser])

  const recentDocsTop = useMemo(() => recentDocs.slice(0, 6), [recentDocs])

  const metricForLink = (to: string): number | null => {
    switch (to) {
      case '/outbox':
        return quickMetrics.outbox
      case '/inbox':
        return quickMetrics.inbox
      case '/reports/overdue-report':
        return quickMetrics.overdue
      case '/registered-users':
        return quickMetrics.users
      default:
        return null
    }
  }

  const formatMetric = (n: number | null) => {
    if (n === null) return '—'
    return n.toLocaleString()
  }

  const getTypePalette = (type: string) => {
    const key = (type || 'Unknown').trim().toLowerCase()
    let hash = 0
    for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0
    const palettes = [
      { chipBg: 'rgba(34,197,94,0.12)', chipBorder: 'rgba(34,197,94,0.30)', chipText: '#22c55e' }, // green
      { chipBg: 'rgba(59,130,246,0.12)', chipBorder: 'rgba(59,130,246,0.30)', chipText: '#60a5fa' }, // blue
      { chipBg: 'rgba(245,158,11,0.14)', chipBorder: 'rgba(245,158,11,0.35)', chipText: '#f59e0b' }, // amber
      { chipBg: 'rgba(239,68,68,0.12)', chipBorder: 'rgba(239,68,68,0.30)', chipText: '#f87171' }, // red
      { chipBg: 'rgba(168,85,247,0.12)', chipBorder: 'rgba(168,85,247,0.30)', chipText: '#c084fc' }, // purple
      { chipBg: 'rgba(20,184,166,0.12)', chipBorder: 'rgba(20,184,166,0.30)', chipText: '#2dd4bf' }, // teal
    ]
    return palettes[hash % palettes.length]
  }

  const lastAddedLabel = useMemo(() => {
    const first = recentDocs[0]
    if (!first?.createdAt) return '—'
    const dt = new Date(first.createdAt)
    if (Number.isNaN(dt.getTime())) return '—'
    return dt.toLocaleString()
  }, [recentDocs])

  return (
    <div
      className="pt-4 pb-8"
    >
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-1" style={{ color: textPrimary }}>
            Home
          </h1>
          <p className="text-sm" style={{ color: textSecondary }}>
            Welcome{user ? `, ${user.fullName || user.employeeCode || user.username}` : ''}. Here’s what’s been recently added to
            the Outbox (your view may be limited if you’re an End-User).
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Recent Documents */}
          <div
            className="lg:col-span-2 rounded-lg relative overflow-hidden border"
            style={{
              backgroundColor: isDark ? '#0f172a' : '#ffffff',
              borderColor: border,
            }}
          >
            {/* Header */}
            <div
              className="px-4 py-3"
              style={{ borderBottom: `1px solid ${border}` }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: isDark ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.08)',
                      color: '#22c55e',
                    }}
                  >
                    <svg
                      className="w-4 h-4 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z"
                      />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8h6M9 12h6M9 16h4" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold leading-tight" style={{ color: textPrimary }}>
                      Recent Documents
                    </h2>
                    <p className="text-[11px] mt-0.5 leading-tight" style={{ color: textSecondary }}>
                      Last: <span style={{ color: textPrimary, fontWeight: 600 }}>{lastAddedLabel}</span>
                      <span className="opacity-60 mx-1">·</span>
                      {recentDocsTop.length} shown
                    </p>
                  </div>
                </div>
                <Link
                  to="/outbox"
                  className="text-[11px] font-medium px-2.5 py-1.5 rounded-md shrink-0 transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: '#3ecf8e',
                    color: '#ffffff',
                  }}
                >
                  Outbox
                </Link>
              </div>
            </div>

            {/* Content */}
            <div className="px-0 py-0">
              {recentLoading ? (
                <div className="divide-y" style={{ borderColor: border }}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="px-3 py-2.5 animate-pulse flex items-center gap-2"
                      style={{ borderColor: border }}
                    >
                      <div className="h-3.5 flex-1 rounded" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f2f2f2' }} />
                      <div className="h-3.5 w-16 rounded shrink-0" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f2f2f2' }} />
                      <div className="h-7 w-7 rounded-md shrink-0" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f2f2f2' }} />
                    </div>
                  ))}
                </div>
              ) : recentError ? (
                <div className="text-[11px] border-t p-3" style={{ borderColor: border, color: '#ef4444' }}>
                  {recentError}
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: border }}>
                  {recentDocsTop.length === 0 ? (
                    <div className="px-3 py-3 text-[11px]" style={{ color: textSecondary }}>
                      No documents yet. Add from Outbox.
                    </div>
                  ) : (
                    recentDocsTop.map((doc) => {
                      const createdAt = doc.createdAt ? new Date(doc.createdAt) : null
                      const createdLabel =
                        createdAt && !Number.isNaN(createdAt.getTime())
                          ? createdAt.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                          : '—'
                      const typePalette = getTypePalette(doc.documentType)

                      return (
                        <div
                          key={doc.id}
                          className="flex items-center gap-2 px-3 py-2"
                          style={{
                            backgroundColor: 'transparent',
                          }}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className="text-[11px] font-semibold truncate max-w-[140px] sm:max-w-[200px]"
                                style={{ color: textPrimary }}
                                title={doc.documentControlNo}
                              >
                                {doc.documentControlNo || '—'}
                              </span>
                              <span
                                className="px-1.5 py-0.5 rounded text-[10px] font-semibold border shrink-0 whitespace-normal break-words text-left"
                                style={{
                                  backgroundColor: typePalette.chipBg,
                                  borderColor: typePalette.chipBorder,
                                  color: typePalette.chipText,
                                }}
                              >
                                {doc.documentType || '—'}
                              </span>
                              <span className="text-[10px] shrink-0 hidden sm:inline" style={{ color: textSecondary }}>
                                {createdLabel}
                              </span>
                            </div>
                            <div className="text-[10px] truncate mt-0.5 leading-snug" style={{ color: textSecondary }} title={doc.subject}>
                              {doc.subject || '—'}
                              {(doc.routeNo || doc.remarks) && (
                                <span className="opacity-80">
                                  {' '}
                                  · R {doc.routeNo || '—'}
                                  {doc.remarks ? ` · ${doc.remarks}` : ''}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => navigate(`/outbox?doc=${doc.id}`)}
                            className={`shrink-0 w-8 h-8 rounded-md flex items-center justify-center text-emerald-500 transition-colors duration-150 ${
                              isDark
                                ? 'bg-emerald-500/15 hover:bg-emerald-500/30 hover:text-emerald-300 active:bg-emerald-500/40'
                                : 'bg-emerald-500/10 hover:bg-emerald-500/25 hover:text-emerald-600 active:bg-emerald-500/35'
                            }`}
                            title="Open this document"
                            aria-label="Open this document in Outbox"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      )
                    })
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Account / Quick Info */}
          <div
            className="rounded-lg border overflow-hidden flex flex-col min-h-0"
            style={{
              borderColor: border,
              backgroundColor: isDark ? '#0f172a' : '#ffffff',
            }}
          >
            <div
              className="px-4 py-3"
              style={{ borderBottom: `1px solid ${border}` }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: isDark ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.08)',
                    color: '#22c55e',
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-semibold leading-tight" style={{ color: textPrimary }}>
                    Your Account
                  </h2>
                  <p className="text-[11px] mt-0.5 leading-tight" style={{ color: textSecondary }}>
                    Signed in profile & shortcuts
                  </p>
                </div>
              </div>
            </div>

            <div className="px-4 py-3 space-y-3">
              <div
                className="rounded-lg px-3 py-2.5 space-y-2.5 text-xs"
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : border}`,
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="uppercase tracking-wide text-[10px] font-semibold" style={{ color: textSecondary }}>
                    Role
                  </span>
                  <span className="text-right truncate pl-2" style={{ color: textPrimary, fontWeight: 600 }}>
                    {user?.userLevel || '—'}
                  </span>
                </div>
                <div
                  className="h-px"
                  style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}
                />
                <div className="flex items-center justify-between gap-3">
                  <span className="uppercase tracking-wide text-[10px] font-semibold" style={{ color: textSecondary }}>
                    Employee Code
                  </span>
                  <span className="text-right font-mono text-[11px]" style={{ color: textPrimary, fontWeight: 600 }}>
                    {user?.employeeCode || '—'}
                  </span>
                </div>
              </div>

              <div>
                <div className="text-[11px] font-medium mb-2" style={{ color: textSecondary }}>
                  Quick actions
                </div>
                <div className="grid gap-2">
                  <Link
                    to="/outbox?add=1"
                    className="rounded-md px-3 py-2.5 text-xs font-medium text-center transition-opacity hover:opacity-90 active:opacity-100"
                    style={{
                      backgroundColor: '#3ecf8e',
                      color: '#ffffff',
                    }}
                  >
                    Add Documents
                  </Link>
                  <Link
                    to="/reports/overdue-report"
                    className="rounded-md px-3 py-2.5 text-xs font-medium text-center transition-opacity hover:opacity-90 active:opacity-100"
                    style={{
                      backgroundColor: '#3ecf8e',
                      color: '#ffffff',
                    }}
                  >
                    Check Overdue Reports
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div
          className="mt-4 rounded-xl border p-4"
          style={{
            borderColor: border,
            backgroundColor: isDark ? '#0f172a' : '#ffffff',
          }}
        >
          <h2 className="text-sm font-semibold mb-3" style={{ color: textPrimary }}>
            Quick Links
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {visibleLinks.map((link) => {
              const m = metricForLink(link.to)
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className="group rounded-xl border p-4 flex items-start gap-3 transition-transform duration-150 hover:border-emerald-500/40"
                  style={{
                    borderColor: isDark ? '#262626' : '#e5e7eb',
                    backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#ffffff',
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                    style={{
                      backgroundColor: isDark ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.08)',
                      color: '#22c55e',
                    }}
                  >
                    {link.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-sm font-semibold truncate group-hover:underline min-w-0" style={{ color: textPrimary }}>
                        {link.label}
                      </div>
                      <div
                        className="shrink-0 text-lg font-bold tabular-nums leading-none pt-0.5"
                        style={{ color: '#3ecf8e' }}
                        title="Count"
                      >
                        {formatMetric(m)}
                      </div>
                    </div>
                    <div className="text-[11px] mt-1 leading-snug" style={{ color: textSecondary }}>
                      {link.description}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home

