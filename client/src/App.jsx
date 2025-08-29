import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import { useAuth } from './hooks/useAuth.js'
import ScrollToTop from './components/Common/ScrollToTop.jsx'

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
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
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
          </Routes>
          <CartDrawer />
          <Footer />
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App