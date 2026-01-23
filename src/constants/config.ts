/**
 * Application-wide configuration constants
 */

/**
 * Polling intervals for various data types (in milliseconds)
 */
export const POLLING_INTERVALS = {
  /** Notification monitor polling interval - 30 seconds */
  NOTIFICATION_MONITOR: 30000,

  /** Target info refresh interval - 10 seconds */
  TARGET_INFO: 10000,

  /** Action history refresh interval - 3 seconds (for "live" feel) */
  ACTION_HISTORY: 3000,

  /** Distribution set refresh interval - 5 seconds */
  DISTRIBUTION_SET: 5000,

  /** Dashboard metrics refresh interval - 30 seconds */
  DASHBOARD_METRICS: 30000,

  /** Rollout progress refresh interval - 5 seconds */
  ROLLOUT_PROGRESS: 5000,
} as const;

/**
 * Size limits for various resources
 */
export const SIZE_LIMITS = {
  /** Maximum logo file size in MB */
  MAX_LOGO_SIZE_MB: 2,

  /** Maximum logo file size in bytes */
  MAX_LOGO_SIZE_BYTES: 2 * 1024 * 1024,

  /** Maximum description length in characters */
  MAX_DESCRIPTION_LENGTH: 500,

  /** Maximum name length in characters */
  MAX_NAME_LENGTH: 64,

  /** Maximum file upload size in MB */
  MAX_FILE_UPLOAD_SIZE_MB: 100,
} as const;

/**
 * UI layout constants
 */
export const UI_LAYOUT = {
  /** App header height in pixels */
  HEADER_HEIGHT: 52,

  /** App header horizontal padding in pixels */
  HEADER_PADDING: 16,

  /** Gap between header items in pixels */
  HEADER_GAP: 20,

  /** Sidebar width when expanded in pixels */
  SIDEBAR_WIDTH: 240,

  /** Sidebar width when collapsed in pixels */
  SIDEBAR_COLLAPSED_WIDTH: 64,

  /** Content padding in pixels */
  CONTENT_PADDING: 24,
} as const;

/**
 * Table pagination defaults
 */
export const PAGINATION = {
  /** Default page size for tables */
  DEFAULT_PAGE_SIZE: 20,

  /** Available page size options */
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],

  /** Show size changer by default */
  SHOW_SIZE_CHANGER: true,

  /** Show quick jumper by default */
  SHOW_QUICK_JUMPER: true,
} as const;

/**
 * Query configuration defaults
 */
export const QUERY_CONFIG = {
  /** Default stale time for queries - 5 minutes */
  DEFAULT_STALE_TIME: 1000 * 60 * 5,

  /** Default retry count */
  DEFAULT_RETRY: 1,

  /** Refetch on window focus */
  REFETCH_ON_WINDOW_FOCUS: false,
} as const;

/**
 * Notification configuration
 */
export const NOTIFICATION_CONFIG = {
  /** Maximum number of notifications to store */
  MAX_NOTIFICATIONS: 100,

  /** Notification auto-close duration in seconds */
  AUTO_CLOSE_DURATION: 5,

  /** Maximum notifications to display at once */
  MAX_DISPLAY_COUNT: 50,
} as const;

/**
 * Debounce and throttle delays (in milliseconds)
 */
export const DELAYS = {
  /** Search input debounce delay */
  SEARCH_DEBOUNCE: 300,

  /** Filter change debounce delay */
  FILTER_DEBOUNCE: 500,

  /** Resize throttle delay */
  RESIZE_THROTTLE: 200,

  /** Scroll throttle delay */
  SCROLL_THROTTLE: 100,
} as const;

/**
 * API request configuration
 */
export const API_CONFIG = {
  /** Request timeout in milliseconds */
  TIMEOUT: 30000,

  /** Max retries for failed requests */
  MAX_RETRIES: 3,

  /** Retry delay in milliseconds */
  RETRY_DELAY: 1000,
} as const;

/**
 * Date/Time formats
 */
export const DATE_FORMATS = {
  /** Display format for dates */
  DATE: 'YYYY-MM-DD',

  /** Display format for date and time */
  DATETIME: 'YYYY-MM-DD HH:mm:ss',

  /** Display format for time only */
  TIME: 'HH:mm:ss',

  /** ISO format for API requests */
  ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
} as const;

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  /** Auth storage key */
  AUTH: 'updater-auth-storage',

  /** Theme storage key */
  THEME: 'updater-theme-storage',

  /** Language storage key */
  LANGUAGE: 'updater-language-storage',

  /** Filters storage key */
  FILTERS: 'updater-filters-storage',

  /** Column settings storage key */
  COLUMNS: 'updater-columns-storage',
} as const;

/**
 * Default values
 */
export const DEFAULTS = {
  /** Default app title */
  APP_TITLE: 'Updater UI',

  /** Default login title */
  LOGIN_TITLE: 'Updater UI',

  /** Default language */
  LANGUAGE: 'en',

  /** Default theme */
  THEME: 'light',
} as const;
