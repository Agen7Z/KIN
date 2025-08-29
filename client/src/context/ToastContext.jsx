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
      {/* Toast viewport */}
      <div className="fixed bottom-4 right-4 z-[1000] space-y-3">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`min-w-[240px] max-w-[320px] px-4 py-3 rounded shadow-lg text-white ${
              t.type === 'success' ? 'bg-green-600' : t.type === 'error' ? 'bg-red-600' : t.type === 'warning' ? 'bg-yellow-600' : 'bg-gray-800'
            }`}
            role="status"
          >
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium">{t.message}</span>
              <button className="text-white/80 hover:text-white text-sm" onClick={() => remove(t.id)}>×</button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export { ToastContext }
export default ToastProvider


