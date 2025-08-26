import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import NavBar from '../components/Common/NavBar'
import { useCart } from '../context/CartContext'

const ProductDetail = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const product = location.state?.product

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <NavBar />
        <div className="max-w-5xl mx-auto px-6 pt-24 pb-16">
          <p className="text-gray-700">Product not found. Go back and open a product.</p>
          <button onClick={() => navigate(-1)} className="mt-4 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black">Go Back</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      <div className="max-w-5xl mx-auto px-6 pt-24 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="relative bg-gray-50 overflow-hidden group">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/10 to-transparent" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500">{product.category}</p>
            <h1 className="mt-1 text-2xl font-semibold text-gray-900">{product.name}</h1>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-xl font-bold text-gray-900">${Number(product.price).toFixed(2)}</span>
              {typeof product.originalPrice === 'number' && (
                <del className="text-sm text-gray-400">${Number(product.originalPrice).toFixed(2)}</del>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                className="inline-flex flex-1 items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black hover:shadow-md"
                onClick={() => addItem(product, 1)}
              >
                Add to cart
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 hover:shadow-sm"
                onClick={() => navigate(-1)}
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail


