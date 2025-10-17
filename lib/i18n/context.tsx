"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { translations, type Language } from "./translations"

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Load saved language preference from localStorage with error handling
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem("sharehouse-language") as Language
        if (saved && (saved === "en" || saved === "ja")) {
          return saved
        }
      } catch (error) {
        console.warn('localStorage not available:', error)
      }
    }
    return "ja" // Default language
  })

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    // Try to save to localStorage, but don't fail if unavailable
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem("sharehouse-language", lang)
      } catch (error) {
        console.warn('Failed to save language preference:', error)
      }
    }
  }

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split(".")
    let value: any = translations[language]

    for (const k of keys) {
      value = value?.[k]
    }

    if (typeof value !== "string") {
      return key
    }

    // Replace template variables like {{name}} with provided params
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() ?? match
      })
    }

    return value
  }

  return <I18nContext.Provider value={{ language, setLanguage, t }}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider")
  }
  return context
}

export const useLanguage = useI18n
