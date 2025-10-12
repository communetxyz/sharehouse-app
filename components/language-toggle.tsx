"use client"

import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n/context"

export function LanguageToggle() {
  const { language, setLanguage } = useI18n()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLanguage(language === "ja" ? "en" : "ja")}
      className="text-charcoal/70 hover:text-charcoal hover:bg-charcoal/5 font-mono"
    >
      {language === "ja" ? "EN" : "日本語"}
    </Button>
  )
}
