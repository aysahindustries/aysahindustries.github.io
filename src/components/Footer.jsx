import { Link } from 'react-router-dom'
import { useApp } from '../context'
import MapEmbed from './MapEmbed'

export default function Footer() {
  const { settings, t, loc } = useApp()
  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div>
          <div className="footer-logo"><img src={settings.logo_url} alt={settings.company_name} /></div>
          <p className="muted-light">{loc(settings, 'footer_text')}</p>
          <div className="socials">
            {settings.facebook && <a href={settings.facebook} target="_blank" rel="noreferrer">Facebook</a>}
            {settings.instagram && <a href={settings.instagram} target="_blank" rel="noreferrer">Instagram</a>}
            {settings.whatsapp && <a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noreferrer">WhatsApp</a>}
          </div>
        </div>
        <div>
          <h4>{t('quick_links')}</h4>
          <ul className="flinks">
            <li><Link to="/">{t('home')}</Link></li>
            <li><Link to="/about">{t('about')}</Link></li>
            <li><Link to="/team">{t('team')}</Link></li>
            <li><Link to="/products">{t('products')}</Link></li>
            <li><Link to="/contact">{t('contact')}</Link></li>
          </ul>
        </div>
        <div>
          <h4>{t('contact')}</h4>
          <ul className="flinks">
            <li>📍 {settings.address}</li>
            <li>📞 <a href={`tel:${settings.phone.replace(/\s/g, '')}`}>{settings.phone}</a></li>
            <li>✉️ <a href={`mailto:${settings.email}`}>{settings.email}</a></li>
            <li>🕗 {settings.opening_hours}</li>
          </ul>
        </div>
        <div>
          <h4>{t('find_us')}</h4>
          <MapEmbed settings={settings} height={170} />
        </div>
      </div>
      <div className="footer-bottom">
        <div className="wrap fb-in">
          <span><b>{settings.company_name}</b> | {loc(settings, 'tagline')}</span>
          <span>
            © {new Date().getFullYear()} {settings.company_name}. {t('rights')} ·{' '}
            <a href="./privacy.html">Privacy Policy</a> · <a href="./terms.html">Terms of Service</a>
          </span>
        </div>
      </div>
    </footer>
  )
}
