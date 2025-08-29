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
    <div className="min-h-screen flex items-center justify-center">Please log in to chat.</div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <NavBar />
      <div className="pt-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Chat with Admin
            </h1>
            <p className="text-gray-600 mt-2">Get instant support and answers to your questions</p>
          </div>
          
          {/* Chat Container */}
          <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-2xl shadow-blue-500/10 flex flex-col h-[75vh] overflow-hidden">
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-gray-200/50 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-semibold text-gray-800">Live Chat</span>
                <span className="text-sm text-gray-500">• Admin is online</span>
              </div>
            </div>
            
            {/* Messages Area */}
            <div
              ref={listRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-white to-gray-50/30"
              onScroll={() => { /* listener is set in effect */ }}
              onMouseEnter={() => setTyping(false)}
            >
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              )}
              {messages.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Start a conversation</h3>
                  <p className="text-gray-600">Say hello! The admin will reply here.</p>
                </div>
              )}
              {messages.map((m, idx) => (
                <div key={idx} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm max-w-[70%] shadow-sm transition-all duration-200 hover:shadow-md ${
                    m.from === 'user' 
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md' 
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md shadow-sm'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {typingState[myUserId]?.from === 'admin' && typingState[myUserId]?.isTyping && (
                <div className="flex justify-start animate-fadeIn">
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Input Area */}
            <div className="px-6 py-4 border-t border-gray-200/50 bg-white/50 backdrop-blur-sm">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const t = text.trim()
                  if (!t) return
                  sendUserMessage(t)
                  setText('')
                }}
                className="flex items-center gap-3"
              >
                <div className="flex-1 relative">
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onFocus={() => setTyping(true)}
                    onBlur={() => setTyping(false)}
                    placeholder="Type your message..."
                    className="w-full border border-gray-300/50 rounded-xl px-4 py-3 text-sm bg-white/70 backdrop-blur-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 placeholder-gray-400"
                  />
                </div>
                <button 
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!text.trim()}
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chat


