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
    if (!user) return
    setLoading(true)
    fetchThread(myUserId, (thread) => {
      setLoading(false)
      const firstTs = Array.isArray(thread) && thread.length ? thread[0].ts : null
      setOldestLoadedTs(firstTs)
    }, { limit: 20 })
  }, [user])

  // Infinite scroll up: load older messages when reaching top
  useEffect(() => {
    const container = listRef.current
    if (!container) return
    const onScroll = () => {
      if (container.scrollTop <= 0 && oldestLoadedTs) {
        const before = oldestLoadedTs
        fetchThread(myUserId, (older) => {
          const firstTs = Array.isArray(older) && older.length ? older[0].ts : oldestLoadedTs
          setOldestLoadedTs(firstTs)
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
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="pt-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col h-[70vh]">
          <div className="px-4 py-3 border-b font-semibold">Chat with Admin</div>
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto p-3 space-y-2"
            onScroll={() => { /* listener is set in effect */ }}
            onMouseEnter={() => setTyping(false)}
          >
            {loading && (
              <div className="text-center text-sm text-gray-500 my-4">Loading…</div>
            )}
            {messages.length === 0 && !loading && (
              <div className="text-center text-sm text-gray-500 my-8">Say hello! The admin will reply here.</div>
            )}
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-3 py-2 rounded-lg text-sm max-w-[70%] ${m.from === 'user' ? 'bg-neutral-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const t = text.trim()
              if (!t) return
              sendUserMessage(t)
              setText('')
            }}
            className="p-3 border-t flex items-center gap-2"
          >
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onFocus={() => setTyping(true)}
              onBlur={() => setTyping(false)}
              placeholder="Type a message"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            {typingState[myUserId]?.from === 'admin' && typingState[myUserId]?.isTyping && (
              <span className="text-xs text-gray-500 mr-2">Admin is typing…</span>
            )}
            <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 rounded-lg">Send</button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Chat


