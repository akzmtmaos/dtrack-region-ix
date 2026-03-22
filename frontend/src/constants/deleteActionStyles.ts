/**
 * Shared styles for delete actions: red border + red icon (outline, not solid fill).
 * Use for table row icon buttons and any compact delete control that matches reference tables.
 */
export const DELETE_ROW_ACTION_BUTTON_CLASS =
  'inline-flex items-center justify-center h-7 w-8 rounded-lg border border-red-500 text-red-600 dark:text-red-400 bg-transparent hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'

/** Inbox / looser layouts with larger icons (w-5 h-5). */
export const DELETE_ROW_ACTION_BUTTON_CLASS_LG =
  'inline-flex items-center justify-center rounded-md border border-red-500 text-red-600 dark:text-red-400 bg-transparent hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors p-1 disabled:opacity-50'
