import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useSocket } from '../context/SocketContext.jsx'
import NavBar from '../components/Common/NavBar.jsx'

const Chat = () => {
  const { user } = useAuth()
  const { chatThreads, fetchThread, sendUserMessage, typingState, setTyping } = useSocket()
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const listRef = useRef(null)
  const topSentinelRef = useRef(null)
  const [oldestLoadedTs, setOldestLoadedTs] = useState(null)

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

  // Infinite scroll up: load older messages when reaching top
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
            // No more messages to load
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
    // scroll to bottom on initial load and on new message
    container.scrollTop = container.scrollHeight
  }, [messages.length])

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="bg-white border border-gray-100 rounded-3xl p-12 shadow-2xl shadow-black/5">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Authentication Required</h2>
          <p className="text-slate-600">Please log in to access the chat interface</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <NavBar />
      <div className="pt-16 h-screen flex flex-col">
        <div className="max-w-6xl mx-auto w-full h-full flex flex-col px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-8 flex-shrink-0">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h1 className="text-5xl font-extrabold tracking-tight">
                  <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
                    Premium Support
                  </span>
                </h1>
              </div>
            </div>
            <p className="text-slate-600 text-lg font-medium">Connect with our admin team for personalized assistance</p>
            <div className="w-24 h-1 bg-gradient-to-r from-slate-800 to-slate-600 rounded-full mx-auto mt-4"></div>
          </div>
          
          {/* Chat Container */}
          <div className="bg-white border border-slate-200/80 rounded-3xl shadow-2xl shadow-black/10 flex flex-col flex-1 overflow-hidden backdrop-blur-sm">
            {/* Chat Header */}
            <div className="px-8 py-5 border-b border-slate-200/60 bg-gradient-to-r from-slate-50/80 to-white flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-4 h-4 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/30"></div>
                    <div className="absolute inset-0 w-4 h-4 bg-emerald-500 rounded-full animate-ping opacity-75"></div>
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-lg">Live Support</span>
                    <div className="text-sm text-slate-600 font-medium">Admin Team • Online</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                  <div className="w-2 h-2 bg-slate-200 rounded-full"></div>
                </div>
              </div>
            </div>
            
            {/* Messages Area */}
            <div
              ref={listRef}
              className="flex-1 overflow-y-auto p-8 space-y-6 bg-gradient-to-b from-white via-slate-50/30 to-white relative scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent"
              onScroll={() => { /* listener is set in effect */ }}
              onMouseEnter={() => setTyping(false)}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_1px_1px,_theme(colors.slate.400)_1px,_transparent_0)] bg-[size:40px_40px]"></div>
              </div>
              
              {loading && (
                <div className="flex items-center justify-center py-12 relative">
                  <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200/50">
                    <div className="flex space-x-3">
                      <div className="w-3 h-3 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full animate-bounce"></div>
                      <div className="w-3 h-3 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full animate-bounce" style={{animationDelay: '0.15s'}}></div>
                      <div className="w-3 h-3 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              
              {messages.length === 0 && !loading && (
                <div className="text-center py-16 relative">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl flex items-center justify-center shadow-2xl shadow-slate-900/20 border-4 border-white">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">Welcome to Premium Support</h3>
                  <p className="text-slate-600 text-lg leading-relaxed max-w-md mx-auto">Start your conversation with our admin team. We're here to provide you with exceptional support.</p>
                  <div className="mt-6 inline-flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-slate-700">Response time: Usually under 1 minute</span>
                  </div>
                </div>
              )}
              
              {messages.map((m, idx) => (
                <div key={idx} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn relative`}>
                  <div className="flex items-end gap-3 max-w-[80%]">
                    {m.from !== 'user' && (
                      <div className="w-8 h-8 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                    <div className={`px-6 py-4 text-sm leading-relaxed shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5 ${
                      m.from === 'user' 
                        ? 'bg-gradient-to-br from-slate-800 via-slate-900 to-black text-white rounded-3xl rounded-br-lg border border-slate-700/50 shadow-slate-900/30' 
                        : 'bg-white border-2 border-slate-100 text-slate-900 rounded-3xl rounded-bl-lg shadow-slate-200/50 relative overflow-hidden'
                    }`}>
                      {m.from !== 'user' && (
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-600 via-slate-500 to-slate-600"></div>
                      )}
                      <div className="relative z-10 font-medium">
                        {m.text}
                      </div>
                    </div>
                    {m.from === 'user' && (
                      <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {typingState[myUserId]?.from === 'admin' && typingState[myUserId]?.isTyping && (
                <div className="flex justify-start animate-fadeIn relative">
                  <div className="flex items-end gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="bg-white border-2 border-slate-100 rounded-3xl rounded-bl-lg px-6 py-4 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-600 via-slate-500 to-slate-600"></div>
                      <div className="flex space-x-2 relative z-10">
                        <div className="w-2.5 h-2.5 bg-slate-400 rounded-full animate-bounce"></div>
                        <div className="w-2.5 h-2.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.15s'}}></div>
                        <div className="w-2.5 h-2.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Input Area */}
            <div className="p-8 border-t border-slate-200/60 bg-gradient-to-r from-slate-50/50 to-white flex-shrink-0 relative">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const t = text.trim()
                  if (!t) return
                  sendUserMessage(t)
                  setText('')
                }}
                className="flex items-center gap-4 relative"
              >
                <div className="flex-1 relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-200 to-slate-300 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-all duration-300 blur-sm"></div>
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onFocus={() => setTyping(true)}
                    onBlur={() => setTyping(false)}
                    placeholder="Share your thoughts or ask a question..."
                    className="w-full border-2 border-slate-200 rounded-2xl px-6 py-4 text-base bg-white/80 backdrop-blur-sm focus:bg-white focus:border-slate-400 focus:ring-4 focus:ring-slate-400/10 transition-all duration-300 placeholder-slate-500 text-slate-900 shadow-lg font-medium relative z-10 group-focus-within:shadow-xl"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </div>
                </div>
                <button 
                  type="submit"
                  className="bg-gradient-to-r from-slate-800 via-slate-900 to-black hover:from-slate-700 hover:via-slate-800 hover:to-slate-900 text-white px-8 py-4 rounded-2xl font-bold shadow-2xl hover:shadow-slate-900/30 transform hover:scale-105 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border border-slate-700/50 relative overflow-hidden group"
                  disabled={!text.trim()}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 flex items-center gap-2">
                    Send
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </span>
                </button>
              </form>
              
              {/* Status Bar */}
              <div className="flex items-center justify-between mt-4 text-xs">
                <div className="flex items-center gap-2 text-slate-500">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">Secure connection established</span>
                </div>
                <div className="text-slate-400 font-medium">
                  {messages.length} messages
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Subtle background elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-gradient-to-br from-slate-100 to-transparent rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-gradient-to-br from-slate-100 to-transparent rounded-full opacity-30 blur-3xl"></div>
      </div>
    </div>
  )
}

export default Chat