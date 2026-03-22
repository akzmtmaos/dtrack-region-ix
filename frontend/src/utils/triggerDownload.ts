/**
 * Download / open a file from a URL (e.g. Supabase signed URL).
 * Avoids fetch()+blob() on cross-origin storage URLs — browsers often block those with CORS
 * even when opening the same URL in a tab would work.
 */
export function triggerBrowserDownload(url: string, filename: string): void {
  const safeName = (filename || 'download').replace(/[/\\?%*:|"<>]/g, '-')
  const a = window.document.createElement('a')
  a.href = url
  a.download = safeName
  a.target = '_blank'
  a.rel = 'noopener noreferrer'
  // Cross-origin: `download` may be ignored; new tab still loads the file (user can Save as).
  window.document.body.appendChild(a)
  a.click()
  window.document.body.removeChild(a)
}
