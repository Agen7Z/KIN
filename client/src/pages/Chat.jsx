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
      <div className="text-gray-800 text-lg">Please log in to chat.</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <NavBar />
      <div className="pt-16 h-screen flex flex-col">
        <div className="max-w-5xl mx-auto w-full h-full flex flex-col px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-6 flex-shrink-0">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Chat with Admin
            </h1>
            <p className="text-gray-600 mt-2">Get instant support and answers to your questions</p>
          </div>
          
          {/* Chat Container */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-xl shadow-gray-200/50 flex flex-col flex-1 overflow-hidden">
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-semibold text-gray-900">Live Chat</span>
                <span className="text-sm text-gray-600">• Admin is online</span>
              </div>
            </div>
            
            {/* Messages Area */}
            <div
              ref={listRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
              onScroll={() => { /* listener is set in effect */ }}
              onMouseEnter={() => setTyping(false)}
            >
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              )}
              {messages.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center border border-gray-200">
                    <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Start a conversation</h3>
                  <p className="text-gray-600">Say hello! The admin will reply here.</p>
                </div>
              )}
              {messages.map((m, idx) => (
                <div key={idx} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm max-w-[70%] shadow-md transition-all duration-200 hover:shadow-lg ${
                    m.from === 'user' 
                      ? 'bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-br-md border border-gray-700' 
                      : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md shadow-sm'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {typingState[myUserId]?.from === 'admin' && typingState[myUserId]?.isTyping && (
                <div className="flex justify-start animate-fadeIn">
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-md">
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
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50 backdrop-blur-sm flex-shrink-0">
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
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm bg-white focus:bg-white focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20 transition-all duration-200 placeholder-gray-500 text-gray-900 shadow-sm"
                  />
                </div>
                <button 
                  type="submit"
                  className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-700"
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