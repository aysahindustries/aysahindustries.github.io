import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'
import { Field } from './fields'

/**
 * Generic list + add/edit/delete screen for one table.
 * fields: form schema; columns: [{label, render(row)}]; defaults: new-row values
 */
export default function Crud({ table, title, fields, columns, defaults = {}, orderBy = 'created_at', asc = false }) {
  const [rows, setRows] = useState([])
  const [edit, setEdit] = useState(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const load = useCallback(() => api.list(table, { orderBy, asc }).then(setRows).catch((e) => setErr(e.message)), [table, orderBy, asc])
  useEffect(() => {
    load()
  }, [load])

  const save = async (e) => {
    e.preventDefault()
    setBusy(true)
    setErr('')
    try {
      const { id, created_at, ...data } = edit
      if (id) await api.update(table, id, data)
      else await api.insert(table, data)
      setEdit(null)
      load()
    } catch (e2) {
      setErr(e2.message)
    } finally {
      setBusy(false)
    }
  }
  const del = async (r) => {
    await api.remove(table, r.id).catch((e) => setErr(e.message))
    load()
  }

  return (
    <div>
      <div className="adm-head">
        <h2>{title}</h2>
        <button className="btn btn-dark sm" onClick={() => setEdit({ ...defaults })}>+ Add new</button>
      </div>
      {err && <div className="err">{err}</div>}
      <div className="card table-wrap">
        <table className="table">
          <thead>
            <tr>{columns.map((c) => <th key={c.label}>{c.label}</th>)}<th /></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                {columns.map((c) => <td key={c.label}>{c.render(r)}</td>)}
                <td className="nowrap right">
                  <button className="btn btn-ghost-dark sm" onClick={() => setEdit({ ...r })}>Edit</button>{' '}
                  <ConfirmBtn onConfirm={() => del(r)} />
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr><td colSpan={columns.length + 1} className="muted center">Nothing yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {edit && (
        <div className="modal-bg">
          <form className="modal wide form" onSubmit={save}>
            <h3>{edit.id ? 'Edit' : 'Add'} – {title}</h3>
            <div className="form-grid">
              {fields.map((f) => (
                <Field key={f.k} f={f} value={edit[f.k]} onChange={(v) => setEdit({ ...edit, [f.k]: v })} />
              ))}
            </div>
            {err && <div className="err">{err}</div>}
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost-dark" onClick={() => setEdit(null)}>Cancel</button>
              <button className="btn btn-dark" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export const Thumb = ({ src, round }) => (
  <div className={'thumb' + (round ? ' round' : '')} style={{ backgroundImage: src ? `url("${src}")` : 'none' }} />
)

/** Two-step delete button (no browser pop-up): click once, then "Sure?" to confirm. */
export function ConfirmBtn({ onConfirm, label = 'Delete' }) {
  const [ask, setAsk] = useState(false)
  useEffect(() => {
    if (!ask) return
    const id = setTimeout(() => setAsk(false), 3000)
    return () => clearTimeout(id)
  }, [ask])
  return (
    <button type="button" className="btn btn-danger sm" onClick={() => (ask ? (setAsk(false), onConfirm()) : setAsk(true))}>
      {ask ? 'Sure? Click again' : label}
    </button>
  )
}
