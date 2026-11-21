import { useState } from 'react'
import { useApp } from '../context'
import { api } from '../lib/api'
import MapEmbed from '../components/MapEmbed'
import { PageHead } from './About'

export default function Contact() {
  const { t, settings, user } = useApp()
  const [f, setF] = useState({ name: user?.profile?.full_name || '', email: user?.email || '', phone: user?.profile?.phone || '', subject: '', message: '' })
  const [state, setState] = useState('')
  const on = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const send = async (e) => {
    e.preventDefault()
    setState('sending')
    try {
      await api.insert('messages', { ...f, read: false })
      setState('ok')
      setF({ ...f, subject: '', message: '' })
    } catch (err) {
      setState('Error: ' + err.message)
    }
  }

  return (
    <>
      <PageHead eyebrow="NEED A HAND?" title={t('contact')} lead={t('contact_lead')} />
      <section className="section">
        <div className="wrap contact-grid">
          <div className="contact-info">
            <h3>{settings.company_name}</h3>
            <ul className="info-list">
              <li><span>📍</span><div><b>{t('address')}</b><br />{settings.address}</div></li>
              <li><span>📞</span><div><b>{t('phone')}</b><br /><a href={`tel:${settings.phone.replace(/\s/g, '')}`}>{settings.phone}</a></div></li>
              <li><span>✉️</span><div><b>{t('email')}</b><br /><a href={`mailto:${settings.email}`}>{settings.email}</a></div></li>
              <li><span>🕗</span><div><b>{t('hours')}</b><br />{settings.opening_hours}</div></li>
            </ul>
            {settings.whatsapp && (
              <a className="btn btn-gold" href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noreferrer">WhatsApp →</a>
            )}
          </div>
          <form className="card pad-lg form" onSubmit={send}>
            <div className="row2">
              <label>{t('name')}<input className="input" required value={f.name} onChange={on('name')} /></label>
              <label>{t('phone')}<input className="input" value={f.phone} onChange={on('phone')} /></label>
            </div>
            <label>{t('email')}<input className="input" type="email" required value={f.email} onChange={on('email')} /></label>
            <label>{t('subject')}<input className="input" value={f.subject} onChange={on('subject')} /></label>
            <label>{t('message')}<textarea className="input" rows={5} required value={f.message} onChange={on('message')} /></label>
            {state === 'ok' && <div className="ok">{t('sent_ok')}</div>}
            {state.startsWith('Error') && <div className="err">{state}</div>}
            <button className="btn btn-dark" disabled={state === 'sending'}>{t('send')} →</button>
          </form>
        </div>
        <div className="wrap mt">
          <h3>{t('find_us')}</h3>
          <MapEmbed settings={settings} height={380} className="big" />
        </div>
      </section>
    </>
  )
}
