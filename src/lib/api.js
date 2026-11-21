// One data layer, two back-ends:
//  - "supabase": real database, logins, file storage and Pi payment functions.
//  - "demo": everything stored in this browser only (used when Supabase isn't configured yet).
import { createClient } from '@supabase/supabase-js'
import { DEFAULT_SETTINGS, SEED, ADMIN_EMAIL } from './defaults'

const URL_ = import.meta.env.VITE_SUPABASE_URL
const KEY_ = import.meta.env.VITE_SUPABASE_ANON_KEY
export const MODE = URL_ && KEY_ ? 'supabase' : 'demo'

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
const now = () => new Date().toISOString()
const listeners = new Set()
const emit = (u) => listeners.forEach((cb) => cb(u))

/* ------------------------------------------------------------------ */
/*  SUPABASE                                                           */
/* ------------------------------------------------------------------ */
function supabaseApi() {
  const sb = createClient(URL_, KEY_)

  async function loadUser(session) {
    if (!session?.user) return null
    const { data: profile } = await sb.from('profiles').select('*').eq('id', session.user.id).maybeSingle()
    return { id: session.user.id, email: session.user.email, profile: profile || {} }
  }
  sb.auth.onAuthStateChange(async (_e, session) => emit(await loadUser(session)))

  const chk = ({ data, error }) => {
    if (error) throw new Error(error.message)
    return data
  }

  return {
    async getSettings() {
      const { data } = await sb.from('settings').select('data').eq('id', 1).maybeSingle()
      return { ...DEFAULT_SETTINGS, ...(data?.data || {}) }
    },
    async saveSettings(s) {
      return chk(await sb.from('settings').upsert({ id: 1, data: s, updated_at: now() }))
    },
    async list(table, { orderBy = 'created_at', asc = false, eq } = {}) {
      let q = sb.from(table).select('*')
      if (eq) Object.entries(eq).forEach(([k, v]) => (q = q.eq(k, v)))
      q = q.order(orderBy, { ascending: asc })
      return chk(await q)
    },
    async insert(table, row) {
      return chk(await sb.from(table).insert(row).select().single())
    },
    async update(table, id, patch) {
      return chk(await sb.from(table).update(patch).eq('id', id).select().single())
    },
    async remove(table, id) {
      return chk(await sb.from(table).delete().eq('id', id))
    },
    async upload(file) {
      const ext = (file.name.split('.').pop() || 'png').toLowerCase()
      const path = `${new Date().getFullYear()}/${uid()}.${ext}`
      chk(await sb.storage.from('media').upload(path, file, { upsert: false, contentType: file.type }))
      return sb.storage.from('media').getPublicUrl(path).data.publicUrl
    },
    auth: {
      async current() {
        const { data } = await sb.auth.getSession()
        return loadUser(data.session)
      },
      async signUp({ email, password, full_name, phone }) {
        const { data, error } = await sb.auth.signUp({ email, password, options: { data: { full_name, phone } } })
        if (error) throw new Error(error.message)
        return { needsConfirm: !data.session }
      },
      async signIn({ email, password }) {
        const { error } = await sb.auth.signInWithPassword({ email, password })
        if (error) throw new Error(error.message)
      },
      async signOut() {
        await sb.auth.signOut()
      },
      async updateProfile(id, patch) {
        return chk(await sb.from('profiles').update(patch).eq('id', id).select().single())
      },
      onChange(cb) {
        listeners.add(cb)
        return () => listeners.delete(cb)
      },
    },
    async piApprove(body) {
      const { data, error } = await sb.functions.invoke('pi-approve', { body })
      if (error) throw new Error(error.message)
      return data
    },
    async piComplete(body) {
      const { data, error } = await sb.functions.invoke('pi-complete', { body })
      if (error) throw new Error(error.message)
      return data
    },
  }
}

