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
  const [bannerNotice, setBannerNotice] = useState(null)
  const [chatThreads, setChatThreads] = useState({}) // key: userId, value: messages
  const [activeChatUserId, setActiveChatUserId] = useState(null)
  const [typingState, setTypingState] = useState({}) // key: userId -> { from, isTyping }

  const apiBase = (import.meta?.env?.VITE_API_URL) || 'http://localhost:4000'

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
      setConnected(false)
      setUnreadCount(0)
      setChatThreads({})
      setActiveChatUserId(null)
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
      // transient banner visible for 5s
      setBannerNotice({
        title: payload?.title || 'Notice',
        message: payload?.message || ''
      })
      setTimeout(() => setBannerNotice(null), 5000)
    })

    // Chat: incoming message (both user/admin)
    socket.on('chat:message', (payload) => {
      if (!payload?.userId || !payload?.text) return
      setChatThreads((prev) => {
        const next = { ...prev }
        const list = next[payload.userId] ? [...next[payload.userId]] : []
        list.push({ from: payload.from, text: payload.text, ts: payload.ts })
        next[payload.userId] = list
        return next
      })
    })

    // Chat: notification popup
    socket.on('chat:notification', (payload) => {
      const text = payload?.text || 'New message'
      show(text, { type: 'info' })
    })

    // Typing indicator events
    socket.on('chat:typing', (payload) => {
      if (user?.role === 'admin') {
        // Payload from user: { from:'user', userId, isTyping }
        if (!payload?.userId) return
        setTypingState((prev) => ({ ...prev, [payload.userId]: { from: 'user', isTyping: !!payload.isTyping } }))
      } else {
        // Payload from admin: { from:'admin', isTyping }
        const myId = user?._id || user?.id
        if (!myId) return
        setTypingState((prev) => ({ ...prev, [myId]: { from: 'admin', isTyping: !!payload?.isTyping } }))
      }
    })

    return () => {
      socket.off('notice:new')
      socket.off('chat:message')
      socket.off('chat:notification')
      socket.off('chat:typing')
      socket.disconnect()
      socketRef.current = null
    }
  }, [user])

  const sendUserMessage = (text) => {
    const socket = socketRef.current
    if (!socket || !user || !text?.trim()) return
    socket.emit('chat:user_message', { text })
    const myId = user?._id || user?.id
    const userId = myId
    setChatThreads((prev) => {
      const next = { ...prev }
      const list = next[userId] ? [...next[userId]] : []
      list.push({ from: 'user', text, ts: Date.now() })
      next[userId] = list
      return next
    })
  }

  const adminSendMessage = (toUserId, text) => {
    const socket = socketRef.current
    if (!socket || !text?.trim() || !toUserId) return
    socket.emit('chat:admin_message', { toUserId, text })
    setChatThreads((prev) => {
      const next = { ...prev }
      const list = next[toUserId] ? [...next[toUserId]] : []
      list.push({ from: 'admin', text, ts: Date.now() })
      next[toUserId] = list
      return next
    })
  }

  // Emit typing indicator
  const setTyping = (isTyping, forUserId) => {
    const socket = socketRef.current
    if (!socket) return
    if (user?.role === 'admin') {
      if (!forUserId) return
      socket.emit('chat:typing', { toUserId: forUserId, isTyping: !!isTyping })
    } else {
      socket.emit('chat:typing', { isTyping: !!isTyping })
    }
  }

  const fetchThread = (forUserId, cb, options = {}) => {
    const socket = socketRef.current
    if (!socket) return
    const payload = user?.role === 'admin' && forUserId ? { userId: forUserId } : {}
    if (options.beforeTs) payload.beforeTs = options.beforeTs
    if (options.limit) payload.limit = options.limit
    socket.emit('chat:get_thread', payload, (thread) => {
      if (forUserId) {
        setChatThreads((prev) => {
          const current = prev[forUserId] || []
          // Prepend older messages when paginating; otherwise replace
          if (options.beforeTs) {
            return { ...prev, [forUserId]: [...(Array.isArray(thread) ? thread : []), ...current] }
          }
          return { ...prev, [forUserId]: Array.isArray(thread) ? thread : [] }
        })
      }
      if (typeof cb === 'function') cb(thread)
    })
  }

  const fetchRecent = (cb) => {
    const socket = socketRef.current
    if (!socket) return
    socket.emit('chat:get_recent', (list) => {
      if (typeof cb === 'function') cb(Array.isArray(list) ? list : [])
    })
  }

  const value = useMemo(() => ({
    socket: socketRef.current,
    connected,
    unreadCount,
    clearUnread: () => setUnreadCount(0),
    bannerNotice,
    chatThreads,
    activeChatUserId,
    setActiveChatUserId,
    sendUserMessage,
    adminSendMessage,
    fetchThread,
    fetchRecent,
    typingState,
    setTyping,
  }), [connected, unreadCount, bannerNotice, chatThreads, activeChatUserId])

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)


