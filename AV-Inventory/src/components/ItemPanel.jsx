import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { supabase } from '../utils/supabase'

const EMPTY_FORM = {
  name: '', category_id: '', quantity_total: 1, quantity_available: 1,
  condition: 'Good', location: '', notes: '', requisition_date: ''
}

function conditionBadge(c) {
  if (c === 'Good') return <span className="badge badge-good">Good</span>
  if (c === 'Fair') return <span className="badge badge-fair">Fair</span>
  return <span className="badge badge-repair">Needs Repair</span>
}

function QRModal({ item, onClose }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return
    const text = [
      `Name: ${item.name}`,
      `Location: ${item.location || 'Not specified'}`,
      `Condition: ${item.condition}`,
      `Category: ${item.categories?.name || 'None'}`,
    ].join('\n')

    QRCode.toCanvas(canvasRef.current, text, {
      width: 240,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' }
    })
  }, [item])

  const download = () => {
    const canvas = canvasRef.current
    const link = document.createElement('a')
    link.download = `${item.name.replace(/\s+/g, '_')}_qr.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 340 }}>
        <div className="modal-header">
          <h3>QR Code</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={{ alignItems: 'center', gap: 16 }}>
          <canvas
            ref={canvasRef}
            style={{ borderRadius: 8, display: 'block' }}
          />
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</p>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 12, marginTop: 2 }}>
              {item.location || 'No location set'}
            </p>
          </div>
          <p style={{ fontSize: 11, color: 'var(--color-text-muted)', textAlign: 'center' }}>
            Scan with any phone camera to read item details.
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
          <button className="btn btn-primary" onClick={download}>Download PNG</button>
        </div>
      </div>
    </div>
  )
}

export default function ItemPanel({ items, categories, onRefresh }) {
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [qrItem, setQrItem] = useState(null)

  const openAdd = () => { setForm(EMPTY_FORM); setEditing(null); setError(''); setModal(true) }
  const openEdit = (item) => {
    setForm({
      name: item.name,
      category_id: item.category_id ?? '',
      quantity_total: item.quantity_total,
      quantity_available: item.quantity_available,
      condition: item.condition,
      location: item.location ?? '',
      notes: item.notes ?? '',
      requisition_date: item.requisition_date ?? ''
    })
    setEditing(item.item_id)
    setError('')
    setModal(true)
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = async () => {
    if (!form.name.trim()) { setError('Name is required.'); return }
    setLoading(true)
    setError('')
    const payload = {
      ...form,
      category_id: form.category_id || null,
      quantity_total: Number(form.quantity_total),
      quantity_available: Number(form.quantity_available),
      requisition_date: form.requisition_date || null
    }
    const { error } = editing
      ? await supabase.from('items').update(payload).eq('item_id', editing)
      : await supabase.from('items').insert(payload)
    if (error) setError(error.message)
    else { setModal(false); onRefresh() }
    setLoading(false)
  }

  const remove = async (id) => {
    if (selectedItem?.item_id === id) setSelectedItem(null)
    await supabase.from('items').delete().eq('item_id', id)
    onRefresh()
  }

  const toggleSelect = (item) => {
    setSelectedItem(prev => prev?.item_id === item.item_id ? null : item)
  }

  return (
    <>
      <div className="panel">
        <div className="panel-header">
          <h2>Items</h2>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="count">{items.length}</span>
            {selectedItem && (
              <button className="btn btn-ghost btn-sm btn-appear" onClick={() => setQrItem(selectedItem)}>
                QR Code
              </button>
            )}
            <button className="btn btn-primary btn-sm" onClick={openAdd}>+ Add item</button>
          </div>
        </div>
        <div className="panel-body" style={{ padding: 0 }}>
          <div className="table-wrap">
            {items.length === 0
              ? <p className="empty">No items yet. Add your first piece of equipment.</p>
              : (
                <table>
                  <thead>
                    <tr>
                      <th></th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Qty</th>
                      <th>Available</th>
                      <th>Condition</th>
                      <th>Location</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => {
                      const isSelected = selectedItem?.item_id === item.item_id
                      return (
                        <tr
                          key={item.item_id}
                          onClick={() => toggleSelect(item)}
                          style={{
                            cursor: 'pointer',
                            background: isSelected ? 'var(--color-accent-dim)' : undefined,
                            outline: isSelected ? '1px solid var(--color-accent)' : undefined,
                          }}
                        >
                          <td style={{ width: 32, paddingRight: 0 }}>
                            <div style={{
                              width: 14, height: 14, borderRadius: 3,
                              border: `2px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-border)'}`,
                              background: isSelected ? 'var(--color-accent)' : 'transparent',
                              margin: 'auto'
                            }} />
                          </td>
                          <td style={{ fontWeight: 500 }}>{item.name}</td>
                          <td className="muted">{item.categories?.name ?? '—'}</td>
                          <td>{item.quantity_total}</td>
                          <td>{item.quantity_available}</td>
                          <td>{conditionBadge(item.condition)}</td>
                          <td className="muted">{item.location || '—'}</td>
                          <td onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button className="btn btn-ghost btn-sm" onClick={() => openEdit(item)}>Edit</button>
                              <button className="btn btn-danger btn-sm" onClick={() => remove(item.item_id)}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )
            }
          </div>
        </div>
      </div>

      {modal && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editing ? 'Edit item' : 'Add item'}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="field">
                <label>Name</label>
                <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Shure SM58" />
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Category</label>
                  <select value={form.category_id} onChange={e => set('category_id', e.target.value)}>
                    <option value="">— None —</option>
                    {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Condition</label>
                  <select value={form.condition} onChange={e => set('condition', e.target.value)}>
                    <option>Good</option>
                    <option>Fair</option>
                    <option>Needs Repair</option>
                  </select>
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Total qty</label>
                  <input type="number" min={0} value={form.quantity_total} onChange={e => set('quantity_total', e.target.value)} />
                </div>
                <div className="field">
                  <label>Available qty</label>
                  <input type="number" min={0} value={form.quantity_available} onChange={e => set('quantity_available', e.target.value)} />
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Location</label>
                  <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Shelf A" />
                </div>
                <div className="field">
                  <label>Requisition date</label>
                  <input type="date" value={form.requisition_date} onChange={e => set('requisition_date', e.target.value)} />
                </div>
              </div>
              <div className="field">
                <label>Notes</label>
                <textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any remarks..." />
              </div>
              {error && <p style={{ color: 'var(--color-repair)', fontSize: 12 }}>{error}</p>}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={loading}>
                {loading ? 'Saving…' : 'Save item'}
              </button>
            </div>
          </div>
        </div>
      )}

      {qrItem && <QRModal item={qrItem} onClose={() => setQrItem(null)} />}
    </>
  )
}
