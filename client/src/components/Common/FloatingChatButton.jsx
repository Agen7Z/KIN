import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { HiOutlineChatAlt2 } from 'react-icons/hi'

const FloatingChatButton = () => {
  const [isHovered, setIsHovered] = useState(false)
  const { user } = useAuth()

  // Hide for admins
  if (user && user.role === 'admin') return null

  return (
    <Link
      to="/chat"
      className="fixed bottom-6 left-6 z-50 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main button */}
      <div className="relative">
        <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 ease-out flex items-center justify-center border border-gray-600">
          <HiOutlineChatAlt2 className="w-8 h-8 text-gray-200" />
        </div>
        
        {/* Pulse animation */}
        <div className="absolute inset-0 w-16 h-16 bg-gray-600 rounded-full animate-ping opacity-20"></div>
        
        {/* Hover glow effect */}
        <div className={`absolute inset-0 w-16 h-16 bg-gray-500 rounded-full transition-all duration-300 ${
          isHovered ? 'scale-125 opacity-30' : 'scale-100 opacity-0'
        }`}></div>
      </div>
      
      {/* Tooltip */}
      <div className={`absolute bottom-20 left-0 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transform transition-all duration-300 ${
        isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}>
        Chat with Admin
        <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
      </div>
    </Link>
  )
}

export default FloatingChatButton
