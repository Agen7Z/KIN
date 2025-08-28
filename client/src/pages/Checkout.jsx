import React, { useState } from 'react'
import emailjs from '@emailjs/browser'
import { useNavigate } from 'react-router-dom'
import NavBar from '../components/Common/NavBar'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'

const provinces = [
  'Koshi',
  'Madhesh',
  'Bagmati',
  'Gandaki',
  'Lumbini',
  'Karnali',
  'Sudurpashchim',
]

const districtsByProvince = {
  Koshi: [
    'Jhapa','Morang','Sunsari','Ilam','Panchthar','Taplejung','Dhankuta','Terhathum','Sankhuwasabha','Bhojpur','Udayapur','Khotang','Okhaldhunga','Solukhumbu'
  ],
  Madhesh: [
    'Saptari','Siraha','Dhanusha','Mahottari','Sarlahi','Rautahat','Bara','Parsa'
  ],
  Bagmati: [
    'Kathmandu','Lalitpur','Bhaktapur','Chitwan','Makwanpur','Nuwakot','Rasuwa','Sindhupalchok','Dolakha','Ramechhap','Sindhuli','Kavrepalanchok','Dhading'
  ],
  Gandaki: [
    'Kaski','Lamjung','Gorkha','Tanahun','Syangja','Parbat','Baglung','Myagdi','Manang','Mustang','Nawalpur'
  ],
  Lumbini: [
    'Rupandehi','Kapilvastu','Nawalparasi (West)','Arghakhanchi','Palpa','Gulmi','Dang','Banke','Bardiya','Pyuthan','Rolpa','Rukum (East)'
  ],
  Karnali: [
    'Humla','Mugu','Jumla','Kalikot','Dolpa','Jajarkot','Dailekh','Salyan','Rukum (West)','Surkhet'
  ],
  Sudurpashchim: [
    'Kailali','Kanchanpur','Dadeldhura','Doti','Achham','Bajura','Bajhang','Baitadi','Darchula'
  ],
}

