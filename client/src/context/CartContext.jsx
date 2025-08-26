import React, { createContext, useContext, useMemo, useState, useCallback } from 'react'

const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]) // [{ id, product, quantity }]
  const [isOpen, setIsOpen] = useState(false)

  const addItem = useCallback((product, quantity = 1) => {
    setItems((prev) => {
      const index = prev.findIndex((entry) => entry.product.id === product.id)
      if (index !== -1) {
        const next = [...prev]
        next[index] = { ...next[index], quantity: next[index].quantity + quantity }
        return next
      }
      return [...prev, { id: product.id, product, quantity }]
    })
  }, [])

  const removeItem = useCallback((productId) => {
    setItems((prev) => prev.filter((entry) => entry.product.id !== productId))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const increase = useCallback((productId, amount = 1) => {
    setItems((prev) => prev.map((e) => e.product.id === productId ? { ...e, quantity: e.quantity + amount } : e))
  }, [])

  const decrease = useCallback((productId, amount = 1) => {
    setItems((prev) => prev
      .map((e) => e.product.id === productId ? { ...e, quantity: Math.max(1, e.quantity - amount) } : e)
    )
  }, [])

  const setQuantity = useCallback((productId, quantity) => {
    const q = Math.max(1, Number(quantity) || 1)
    setItems((prev) => prev.map((e) => e.product.id === productId ? { ...e, quantity: q } : e))
  }, [])

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((v) => !v), [])

  const { count, total } = useMemo(() => {
    const count = items.reduce((sum, entry) => sum + entry.quantity, 0)
    const total = items.reduce((sum, entry) => sum + (Number(entry.product.price) || 0) * entry.quantity, 0)
    return { count, total }
  }, [items])

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      clear,
      increase,
      decrease,
      setQuantity,
      count,
      total,
      isOpen,
      open,
      close,
      toggle,
    }),
    [items, addItem, removeItem, clear, increase, decrease, setQuantity, count, total, isOpen, open, close, toggle]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}


