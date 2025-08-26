import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext(null)

const STORAGE_KEY = 'kin_auth'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const init = async () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return
        const parsed = JSON.parse(raw)
        if (!parsed?.token) return
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${parsed.token}` },
        })
        if (!res.ok) throw new Error('unauthorized')
        const json = await res.json()
        const next = { user: json?.data?.user, token: parsed.token }
        setUser(next.user)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) throw new Error('Login failed')
    const json = await res.json()
    const token = json?.data?.token
    const userData = json?.data?.user
    if (!token || !userData) throw new Error('Invalid response')
    setUser(userData)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: userData, token }))
    // Redirect based on user role
    if (userData.role === 'admin') {
      navigate('/admin')
    } else {
      navigate('/')
    }
    return userData
  }, [navigate])

  const signup = useCallback(async (email, password, name) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username: name }),
    })
    if (!res.ok) throw new Error('Signup failed')
    const json = await res.json()
    const token = json?.data?.token
    const userData = json?.data?.user
    if (!token || !userData) throw new Error('Invalid response')
    setUser(userData)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: userData, token }))
    // Redirect based on user role
    if (userData.role === 'admin') {
      navigate('/admin')
    } else {
      navigate('/')
    }
    return userData
  }, [navigate])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
    navigate('/')
  }, [navigate])

  const value = useMemo(() => ({ user, loading, login, signup, logout }), [user, loading, login, signup, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}


