import React, { useEffect, useState } from 'react'
import apiFetch from '../utils/api'
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
        const res = await apiFetch(`/api/orders/${id}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
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

  const getOrderStatus = (status) => {
    const map = {
      pending: { label: 'Pending', bg: 'bg-amber-100', color: 'text-amber-800', ring: 'ring-amber-200' },
      processing: { label: 'Processing', bg: 'bg-blue-100', color: 'text-blue-800', ring: 'ring-blue-200' },
      shipped: { label: 'Shipped', bg: 'bg-indigo-100', color: 'text-indigo-800', ring: 'ring-indigo-200' },
      delivered: { label: 'Delivered', bg: 'bg-emerald-100', color: 'text-emerald-800', ring: 'ring-emerald-200' },
      cancelled: { label: 'Cancelled', bg: 'bg-rose-100', color: 'text-rose-800', ring: 'ring-rose-200' },
      returned: { label: 'Returned', bg: 'bg-fuchsia-100', color: 'text-fuchsia-800', ring: 'ring-fuchsia-200' }
    }
    return map[(status || '').toLowerCase()] || { label: status || 'Unknown', bg: 'bg-neutral-100', color: 'text-neutral-800', ring: 'ring-neutral-200' }
  }

  const getPaymentStatus = (order) => {
    if (order.paymentInfo?.provider === 'khalti') {
      return { status: 'Paid', color: 'text-emerald-700', bg: 'bg-emerald-100' }
    } else if (order.paymentInfo?.provider === 'cod') {
      return { status: 'Pending Payment', color: 'text-amber-700', bg: 'bg-amber-100' }
    }
    return { status: 'Unknown', color: 'text-gray-700', bg: 'bg-gray-100' }
  }

  const getPaymentMethod = (order) => {
    if (order.paymentInfo?.provider === 'khalti') return 'Khalti'
    if (order.paymentInfo?.provider === 'cod') return 'Cash on Delivery'
    return 'Unknown'
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <NavBar />
      <div className="max-w-6xl mx-auto px-6 pt-28 pb-20">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 mb-8 tracking-tight">Order Details</h1>
        {loading && (
          <div className="bg-white rounded-3xl shadow-sm p-8 border border-neutral-200 animate-pulse">
            <div className="h-6 w-1/3 bg-neutral-200 rounded mb-6" />
            <div className="h-4 w-1/2 bg-neutral-200 rounded" />
          </div>
        )}
        {error && <p className="text-red-600 font-medium">{error}</p>}
        {order && (
          <div className="space-y-8">
            {/* Header */}
            <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 p-6 sm:p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-neutral-900">Order #{order._id?.slice(-6)}</p>
                  <p className="text-sm text-neutral-500 mt-1">Placed {new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ring-1 ${getOrderStatus(order.status).bg} ${getOrderStatus(order.status).color} ${getOrderStatus(order.status).ring}`}>
                    <span className="inline-block w-2 h-2 rounded-full bg-current opacity-70" />
                    {getOrderStatus(order.status).label}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: Items + Progress */}
              <div className="space-y-8 lg:col-span-2">
                {/* Progress */}
                <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 p-6">
                  <h2 className="text-lg font-semibold text-neutral-900 mb-6">Order Progress</h2>
                  <div className="flex items-center justify-between">
                    {['pending','processing','shipped','delivered'].map((s, idx) => {
                      const active = ['pending','processing','shipped','delivered'].indexOf((order.status || '').toLowerCase()) >= idx
                      return (
                        <div key={s} className="flex-1 flex items-center">
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300 ${active ? 'bg-neutral-900 text-white shadow-lg' : 'bg-neutral-200 text-neutral-500'}`}>
                            {idx+1}
                          </div>
                          {idx < 3 && <div className={`flex-1 h-1 ${active ? 'bg-neutral-900' : 'bg-neutral-200'}`}></div>}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Items */}
                <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 p-6">
                  <h2 className="text-xl font-bold text-neutral-900 mb-6">Items</h2>
                  <div className="divide-y divide-neutral-100">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="py-5 flex items-center gap-5">
                        {it.image && <img src={it.image} alt={it.name} className="w-18 h-18 sm:w-20 sm:h-20 object-cover rounded-xl border border-neutral-200 bg-neutral-50" />}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-neutral-900 text-base sm:text-lg truncate">{it.name}</p>
                          <p className="text-sm text-neutral-500">Qty {it.quantity}</p>
                        </div>
                        <div className="text-sm sm:text-base font-semibold text-neutral-900 whitespace-nowrap">Rs. {(Number(it.price) * Number(it.quantity)).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Summary + Payment + Shipping + Tracking */}
              <div className="space-y-8">
                <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 p-6">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">Order Summary</h3>
                  <div className="space-y-3 text-sm sm:text-base">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Subtotal</span>
                      <span className="font-semibold text-neutral-900">Rs. {Number(order.subtotal).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Shipping</span>
                      <span className="font-semibold text-neutral-900">Rs. {Number(order.shipping).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg border-t pt-4">
                      <span className="text-neutral-700 font-bold">Total</span>
                      <span className="text-neutral-900 font-extrabold">Rs. {Number(order.total).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 p-6">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">Payment</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-neutral-500">Method</p>
                      <p className="font-semibold text-neutral-900 text-base">{getPaymentMethod(order)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-neutral-500">Status</p>
                      <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide ${getPaymentStatus(order).bg} ${getPaymentStatus(order).color}`}>
                        {getPaymentStatus(order).status}
                      </span>
                    </div>
                  </div>
                  {order.paymentInfo?.reference && (
                    <div className="mt-4">
                      <p className="text-xs text-neutral-500">Reference</p>
                      <p className="text-xs sm:text-sm text-neutral-900 font-mono bg-neutral-50 p-3 rounded-lg border border-neutral-200 break-all">{order.paymentInfo.reference}</p>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 p-6">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">Shipping Address</h3>
                  <div className="grid grid-cols-1 gap-4 text-sm sm:text-base">
                    <div>
                      <p className="text-neutral-500">Full Name</p>
                      <p className="font-semibold text-neutral-900">{order.shippingAddress?.fullName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-neutral-500">Province</p>
                      <p className="font-semibold text-neutral-900">{order.shippingAddress?.province || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-neutral-500">District</p>
                      <p className="font-semibold text-neutral-900">{order.shippingAddress?.district || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-neutral-500">Main Address</p>
                      <p className="font-semibold text-neutral-900">{order.shippingAddress?.mainAddress || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {order.trackingNumber && (
                  <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 p-6">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">Tracking</h3>
                    <p className="text-sm text-neutral-700">Tracking Number: <span className="font-semibold text-neutral-900">{order.trackingNumber}</span></p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderDetail
