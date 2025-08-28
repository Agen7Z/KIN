import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import NavBar from '../components/Common/NavBar'
import { useAuth } from '../hooks/useAuth'

const Login = () => {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

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
    if (!email || !password) {
      alert('Please enter email and password')
      return
    }
    setLoading(true)
    try {
      const result = await login(email, password)
      if (result.success) {
        // Navigation will be handled by useEffect above
      } else {
        alert(result.error || 'Login failed')
      }
    } catch (error) {
      alert('Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      <div className="max-w-md mx-auto px-6 pt-28 pb-16">
        <h1 className="text-2xl font-semibold text-gray-900">Welcome back</h1>
        <p className="mt-1 text-gray-600">Sign in to continue</p>

        <form onSubmit={onSubmit} className="mt-8 space_y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:opacity-70"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-600">
          No account? <Link to="/signup" className="text-gray-900 underline">Create one</Link>
        </p>
      </div>
    </div>
  )
}

export default Login


