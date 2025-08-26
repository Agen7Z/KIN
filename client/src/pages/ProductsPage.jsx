import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import NavBar from '../components/Common/NavBar'
import ProductCard from '../components/Products/ProductCard'
import { useCart } from '../context/CartContext'


const sampleProducts = {
  men: [
    {
      id: 1,
      name: "Classic Oxford Shirt",
      category: "Signature Collection",
      price: 89,
      originalPrice: 120,
      image: "https://i.pinimg.com/736x/de/dd/3d/dedd3d8f3ec58659e569f95cbdcb027f.jpg",
      isNew: true,
      isTrending: false,
      colors: ['white', 'navy', 'black'],
      rating: 4.6,
      reviews: 124
    },
    {
      id: 2,
      name: "Slim Fit Chino Pants",
      category: "Summer Collection",
      price: 65,
      originalPrice: null,
      image: "https://images.pexels.com/photos/1972115/pexels-photo-1972115.jpeg",
      isNew: false,
      isTrending: true,
      colors: ['navy', 'black', 'gray'],
      rating: 4.2,
      reviews: 89
    },
    {
      id: 3,
      name: "Premium Wool Blazer",
      category: "Signature Series",
      price: 299,
      originalPrice: 399,
      image: "https://images.pexels.com/photos/2897883/pexels-photo-2897883.jpeg",
      isNew: false,
      isTrending: false,
      colors: ['black', 'navy', 'gray'],
      rating: 4.8,
      reviews: 57
    }
  ],
  women: [
    {
      id: 7,
      name: "Silk Blend Blouse",
      category: "Signature Collection",
      price: 129,
      originalPrice: 169,
      image: "https://images.pexels.com/photos/19064121/pexels-photo-19064121.jpeg",
      isNew: true,
      isTrending: true,
      colors: ['white', 'black', 'navy'],
      rating: 4.7,
      reviews: 203
    },
    {
      id: 8,
      name: "High-Waist Tailored Pants",
      category: "Summer Collection",
      price: 89,
      originalPrice: null,
      image: "https://images.pexels.com/photos/19064121/pexels-photo-19064121.jpeg",
      isNew: false,
      isTrending: true,
      colors: ['black', 'navy', 'gray'],
      rating: 4.3,
      reviews: 96
    },
    {
      id: 9,
      name: "Elegant Midi Dress",
      category: "Signature Series",
      price: 199,
      originalPrice: 259,
      image: "https://images.pexels.com/photos/19064121/pexels-photo-19064121.jpeg",
      isNew: true,
      isTrending: false,
      colors: ['black', 'navy', 'red'],
      rating: 4.9,
      reviews: 311
    }
  ]
}

