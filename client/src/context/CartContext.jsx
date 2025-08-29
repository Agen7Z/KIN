import React, { createContext, useState, useEffect } from 'react'
import { ToastContext } from './ToastContext.jsx'

const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const toast = React.useContext(ToastContext)
  const STORAGE_KEY = 'kin_cart'
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = (product, quantity = 1) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item._id === product._id)
      if (existingItem) {
        // Do NOT auto-increase quantity on repeated add; just inform and open cart
        toast?.info?.(`${product.name || 'Item'} is already in your cart`, { duration: 2500 })
        setIsOpen(true)
        return prevItems
      } else {
        const next = [...prevItems, { ...product, quantity }]
        // Toast for added item
        toast?.success?.(`${product.name || 'Item'} added to cart`, { duration: 2500 })
        // Open cart drawer to show item added
        setIsOpen(true)
        return next
      }
    })
  }

  const removeItem = (productId) => {
    setItems(prevItems => prevItems.filter(item => item._id !== productId))
  }

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }
    setItems(prevItems =>
      prevItems.map(item =>
        item._id === productId ? { ...item, quantity } : item
      )
    )
  }

  const increase = (productId) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item._id === productId ? { ...item, quantity: item.quantity + 1 } : item
      )
    )
  }

  const decrease = (productId) => {
    setItems(prevItems =>
      prevItems.map(item => {
        if (item._id === productId) {
          if (item.quantity <= 1) {
            return null // Will be filtered out
          }
          return { ...item, quantity: item.quantity - 1 }
        }
        return item
      }).filter(Boolean) // Remove null items
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const toggle = () => {
    setIsOpen(prev => !prev)
  }

  const close = () => {
    setIsOpen(false)
  }

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const count = items.reduce((sum, item) => sum + item.quantity, 0)

  const value = {
    items,
    isOpen,
    addItem,
    removeItem,
    updateQuantity,
    increase,
    decrease,
    clearCart,
    total,
    count,
    toggle,
    close
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export { CartContext }
export default CartProvider


