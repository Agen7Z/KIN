import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Home from './pages/Home'
import ProductsPage from './pages/ProductsPage'
import CartDrawer from './components/Cart/CartDrawer'
import ProductDetail from './pages/ProductDetail'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/products/:category' element={<ProductsPage />} />
        <Route path='/product/:id' element={<ProductDetail />} />
      </Routes>
      <CartDrawer />
    </BrowserRouter>
  )
}

export default App