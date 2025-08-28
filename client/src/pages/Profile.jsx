import React, { useEffect, useState } from 'react'
import apiFetch from '../utils/api'
import NavBar from '../components/Common/NavBar'
import { useAuth } from '../hooks/useAuth'

const Profile = () => {
  const { user, logout } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const raw = localStorage.getItem('kin_auth')
        const parsed = raw ? JSON.parse(raw) : null
        const token = parsed?.token
        if (!token) throw new Error('Unauthorized')
        const res = await apiFetch('/api/orders/mine', { headers: { Authorization: `Bearer ${token}` } })
        if (!res.ok) throw new Error('Failed to load orders')
        const json = await res.json()
        setOrders(json?.data?.orders || [])
      } catch (e) {
        setError(e.message || 'Failed to load')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const getOrderStatus = (status) => {
    const map = {
      pending: { label: 'Pending', bg: 'bg-amber-100', color: 'text-amber-800', ring: 'ring-amber-200' },
      processing: { label: 'Processing', bg: 'bg-blue-100', color: 'text-blue-800', ring: 'ring-blue-200' },
      shipped: { label: 'Shipped', bg: 'bg-indigo-100', color: 'text-indigo-800', ring: 'ring-indigo-200' },
      delivered: { label: 'Delivered', bg: 'bg-emerald-100', color: 'text-emerald-800', ring: 'ring-emerald-200' },
      cancelled: { label: 'Cancelled', bg: 'bg-rose-100', color: 'text-rose-800', ring: 'ring-rose-200' }
    }
    return map[(status || '').toLowerCase()] || { label: status || 'Unknown', bg: 'bg-neutral-100', color: 'text-neutral-800', ring: 'ring-neutral-200' }
  }

  const totalOrders = orders.length
  const totalSpent = orders.reduce((sum, o) => sum + Number(o.total || 0), 0)
  const topThree = orders.slice(0, 3)

  return (
    <div className="min-h-screen bg-neutral-50">
      <NavBar />
      <div className="max-w-6xl mx-auto px-6 pt-28 pb-20">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-50 via-white to-neutral-50" />
          <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-neutral-900 text-white flex items-center justify-center text-2xl font-bold shadow-sm">
                {(user?.username || user?.name || 'U').slice(0, 1).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">{user?.username || user?.name || 'User'}</h1>
                <p className="text-neutral-600">{user?.email}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ring-1 bg-emerald-50 text-emerald-800 ring-emerald-200">
                    <span className="inline-block w-2 h-2 rounded-full bg-current opacity-70" />
                    Active Member
                  </span>
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ring-1 bg-neutral-100 text-neutral-800 ring-neutral-200">{totalOrders} Orders</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a href="/orders" className="px-4 py-2 rounded-xl ring-1 ring-neutral-300 text-neutral-800 hover:bg-neutral-100 transition">View Orders</a>
              <button onClick={logout} className="px-4 py-2 rounded-xl bg-neutral-900 text-white hover:bg-black transition">Logout</button>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Account */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Account Information</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Name</span>
                  <span className="font-medium text-neutral-900">{user?.username || user?.name || '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Email</span>
                  <span className="font-medium text-neutral-900">{user?.email || '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Orders</span>
                  <span className="font-medium text-neutral-900">{totalOrders}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Total Spent</span>
                  <span className="font-semibold text-neutral-900">Rs. {totalSpent.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Orders */}
          <div id="orders" className="lg:col-span-2">
            <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-neutral-900">Recent Orders</h2>
                <a href="/orders" className="text-sm text-neutral-700 hover:text-neutral-900">View all</a>
              </div>
              {loading && (
                <div className="animate-pulse space-y-3">
                  <div className="h-16 bg-neutral-100 rounded-xl" />
                  <div className="h-16 bg-neutral-100 rounded-xl" />
                </div>
              )}
              {error && <p className="text-rose-600">{error}</p>}
              {!loading && !error && orders.length === 0 && (
                <p className="text-neutral-600">No orders yet.</p>
              )}
              <div className="mt-2 space-y-4">
                {topThree.map((o) => (
                  <div key={o._id} className="rounded-2xl border border-neutral-200 p-4 hover:shadow-sm transition">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-neutral-900">Order #{o._id.slice(-6)}</p>
                        <p className="text-xs text-neutral-500">{new Date(o.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-3 sm:text-right">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ring-1 ${getOrderStatus(o.status).bg} ${getOrderStatus(o.status).color} ${getOrderStatus(o.status).ring}`}>
                          {getOrderStatus(o.status).label}
                        </span>
                        <p className="font-semibold text-neutral-900 whitespace-nowrap">Rs. {Number(o.total).toFixed(2)}</p>
                        <a href={`/orders/${o._id}`} className="inline-block px-3 py-1.5 rounded-lg text-xs bg-neutral-900 text-white hover:bg-black">Track</a>
                      </div>
                    </div>
                    <div className="mt-3 divide-y divide-neutral-100">
                      {o.items.slice(0,3).map((it, idx) => (
                        <div key={idx} className="py-2 flex items-center gap-3">
                          {it.image && <img src={it.image} alt={it.name} className="w-12 h-12 object-cover rounded-lg border border-neutral-200" />}
                          <div className="flex-1 min-w-0">
                            <p className="text-neutral-900 truncate">{it.name}</p>
                            <p className="text-xs text-neutral-600">Qty {it.quantity} · Rs. {Number(it.price).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        
      </div>
    </div>
  )
}

export default Profile


