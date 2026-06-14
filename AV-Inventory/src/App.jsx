import { useEffect, useMemo, useState } from 'react'
import { supabase } from './utils/supabase'
import CategoryPanel from './components/CategoryPanel'
import ItemPanel from './components/ItemPanel'
import MaintenancePanel from './components/MaintenancePanel'
import LoginScreen from './components/LoginScreen'
import './index.css'

export default function App() {
  const [session, setSession] = useState(undefined)
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [maintenance, setMaintenance] = useState([])
  const [error, setError] = useState('')

  // Auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  const load = async () => {
    const [cr, ir, mr] = await Promise.all([
      supabase.from('categories').select('category_id, name').order('name'),
      supabase.from('items').select('item_id, name, category_id, quantity_total, quantity_available, condition, location, notes, requisition_date, categories(name)').order('name'),
      supabase.from('maintenance_log').select('log_id, item_id, reported_by, issue, status, report_date, resolved_date, items(name)').order('report_date', { ascending: false }).limit(20),
    ])
    if (cr.error || ir.error || mr.error) {
      setError((cr.error || ir.error || mr.error).message)
      return
    }
    setCategories(cr.data)
    setItems(ir.data)
    setMaintenance(mr.data)
  }

  useEffect(() => {
    if (session) void load()
  }, [session])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const stats = useMemo(() => ({
    categories: categories.length,
    items: items.length,
    unavailable: items.filter(i => Number(i.quantity_available) < Number(i.quantity_total)).length,
    repair: items.filter(i => i.condition === 'Needs Repair').length,
  }), [categories, items])

  // Still checking session on first load
  if (session === undefined) return null

  // Not logged in
  if (!session) return <LoginScreen />

  return (
    <div className="shell">
      <div className="topbar">
        <div className="topbar-title">
          <span>Community Centre</span>
          <h1>AV Inventory</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="status-pill">
            <span className={`status-dot ${error ? 'error' : ''}`} />
            {error ? 'Connection error' : 'Live'}
          </div>
          <button className="btn btn-ghost btn-sm" onClick={signOut}>Sign out</button>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card"><span>Categories</span><strong>{stats.categories}</strong></div>
        <div className="stat-card"><span>Items</span><strong>{stats.items}</strong></div>
        <div className="stat-card"><span>Partially out</span><strong>{stats.unavailable}</strong></div>
        <div className="stat-card"><span>Needs repair</span><strong>{stats.repair}</strong></div>
      </div>

      {error && (
        <div style={{ background: 'var(--color-repair-dim)', border: '1px solid var(--color-repair)', borderRadius: 8, padding: '12px 16px', marginBottom: 20, color: 'var(--color-repair)', fontSize: 13 }}>
          {error}
        </div>
      )}

      <div className="panels">
        <CategoryPanel categories={categories} onRefresh={load} />
        <div className="right-panel">
          <ItemPanel items={items} categories={categories} onRefresh={load} />
          <MaintenancePanel maintenance={maintenance} items={items} onRefresh={load} />
        </div>
      </div>
    </div>
  )
}
