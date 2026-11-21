import { useEffect, useState } from 'react'
import { useApp } from '../context'
import { api } from '../lib/api'
import ProductCard, { useBuy } from '../components/ProductCard'
import { PageHead } from './About'

const SANDBOX = String(import.meta.env.VITE_PI_SANDBOX ?? 'true') === 'true'

export default function Products() {
  const { t } = useApp()
  const [items, setItems] = useState([])
  const [tab, setTab] = useState('all')
  const [cat, setCat] = useState('')
  const { buy, modal } = useBuy()

  useEffect(() => {
    api.list('products').then(setItems)
  }, [])

  const cats = [...new Set(items.filter((p) => tab === 'all' || p.kind === tab).map((p) => p.category).filter(Boolean))]
  const shown = items.filter((p) => (tab === 'all' || p.kind === tab) && (!cat || p.category === cat))

  return (
    <>
      <PageHead eyebrow="OUR INVENTORY" title={t('products')} lead={t('products_lead')} />
      <section className="section">
        <div className="wrap">
          {SANDBOX && <div className="notice">{t('testnet')}</div>}
          <div className="tabs">
            {[['all', t('all')], ['product', t('product')], ['service', t('service')]].map(([k, l]) => (
              <button key={k} className={tab === k ? 'tab on' : 'tab'} onClick={() => { setTab(k); setCat('') }}>{l}</button>
            ))}
            {cats.length > 1 && (
              <select className="input sel" value={cat} onChange={(e) => setCat(e.target.value)}>
                <option value="">— {t('all')} —</option>
                {cats.map((c) => <option key={c}>{c}</option>)}
              </select>
            )}
          </div>
          <div className="grid g3">
            {shown.map((p) => <ProductCard key={p.id} p={p} onBuy={buy} />)}
          </div>
        </div>
      </section>
      {modal}
    </>
  )
}