/* ------------------------------------------------------------------ */
/*  DEMO (browser storage)                                             */
/* ------------------------------------------------------------------ */
function demoApi() {
  const KEY = 'aysah_demo_v1'
  let mem = null
  const fresh = () => ({
    settings: { ...DEFAULT_SETTINGS },
    slides: SEED.slides.map((r) => ({ ...r, created_at: now() })),
    products: SEED.products.map((r) => ({ ...r, created_at: now() })),
    team: SEED.team.map((r) => ({ ...r, created_at: now() })),
    orders: [],
    messages: [],
    profiles: [{ id: 'admin', email: ADMIN_EMAIL, full_name: 'MUTABAZI Yves', phone: '+250 784 578 722', role: 'admin', created_at: now() }],
    users: [{ id: 'admin', email: ADMIN_EMAIL, password: 'Aysah@2026' }],
    session: null,
  })
  const load = () => {
    if (mem) return mem
    try {
      mem = JSON.parse(localStorage.getItem(KEY)) || fresh()
    } catch {
      mem = fresh()
    }
    return mem
  }
  const save = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify(mem))
    } catch {
      /* storage full or blocked: keep in memory */
    }
  }
  const delay = (v) => new Promise((r) => setTimeout(() => r(structuredClone(v)), 120))
  const me = () => {
    const d = load()
    if (!d.session) return null
    const p = d.profiles.find((x) => x.id === d.session)
    return p ? { id: p.id, email: p.email, profile: p } : null
  }

  return {
    async getSettings() {
      return delay({ ...DEFAULT_SETTINGS, ...load().settings })
    },
    async saveSettings(s) {
      load().settings = s
      save()
      return delay(s)
    },
    async list(table, { orderBy = 'created_at', asc = false, eq } = {}) {
      let rows = [...(load()[table] || [])]
      if (eq) rows = rows.filter((r) => Object.entries(eq).every(([k, v]) => r[k] === v))
      rows.sort((a, b) => ((a[orderBy] ?? '') > (b[orderBy] ?? '') ? 1 : -1) * (asc ? 1 : -1))
      return delay(rows)
    },
    async insert(table, row) {
      const r = { id: uid(), created_at: now(), ...row }
      load()[table].push(r)
      save()
      return delay(r)
    },
    async update(table, id, patch) {
      const t = load()[table]
      const i = t.findIndex((r) => r.id === id)
      if (i < 0) throw new Error('Not found')
      t[i] = { ...t[i], ...patch }
      save()
      return delay(t[i])
    },
    async remove(table, id) {
      const d = load()
      d[table] = d[table].filter((r) => r.id !== id)
      save()
      return delay(true)
    },
    async upload(file) {
      return new Promise((res, rej) => {
        const fr = new FileReader()
        fr.onload = () => res(fr.result)
        fr.onerror = rej
        fr.readAsDataURL(file)
      })
    },
    auth: {
      async current() {
        return delay(me())
      },
      async signUp({ email, password, full_name, phone }) {
        const d = load()
        email = email.trim().toLowerCase()
        if (d.users.some((u) => u.email === email)) throw new Error('Iyi email isanzwe ifite konti. / This email already has an account.')
        const id = uid()
        d.users.push({ id, email, password })
        d.profiles.push({ id, email, full_name, phone, role: email === ADMIN_EMAIL ? 'admin' : 'client', created_at: now() })
        d.session = id
        save()
        emit(me())
        return { needsConfirm: false }
      },
      async signIn({ email, password }) {
        const d = load()
        const u = d.users.find((x) => x.email === email.trim().toLowerCase() && x.password === password)
        if (!u) throw new Error('Email cyangwa ijambo ry’ibanga sibyo. / Wrong email or password.')
        d.session = u.id
        save()
        emit(me())
      },
      async signOut() {
        load().session = null
        save()
        emit(null)
      },
      async updateProfile(id, patch) {
        const d = load()
        const p = d.profiles.find((x) => x.id === id)
        Object.assign(p, patch)
        save()
        emit(me())
        return delay(p)
      },
      onChange(cb) {
        listeners.add(cb)
        return () => listeners.delete(cb)
      },
    },
    async piApprove({ orderId, paymentId }) {
      const d = load()
      const o = d.orders.find((x) => x.id === orderId)
      Object.assign(o, { payment_id: paymentId, status: 'approved' })
      save()
      return delay({ ok: true })
    },
    async piComplete({ orderId, paymentId, txid }) {
      const d = load()
      const o = d.orders.find((x) => x.id === orderId || x.payment_id === paymentId)
      if (o) Object.assign(o, { txid, status: 'paid', paid_at: now() })
      save()
      return delay({ ok: true })
    },
    resetDemo() {
      mem = fresh()
      save()
      location.reload()
    },
  }
}

export const api = MODE === 'supabase' ? supabaseApi() : demoApi()
