import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'

import Home from './pages/Home'
import ProductsPage from './pages/ProductsPage'
import CartDrawer from './components/Cart/CartDrawer'
import ProductDetail from './pages/ProductDetail'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import AdminDashboard from './pages/AdminDashboard'

const App = () => {
  return (
    <BrowserRouter>
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
            <Route path='/profile' element={<Profile />} />
            <Route path='/admin' element={<AdminDashboard />} />
          </Routes>
          <CartDrawer />
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App