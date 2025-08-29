import React from 'react'
import { Link } from 'react-router-dom'
import { HiOutlineUser, HiOutlineShoppingCart, HiOutlineBell, HiOutlineChatAlt2 } from 'react-icons/hi'
import { useCart } from '../../hooks/useCart'
import { useAuth } from '../../hooks/useAuth'
import apiFetch from '../../utils/api'
import { useSocket } from '../../context/SocketContext.jsx'

const NavBar = () => {
  const { count, toggle } = useCart()
  const { user } = useAuth()
  const { unreadCount, clearUnread, bannerNotice } = useSocket() || {}
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [notices, setNotices] = React.useState([])

  React.useEffect(() => {
    let intervalId
    const load = async () => {
      try {
        setLoading(true)
        const res = await apiFetch('/api/notices')
        if (res.ok) {
          const data = await res.json()
          setNotices(Array.isArray(data?.data?.notices) ? data.data.notices : [])
        }
      } finally {
        setLoading(false)
      }
    }
    if (open) {
      load()
      clearUnread?.()
      intervalId = setInterval(load, 60000)
    }
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [open])
  return (
    <nav className="fixed top-0 left-0 w-full z-20">
      <div className="flex justify-between items-center py-3 sm:py-4 px-4 sm:px-6 lg:px-8 bg-transparent">
        
        {/* Logo */}
        <div className="flex items-center gap-4 sm:gap-8">
          <Link to="/" className="text-xl sm:text-2xl font-bold text-black">
            KINN
          </Link>
          
          {/* Navigation Links removed as per requirement */}
        </div>

        {/* Right side icons */}
        <div className="flex items-center gap-3 sm:gap-4 lg:gap-6 text-[18px] sm:text-[20px]">
          {user && user.role !== 'admin' && (
            <Link to="/chat" className="text-blue-600 hover:text-blue-700 transition-all duration-300 relative flex items-center" aria-label="Messages">
              <HiOutlineChatAlt2 />
            </Link>
          )}
          {user && user.role !== 'admin' && (
            <button onClick={() => setOpen(o => !o)} className="text-blue-600 hover:text-blue-700 transition-all duration-300 relative flex items-center" aria-label="Notifications">
              <HiOutlineBell />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-3 bg-blue-600 text-white rounded-full min-w-4 h-4 px-1 text-[10px] leading-4 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          )}
          <Link
            to={user ? (user.role === 'admin' ? '/admin' : '/profile') : '/login'}
            className="text-black hover:text-gray-700 transition-all duration-300 flex items-center"
            aria-label="Account"
          >
            {user ? (
              <span className="text-xs sm:text-sm font-medium">
                {(user.email?.split('@')[0] || 'User').slice(0, 12)}
              </span>
            ) : (
              <HiOutlineUser />
            )}
          </Link>
          {user?.role !== 'admin' && (
            <button onClick={toggle} className="text-black hover:text-gray-700 transition-all duration-300 relative flex items-center">
              <HiOutlineShoppingCart />
              {count > 0 && (
                <span className="absolute -top-1 -right-3 bg-red-500 text-white rounded-full min-w-4 h-4 px-1 text-[10px] leading-4 flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
      {open && user && user.role !== 'admin' && (
        <div className="absolute right-4 sm:right-6 lg:right-8 top-14 sm:top-16 z-30 w-80 max-w-[90vw] bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[70vh]">
          <div className="flex items-center justify-between px-4 py-2 bg-blue-600 text-white flex-shrink-0">
            <span className="text-sm font-semibold">Recent notices</span>
            <button onClick={() => setOpen(false)} className="opacity-90 hover:opacity-100 text-sm">Close</button>
          </div>
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-4 text-sm text-blue-700 bg-blue-50">Loading…</div>
            ) : (notices.length === 0 ? (
              <div className="p-4 text-sm text-gray-600">No notices</div>
            ) : (
              notices.map(n => (
                <div key={n._id} className="px-4 py-3 border-b last:border-b-0 border-gray-100">
                  {n.title && (
                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-red-800 bg-red-50 px-2 py-1 rounded">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500"></span>
                      {n.title}
                    </div>
                  )}
                  <div className="text-sm text-gray-800 mt-1">{n.message}</div>
                  <div className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                </div>
              ))
            ))}
          </div>
        </div>
      )}
      {bannerNotice && (
        <div className="fixed top-12 left-0 w-full z-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-md bg-red-50 border border-red-200 p-3 sm:p-3.5 shadow-sm">
              <div className="flex items-start gap-2">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-700 text-xs font-bold select-none">!</span>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-red-800">{bannerNotice.title}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default NavBar
