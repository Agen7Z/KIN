import React, { createContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const tokenData = localStorage.getItem('kin_auth')
        
        if (tokenData) {
          try {
            const { token } = JSON.parse(tokenData)
            
            if (!token) {
              localStorage.removeItem('kin_auth')
              setUser(null)
              setLoading(false)
              return
            }

            const response = await fetch('/api/users/me', {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              credentials: 'include'
            })
            
            if (response.ok) {
              const userData = await response.json()
              setUser(userData.data.user)
            } else if (response.status === 401) {
              localStorage.removeItem('kin_auth')
              setUser(null)
            }
          } catch (parseError) {
            localStorage.removeItem('kin_auth')
            setUser(null)
          }
        }
      } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          // Keep user logged in for network issues
        } else {
          localStorage.removeItem('kin_auth')
          setUser(null)
        }
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }

      // Fix: Access token from the correct path in response
      const token = data.data.token
      if (!token) {
        throw new Error('No token received from server')
      }

      localStorage.setItem('kin_auth', JSON.stringify({ token }))
      setUser(data.data.user)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const signup = async (email, password, name) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: name, email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed')
      }

      // Fix: Access token from the correct path in response
      const token = data.data.token
      if (!token) {
        throw new Error('No token received from server')
      }

      localStorage.setItem('kin_auth', JSON.stringify({ token }))
      setUser(data.data.user)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    localStorage.removeItem('kin_auth')
    setUser(null)
  }

  const value = {
    user,
    loading,
    login,
    signup,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext }
export default AuthProvider


