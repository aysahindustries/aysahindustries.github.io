import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context'
import { api } from '../lib/api'
import { payWithPi } from '../lib/pi'

export function PayModal({ state, onClose }) {
  const { t } = useApp()
  if (!state) return null
  const done = ['paid', 'cancelled', 'error', 'info'].includes(state.status)
  return (
    <div className="modal-bg" onClick={done ? onClose : undefined}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className={'pay-icon ' + state.status}>
          {state.status === 'paid' ? '✓' : state.status === 'error' || state.status === 'cancelled' ? '!' : state.status === 'info' ? 'i' : <span className="spinner sm" />}
        </div>
        <h3>{state.title}</h3>
        <p className="muted">{state.status === 'error' || state.status === 'info' ? state.message : t('pay_' + state.status)}</p>
        {done && <button className="btn btn-dark" onClick={onClose}>{t('close')}</button>}
      </div>
    </div>
  )
}

/** Start buying (product) or requesting (service) for the logged-in client. */
export function useBuy() {
  const { user, t } = useApp()
  const nav = useNavigate()
  const [pay, setPay] = useState(null)

  const payOrder = async (order, title) => {
    setPay({ status: 'authenticating', title })
    try {
      const r = await payWithPi({
        order,
        memo: `AYSAH: ${order.product_name}`,
        onStatus: (s) => setPay({ status: s, title }),
      })
      if (r === 'cancelled') await api.update('orders', order.id, { status: 'cancelled' }).catch(() => {})
    } catch (e) {
      const msg = e.message === 'NOT_PI_BROWSER' ? t('not_pi') : e.message
      setPay({ status: 'error', title, message: msg })
    }
  }

  const buy = async (p) => {
    if (!user) {
      nav('/login?next=/products')
      return
    }
    const isPaid = p.kind === 'product' && Number(p.price_pi) > 0
    const order = await api.insert('orders', {
      user_id: user.id,
      customer_name: user.profile?.full_name || '',
      customer_email: user.email,
      customer_phone: user.profile?.phone || '',
      product_id: p.id,
      product_name: p.name,
      kind: p.kind,
      amount_pi: isPaid ? Number(p.price_pi) : 0,
      status: isPaid ? 'pending' : 'requested',
    })
    if (!isPaid) {
      setPay({ status: 'info', title: p.name, message: t('request_sent') })
      return
    }
    payOrder(order, p.name)
  }

  return { buy, payOrder, modal: <PayModal state={pay} onClose={() => setPay(null)} /> }
}

export default function ProductCard({ p, onBuy }) {
  const { t, loc } = useApp()
  const priced = Number(p.price_pi) > 0
  return (
    <article className="card product">
      <div className="product-img" style={{ backgroundImage: `url("${p.image_url}")` }}>
        <span className="chip">{p.category || 'AYSAH'}</span>
        {!p.available && <span className="chip sold">{t('sold_out')}</span>}
      </div>
      <div className="product-body">
        <div className="kicker">{p.kind === 'service' ? t('service') : t('product')}</div>
        <h3>{p.name}</h3>
        <p className="muted">{loc(p, 'description')}</p>
        <div className="product-foot">
          <div>
            <div className="tiny muted">{t('price')}</div>
            {priced ? (
              <div className="price">{Number(p.price_pi).toLocaleString()} <span className="gold">π Pi</span></div>
            ) : (
              <div className="price sm">{t('on_quote')}</div>
            )}
          </div>
          <button className="btn btn-dark" disabled={!p.available} onClick={() => onBuy(p)}>
            {p.kind === 'product' && priced ? t('buy_pi') : t('request')} →
          </button>
        </div>
      </div>
    </article>
  )
}