const Checkout = () => {
  const { items, total, clearCart, close } = useCart()
  const safeItems = Array.isArray(items) ? items : []
  const safeTotal = Number(total) || 0
  const { user } = useAuth()
  const { show } = useToast()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [address, setAddress] = useState({
    fullName: user?.username || '',
    province: '',
    district: '',
    mainAddress: '',
  })
  const [khaltiLoading, setKhaltiLoading] = useState(false)
  const [testMode, setTestMode] = useState(false)
  const [simOpen, setSimOpen] = useState(false)
  const [simMobile, setSimMobile] = useState('')
  const [simPin, setSimPin] = useState('')

  // Close cart drawer when checkout page loads
  React.useEffect(() => {
    close()
  }, [close])

  const validateFields = () => {
    if (!address.fullName.trim()) {
      show('Please enter your full name', { type: 'warning' })
      return false
    }
    if (!address.province.trim()) {
      show('Please select your province', { type: 'warning' })
      return false
    }
    if (!address.district.trim()) {
      show('Please select your district', { type: 'warning' })
      return false
    }
    if (!address.mainAddress.trim()) {
      show('Please enter your main address', { type: 'warning' })
      return false
    }
    return true
  }

  const placeOrder = async (payment = { provider: 'khalti', reference: '' }) => {
    if (!user) {
      show('Please log in to place an order.', { type: 'warning' })
      window.location.href = '/login'
      return
    }
    if (safeItems.length === 0) {
      show('Your cart is empty.', { type: 'warning' })
      return
    }
    if (!validateFields()) {
      return
    }
    try {
      setLoading(true)
      
      const token = localStorage.getItem('kin_auth') ? JSON.parse(localStorage.getItem('kin_auth')).token : null
      
      const payload = {
        items: safeItems.map((item) => ({ 
          product: item._id || item.id, 
          quantity: item.quantity 
        })),
        shippingAddress: address,
        paymentInfo: payment,
      }
      
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      })
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to place order')
      }
      
      const orderData = await res.json()
      const order = orderData?.data?.order
      
      clearCart()
      show('Order placed successfully!', { type: 'success' })
      // Fire-and-forget confirmation email from client if configured
      try {
        const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID1
        const templateId = import.meta.env.VITE_EMAILJS_ORDER_TEMPLATE_ID1
        const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY1
        const toEmail = user?.email
        if (serviceId && templateId && publicKey && toEmail && order) {
          const firstItem = order?.items?.[0]
          const totalUnits = Array.isArray(order?.items) ? order.items.reduce((s, i) => s + Number(i.quantity || 0), 0) : 0
          emailjs.init(publicKey)
          emailjs.send(serviceId, templateId, {
            to_email: toEmail,
            order_id: String(order._id || '').slice(-6),
            name: firstItem?.name || 'Order Items',
            units: totalUnits,
            order_total: Number(order.total || 0).toFixed(2),
            orders: (order.items || []).map(i => ({
              name: i.name,
              units: Number(i.quantity || 0),
              price: Number(i.price || 0).toFixed(2)
            })),
            cost: {
              shipping: Number(order.shipping || 0).toFixed(2),
              total: Number(order.total || 0).toFixed(2)
            }
          }).then(() => {
            // optional success log
            console.log('Order email sent')
          }).catch((err) => {
            console.warn('Order email failed:', err?.text || err?.message || err)
            show('Order placed, but email could not be sent.', { type: 'info' })
          })
        } else {
          console.warn('Order email skipped due to missing config/data', {
            hasServiceId: !!serviceId,
            hasTemplateId: !!templateId,
            hasPublicKey: !!publicKey,
            hasEmail: !!toEmail,
            hasOrder: !!order
          })
        }
      } catch (err) {
        console.warn('Order email exception:', err?.message || err)
      }
      navigate('/profile')
    } catch (e) {
      show(e.message || 'Failed to place order', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const payWithKhalti = async () => {
    if (testMode) {
      if (!validateFields()) return
      if (!(safeTotal > 0)) {
        show('Order total must be greater than 0', { type: 'warning' })
        return
      }
      setSimOpen(true)
      return
    }

    if (!window.KhaltiCheckout) {
      show('Khalti SDK not loaded', { type: 'error' })
      return
    }
    if (!validateFields()) {
      return
    }
    if (!(safeTotal > 0)) {
      show('Order total must be greater than 0', { type: 'warning' })
      return
    }
    try {
      setKhaltiLoading(true)
      const khaltiPublicKey = import.meta.env.VITE_KHALTI_PUBLIC_KEY || 'test_public_key_dc74a0fe9a8e4f5e87c9e6e3b1b9a6d1'
      const config = {
        publicKey: khaltiPublicKey,
        productIdentity: `KINN_ORDER_${Date.now()}`,
        productName: 'KINN Fashion Store Purchase',
        productUrl: window.location.origin,
        eventHandler: {
          onSuccess: async (payload) => {
            const reference = payload?.token || payload?.idx || ''
            if (!reference) {
              show('Payment successful but reference not received.', { type: 'warning' })
              return
            }
            await placeOrder({ provider: 'khalti', reference })
          },
          onError: () => {
            show('Payment failed. Please try again.', { type: 'error' })
          },
          onClose: () => {
            show('Payment cancelled', { type: 'info' })
          },
        },
        paymentPreference: ['KHALTI'],
      }
      const checkout = new window.KhaltiCheckout(config)
      checkout.show({ amount: Math.round(safeTotal * 100) })
    } finally {
      setKhaltiLoading(false)
    }
  }

  const confirmSimulatedPayment = async () => {
    if (!/^[0-9]{7,15}$/.test(simMobile)) {
      show('Enter a valid mobile number (digits only)', { type: 'warning' })
      return
    }
    if (!/^[0-9]{4,6}$/.test(simPin)) {
      show('Enter a valid PIN (4-6 digits)', { type: 'warning' })
      return
    }
    
    const ref = `SIM_${Date.now()}`
    
    setSimOpen(false)
    await placeOrder({ provider: 'khalti', reference: ref })
    setSimMobile('')
    setSimPin('')
  }

  const currentDistricts = districtsByProvince[address.province] || []

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <NavBar />
      <div className="max-w-6xl mx-auto px-6 pt-24 pb-16">
        <h1 className="text-3xl font-semibold text-gray-900 mb-6 tracking-tight">Checkout</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left: Address & Payment */}
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-medium text-gray-900">Shipping Address</h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="text-sm text-gray-700">
                  Full name
                  <input className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 p-3 focus:outline-none focus:ring-2 focus:ring-gray-900"
                    placeholder="Your full name"
                    value={address.fullName}
                    onChange={(e)=>setAddress(a=>({...a, fullName:e.target.value}))} />
                </label>
                <label className="text-sm text-gray-700">
                  Province
                  <select className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 p-3 focus:outline-none focus:ring-2 focus:ring-gray-900"
                    value={address.province}
                    onChange={(e)=>setAddress(a=>({...a, province:e.target.value, district: ''}))}>
                    <option value="">Select Province</option>
                    {provinces.map(p => (<option key={p} value={p}>{p}</option>))}
                  </select>
                </label>
                <label className="text-sm text-gray-700">
                  District
                  <select className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 p-3 focus:outline-none focus:ring-2 focus:ring-gray-900"
                    value={address.district}
                    onChange={(e)=>setAddress(a=>({...a, district:e.target.value}))}
                    disabled={!address.province}>
                    <option value="">{address.province ? 'Select District' : 'Select Province first'}</option>
                    {currentDistricts.map(d => (<option key={d} value={d}>{d}</option>))}
                  </select>
                </label>
                <label className="md:col-span-2 text-sm text-gray-700">
                  Main address
                  <textarea className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 p-3 focus:outline-none focus:ring-2 focus:ring-gray-900"
                    placeholder="Street, area, landmarks"
                    value={address.mainAddress}
                    onChange={(e)=>setAddress(a=>({...a, mainAddress:e.target.value}))} rows="3" />
                </label>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-medium text-gray-900">Payment Method</h2>
              </div>
              <div className="p-6">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="text-gray-800 font-medium">Khalti Digital Payment</p>
                  <p className="text-sm text-gray-500 mt-1">Secure online payment through Khalti</p>
                  <label className="mt-3 flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" checked={testMode} onChange={(e)=>setTestMode(e.target.checked)} />
                    Use dummy payment (dev/testing)
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Summary */}
          <div>
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-3">Order Summary</h2>
              <div className="space-y-3 max-h-60 overflow-auto">
                {safeItems.map((item) => (
                  <div key={item._id || item.id} className="flex items-center gap-3">
                    <img src={(item.images && item.images[0]) || item.image} alt={item.name} className="w-12 h-12 object-contain bg-gray-50 rounded" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 line-clamp-1">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-sm text-gray-900 font-medium">Rs. {(Number(item.price) * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-gray-600">Total</span>
                <span className="font-semibold text-gray-900">Rs. {safeTotal.toFixed(2)}</span>
              </div>
              <button disabled={khaltiLoading || loading}
                onClick={payWithKhalti}
                className={`mt-4 w-full rounded-xl ${testMode ? 'bg-gray-900 hover:bg-black' : 'bg-[#5D2E8E] hover:opacity-90'} px-4 py-3 text-sm font-medium text-white shadow-sm`}>
                {testMode ? (loading ? 'Placing test order…' : 'Simulate Khalti Payment') : (khaltiLoading ? 'Launching Khalti…' : 'Pay with Khalti')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {simOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSimOpen(false)} />
          <div className="relative z-10 w-full max-w-md bg-white p-6 shadow-2xl rounded-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Khalti (Simulation)</h3>
            <p className="text-sm text-gray-600 mb-4">Enter any mobile and 4–6 digit PIN to confirm payment of Rs. {safeTotal.toFixed(2)}</p>
            <div className="space-y-3">
              <input className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3" placeholder="Mobile number" value={simMobile} onChange={(e)=>setSimMobile(e.target.value)} />
              <input className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3" placeholder="PIN" value={simPin} onChange={(e)=>setSimPin(e.target.value)} />
              <div className="flex gap-2 justify-end pt-2">
                <button onClick={() => setSimOpen(false)} className="px-4 py-2 text-sm rounded border border-gray-200">Cancel</button>
                <button onClick={confirmSimulatedPayment} className="px-4 py-2 text-sm rounded bg-gray-900 text-white">Confirm Payment</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Checkout
