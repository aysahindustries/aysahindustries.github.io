import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useApp } from '../context'
import { api, MODE } from '../lib/api'

export default function Header({ bare }) {
  const { settings, t, lang, setLang, user, isAdmin, loc } = useApp()
  const [open, setOpen] = useState(false)
  const nav = useNavigate()
  const links = [
    ['/', t('home')],
    ['/about', t('about')],
    ['/team', t('team')],
    ['/products', t('products')],
    ['/contact', t('contact')],
  ]
  const logout = async () => {
    await api.auth.signOut()
    nav('/')
  }
  const first = (user?.profile?.full_name || user?.email || '').split(' ')[0]

  return (
    <header className="site-header">
      <div className="topbar">
        <div className="wrap topbar-in">
          <span>
            <b>{settings.company_name}</b> <span className="sep">|</span> {loc(settings, 'tagline')}
          </span>
          <span className="topbar-right">
            {MODE === 'demo' && <span className="demo-pill">DEMO</span>}
            <span className="hide-sm">{t('pi_bar')}</span>
            <button className="lang" onClick={() => setLang(lang === 'rw' ? 'en' : 'rw')}>
              {lang === 'rw' ? 'EN' : 'RW'}
            </button>
          </span>
        </div>
      </div>
      {!bare && (
        <div className="navbar">
          <div className="wrap nav-in">
            <Link to="/" className="brand" onClick={() => setOpen(false)}>
              <img src={settings.logo_url} alt={settings.company_name} />
            </Link>
            <button className="burger" aria-label="Menu" onClick={() => setOpen(!open)}>
              <span /><span /><span />
            </button>
            <nav className={open ? 'menu open' : 'menu'} onClick={() => setOpen(false)}>
              {links.map(([to, label]) => (
                <NavLink key={to} to={to} end={to === '/'} className="nav-link">
                  {label}
                </NavLink>
              ))}
              <Link to="/products" className="btn btn-dark nav-cta">{t('see_products')} →</Link>
              {user ? (
                <>
                  {isAdmin && <NavLink to="/admin" className="nav-link strong">{t('admin')}</NavLink>}
                  <NavLink to="/account" className="nav-link strong">{t('hello')}, {first}</NavLink>
                  <button className="nav-link linkbtn" onClick={logout}>{t('logout')}</button>
                </>
              ) : (
                <>
                  <NavLink to="/login" className="nav-link strong">{t('login')}</NavLink>
                  <NavLink to="/register" className="nav-link strong">{t('register')}</NavLink>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
