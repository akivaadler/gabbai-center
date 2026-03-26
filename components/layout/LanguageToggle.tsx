'use client'
import { useLang } from '@/components/providers/LanguageProvider'

export function LanguageToggle() {
  const { lang, setLang } = useLang()
  return (
    <button
      onClick={() => setLang(lang === 'en' ? 'he' : 'en')}
      className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded border border-border hover:border-foreground/20"
      style={lang === 'he' ? { fontFamily: "'Frank Ruhl Libre', serif" } : undefined}
    >
      {lang === 'en' ? 'עברית' : 'English'}
    </button>
  )
}
