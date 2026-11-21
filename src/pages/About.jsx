import { useApp } from '../context'

export function PageHead({ eyebrow, title, lead }) {
  return (
    <section className="page-head">
      <div className="wrap">
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        {lead && <p>{lead}</p>}
      </div>
    </section>
  )
}

export default function About() {
  const { t, loc, settings } = useApp()
  return (
    <>
      <PageHead eyebrow="ABOUT AYSAH" title={t('about')} lead={loc(settings, 'tagline')} />
      <section className="section">
        <div className="wrap split">
          <div>
            <div className="eyebrow dark">{settings.company_name}</div>
            <h2>{loc(settings, 'about_title')}</h2>
            <p className="lead-p">{loc(settings, 'about_text')}</p>
          </div>
          <div className="about-img" style={{ backgroundImage: `url("${settings.about_image}")` }} />
        </div>
      </section>
      <section className="section alt">
        <div className="wrap grid g2">
          <div className="card pad-lg">
            <div className="why-ic">🎯</div>
            <h3>{t('mission')}</h3>
            <p className="muted">{loc(settings, 'mission')}</p>
          </div>
          <div className="card pad-lg">
            <div className="why-ic">🔭</div>
            <h3>{t('vision')}</h3>
            <p className="muted">{loc(settings, 'vision')}</p>
          </div>
        </div>
      </section>
    </>
  )
}
