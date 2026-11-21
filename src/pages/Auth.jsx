import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../context'
import { api, MODE } from '../lib/api'

function AuthCard({ children }) {
  return (
    <section className="auth-wrap">
      <div className="card auth">{children}</div>
    </section>
  )
}

export function Login() {
  const { t } = useApp()
  const nav = useNavigate()
  const [q] = useSearchParams()
  const [f, setF] = useState({ email: '', password: '' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    setBusy(true)
    try {
      await api.auth.signIn(f)
      const u = await api.auth.current()
      nav(q.get('next') || (u?.profile?.role === 'admin' ? '/admin' : '/account'))
    } catch (e2) {
      setErr(e2.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthCard>
      <Link to="/" className="back">{t('back_shop')}</Link>
      <h1>{t('welcome_back')}</h1>
      <p className="muted">{t('signin_lead')}</p>
      {q.get('next') && <div className="notice">{t('login_to_buy')}</div>}
      <form className="form" onSubmit={submit}>
        <label>{t('email')}<input className="input" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
        <label>{t('password')}<input className="input" type="password" required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></label>
        {err && <div className="err">{err}</div>}
        <button className="btn btn-dark block" disabled={busy}>{busy ? '…' : t('login')}</button>
      </form>
      <p className="center small muted mt-s">
        {t('new_here')} <Link className="gold-link" to={'/register' + (q.get('next') ? `?next=${q.get('next')}` : '')}>{t('create_account')}</Link>
      </p>
      {MODE === 'demo' && <p className="tiny muted center">{t('demo_note')} Admin: aysah22n@gmail.com / Aysah@2026</p>}
    </AuthCard>
  )
}

export function Register() {
  const { t } = useApp()
  const nav = useNavigate()
  const [q] = useSearchParams()
  const [f, setF] = useState({ full_name: '', email: '', phone: '', password: '' })
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const on = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    if (f.password.length < 8) return setErr(t('pw_hint'))
    setBusy(true)
    try {
      const r = await api.auth.signUp(f)
      if (r.needsConfirm) setMsg(t('confirm_email'))
      else nav(q.get('next') || '/account')
    } catch (e2) {
      setErr(e2.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthCard>
      <Link to="/" className="back">{t('back_shop')}</Link>
      <h1>{t('create_account')}</h1>
      <p className="muted">{t('register_lead')}</p>
      {msg ? (
        <div className="ok">{msg}</div>
      ) : (
        <form className="form" onSubmit={submit}>
          <label>{t('name')}<input className="input" required value={f.full_name} onChange={on('full_name')} /></label>
          <label>{t('email')}<input className="input" type="email" required value={f.email} onChange={on('email')} /></label>
          <label>{t('phone')}<input className="input" value={f.phone} onChange={on('phone')} placeholder="07…" /></label>
          <label>{t('password')}<input className="input" type="password" required value={f.password} onChange={on('password')} /><span className="tiny muted">{t('pw_hint')}</span></label>
          {err && <div className="err">{err}</div>}
          <button className="btn btn-dark block" disabled={busy}>{busy ? '…' : t('create_account')}</button>
        </form>
      )}
      <p className="center small muted mt-s">
        {t('have_account')} <Link className="gold-link" to="/login">{t('login')}</Link>
      </p>
    </AuthCard>
  )
}
