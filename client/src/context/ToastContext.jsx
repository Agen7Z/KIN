import React, { createContext, useState } from 'react'

const ToastContext = createContext()

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const show = (message, options = {}) => {
    const id = Date.now()
    const toast = {
      id,
      message,
      type: options.type || 'info',
      duration: options.duration || 5000
    }

    setToasts(prev => [...prev, toast])

    setTimeout(() => {
      remove(id)
    }, toast.duration)
  }

  const remove = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const success = (message, options = {}) => show(message, { ...options, type: 'success' })
  const error = (message, options = {}) => show(message, { ...options, type: 'error' })
  const warning = (message, options = {}) => show(message, { ...options, type: 'warning' })
  const info = (message, options = {}) => show(message, { ...options, type: 'info' })

  const value = {
    toasts,
    show,
    remove,
    success,
    error,
    warning,
    info
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  )
}

export { ToastContext }
export default ToastProvider


