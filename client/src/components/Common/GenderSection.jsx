import React from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../Products/ProductCard'

const GenderSection = ({ title, gender, products, maxProducts = 6 }) => {
  const filteredProducts = products.filter(product => 
    product.gender === gender || product.gender === 'unisex'
  ).slice(0, maxProducts)

  if (filteredProducts.length === 0) return null

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
            <p className="text-gray-600">Discover our latest {gender === 'unisex' ? 'unisex' : gender} collection</p>
          </div>
          <Link 
            to={`/products/${gender}`} 
            className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            View All
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
