import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Search, Send, Users, MessageSquare, MoreVertical } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useSocket } from '../context/SocketContext.jsx'
import apiFetch from '../utils/api'

// Inline UI primitives inspired by the premium UI
const Button = ({ children, variant = 'default', size = 'default', className = '', ...props }) => {
  const base = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50'
  const variants = { default: 'bg-orange-500 text-white hover:bg-orange-600', ghost: 'hover:bg-gray-100 text-gray-800' }
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
// Removed AvatarImage to always use initials
const AvatarFallback = ({ children, className = '' }) => (
  <div className={`flex h-full w-full items-center justify-center rounded-full bg-gray-200 ${className}`}>{children}</div>
)

const AdminChat = () => {
  const { user, logout } = useAuth()
  const { chatThreads, fetchRecent, setActiveChatUserId, activeChatUserId, adminSendMessage, typingState, setTyping, fetchThread } = useSocket()
  const [recentChats, setRecentChats] = useState([])
  const [userSearch, setUserSearch] = useState('')
  const [adminMsgText, setAdminMsgText] = useState('')
  const [users, setUsers] = useState([])
  const activeUser = users.find(u => String(u._id) === String(activeChatUserId))
  const initialsFromEmail = (email) => {
    if (!email) return 'NA'
    const name = String(email).split('@')[0]
    return name.slice(0, 2).toUpperCase()
  }

  useEffect(() => {
    fetchRecent((list) => setRecentChats(list))
    const loadUsers = async () => {
      try {
        const token = localStorage.getItem('kin_auth') ? JSON.parse(localStorage.getItem('kin_auth')).token : null
        if (token) {
          const response = await apiFetch('/api/users', { headers: { 'Authorization': `Bearer ${token}` } })
          if (!response.ok) return
          const contentType = response.headers.get('content-type') || ''
          if (!contentType.includes('application/json')) return
          const data = await response.json()
          setUsers(Array.isArray(data?.data?.users) ? data.data.users : [])
        }
      } catch (error) {
        console.error('Failed to load users:', error)
      }
    }
    loadUsers()
  }, [fetchRecent])

  useEffect(() => {
    if (activeChatUserId) fetchThread(activeChatUserId, undefined, { limit: 20 })
  }, [activeChatUserId, fetchThread])

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center max-w-md">
          <div className="text-red-500 mb-4">
            <MessageSquare className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You need admin privileges to access this page.</p>
          <Link to="/admin" className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg transition-colors">Go Back</Link>
        </div>
      </div>
    )
  }

  const messages = activeChatUserId ? (chatThreads[activeChatUserId] || []) : []

  const mergedUsers = users.map(u => {
    const rc = recentChats.find(rc => rc.userId === String(u._id))
    return { userId: String(u._id), username: u.username, email: u.email, lastText: rc?.lastText || '', lastFrom: rc?.lastFrom || '', ts: rc?.ts || 0 }
  }).filter(m => {
    if (!userSearch) return true
    const q = userSearch.toLowerCase()
    return ((m.username || '').toLowerCase().includes(q) || (m.email || '').toLowerCase().includes(q) || (m.userId || '').toLowerCase().includes(q) || (m.lastText || '').toLowerCase().includes(q))
  }).sort((a, b) => (b.ts || 0) - (a.ts || 0))

  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </Link>
            <span className="text-gray-400">|</span>
            <h1 className="text-xl font-semibold text-gray-900">Admin Chat</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">{user?.email ? user.email.split('@')[0] : 'Admin'}</div>
            <button onClick={logout} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">Logout</button>
          </div>
        </div>
      </nav>

      <div className="pt-20 h-screen flex">
        {/* Sidebar - Changed to white background */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xl font-semibold text-[#121212]">Conversations</div>
              <Button variant="ghost" size="icon" className="text-[#121212] hover:bg-gray-100"><MoreVertical className="h-5 w-5" /></Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input placeholder="Search..." value={userSearch} onChange={(e)=>setUserSearch(e.target.value)} className="pl-10 bg-white" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {mergedUsers.map((c) => (
              <div key={c.userId} onClick={()=>{ setActiveChatUserId(c.userId); fetchThread(c.userId, undefined, { limit: 20 }) }} className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${activeChatUserId===c.userId ? 'bg-gray-100 border-r-2 border-orange-500':''}`}>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-[#121212] text-white">{initialsFromEmail(c.email || c.username || c.userId)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-[#121212] truncate">{c.username || c.email || c.userId}</p>
                      <span className="text-xs text-gray-500">{c.ts ? new Date(c.ts).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) : ''}</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{c.lastFrom==='admin' ? 'You: ' : ''}{c.lastText || 'No messages yet'}</p>
                  </div>
                </div>
              </div>
            ))}
            {mergedUsers.length===0 && (<div className="p-4 text-sm text-gray-500">No users found</div>)}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-[#121212] text-white">{initialsFromEmail(activeUser?.email)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold text-[#121212]">{activeChatUserId ? `User ${activeChatUserId}` : 'Select a conversation'}</div>
                {activeChatUserId && (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-500">Active now</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2"></div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
            {(!activeChatUserId || messages.length===0) && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                  <MessageSquare className="w-8 h-8 text-gray-500" />
                </div>
                <div className="text-lg font-semibold text-[#121212] mb-2">{!activeChatUserId ? 'Choose a user to start chatting' : 'No messages yet'}</div>
                <div className="text-gray-600">{!activeChatUserId ? 'Select a user from the left to begin a conversation' : 'Start the conversation by sending a message'}</div>
              </div>
            )}

            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.from === 'admin' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-4 rounded-lg shadow-sm transition-shadow max-w-xs lg:max-w-md ${m.from==='admin' ? 'bg-[#F14D4C] text-white' : 'bg-gray-100 text-[#121212]'}`}>
                  <div className="text-sm leading-relaxed">{m.text}</div>
                </div>
              </div>
            ))}

            {activeChatUserId && typingState[activeChatUserId]?.from === 'user' && typingState[activeChatUserId]?.isTyping && (
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

          <form onSubmit={(e)=>{ e.preventDefault(); if (!activeChatUserId) return; const t = adminMsgText.trim(); if(!t) return; adminSendMessage(activeChatUserId, t); setAdminMsgText('') }} className="border-t border-gray-200 p-4 bg-white">
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <Input value={adminMsgText} onChange={(e)=>setAdminMsgText(e.target.value)} onFocus={()=>activeChatUserId && setTyping(true, activeChatUserId)} onBlur={()=>activeChatUserId && setTyping(false, activeChatUserId)} placeholder={activeChatUserId ? 'Type your message...' : 'Select a conversation'} />
              </div>
              <Button type="submit" disabled={!activeChatUserId} className="shadow-lg hover:shadow-xl transition-all duration-200 bg-[#F14D4C] text-white" size="icon"><Send className="h-4 w-4" /></Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AdminChat
