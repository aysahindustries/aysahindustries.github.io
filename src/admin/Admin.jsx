import { useEffect, useState } from 'react'
import { Link, NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import { useApp } from '../context'
import { api, MODE } from '../lib/api'
import Crud, { Thumb, ConfirmBtn } from './Crud'
import { Field } from './fields'
import MapEmbed from '../components/MapEmbed'
import { StatusBadge } from '../pages/Account'

const STATUSES = ['pending', 'requested', 'approved', 'paid', 'processing', 'delivered', 'cancelled']
const fmt = (d) => (d ? new Date(d).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : '')

export default function Admin() {
  const { settings, user } = useApp()
  const nav = useNavigate()
  const [open, setOpen] = useState(false)
  const items = [
    ['', '📊 Dashboard'], ['settings', '⚙️ Site settings'], ['slides', '🖼️ Carousel'], ['products', '🚚 Products & services'],
    ['team', '👥 Team'], ['orders', '🧾 Orders'], ['messages', '✉️ Messages'], ['clients', '🙍 Clients'],
  ]
  return (
    <div className="adm">
      <aside className={open ? 'adm-side open' : 'adm-side'} onClick={() => setOpen(false)}>
        <Link to="/" className="adm-logo"><img src={settings.logo_url} alt="" /></Link>
        <nav>
          {items.map(([to, l]) => (
            <NavLink key={to} to={'/admin' + (to ? '/' + to : '')} end={!to} className="adm-link">{l}</NavLink>
          ))}
        </nav>
        <div className="adm-foot">
          <div className="tiny">{user.email}</div>
          <Link to="/" className="adm-link">← View website</Link>
          <button className="adm-link linkbtn" onClick={async () => { await api.auth.signOut(); nav('/') }}>Sign out</button>
          {MODE === 'demo' && <div style={{ padding: '6px 12px' }}><ConfirmBtn label="Reset demo data" onConfirm={() => api.resetDemo()} /></div>}
        </div>
      </aside>
      <div className="adm-main">
        <div className="adm-top">
          <button className="burger dark" onClick={() => setOpen(!open)}><span /><span /><span /></button>
          <b>{settings.company_name} – Admin</b>
          {MODE === 'demo' && <span className="demo-pill">DEMO MODE</span>}
        </div>
        <div className="adm-body">
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="settings" element={<Settings />} />
            <Route path="slides" element={<Slides />} />
            <Route path="products" element={<Products />} />
            <Route path="team" element={<TeamAdmin />} />
            <Route path="orders" element={<Orders />} />
            <Route path="messages" element={<Messages />} />
            <Route path="clients" element={<Clients />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

function Dashboard() {
  const [s, setS] = useState(null)
  useEffect(() => {
    Promise.all(['products', 'orders', 'messages', 'profiles'].map((t) => api.list(t))).then(([p, o, m, c]) =>
      setS({
        products: p.length,
        orders: o.length,
        paid: o.filter((x) => ['paid', 'processing', 'delivered'].includes(x.status)).reduce((a, x) => a + Number(x.amount_pi || 0), 0),
        unread: m.filter((x) => !x.read).length,
        clients: c.filter((x) => x.role !== 'admin').length,
        recent: o.slice(0, 6),
      }),
    )
  }, [])
  if (!s) return <div className="spinner" />
  return (
    <div>
      <div className="adm-head"><h2>Dashboard</h2></div>
      <div className="stats">
        <div className="card stat"><span>Products & services</span><b>{s.products}</b></div>
        <div className="card stat"><span>Orders</span><b>{s.orders}</b></div>
        <div className="card stat"><span>Received (Pi)</span><b>{s.paid} π</b></div>
        <div className="card stat"><span>Unread messages</span><b>{s.unread}</b></div>
        <div className="card stat"><span>Clients</span><b>{s.clients}</b></div>
      </div>
      <h3 className="mt">Latest orders</h3>
      <div className="card table-wrap">
        <table className="table">
          <thead><tr><th>Date</th><th>Client</th><th>Item</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>
            {s.recent.map((o) => (
              <tr key={o.id}><td>{fmt(o.created_at)}</td><td>{o.customer_name || o.customer_email}</td><td>{o.product_name}</td><td>{o.amount_pi ? o.amount_pi + ' π' : '—'}</td><td><StatusBadge s={o.status} /></td></tr>
            ))}
            {!s.recent.length && <tr><td colSpan={5} className="muted center">No orders yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const SETTINGS_GROUPS = [
  ['Branding', [
    { k: 'company_name', label: 'Company name' },
    { k: 'tagline_rw', label: 'Tagline (Kinyarwanda)' }, { k: 'tagline_en', label: 'Tagline (English)' },
    { k: 'logo_url', label: 'Logo', type: 'image', hint: 'Wide PNG with transparent or white background works best.' },
    { k: 'favicon_url', label: 'Favicon (browser tab icon)', type: 'image', hint: 'Square image, at least 64×64.' },
    { k: 'primary_color', label: 'Main colour', type: 'color' }, { k: 'accent_color', label: 'Accent colour', type: 'color' },
  ]],
  ['Contact & map', [
    { k: 'owner_name', label: 'Owner' }, { k: 'email', label: 'Email' }, { k: 'phone', label: 'Phone' },
    { k: 'whatsapp', label: 'WhatsApp number (digits only, e.g. 250784578722)' },
    { k: 'address', label: 'Address' }, { k: 'opening_hours', label: 'Opening hours' },
    { k: 'map_embed_url', label: 'Google Maps embed link', full: true, hint: 'Google Maps → Share → Embed a map → copy and paste the whole code or link here. Leave empty to use the address.' },
  ]],
  ['About page', [
    { k: 'about_title_rw', label: 'Title (RW)' }, { k: 'about_title_en', label: 'Title (EN)' },
    { k: 'about_text_rw', label: 'About text (RW)', type: 'textarea', full: true }, { k: 'about_text_en', label: 'About text (EN)', type: 'textarea', full: true },
    { k: 'mission_rw', label: 'Mission (RW)', type: 'textarea' }, { k: 'mission_en', label: 'Mission (EN)', type: 'textarea' },
    { k: 'vision_rw', label: 'Vision (RW)', type: 'textarea' }, { k: 'vision_en', label: 'Vision (EN)', type: 'textarea' },
    { k: 'about_image', label: 'About photo', type: 'image' },
  ]],
  ['Footer & social', [
    { k: 'footer_text_rw', label: 'Footer text (RW)' }, { k: 'footer_text_en', label: 'Footer text (EN)' },
    { k: 'facebook', label: 'Facebook link' }, { k: 'instagram', label: 'Instagram link' },
  ]],
]

function Settings() {
  const { settings, setSettings } = useApp()
  const [s, setS] = useState(settings)
  const [msg, setMsg] = useState('')
  const save = async (e) => {
    e.preventDefault()
    setMsg('Saving…')
    try {
      await api.saveSettings(s)
      setSettings(s)
      setMsg('Saved ✓')
    } catch (err) {
      setMsg('Error: ' + err.message)
    }
    setTimeout(() => setMsg(''), 3000)
  }
  return (
    <form onSubmit={save} className="form">
      <div className="adm-head sticky">
        <h2>Site settings</h2>
        <div><span className="small muted">{msg}</span> <button className="btn btn-dark sm">Save changes</button></div>
      </div>
      {SETTINGS_GROUPS.map(([g, fields]) => (
        <div className="card pad-lg mb" key={g}>
          <h3>{g}</h3>
          <div className="form-grid">
            {fields.map((f) => <Field key={f.k} f={f} value={s[f.k]} onChange={(v) => setS({ ...s, [f.k]: v })} />)}
          </div>
          {g === 'Contact & map' && <div className="mt-s"><span className="flabel">Map preview (shown in footer and Contact page)</span><MapEmbed settings={s} height={240} /></div>}
        </div>
      ))}
    </form>
  )
}

function Slides() {
  return (
    <Crud table="slides" title="Home carousel" orderBy="sort" asc defaults={{ active: true, sort: 10 }}
      fields={[
        { k: 'image_url', label: 'Photo', type: 'image', hint: 'Wide photo, 1600×900 recommended.' },
        { k: 'title_rw', label: 'Title line 1 (RW)' }, { k: 'title2_rw', label: 'Title line 2 – gold (RW)' },
        { k: 'title_en', label: 'Title line 1 (EN)' }, { k: 'title2_en', label: 'Title line 2 – gold (EN)' },
        { k: 'text_rw', label: 'Text (RW)', type: 'textarea', rows: 2 }, { k: 'text_en', label: 'Text (EN)', type: 'textarea', rows: 2 },
        { k: 'sort', label: 'Order (1 = first)', type: 'number' }, { k: 'active', label: 'Show on website', type: 'checkbox' },
      ]}
      columns={[
        { label: 'Photo', render: (r) => <Thumb src={r.image_url} /> },
        { label: 'Title', render: (r) => <><b>{r.title_rw}</b> <span className="muted">{r.title2_rw}</span></> },
        { label: 'Order', render: (r) => r.sort },
        { label: 'Visible', render: (r) => (r.active ? '✓' : '—') },
      ]}
    />
  )
}

function Products() {
  return (
    <Crud table="products" title="Products & services" defaults={{ kind: 'product', available: true, featured: false, price_pi: 0 }}
      fields={[
        { k: 'kind', label: 'Type', type: 'select', options: [{ v: 'product', l: 'Product (for sale)' }, { v: 'service', l: 'Service' }] },
        { k: 'category', label: 'Category (e.g. SUV, Truck, Trailer)' },
        { k: 'name', label: 'Name', full: true },
        { k: 'description_rw', label: 'Description (RW)', type: 'textarea', rows: 3 }, { k: 'description_en', label: 'Description (EN)', type: 'textarea', rows: 3 },
        { k: 'price_pi', label: 'Price in Pi', type: 'number', hint: '0 = "price on request" (client sends a request instead of paying).' },
        { k: 'image_url', label: 'Photo', type: 'image' },
        { k: 'available', label: 'Available', type: 'checkbox' }, { k: 'featured', label: 'Show on home page', type: 'checkbox' },
      ]}
      columns={[
        { label: 'Photo', render: (r) => <Thumb src={r.image_url} /> },
        { label: 'Name', render: (r) => <><b>{r.name}</b><div className="tiny muted">{r.category}</div></> },
        { label: 'Type', render: (r) => r.kind },
        { label: 'Price', render: (r) => (r.price_pi > 0 ? r.price_pi + ' π' : 'on request') },
        { label: 'Status', render: (r) => (r.available ? 'Available' : 'Sold') + (r.featured ? ' · ★' : '') },
      ]}
    />
  )
}

function TeamAdmin() {
  return (
    <Crud table="team" title="Team" orderBy="sort" asc defaults={{ sort: 10 }}
      fields={[
        { k: 'name', label: 'Full name' }, { k: 'sort', label: 'Order', type: 'number' },
        { k: 'role_rw', label: 'Role (RW)' }, { k: 'role_en', label: 'Role (EN)' },
        { k: 'bio_rw', label: 'Short bio (RW)', type: 'textarea', rows: 2 }, { k: 'bio_en', label: 'Short bio (EN)', type: 'textarea', rows: 2 },
        { k: 'email', label: 'Email' }, { k: 'phone', label: 'Phone' },
        { k: 'photo_url', label: 'Photo', type: 'image' },
      ]}
      columns={[
        { label: 'Photo', render: (r) => <Thumb src={r.photo_url} round /> },
        { label: 'Name', render: (r) => <b>{r.name}</b> },
        { label: 'Role', render: (r) => r.role_en || r.role_rw },
        { label: 'Order', render: (r) => r.sort },
      ]}
    />
  )
}

function Orders() {
  const [rows, setRows] = useState([])
  const [f, setF] = useState('')
  const load = () => api.list('orders').then(setRows)
  useEffect(() => {
    load()
  }, [])
  const upd = async (o, patch) => {
    await api.update('orders', o.id, patch)
    load()
  }
  const shown = rows.filter((o) => !f || o.status === f)
  return (
    <div>
      <div className="adm-head">
        <h2>Orders & requests</h2>
        <select className="input sel" value={f} onChange={(e) => setF(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div className="card table-wrap">
        <table className="table">
          <thead><tr><th>Date</th><th>Client</th><th>Item</th><th>Amount</th><th>Status</th><th>Note to client</th></tr></thead>
          <tbody>
            {shown.map((o) => (
              <tr key={o.id}>
                <td className="nowrap">{fmt(o.created_at)}</td>
                <td><b>{o.customer_name}</b><div className="tiny muted">{o.customer_email}<br />{o.customer_phone}</div></td>
                <td>{o.product_name}<div className="tiny muted">{o.kind}{o.txid && <> · tx {String(o.txid).slice(0, 10)}…</>}</div></td>
                <td className="nowrap">{o.amount_pi ? o.amount_pi + ' π' : '—'}</td>
                <td>
                  <select className="input sm" value={o.status} onChange={(e) => upd(o, { status: e.target.value })}>
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td><input className="input sm" defaultValue={o.admin_note || ''} onBlur={(e) => e.target.value !== (o.admin_note || '') && upd(o, { admin_note: e.target.value })} placeholder="e.g. delivery on Monday" /></td>
              </tr>
            ))}
            {!shown.length && <tr><td colSpan={6} className="muted center">No orders.</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="tiny muted">"paid" is set automatically after a Pi payment is completed. Change to processing / delivered as you serve the client – they see it in their account.</p>
    </div>
  )
}

function Messages() {
  const [rows, setRows] = useState([])
  const load = () => api.list('messages').then(setRows)
  useEffect(() => {
    load()
  }, [])
  return (
    <div>
      <div className="adm-head"><h2>Contact messages</h2></div>
      <div className="msgs">
        {rows.map((m) => (
          <div key={m.id} className={'card pad msg' + (m.read ? '' : ' unread')}>
            <div className="msg-head">
              <div><b>{m.name}</b> <span className="muted small">· {m.email} {m.phone && '· ' + m.phone}</span></div>
              <span className="tiny muted">{fmt(m.created_at)}</span>
            </div>
            {m.subject && <div className="kicker">{m.subject}</div>}
            <p>{m.message}</p>
            <div className="msg-actions">
              <a className="btn btn-dark sm" href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject || 'AYSAH INDUSTRIES')}`}>Reply by email</a>
              {!m.read && <button className="btn btn-ghost-dark sm" onClick={() => api.update('messages', m.id, { read: true }).then(load)}>Mark as read</button>}
              <ConfirmBtn onConfirm={() => api.remove('messages', m.id).then(load)} />
            </div>
          </div>
        ))}
        {!rows.length && <p className="muted">No messages yet.</p>}
      </div>
    </div>
  )
}

function Clients() {
  const [rows, setRows] = useState([])
  const [orders, setOrders] = useState([])
  const load = () => Promise.all([api.list('profiles'), api.list('orders')]).then(([p, o]) => { setRows(p); setOrders(o) })
  useEffect(() => {
    load()
  }, [])
  return (
    <div>
      <div className="adm-head"><h2>Clients</h2></div>
      <div className="card table-wrap">
        <table className="table">
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Orders</th><th>Joined</th><th>Role</th></tr></thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id}>
                <td><b>{p.full_name}</b></td><td>{p.email}</td><td>{p.phone}</td>
                <td>{orders.filter((o) => o.user_id === p.id).length}</td>
                <td className="nowrap">{fmt(p.created_at)}</td>
                <td>
                  <select className="input sm" value={p.role} onChange={(e) => api.auth.updateProfile(p.id, { role: e.target.value }).then(load)}>
                    <option value="client">client</option><option value="admin">admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
