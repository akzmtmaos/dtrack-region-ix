/** Role checks aligned with Laravel `UsersController` verification rules. */

export function normalizeUserLevel(userLevel: string | undefined): string {
  return (userLevel ?? '').trim().toLowerCase()
}

export function isAdministrator(user: { userLevel?: string }): boolean {
  const l = normalizeUserLevel(user.userLevel)
  return l === 'administrator' || l === 'admin'
}

/** User level is Action Officer (any office rep. setting). */
export function isActionOfficer(user: { userLevel?: string }): boolean {
  const l = normalizeUserLevel(user.userLevel)
  return l.includes('action') && l.includes('officer')
}

/** End-User level (Outbox / Trash self scope). */
export function isEndUserLevel(user: { userLevel?: string }): boolean {
  const l = normalizeUserLevel(user.userLevel)
  return l === 'end-user' || l === 'end-users'
}

/**
 * When set, `GET /api/document-source/` scopes rows for End-User (holder) or Action Officer (office).
 * Administrators and other roles omit this so the API returns the full list.
 */
export function documentSourceListEmployeeCode(user: {
  userLevel?: string
  employeeCode?: string
  username?: string
} | null): string | undefined {
  if (!user) return undefined
  const ec = (user.employeeCode ?? user.username ?? '').trim()
  if (!ec) return undefined
  if (isEndUserLevel(user)) return ec
  if (isActionOfficer(user) && !isAdministrator(user)) return ec
  return undefined
}

/** Action Officer who is head of office (Office Rep. = Yes). */
export function isActionOfficerHead(user: {
  userLevel?: string
  officeRepresentative?: string
}): boolean {
  const rep = (user.officeRepresentative ?? '').trim().toLowerCase()
  return isActionOfficer(user) && rep === 'yes'
}

/** Can approve pending accounts: Administrator, or Action Officer head for same office. */
export function canVerifyRegisteredUser(
  viewer: { userLevel?: string; officeRepresentative?: string; office?: string },
  target: { office?: string }
): boolean {
  if (isAdministrator(viewer)) return true
  if (!isActionOfficerHead(viewer)) return false
  const oa = (viewer.office ?? '').trim().toLowerCase()
  const ob = (target.office ?? '').trim().toLowerCase()
  return oa !== '' && oa === ob
}

/** Full create/edit/delete of arbitrary user rows (Registered Users admin UI). */
export function canManageRegisteredUsers(user: { userLevel?: string }): boolean {
  return isAdministrator(user)
}
