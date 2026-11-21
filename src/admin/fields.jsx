import { useState } from 'react'
import { api } from '../lib/api'

export function ImageField({ label, value, onChange, hint }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const pick = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) return setErr('Max 5 MB')
    setErr('')
    setBusy(true)
    try {
      onChange(await api.upload(file))
    } catch (e2) {
      setErr(e2.message)
    } finally {
      setBusy(false)
      e.target.value = ''
    }
  }
  return (
    <div className="field">
      <span className="flabel">{label}</span>
      <div className="img-field">
        <div className="img-prev" style={{ backgroundImage: value ? `url("${value}")` : 'none' }}>{!value && 'No image'}</div>
        <div className="img-actions">
          <label className="btn btn-ghost-dark sm">
            {busy ? 'Uploading…' : 'Upload image'}
            <input type="file" accept="image/*" hidden onChange={pick} />
          </label>
          <input className="input sm" placeholder="…or paste image URL" value={value || ''} onChange={(e) => onChange(e.target.value)} />
          {hint && <span className="tiny muted">{hint}</span>}
          {err && <span className="err tiny">{err}</span>}
        </div>
      </div>
    </div>
  )
}

/** Render one field from a schema entry: {k, label, type, options, hint, full} */
export function Field({ f, value, onChange }) {
  if (f.type === 'image') return <ImageField label={f.label} value={value} onChange={onChange} hint={f.hint} />
  if (f.type === 'checkbox')
    return (
      <label className="check">
        <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} /> {f.label}
      </label>
    )
  return (
    <label className={'field' + (f.full ? ' full' : '')}>
      <span className="flabel">{f.label}</span>
      {f.type === 'textarea' ? (
        <textarea className="input" rows={f.rows || 4} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
      ) : f.type === 'select' ? (
        <select className="input" value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
          {f.options.map((o) => (
            <option key={o.v ?? o} value={o.v ?? o}>{o.l ?? o}</option>
          ))}
        </select>
      ) : (
        <input
          className="input"
          type={f.type === 'number' ? 'number' : f.type === 'color' ? 'color' : 'text'}
          step={f.type === 'number' ? 'any' : undefined}
          value={value ?? ''}
          onChange={(e) => onChange(f.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)}
        />
      )}
      {f.hint && <span className="tiny muted">{f.hint}</span>}
    </label>
  )
}
