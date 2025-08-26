import React from 'react'
import { useCart } from '../../context/CartContext'

const CartDrawer = () => {
  const { items, total, isOpen, close, increase, decrease, removeItem } = useCart()

  return (
    <div className={`${isOpen ? 'pointer-events-auto' : 'pointer-events-none'} fixed inset-0 z-50`}>
      <div
        className={`${isOpen ? 'opacity-100' : 'opacity-0'} absolute inset-0 bg-black/40 transition-opacity`}
        onClick={close}
      />
      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-md bg-white/70 backdrop-blur-md shadow-[0_20px_60px_-15px_rgba(0,0,0,0.35)] transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        aria-hidden={!isOpen}
      >
        <div className="relative">
          <div className="absolute inset-0 p-[1px] bg-gradient-to-br from-white/60 via-white/20 to-transparent pointer-events-none" />
        </div>
        <div className="flex items-center justify_between px-5 py-4 border-b border-white/30">
          <h2 className="text-lg font-semibold text-gray-900">Your Cart</h2>
          <button onClick={close} className="text-gray-700 hover:text-black">✕</button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-5 py-4 divide-y divide-gray-100">
          {items.length === 0 && (
            <p className="py-12 text-center text-gray-500">Your cart is empty.</p>
          )}
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="py-4 flex gap-3">
              <img src={product.image} alt={product.name} className="h-16 w-16 object-cover bg-gray-100" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 line-clamp-1">{product.name}</p>
                <p className="text-xs text-gray-500">${Number(product.price).toFixed(2)}</p>
                <div className="mt-2 flex items-center gap-2">
                  <button onClick={() => decrease(product.id)} className="h-7 w-7 rounded border border-gray-200 text-gray-700">-</button>
                  <span className="min-w-[2ch] text-center text-sm">{quantity}</span>
                  <button onClick={() => increase(product.id)} className="h-7 w-7 rounded border border-gray-200 text-gray-700">+</button>
                  <button onClick={() => removeItem(product.id)} className="ml-auto text-xs text-red-600 hover:underline">Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto border-t border-white/30 p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-semibold text-gray-900">${total.toFixed(2)}</span>
          </div>
          <button className="mt-4 w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black hover:shadow-md">Checkout</button>
        </div>
      </aside>
    </div>
  )
}

export default CartDrawer


