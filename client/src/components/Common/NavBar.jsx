import React from 'react'
import { Link } from 'react-router-dom'
import { HiOutlineUser, HiOutlineShoppingCart } from 'react-icons/hi'
import { useCart } from '../../hooks/useCart'
import { useAuth } from '../../hooks/useAuth'

const NavBar = () => {
  const { count, toggle } = useCart()
  const { user } = useAuth()
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
    </nav>
  )
}

export default NavBar
