import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'

const SocketContext = createContext(null)

export const SocketProvider = ({ children }) => {
  const { user } = useAuth()
  const { show } = useToast()
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const apiBase = (import.meta?.env?.VITE_API_URL) || 'http://localhost:4000'

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
      setConnected(false)
      return
    }

    const token = localStorage.getItem('kin_auth') ? JSON.parse(localStorage.getItem('kin_auth')).token : null

    const socket = io(apiBase, {
      transports: ['websocket'],
      withCredentials: true,
      auth: token ? { token } : undefined
    })
    socketRef.current = socket

    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))

    socket.on('notice:new', (payload) => {
      setUnreadCount((c) => c + 1)
      if (payload?.message) {
        show(payload.title ? `${payload.title}: ${payload.message}` : payload.message, { type: 'info' })
      }
    })

    return () => {
      socket.off('notice:new')
      socket.disconnect()
      socketRef.current = null
    }
  }, [user])

  const value = useMemo(() => ({
    socket: socketRef.current,
    connected,
    unreadCount,
    clearUnread: () => setUnreadCount(0)
  }), [connected, unreadCount])

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)


