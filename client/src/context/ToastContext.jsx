import React, { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react'

const ToastContext = createContext(null)

let idCounter = 0

export const ToastProvider = ({ children, position = 'top-right', duration = 3000 }) => {
  const [toasts, setToasts] = useState([])

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const show = useCallback((message, options = {}) => {
    const id = ++idCounter
    const toast = {
      id,
      message,
      type: options.type || 'info',
      duration: options.duration || duration,
    }
    setToasts((prev) => [...prev, toast])
    if (toast.duration > 0) {
      setTimeout(() => remove(id), toast.duration)
    }
    return id
  }, [duration, remove])

  const value = useMemo(() => ({ show, remove }), [show, remove])

  const positionClasses = useMemo(() => {
    return position === 'top-left'
      ? 'top-4 left-4'
      : position === 'bottom-right'
      ? 'bottom-4 right-4'
      : position === 'bottom-left'
      ? 'bottom-4 left-4'
      : 'top-4 right-4'
  }, [position])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={`fixed z-50 ${positionClasses} space-y-3`}> 
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`min-w-[240px] max-w-xs px-4 py-3 rounded-md shadow-lg text-white pointer-events-auto transition-opacity bg-opacity-90 ${
              t.type === 'success' ? 'bg-emerald-600' : t.type === 'error' ? 'bg-red-600' : t.type === 'warning' ? 'bg-yellow-600' : 'bg-gray-900'
            }`}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="text-sm leading-5">{t.message}</span>
              <button
                onClick={() => remove(t.id)}
                className="text-white/90 hover:text-white focus:outline-none"
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}


