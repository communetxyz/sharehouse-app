/**
 * Debug utility to replace console.log throughout the app
 * Only logs in development mode
 */

const isDevelopment = process.env.NODE_ENV === 'development'

export const debug = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args)
    }
  },

  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args)
    }
  },

  error: (...args: any[]) => {
    // Always log errors, even in production
    console.error(...args)
  },

  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args)
    }
  },

  group: (label: string) => {
    if (isDevelopment) {
      console.group(label)
    }
  },

  groupEnd: () => {
    if (isDevelopment) {
      console.groupEnd()
    }
  },

  table: (data: any) => {
    if (isDevelopment) {
      console.table(data)
    }
  },
}

export default debug
