import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import NavBar from '../components/Common/NavBar'

const OrderDetail = () => {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const raw = localStorage.getItem('kin_auth')
        const token = raw ? JSON.parse(raw).token : null
        const res = await fetch(`/api/orders/${id}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
        if (!res.ok) throw new Error('Failed to load order')
        const json = await res.json()
        setOrder(json?.data?.order || null)
      } catch (e) {
        setError(e.message || 'Failed to load order')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const getPaymentStatus = (order) => {
    if (order.paymentInfo?.provider === 'khalti') {
      return { status: 'Paid', color: 'text-green-600', bg: 'bg-green-50' }
    } else if (order.paymentInfo?.provider === 'cod') {
      return { status: 'Pending Payment', color: 'text-yellow-600', bg: 'bg-yellow-50' }
    }
    return { status: 'Unknown', color: 'text-gray-600', bg: 'bg-gray-50' }
  }

  const getPaymentMethod = (order) => {
    if (order.paymentInfo?.provider === 'khalti') return 'Khalti'
    if (order.paymentInfo?.provider === 'cod') return 'Cash on Delivery'
    return 'Unknown'
  }

  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      <div className="max-w-4xl mx-auto px-6 pt-24 pb-16">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Order Details</h1>
        {loading && <p className="text-gray-600">Loading…</p>}
        {error && <p className="text-red-600">{error}</p>}
        {order && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Order #{order._id?.slice(-6)}</p>
                <p className="text-sm text-gray-600">Placed {new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-medium text-gray-900 capitalize">{order.status}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {['pending','processing','shipped','delivered'].map((s, idx) => {
                const active = ['pending','processing','shipped','delivered'].indexOf(order.status) >= idx
                return (
                  <div key={s} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${active ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-500'}`}>{idx+1}</div>
                    {idx < 3 && <div className={`w-16 h-0.5 ${active ? 'bg-gray-900' : 'bg-gray-200'}`}></div>}
                  </div>
                )
              })}
            </div>

            <div className="border p-4">
              <h2 className="text-lg font-medium text-gray-900 mb-3">Items</h2>
              <div className="divide-y divide-gray-100">
                {order.items.map((it, idx) => (
                  <div key={idx} className="py-3 flex items-center gap-3">
                    {it.image && <img src={it.image} alt={it.name} className="w-12 h-12 object-contain bg-gray-50" />}
                    <div className="flex-1">
                      <p className="text-gray-900">{it.name}</p>
                      <p className="text-sm text-gray-600">Qty {it.quantity}</p>
                    </div>
                    <div className="text-sm text-gray-900">Rs. {(Number(it.price) * Number(it.quantity)).toFixed(2)}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900 font-medium">Rs. {Number(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-900 font-medium">Rs. {Number(order.shipping).toFixed(2)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-gray-600">Total</span>
                <span className="text-gray-900 font-semibold">Rs. {Number(order.total).toFixed(2)}</span>
              </div>
            </div>

            <div className="border p-4">
              <h2 className="text-lg font-medium text-gray-900 mb-3">Payment Information</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-medium text-gray-900">{getPaymentMethod(order)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Payment Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatus(order).bg} ${getPaymentStatus(order).color}`}>
                    {getPaymentStatus(order).status}
                  </span>
                </div>
              </div>
              {order.paymentInfo?.reference && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600">Reference</p>
                  <p className="text-sm text-gray-900 font-mono">{order.paymentInfo.reference}</p>
                </div>
              )}
            </div>

            <div className="border p-4">
              <h2 className="text-lg font-medium text-gray-900 mb-3">Shipping Address</h2>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="font-medium text-gray-900">{order.shippingAddress?.fullName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Province</p>
                  <p className="font-medium text-gray-900">{order.shippingAddress?.province || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">District</p>
                  <p className="font-medium text-gray-900">{order.shippingAddress?.district || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Main Address</p>
                  <p className="font-medium text-gray-900">{order.shippingAddress?.mainAddress || 'N/A'}</p>
                </div>
              </div>
            </div>

            {order.trackingNumber && (
              <div className="border p-4">
                <h2 className="text-lg font-medium text-gray-900 mb-2">Tracking</h2>
                <p className="text-sm text-gray-700">Tracking Number: {order.trackingNumber}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderDetail
