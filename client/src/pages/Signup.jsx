import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import NavBar from '../components/Common/NavBar'
import { useAuth } from '../hooks/useAuth'

const Signup = () => {
  const { signup, user, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId) {
      console.error('Google Client ID not found')
      return
    }

    // Wait for Google script to load
    const waitForGoogle = () => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        try {
          console.log('Initializing Google Sign-In for Signup')
          window.google.accounts.id.initialize({
            client_id: clientId,
            use_fedcm_for_prompt: true,
            auto_select: false,
            cancel_on_tap_outside: true,
            callback: async (response) => {
              try {
                console.log('Google signup callback received')
                const payload = JSON.parse(atob(response.credential.split('.')[1] || ''))
                const { sub, email } = payload
                const result = await loginWithGoogle({ sub, email })
                // If successful, the auth context will set user and redirect by effect
              } catch (error) {
                console.error('Google signup error:', error)
              }
            }
          })
          
          const container = document.getElementById('google-signup-btn')
          if (container) {
            window.google.accounts.id.renderButton(container, { 
              theme: 'outline', 
              size: 'large', 
              shape: 'pill', 
              width: '100%' 
            })
          }
        } catch (error) {
          console.error('Error initializing Google Sign-In:', error)
        }
      } else {
        // Retry after a short delay
        setTimeout(waitForGoogle, 100)
      }
    }
    
    waitForGoogle()
  }, [loginWithGoogle])

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/')
      }
    }
  }, [user, navigate])

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Please fill all fields')
      return
    }
    setLoading(true)
    try {
      const result = await signup(email, password)
      if (result.success) {
        // Navigation will be handled by useEffect above
      } else {
        setError(result.error || 'Signup failed')
      }
    } catch (error) {
      setError('Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      <div className="flex items-center justify-center pt-16 pb-10 px-4 sm:px-6">
        <div className="w-full max-w-2xl px-4 sm:px-8 py-8 sm:py-12 text-center">
          <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-light tracking-[0.15em] sm:tracking-[0.25em] mb-4 sm:mb-6 text-black">MY KINN ACCOUNT</h1>

          <h2 className="font-display text-base sm:text-lg font-light tracking-[0.15em] sm:tracking-[0.18em] mb-2 text-black">CONTINUE WITH YOUR EMAIL ADDRESS</h2>
          <p className="text-sm text-gray-600 mb-6 sm:mb-8 px-2">Create your account using email and password.</p>

          <form onSubmit={onSubmit} className="space-y-4 sm:space-y-5 max-w-sm mx-auto">
            {error && <p className="text-sm text-red-600 text-left bg-red-50 p-3 border border-red-200 rounded">{error}</p>}
            <div className="text-left">
              <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email*" required className="w-full border border-black/80 rounded-sm px-3 sm:px-4 py-2.5 sm:py-3 text-sm placeholder-gray-500 focus:outline-none focus:border-black bg-transparent" />
            </div>
            <div className="text-left">
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Password*" required className="w-full border border-black/80 rounded-sm px-3 sm:px-4 py-2.5 sm:py-3 text-sm placeholder-gray-500 focus:outline-none focus:border-black bg-transparent" />
            </div>
            <button type="submit" disabled={loading} className="w-full border border-black bg-black py-3 sm:py-3.5 text-sm font-medium text-white tracking-[0.15em] hover:bg-gray-900 disabled:opacity-70 disabled:cursor-not-allowed transition-colors mt-2">
              {loading ? 'CREATING…' : 'SIGN UP'}
            </button>
          </form>

          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-black/10">
            <h3 className="font-display text-base sm:text-lg font-light tracking-[0.15em] text-black">ALREADY HAVE AN ACCOUNT?</h3>
            <p className="text-sm text-gray-600 mt-2">Return to <Link to="/login" className="underline text-black hover:no-underline transition-all">Sign in</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup


