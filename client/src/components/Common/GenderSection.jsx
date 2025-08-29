import React from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../Products/ProductCard'

const GenderSection = ({ title, gender, products, maxProducts = 6 }) => {
  const filteredProducts = products.filter(product => 
    product.gender === gender || product.gender === 'unisex'
  ).slice(0, maxProducts)

  if (filteredProducts.length === 0) return null

  return (
    <section className="py-8 sm:py-12 lg:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-8 sm:mb-12">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{title}</h2>
            <p className="text-sm sm:text-base text-gray-600">Discover our latest {gender === 'unisex' ? 'unisex' : gender} collection</p>
          </div>
          <Link 
            to={`/products/${gender}`} 
            className="bg-gray-900 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium text-sm sm:text-base self-start sm:self-auto"
          >
            View All
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onQuickView={() => {}} // We'll implement this later
              onAddToCart={() => {}} // We'll implement this later
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default GenderSection
