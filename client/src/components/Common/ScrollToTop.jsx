import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const ScrollToTop = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    // Scroll to top on page refresh
    const handleBeforeUnload = () => {
      window.scrollTo(0, 0)
    }

    // Scroll to top when page becomes visible (refresh)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        window.scrollTo(0, 0)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return null
}

export default ScrollToTop
