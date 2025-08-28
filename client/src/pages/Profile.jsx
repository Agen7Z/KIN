import React, { useEffect, useState } from 'react'
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
        const res = await fetch('/api/orders/mine', { headers: { Authorization: `Bearer ${token}` } })
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

  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      <div className="max-w-5xl mx-auto px-6 pt-28 pb-16">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Your profile</h1>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
        {user && (
          <div className="mt-4 text-gray-700">
            <p><span className="font-medium">Name:</span> {user.username || user.name}</p>
            <p><span className="font-medium">Email:</span> {user.email}</p>
          </div>
        )}

        <h2 className="mt-10 text-xl font-semibold text-gray-900">Your orders</h2>
        {loading && <p className="text-gray-600 mt-2">Loading orders…</p>}
        {error && <p className="text-red-600 mt-2">{error}</p>}
        {!loading && !error && orders.length === 0 && (
          <p className="text-gray-600 mt-2">No orders yet.</p>
        )}
        <div className="mt-6 space-y-4">
          {orders.map((o) => (
            <div key={o._id} className="border border-gray-200 p-4">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">Order #{o._id.slice(-6)}</p>
                  <p className="text-sm text-gray-600">Status: {o.status}</p>
                  {o.trackingNumber && (<p className="text-sm text-gray-600">Tracking: {o.trackingNumber}</p>)}
                </div>
                <div className="text-right">
                  <p className="text-gray-900 font-semibold">Rs. {Number(o.total).toFixed(2)}</p>
                  <p className="text-sm text-gray-600">{new Date(o.createdAt).toLocaleString()}</p>
                  <a href={`/orders/${o._id}`} className="inline-block mt-2 px-3 py-1 text-sm rounded bg-gray-900 text-white hover:bg-black">Track Order</a>
                </div>
              </div>
              <div className="mt-3 divide-y divide-gray-100">
                {o.items.map((it, idx) => (
                  <div key={idx} className="py-2 flex items-center gap-3">
                    {it.image && <img src={it.image} alt={it.name} className="w-12 h-12 object-cover" />}
                    <div className="flex-1">
                      <p className="text-gray-900">{it.name}</p>
                      <p className="text-sm text-gray-600">Qty {it.quantity} · ${Number(it.price).toFixed(2)}</p>
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

export default Profile


