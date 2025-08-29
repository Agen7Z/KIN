import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import { SocketProvider } from './context/SocketContext.jsx'
import { useAuth } from './hooks/useAuth.js'
import ScrollToTop from './components/Common/ScrollToTop.jsx'
import KinnLoader from './components/Common/KinnLoader.jsx'

import Home from './pages/Home'
import ProductsPage from './pages/ProductsPage'
import CartDrawer from './components/Cart/CartDrawer'
import Footer from './components/Common/Footer.jsx'
import ProductDetail from './pages/ProductDetail'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import AdminDashboard from './pages/AdminDashboard'
import Checkout from './pages/Checkout'
import OrderDetail from './pages/OrderDetail'
import OrdersList from './pages/OrdersList'
import About from './pages/About'
import Chat from './pages/Chat'
import AdminChat from './pages/AdminChat'
import FloatingChatButton from './components/Common/FloatingChatButton.jsx'

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />
  }
  
  return children
}

const App = () => {
  const [initialGate, setInitialGate] = React.useState(true)

  React.useEffect(() => {
    const id = setTimeout(() => setInitialGate(false), 2000)
    return () => clearTimeout(id)
  }, [])

  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
          <SocketProvider>
          {/* Global initial overlay */}
          {initialGate && (
            <div className="fixed inset-0 z-[1000] bg-white flex items-center justify-center px-6">
              <KinnLoader message="Preparing your collection..." />
            </div>
          )}

          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/products/:category' element={<ProductsPage />} />
            <Route path='/men' element={<ProductsPage />} />
            <Route path='/women' element={<ProductsPage />} />
            <Route path='/unisex' element={<ProductsPage />} />
            <Route path='/product/:id' element={<ProductDetail />} />
            <Route path='/login' element={<Login />} />
            <Route path='/signup' element={<Signup />} />
            <Route path='/profile' element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path='/admin' element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path='/checkout' element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path='/orders/:id' element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
            <Route path='/orders' element={<ProtectedRoute><OrdersList /></ProtectedRoute>} />
            <Route path='/about' element={<About />} />
            <Route path='/chat' element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path='/admin/chat' element={<ProtectedRoute requiredRole="admin"><AdminChat /></ProtectedRoute>} />
          </Routes>
          <CartDrawer />
          <FloatingChatButton />
          </SocketProvider>
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App