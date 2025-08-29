import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Search, Send, Users, MessageSquare } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useSocket } from '../context/SocketContext.jsx'
import apiFetch from '../utils/api'

const AdminChat = () => {
  const { user, logout } = useAuth()
  const { chatThreads, fetchRecent, setActiveChatUserId, activeChatUserId, adminSendMessage, typingState, setTyping, fetchThread } = useSocket()
  const [recentChats, setRecentChats] = useState([])
  const [userSearch, setUserSearch] = useState('')
  const [adminMsgText, setAdminMsgText] = useState('')
  const [users, setUsers] = useState([])

  // Load recent chats and users
  useEffect(() => {
    fetchRecent((list) => setRecentChats(list))
    // Load users from localStorage or fetch from API
    const loadUsers = async () => {
      try {
        const token = localStorage.getItem('kin_auth') ? JSON.parse(localStorage.getItem('kin_auth')).token : null
        if (token) {
          const response = await apiFetch('/api/users', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
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

  // Load selected user's thread when a user is chosen
  useEffect(() => {
    if (activeChatUserId) {
      fetchThread(activeChatUserId, undefined, { limit: 20 })
    }
  }, [activeChatUserId, fetchThread])

  // Access control
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center max-w-md">
          <div className="text-red-500 mb-4">
            <MessageSquare className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You need admin privileges to access this page.</p>
          <Link
            to="/admin"
            className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg transition-colors"
          >
            Go Back
          </Link>
        </div>
      </div>
    )
  }

  const messages = activeChatUserId ? (chatThreads[activeChatUserId] || []) : []

  // Merge all users with recent chat data
  const mergedUsers = users.map(u => {
    const rc = recentChats.find(rc => rc.userId === String(u._id))
    return {
      userId: String(u._id),
      username: u.username,
      email: u.email,
      lastText: rc?.lastText || '',
      lastFrom: rc?.lastFrom || '',
      ts: rc?.ts || 0,
    }
  }).filter(m => {
    if (!userSearch) return true
    const q = userSearch.toLowerCase()
    return (
      (m.username || '').toLowerCase().includes(q) ||
      (m.email || '').toLowerCase().includes(q) ||
      (m.userId || '').toLowerCase().includes(q) ||
      (m.lastText || '').toLowerCase().includes(q)
    )
  }).sort((a, b) => (b.ts || 0) - (a.ts || 0))

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/admin"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </Link>
            <span className="text-gray-400">|</span>
            <h1 className="text-xl font-semibold text-gray-900">Admin Chat</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">Welcome, {user?.email ? user.email.split('@')[0] : 'Admin'}</div>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      
      <div className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[80vh]">
            {/* Users Sidebar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-white space-y-3">
                <div className="font-medium text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Users ({mergedUsers.length})
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search users..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl text-sm bg-white focus:bg-white focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-all duration-200 placeholder-gray-400 text-gray-900"
                  />
                </div>
              </div>
              <div className="h-[calc(80vh-140px)] overflow-y-auto divide-y divide-gray-100 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {mergedUsers.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500 text-center">No users found</div>
                ) : (
                  mergedUsers.map((c) => (
                    <button
                      key={c.userId}
                      onClick={() => { setActiveChatUserId(c.userId); fetchThread(c.userId, undefined, { limit: 20 }) }}
                      className={`w-full text-left p-4 hover:bg-gray-50 transition-all duration-200 ${
                        activeChatUserId === c.userId 
                          ? 'bg-blue-50 border-r-2 border-blue-600' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-sm font-medium text-gray-900">{c.username || c.email || c.userId}</div>
                      <div className="text-xs text-gray-500 truncate">{c.email}</div>
                      {c.lastText && (
                        <div className="text-xs text-gray-500 truncate mt-1">
                          {c.lastFrom === 'admin' ? 'You: ' : ''}{c.lastText}
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between flex-shrink-0">
                <span className="font-medium text-gray-900">
                  {activeChatUserId ? `Chat with ${activeChatUserId}` : 'Select a conversation'}
                </span>
                {activeChatUserId && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-500">User online</span>
                  </div>
                )}
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto space-y-3 h-[calc(80vh-200px)] bg-white scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {(!activeChatUserId || messages.length === 0) && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                      <MessageSquare className="w-8 h-8 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {!activeChatUserId ? 'Choose a user to start chatting' : 'No messages yet'}
                    </h3>
                    <p className="text-gray-600">
                      {!activeChatUserId ? 'Select a user from the left to begin a conversation' : 'Start the conversation by sending a message'}
                    </p>
                  </div>
                )}
                
                {messages.map((m, idx) => (
                  <div key={idx} className={`flex ${m.from === 'admin' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                    <div className={`px-4 py-3 rounded-2xl text-sm max-w-[70%] shadow-sm transition-all duration-200 ${
                      m.from === 'admin' 
                        ? 'bg-gray-900 text-white rounded-br-md border border-gray-900' 
                        : 'bg-gray-100 border border-gray-200 text-gray-900 rounded-bl-md'
                    }`}>
                      {m.text}
                    </div>
                  </div>
                ))}
                
                {activeChatUserId && typingState[activeChatUserId]?.from === 'user' && typingState[activeChatUserId]?.isTyping && (
                  <div className="flex justify-start animate-fadeIn">
                    <div className="bg-gray-100 border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!activeChatUserId) return
                  const t = adminMsgText.trim()
                  if (!t) return
                  adminSendMessage(activeChatUserId, t)
                  setAdminMsgText('')
                }}
                className="p-4 border-t border-gray-200 bg-white flex-shrink-0"
              >
                <div className="flex items-center gap-3">
                  <input
                    value={adminMsgText}
                    onChange={(e) => setAdminMsgText(e.target.value)}
                    onFocus={() => activeChatUserId && setTyping(true, activeChatUserId)}
                    onBlur={() => activeChatUserId && setTyping(false, activeChatUserId)}
                    placeholder={activeChatUserId ? 'Type a message...' : 'Select a conversation'}
                    disabled={!activeChatUserId}
                    className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm bg-white focus:bg-white focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-all duration-200 placeholder-gray-400 text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <button 
                    disabled={!activeChatUserId} 
                    className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl font-medium shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-gray-900 flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminChat
