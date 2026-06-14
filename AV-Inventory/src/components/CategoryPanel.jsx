import { useState } from 'react'
import { supabase } from '../utils/supabase'

export default function CategoryPanel({ categories, onRefresh }) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const add = async () => {
    if (!name.trim()) return
    setLoading(true)
    setError('')
    const { error } = await supabase.from('categories').insert({ name: name.trim() })
    if (error) setError(error.message)
    else { setName(''); onRefresh() }
    setLoading(false)
  }

  const remove = async (id) => {
    await supabase.from('categories').delete().eq('category_id', id)
    onRefresh()
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Categories</h2>
        <span className="count">{categories.length}</span>
      </div>
      <div className="panel-body">
        <div className="input-row">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && add()}
            placeholder="New category name"
          />
          <button className="btn btn-primary" onClick={add} disabled={loading}>
            Add
          </button>
        </div>
        {error && <p style={{ color: 'var(--color-repair)', fontSize: 12, marginBottom: 8 }}>{error}</p>}
        <div className="category-list">
          {categories.length === 0 && <p className="empty">No categories yet.</p>}
          {categories.map(c => (
            <div className="category-row" key={c.category_id}>
              <span>{c.name}</span>
              <button className="btn btn-danger btn-sm" onClick={() => remove(c.category_id)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
