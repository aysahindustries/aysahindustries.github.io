import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context'
import { api } from '../lib/api'
import Carousel from '../components/Carousel'
import ProductCard, { useBuy } from '../components/ProductCard'

export default function Home() {
  const { t, loc, settings } = useApp()
  const [slides, setSlides] = useState([])
  const [products, setProducts] = useState([])
  const { buy, modal } = useBuy()

  useEffect(() => {
    api.list('slides', { orderBy: 'sort', asc: true }).then((r) => setSlides(r.filter((s) => s.active)))
    api.list('products').then(setProducts)
  }, [])

  const featured = products.filter((p) => p.featured && p.kind === 'product').slice(0, 6)
  const services = products.filter((p) => p.kind === 'service').slice(0, 3)

  return (
    <>
      <Carousel slides={slides} />

      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <div className="eyebrow dark">{t('featured')}</div>
              <h2>{t('our_products')}</h2>
            </div>
            <p className="muted">{t('products_lead')}</p>
          </div>
          <div className="grid g3">
            {featured.map((p) => <ProductCard key={p.id} p={p} onBuy={buy} />)}
          </div>
          <div className="center mt"><Link className="btn btn-dark" to="/products">{t('see_products')} →</Link></div>
        </div>
      </section>

      <section className="section alt">
        <div className="wrap split">
          <div>
            <div className="eyebrow dark">BUILT FOR THE ROAD</div>
            <h2>{t('why_title')}</h2>
            <p className="muted">{loc(settings, 'about_text')}</p>
          </div>
          <div className="grid g3 why">
            {[['why1', 'why1t', '💰'], ['why2', 'why2t', '🔒'], ['why3', 'why3t', '🤝']].map(([a, b, ic]) => (
              <div className="card pad" key={a}>
                <div className="why-ic">{ic}</div>
                <h4>{t(a)}</h4>
                <p className="muted small">{t(b)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {services.length > 0 && (
        <section className="section">
          <div className="wrap">
            <div className="sec-head">
              <div>
                <div className="eyebrow dark">SERVICES</div>
                <h2>{t('our_services')}</h2>
              </div>
              <p className="muted">{t('services_lead')}</p>
            </div>
            <div className="grid g3">
              {services.map((p) => <ProductCard key={p.id} p={p} onBuy={buy} />)}
            </div>
          </div>
        </section>
      )}

      <section className="cta-band">
        <div className="wrap cta-in">
          <div>
            <div className="eyebrow">NEED A HAND?</div>
            <h2>{t('contact_lead')}</h2>
          </div>
          <div className="hero-btns">
            <Link to="/contact" className="btn btn-gold">{t('contact_us')} →</Link>
            <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="btn btn-ghost">📞 {settings.phone}</a>
          </div>
        </div>
      </section>
      {modal}
    </>
  )
}
