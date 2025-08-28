import React, { useEffect, useState } from 'react'
import NavBar from '../components/Common/NavBar'

const OrdersList = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const raw = localStorage.getItem('kin_auth')
        const token = raw ? JSON.parse(raw).token : null
        if (!token) throw new Error('Unauthorized')
        const res = await fetch('/api/orders/mine', { headers: { Authorization: `Bearer ${token}` } })
        if (!res.ok) throw new Error('Failed to load orders')
        const json = await res.json()
        setOrders(json?.data?.orders || [])
      } catch (e) {
        setError(e.message || 'Failed to load orders')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const getStatusBadge = (status) => {
    const map = {
      pending: 'bg-amber-100 text-amber-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-emerald-100 text-emerald-800',
      cancelled: 'bg-rose-100 text-rose-800'
    }
    return map[(status || '').toLowerCase()] || 'bg-neutral-100 text-neutral-800'
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <NavBar />
      <div className="max-w-6xl mx-auto px-6 pt-28 pb-20">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 mb-6 tracking-tight">Your Orders</h1>
        {loading && <p className="text-neutral-600">Loading…</p>}
        {error && <p className="text-rose-600">{error}</p>}
        {!loading && !error && orders.length === 0 && (
          <p className="text-neutral-600">You have no orders yet.</p>
        )}

        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o._id} className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="font-semibold text-neutral-900">Order #{o._id.slice(-6)}</p>
                  <p className="text-xs text-neutral-500">{new Date(o.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusBadge(o.status)}`}>{o.status}</span>
                  <p className="font-semibold text-neutral-900 whitespace-nowrap">Rs. {Number(o.total).toFixed(2)}</p>
                  <a href={`/orders/${o._id}`} className="inline-block px-3 py-1.5 rounded-lg text-xs bg-neutral-900 text-white hover:bg-black">View</a>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {o.items.slice(0,3).map((it, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    {it.image && <img src={it.image} alt={it.name} className="w-12 h-12 object-cover rounded-lg border border-neutral-200" />}
                    <div className="min-w-0">
                      <p className="text-sm text-neutral-900 truncate">{it.name}</p>
                      <p className="text-xs text-neutral-600">Qty {it.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default OrdersList


