import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useSocket } from '../context/SocketContext.jsx'
import NavBar from '../components/Common/NavBar.jsx'
import { Send, MessageSquare, MoreVertical, Search } from 'lucide-react'

// Shared UI primitives
const Button = ({ children, variant = 'default', size = 'default', className = '', ...props }) => {
  const base = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50'
  const variants = { default: 'bg-[#F14D4C] text-white hover:bg-[#e03d3d]', ghost: 'hover:bg-gray-100 text-gray-800' }
  const sizes = { default: 'h-10 px-4 py-2', icon: 'h-10 w-10' }
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>{children}</button>
  )
}
const Input = ({ className = '', ...props }) => (
  <input className={`flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 ${className}`} {...props} />
)
const Avatar = ({ children, className = '' }) => (
  <div className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}>{children}</div>
)
const AvatarFallback = ({ children, className = '' }) => (
  <div className={`flex h-full w-full items-center justify-center rounded-full bg-gray-200 ${className}`}>{children}</div>
)

const Chat = () => {
  const { user } = useAuth()
  const { chatThreads, fetchThread, sendUserMessage, typingState, setTyping } = useSocket()
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const listRef = useRef(null)
  const [oldestLoadedTs, setOldestLoadedTs] = useState(null)

  const initialsFromEmail = (email) => {
    if (!email) return 'NA'
    const name = String(email).split('@')[0]
    return name.slice(0, 2).toUpperCase()
  }

  const myUserId = user?._id || user?.id
  const messages = useMemo(() => chatThreads[myUserId] || [], [chatThreads, myUserId])

  useEffect(() => {
    if (!user || !myUserId) return
    setLoading(true)
    fetchThread(myUserId, (thread) => {
      setLoading(false)
      const firstTs = Array.isArray(thread) && thread.length ? thread[0].ts : null
      setOldestLoadedTs(firstTs)
    }, { limit: 20 })
  }, [user, myUserId, fetchThread])

  useEffect(() => {
    const container = listRef.current
    if (!container || !oldestLoadedTs) return
    const onScroll = () => {
      if (container.scrollTop <= 0 && oldestLoadedTs) {
        const before = oldestLoadedTs
        fetchThread(myUserId, (older) => {
          if (Array.isArray(older) && older.length > 0) {
            const firstTs = older[0].ts
            setOldestLoadedTs(firstTs)
          } else {
            setOldestLoadedTs(null)
          }
        }, { beforeTs: before, limit: 20 })
      }
    }
    container.addEventListener('scroll', onScroll)
    return () => container.removeEventListener('scroll', onScroll)
  }, [oldestLoadedTs, myUserId])

  useEffect(() => {
    const container = listRef.current
    if (!container) return
    container.scrollTop = container.scrollHeight
  }, [messages.length])

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center max-w-md">
        <div className="text-red-500 mb-4">
          <MessageSquare className="w-16 h-16 mx-auto" />
        </div>
        <h2 className="text-2xl font-semibold text-[#121212] mb-2">Authentication Required</h2>
        <p className="text-gray-600">Please log in to access the chat interface</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      <div className="pt-20 h-screen flex">
        {/* Left Sidebar - single Admin */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xl font-semibold text-[#121212]">Messages</div>
              <Button variant="ghost" size="icon" className="text-[#121212] hover:bg-gray-100"><MoreVertical className="h-5 w-5" /></Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input placeholder="Search..." className="pl-10 bg-white" disabled />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className={`p-4 bg-gray-100 border-r-2 border-orange-500`}>
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-[#121212] text-white">AD</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-[#121212] truncate">admin</p>
                    <span className="text-xs text-gray-500">Now</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">Premium Support</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-[#121212] text-white">AD</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold text-[#121212]">admin</div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-500">Active now</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2"></div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white pb-24" ref={listRef}>
            {loading && (
              <div className="text-center text-sm text-gray-500">Loading...</div>
            )}
            
            {messages.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                  <MessageSquare className="w-8 h-8 text-gray-500" />
                </div>
                <div className="text-lg font-semibold text-[#121212] mb-2">Start a conversation</div>
                <div className="text-gray-600">Ask us anything. We're here to help.</div>
              </div>
            )}

            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-4 rounded-lg shadow-sm transition-shadow max-w-xs lg:max-w-md ${m.from==='user' ? 'bg-[#F14D4C] text-white' : 'bg-gray-100 text-[#121212]'}`}>
                  <div className="text-sm leading-relaxed">{m.text}</div>
                </div>
              </div>
            ))}

            {typingState[myUserId]?.from === 'admin' && typingState[myUserId]?.isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); const t = text.trim(); if (!t) return; sendUserMessage(t); setText('') }} className="border-t border-gray-200 p-4 bg-white mb-6">
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <Input 
                  value={text} 
                  onChange={(e) => setText(e.target.value)} 
                  onFocus={() => setTyping(true)} 
                  onBlur={() => setTyping(false)} 
                  placeholder="Type your message..." 
                />
              </div>
              <Button type="submit" disabled={!text.trim()} className="shadow-lg hover:shadow-xl transition-all duration-200" size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Chat