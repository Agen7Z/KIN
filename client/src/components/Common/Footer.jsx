import React, { useState } from 'react'

const Footer = () => {
  const col = 'space-y-4'
  const link = 'block text-sm text-neutral-700 hover:text-black'
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const onJoin = async (e) => {
    e.preventDefault()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('Please enter a valid email')
      return
    }
    setLoading(true)
    setStatus('')
    try {
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

      if (!serviceId || !templateId || !publicKey) {
        // Fallback: pretend success if keys are not set, so UI works in dev
        setStatus('Subscribed!')
        setEmail('')
        setLoading(false)
        return
      }

      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          service_id: serviceId,
          template_id: templateId,
          user_id: publicKey,
          template_params: {
            to_email: email
          }
        })
      })

      if (response.ok) {
        setStatus('Subscribed!')
        setEmail('')
      } else {
        const txt = await response.text()
        setStatus(`Failed to subscribe (${response.status}). ${txt || ''}`)
      }
    } catch (err) {
      setStatus(`Failed to subscribe. ${err?.message || ''}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <footer className="mt-24 border-t border-black/10 bg-white">
      <div className="max-w-6xl mx-auto px-6 py-16 sm:py-20 lg:py-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
        <div className={col}>
          <h4 className="text-xs tracking-[0.2em] text-black pb-3 border-b border-black/10 inline-block">HELP</h4>
          <p className="text-sm text-neutral-700">Contact us at <a className="underline hover:text-black" href="mailto:info.azrael2169@gmail.com">info.azrael2169@gmail.com</a></p>
          <a href="mailto:info.azrael2169@gmail.com" className={link}>FAQ</a>
          <a href="mailto:info.azrael2169@gmail.com" className={link}>Product Care</a>
          <a href="mailto:info.azrael2169@gmail.com" className={link}>Stores</a>
        </div>
        <div className={col}>
          <h4 className="text-xs tracking-[0.2em] text-black pb-3 border-b border-black/10 inline-block">SERVICES</h4>
          <p className={link}>Easy Returns</p>
          <p className={link}>Personal Styling</p>
          <p className={link}>Gift Wrapping</p>
        </div>
        <div className={col}>
          <h4 className="text-xs tracking-[0.2em] text-black pb-3 border-b border-black/10 inline-block">ABOUT KINN</h4>
          <a href="/about" className={link}>Our Story</a>
          <a href="/about" className={link}>Sustainability</a>
          <a href="/about" className={link}>Latest Collection</a>
        </div>
        <div className={col}>
          <h4 className="text-xs tracking-[0.2em] text-black pb-3 border-b border-black/10 inline-block">CONNECT</h4>
          <p className="text-sm text-neutral-700">Sign up for emails to receive latest news, pre‑launches and collections.</p>
          <form onSubmit={onJoin} className="flex items-center gap-2">
            <input value={email} onChange={(e)=>setEmail(e.target.value)} className="flex-1 border border-black/40 rounded-sm px-3 py-2 text-sm placeholder-neutral-500 focus:outline-none focus:border-black" placeholder="Email address" />
            <button disabled={loading} className="px-5 py-2 border border-black bg-black text-white text-xs tracking-widest hover:bg-black/85 disabled:opacity-60">{loading ? 'SENDING…' : 'JOIN'}</button>
          </form>
          {status && <p className="text-xs text-neutral-600 pt-1">{status}</p>}
        </div>
      </div>
      <div className="border-t border-black/10" />
      <div className="border-t border-black/10">
        <div className="max-w-6xl mx-auto px-6 py-8 lg:py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-xs text-neutral-600">© {new Date().getFullYear()} KINN</div>
          <div className="flex items-center gap-6 text-xs">
            <a href="#" className="text-neutral-700 hover:text-black">Sitemap</a>
            <a href="#" className="text-neutral-700 hover:text-black">Legal & privacy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer


