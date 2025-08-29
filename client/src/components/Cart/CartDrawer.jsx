import React from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../hooks/useCart'
import { useAuth } from '../../hooks/useAuth'

const CartDrawer = () => {
  const { items, total, isOpen, close, increase, decrease, removeItem } = useCart()
  const { user } = useAuth()
  
  // Hide cart drawer for admin users
  if (user?.role === 'admin') {
    return null
  }

  return (
    <div className={`${isOpen ? 'pointer-events-auto' : 'pointer-events-none'} fixed inset-0 z-50`}>
      <div
        className={`${isOpen ? 'opacity-100' : 'opacity-0'} absolute inset-0 bg-black/40 transition-opacity`}
        onClick={close}
      />
      <aside
        className={`absolute right-0 top-0 h-full w-full sm:max-w-md bg-white/70 backdrop-blur-md shadow-[0_20px_60px_-15px_rgba(0,0,0,0.35)] transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        aria-hidden={!isOpen}
      >
        <div className="relative">
          <div className="absolute inset-0 p-[1px] bg-gradient-to-br from-white/60 via-white/20 to-transparent pointer-events-none" />
        </div>
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-white/30">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Your Cart</h2>
          <button onClick={close} className="text-gray-700 hover:text-black p-1">✕</button>
        </div>

        <div className="max-h-[50vh] sm:max-h-[60vh] overflow-y-auto px-4 sm:px-5 py-3 sm:py-4 divide-y divide-gray-100">
          {items.length === 0 && (
            <p className="py-8 sm:py-12 text-center text-gray-500 text-sm sm:text-base">Your cart is empty.</p>
          )}
          {items.map((item) => (
            <div key={item._id} className="py-3 sm:py-4 flex gap-2 sm:gap-3">
              <img 
                src={(item.images && item.images[0]) || item.image} 
                alt={item.name} 
                className="h-14 w-14 sm:h-16 sm:w-16 object-contain bg-gray-100 rounded" 
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</p>
                <p className="text-xs text-gray-500">Rs. {Number(item.price).toFixed(2)}</p>
                <div className="mt-2 flex items-center gap-2">
                  <button 
                    onClick={() => decrease(item._id)} 
                    className="h-6 w-6 sm:h-7 sm:w-7 rounded border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm sm:text-base"
                  >
                    -
                  </button>
                  <span className="min-w-[2ch] text-center text-sm">{item.quantity}</span>
                  <button 
                    onClick={() => increase(item._id)} 
                    className="h-6 w-6 sm:h-7 sm:w-7 rounded border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm sm:text-base"
                  >
                    +
                  </button>
                  <button 
                    onClick={() => removeItem(item._id)} 
                    className="ml-auto text-xs text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto border-t border-white/30 p-4 sm:p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-semibold text-gray-900">Rs. {total.toFixed(2)}</span>
          </div>
          {items.length > 0 && (
            <Link 
              to="/checkout" 
              onClick={close}
              className="mt-3 sm:mt-4 block w-full text-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black hover:shadow-md"
            >
              Checkout
            </Link>
          )}
        </div>
      </aside>
    </div>
  )
}

export default CartDrawer


