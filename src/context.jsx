import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api } from './lib/api'
import { DEFAULT_SETTINGS } from './lib/defaults'
import { T } from './lib/i18n'

const Ctx = createContext(null)
export const useApp = () => useContext(Ctx)

function getLang() {
  try {
    return localStorage.getItem('aysah_lang') || 'rw'
  } catch {
    return 'rw'
  }
}

export function AppProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)
  const [lang, setLangState] = useState(getLang)

  const refreshSettings = useCallback(async () => {
    try {
      setSettings(await api.getSettings())
    } catch (e) {
      console.error(e)
    }
  }, [])

  useEffect(() => {
    Promise.all([refreshSettings(), api.auth.current().then(setUser)]).finally(() => setReady(true))
    return api.auth.onChange(setUser)
  }, [refreshSettings])

  // Keep favicon, page title and brand colours in sync with admin settings.
  useEffect(() => {
    const link = document.getElementById('site-favicon')
    if (link && settings.favicon_url) link.href = settings.favicon_url
    document.title = settings.company_name || 'AYSAH INDUSTRIES LTD'
    document.documentElement.style.setProperty('--ink', settings.primary_color || '#111827')
    document.documentElement.style.setProperty('--gold', settings.accent_color || '#E3A33D')
  }, [settings])

  const setLang = (l) => {
    setLangState(l)
    document.documentElement.lang = l
    try {
      localStorage.setItem('aysah_lang', l)
    } catch {
      /* ignore */
    }
  }
  const t = (k) => T[lang][k] ?? T.rw[k] ?? k
  // pick a bilingual field: loc(row, 'title') -> row.title_rw / row.title_en / row.title
  const loc = (row, f) => (row && (row[`${f}_${lang}`] || row[`${f}_rw`] || row[`${f}_en`] || row[f])) || ''
  const isAdmin = user?.profile?.role === 'admin'

  return (
    <Ctx.Provider value={{ settings, setSettings, refreshSettings, user, ready, lang, setLang, t, loc, isAdmin }}>
      {children}
    </Ctx.Provider>
  )
}
