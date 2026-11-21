import { useCallback, useEffect, useState } from 'react'
import { useApp } from '../context'
import { api } from '../lib/api'
import { useBuy } from '../components/ProductCard'

export function StatusBadge({ s }) {
  const { t } = useApp()
  return <span className={'badge st-' + s}>{t('st_' + s)}</span>
}

export default function Account() {
  const { t, user, lang } = useApp()
  const [orders, setOrders] = useState([])
  const [p, setP] = useState({ full_name: user.profile?.full_name || '', phone: user.profile?.phone || '' })
  const [saved, setSaved] = useState(false)
  const { payOrder, modal } = useBuy()

  const load = useCallback(() => api.list('orders', { eq: { user_id: user.id } }).then(setOrders), [user.id])
  useEffect(() => {
    load()
  }, [load])

  const save = async (e) => {
    e.preventDefault()
    await api.auth.updateProfile(user.id, p)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }
  const fmt = (d) => new Date(d).toLocaleString(lang === 'rw' ? 'fr-RW' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' })

  return (
    <section className="section">
      <div className="wrap">
        <div className="sec-head">
          <div>
            <div className="eyebrow dark">{t('my_account')}</div>
            <h2>{t('hello')}, {p.full_name || user.email}</h2>
          </div>
        </div>
        <div className="account-grid">
          <div className="card pad-lg">
            <h3>{t('my_orders')}</h3>
            {orders.length === 0 ? (
              <p className="muted">{t('no_orders')}</p>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr><th>{t('date')}</th><th>{t('item')}</th><th>{t('amount')}</th><th>{t('status')}</th><th /></tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id}>
                        <td className="nowrap">{fmt(o.created_at)}</td>
                        <td>
                          <b>{o.product_name}</b>
                          {o.admin_note && <div className="tiny muted">{t('note')}: {o.admin_note}</div>}
                        </td>
                        <td className="nowrap">{o.amount_pi > 0 ? `${o.amount_pi} π` : '—'}</td>
                        <td><StatusBadge s={o.status} /></td>
                        <td>
                          {o.status === 'pending' && (
                            <button className="btn btn-dark sm" onClick={() => payOrder(o, o.product_name).then(load)}>{t('pay_now')}</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <button className="btn btn-ghost-dark sm mt-s" onClick={load}>↻</button>
          </div>
          <form className="card pad-lg form" onSubmit={save}>
            <h3>{t('profile')}</h3>
            <label>{t('email')}<input className="input" value={user.email} disabled /></label>
            <label>{t('name')}<input className="input" value={p.full_name} onChange={(e) => setP({ ...p, full_name: e.target.value })} /></label>
            <label>{t('phone')}<input className="input" value={p.phone} onChange={(e) => setP({ ...p, phone: e.target.value })} /></label>
            {saved && <div className="ok">{t('saved')}</div>}
            <button className="btn btn-dark">{t('save')}</button>
          </form>
        </div>
      </div>
      {modal}
    </section>
  )
}
