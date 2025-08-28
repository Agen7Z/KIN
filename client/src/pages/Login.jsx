import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import NavBar from '../components/Common/NavBar'
import { useAuth } from '../hooks/useAuth'

const Login = () => {
  const { login, user, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId || !(window).google) return
    try {
      (window).google.accounts.id.initialize({
        client_id: clientId,
        use_fedcm_for_prompt: true,
        callback: async (response) => {
          try {
            const payload = JSON.parse(atob(response.credential.split('.')[1] || ''))
            const { sub, email } = payload
            const result = await loginWithGoogle({ sub, email })
            if (!result.success) setError(result.error || 'Google login failed')
          } catch {
            setError('Google login failed')
          }
        }
      })
      const container = document.getElementById('google-login-btn-custom')
      if (container) {
        ;(window).google.accounts.id.renderButton(container, {
          type: 'standard',
          theme: 'filled_black',
          text: 'continue_with',
          size: 'large',
          shape: 'pill',
          logo_alignment: 'left',
          width: 320,
          locale: 'en'
        })
      }
      // Probe One Tap availability
      ;(window).google.accounts.id.prompt(() => {})
    } catch {}
  }, [loginWithGoogle])

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin')
      else navigate('/')
    }
  }, [user, navigate])

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Please enter email and password')
      return
    }
    setLoading(true)
    try {
      const result = await login(email, password)
      if (!result.success) setError(result.error || 'Login failed')
    } catch {
      setError('Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      <div className="flex items-center justify-center pt-16 pb-10">
      <div className="w-full max-w-2xl px-8 py-12 text-center">
        {/* Main Title */}
        <h1 className="font-display text-4xl sm:text-5xl font-light tracking-[0.25em] mb-6 text-black">
          MY KINN ACCOUNT
        </h1>

        {/* Social Login Button (Google renders here) */}
        <div className="mb-6 flex justify-center">
          <div id="google-login-btn-custom" className="w-[320px]" />
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-4 text-gray-500 font-medium tracking-wider">
              OR
            </span>
          </div>
        </div>

        {/* Section Title */}
        <h2 className="font-display text-lg font-light tracking-[0.18em] mb-2 text-black">
          CONTINUE WITH YOUR EMAIL ADDRESS
        </h2>
        
        <p className="text-sm text-gray-600 mb-8">
          Sign in with your email and password or create a profile if you are new.
        </p>

        {/* Email/Password Form */}
        <form onSubmit={onSubmit} className="space-y-5 max-w-sm mx-auto">
          {error && (
            <div className="text-sm text-red-600 text-left bg-red-50 p-3 border border-red-200">
              {error}
            </div>
          )}

          <div className="text-left">
            <input
              type="email"
              placeholder="Email*"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-black/80 rounded-sm px-4 py-3 text-sm placeholder-gray-500 focus:outline-none focus:border-black bg-transparent"
              required
            />
          </div>

          <div className="text-left">
            <input
              type="password"
              placeholder="Password*"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-black/80 rounded-sm px-4 py-3 text-sm placeholder-gray-500 focus:outline-none focus:border-black bg-transparent"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full border border-black bg-black py-3.5 text-sm font-medium text-white tracking-[0.15em] hover:bg-gray-900 disabled:opacity-70 disabled:cursor-not-allowed transition-colors mt-2"
          >
            {loading ? 'SIGNING IN...' : 'LOGIN'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-black/10">
          <h3 className="font-display text-lg font-light tracking-[0.15em] text-black">
            JOIN MY KINN
          </h3>
          <p className="text-sm text-gray-600 mt-2">
            Don't have an account?{' '}
            <Link 
              to="/signup" 
              className="underline text-black hover:no-underline transition-all"
            >
              Create one here
            </Link>
          </p>
        </div>
      </div>
    </div>
  </div>
  )
}

export default Login