const ProductsPage = () => {
  const { addItem } = useCart()
  const { category } = useParams()
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false)
  
  // Get products for the current category
  const products = sampleProducts[category] || []
  
  const openQuickView = (product) => {
    setQuickViewProduct(product)
    setIsQuickViewOpen(true)
  }

  const closeQuickView = () => {
    setIsQuickViewOpen(false)
    setQuickViewProduct(null)
  }
  
  return (
    <>
    <div className="min-h-screen bg-white">
      <NavBar />
      
      {/* Premium Hero Section */}
      <div className="pt-20 pb-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center py-12">
            <div className="inline-block">
              <h1 className="text-5xl md:text-7xl font-serif text-gray-900 uppercase tracking-[0.2em] mb-4">
                {category}
              </h1>
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-gray-900 to-transparent mx-auto mb-6"></div>
              <p className="text-lg text-gray-600 font-light tracking-wide">
                Curated collection for the modern {category}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toggle for Mobile */}
      <div className="md:hidden px-6 mb-6 border-b border-gray-100 pb-4">
        <button 
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center justify-between w-full py-3 text-gray-900 font-medium hover:text-black"
        >
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
            </svg>
            Filters & Search
          </span>
          <svg className={`w-5 h-5 transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="flex gap-12">
          
          {/* Premium Left Sidebar */}
          <div className={`w-72 flex-shrink-0 ${isFilterOpen ? 'block' : 'hidden md:block'}`}>
            <div className="sticky top-24 space-y-8">
              
              {/* Search Section */}
              <div className="pb-6 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                  Search
                </h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Find your style..."
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-none focus:bg-white focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all duration-200 text-gray-900 placeholder-gray-500 hover:bg-white"
                  />
                  <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Price Range */}
              <div className="pb-6 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-6">
                  Price Range
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Under $50', value: 'under-50' },
                    { label: '$50 - $100', value: '50-100' },
                    { label: '$100 - $200', value: '100-200' },
                    { label: 'Premium ($200+)', value: '200-plus' }
                  ].map((price) => (
                    <label key={price.value} className="flex items-center group cursor-pointer">
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                        />
                        <div className="w-5 h-5 border-2 border-gray-300 peer-checked:border-gray-900 peer-checked:bg-gray-900 transition-all duration-200 relative">
                          <svg className="w-3 h-3 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <span className="ml-3 text-gray-700 group-hover:text-gray-900 transition-colors font-medium">
                        {price.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Collections */}
              <div className="pb-6 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-6">
                  Collections
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'New Arrivals', value: 'new', count: 24 },
                    { label: 'Trending', value: 'trending', count: 18 },
                    { label: 'Summer Collection', value: 'summer', count: 32 },
                    { label: 'Signature Series', value: 'signature', count: 12 }
                  ].map((collection) => (
                    <label key={collection.value} className="flex items-center justify-between group cursor-pointer">
                      <div className="flex items-center">
                        <div className="relative">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                          />
                          <div className="w-5 h-5 border-2 border-gray-300 peer-checked:border-gray-900 peer-checked:bg-gray-900 transition-all duration-200 relative">
                            <svg className="w-3 h-3 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <span className="ml-3 text-gray-700 group-hover:text-gray-900 transition-colors font-medium">
                          {collection.label}
                        </span>
                      </div>
                      <span className="text-gray-400 text-sm">({collection.count})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              <button className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm uppercase tracking-wider">
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Products Section */}
          <div className="flex-1">
            
            {/* Results Header */}
            <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-100">
              <div>
                <p className="text-gray-600 font-medium">
                  Showing <span className="text-gray-900">1-{products.length}</span> of <span className="text-gray-900">{products.length}</span> products
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 font-medium">Sort by:</span>
                <select className="bg-white border border-gray-200 px-4 py-2 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent">
                  <option>Featured</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest First</option>
                  <option>Best Selling</option>
                </select>
              </div>
            </div>

            {/* Premium Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  rating={product.rating}
                  reviews={product.reviews}
                  onQuickView={() => openQuickView(product)}
                  onAddToCart={() => addItem(product, 1)}
                />
              ))}
              
              {/* If no products found */}
              {products.length === 0 && (
                <div className="col-span-full text-center py-16">
                  <p className="text-gray-500 text-lg">No products found for {category}.</p>
                  <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or check back later.</p>
                </div>
              )}
            </div>

            {/* Load More */}
            <div className="text-center mt-12 pt-8 border-t border-gray-100">
              <button className="bg-gray-900 text-white px-8 py-3 font-medium uppercase tracking-wider hover:bg-gray-700 transition-colors duration-300">
                Load More Products
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    {isQuickViewOpen && quickViewProduct && (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40" onClick={closeQuickView} />
        <div className="relative z-10 w-full max-w-2xl bg-white shadow-xl">
          <div className="flex">
            <div className="w-1/2 bg-gray-50">
              <img
                src={quickViewProduct.image}
                alt={quickViewProduct.name}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="w-1/2 p-6">
              <p className="text-xs uppercase tracking-wider text-gray-500">{quickViewProduct.category}</p>
              <h3 className="mt-1 text-xl font-semibold text-gray-900">{quickViewProduct.name}</h3>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-lg font-bold text-gray-900">${quickViewProduct.price.toFixed(2)}</span>
                {typeof quickViewProduct.originalPrice === 'number' && (
                  <del className="text-sm text-gray-400">${quickViewProduct.originalPrice.toFixed(2)}</del>
                )}
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  className="inline-flex flex-1 items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black"
                  onClick={() => addItem(quickViewProduct, 1)}
                >
                  Add to cart
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
                  onClick={closeQuickView}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  )
}

export default ProductsPage