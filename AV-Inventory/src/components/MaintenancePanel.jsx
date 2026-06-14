import { useState } from 'react'
import { supabase } from '../utils/supabase'

const EMPTY_FORM = { item_id: '', reported_by: '', issue: '', status: 'Reported', report_date: '', resolved_date: '' }

function statusBadge(s) {
  const map = {
    'Reported':   'badge-repair',
    'In Repair':  'badge-fair',
    'Resolved':   'badge-good',
    'Written Off':'badge-fair',
  }
  return <span className={`badge ${map[s] ?? ''}`}>{s}</span>
}

export default function MaintenancePanel({ maintenance, items, onRefresh }) {
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const openAdd = () => { setForm(EMPTY_FORM); setEditing(null); setError(''); setModal(true) }
  const openEdit = (log) => {
    setForm({
      item_id: log.item_id,
      reported_by: log.reported_by ?? '',
      issue: log.issue ?? '',
      status: log.status,
      report_date: log.report_date ?? '',
      resolved_date: log.resolved_date ?? ''
    })
    setEditing(log.log_id)
    setError('')
    setModal(true)
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = async () => {
    if (!form.item_id) { setError('Select an item.'); return }
    if (!form.issue.trim()) { setError('Describe the issue.'); return }
    setLoading(true)
    setError('')
    const payload = {
      ...form,
      item_id: Number(form.item_id),
      report_date: form.report_date || null,
      resolved_date: form.resolved_date || null
    }
    const { error } = editing
      ? await supabase.from('maintenance_log').update(payload).eq('log_id', editing)
      : await supabase.from('maintenance_log').insert(payload)
    if (error) setError(error.message)
    else { setModal(false); onRefresh() }
    setLoading(false)
  }

  const remove = async (id) => {
    await supabase.from('maintenance_log').delete().eq('log_id', id)
    onRefresh()
  }

  return (
    <>
      <div className="panel">
        <div className="panel-header">
          <h2>Maintenance log</h2>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="count">{maintenance.length} recent</span>
            <button className="btn btn-primary btn-sm" onClick={openAdd}>+ Log issue</button>
          </div>
        </div>
        <div className="panel-body">
          {maintenance.length === 0
            ? <p className="empty">No maintenance entries yet.</p>
            : (
              <div className="log-list">
                {maintenance.map(log => (
                  <div className="log-entry" key={log.log_id}>
                    <div className="log-top">
                      <span className="log-item">{log.items?.name ?? `Item #${log.item_id}`}</span>
                      {statusBadge(log.status)}
                    </div>
                    <span className="log-issue">{log.issue}</span>
                    <div className="log-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{log.reported_by ? `Reported by ${log.reported_by}` : ''} {log.report_date ? `· ${log.report_date}` : ''}</span>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(log)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => remove(log.log_id)}>Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          }
        </div>
      </div>

      {modal && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editing ? 'Edit log entry' : 'Log an issue'}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="field">
                <label>Item</label>
                <select value={form.item_id} onChange={e => set('item_id', e.target.value)}>
                  <option value="">— Select item —</option>
                  {items.map(i => <option key={i.item_id} value={i.item_id}>{i.name}</option>)}
                </select>
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Reported by</label>
                  <input value={form.reported_by} onChange={e => set('reported_by', e.target.value)} placeholder="Name" />
                </div>
                <div className="field">
                  <label>Status</label>
                  <select value={form.status} onChange={e => set('status', e.target.value)}>
                    <option>Reported</option>
                    <option>In Repair</option>
                    <option>Resolved</option>
                    <option>Written Off</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label>Issue</label>
                <textarea value={form.issue} onChange={e => set('issue', e.target.value)} placeholder="Describe the problem..." />
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Report date</label>
                  <input type="date" value={form.report_date} onChange={e => set('report_date', e.target.value)} />
                </div>
                <div className="field">
                  <label>Resolved date</label>
                  <input type="date" value={form.resolved_date} onChange={e => set('resolved_date', e.target.value)} />
                </div>
              </div>
              {error && <p style={{ color: 'var(--color-repair)', fontSize: 12 }}>{error}</p>}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={loading}>
                {loading ? 'Saving…' : 'Save entry'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
