import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context'

export default function Carousel({ slides }) {
  const { t, loc } = useApp()
  const [i, setI] = useState(0)
  const n = slides.length
  useEffect(() => {
    if (n < 2) return
    const id = setInterval(() => setI((x) => (x + 1) % n), 6000)
    return () => clearInterval(id)
  }, [n])
  if (!n) return null
  return (
    <section className="hero">
      {slides.map((s, k) => (
        <div key={s.id} className={'hero-slide' + (k === i ? ' on' : '')} style={{ backgroundImage: `url("${s.image_url}")` }} />
      ))}
      <div className="hero-shade" />
      <div className="wrap hero-in">
        <div className="eyebrow">STRENGTH IN EVERY VEHICLE</div>
        <h1>
          {loc(slides[i], 'title')}
          <br />
          <span className="gold">{loc(slides[i], 'title2')}</span>
        </h1>
        <p className="hero-text">{loc(slides[i], 'text')}</p>
        <div className="hero-btns">
          <Link to="/products" className="btn btn-gold">{t('see_products')} →</Link>
          <Link to="/about" className="btn btn-ghost">{t('learn_more')}</Link>
        </div>
        {n > 1 && (
          <div className="dots">
            {slides.map((s, k) => (
              <button key={s.id} className={k === i ? 'dot on' : 'dot'} onClick={() => setI(k)} aria-label={`Slide ${k + 1}`} />
            ))}
          </div>
        )}
      </div>
      {n > 1 && (
        <>
          <button className="arrow left" onClick={() => setI((i - 1 + n) % n)} aria-label="Previous">‹</button>
          <button className="arrow right" onClick={() => setI((i + 1) % n)} aria-label="Next">›</button>
        </>
      )}
    </section>
  )
}
