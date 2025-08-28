import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import NavBar from '../components/Common/NavBar'
import ProductCard from '../components/Products/ProductCard'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../hooks/useAuth'
import apiFetch from '../utils/api'


const useProducts = (category, gender) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (category) params.set('category', category)
        if (gender && gender !== 'all') params.set('gender', gender)
        const res = await apiFetch(`/api/products?${params.toString()}`)
        const json = await res.json()
        setData(json?.data?.products || [])
      } catch {
        setData([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [category, gender])
  return { data, loading }
}

const useTrending = () => {
  const [data, setData] = useState([])
  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetch('/api/products/trending/top')
        const json = await res.json()
        setData(json?.data?.products || [])
      } catch {
        setData([])
      }
    }
    load()
  }, [])
  return data
}

const ProductsPage = () => {
  const { addItem } = useCart()
  const { user } = useAuth()
  const { category } = useParams()
  const location = useLocation()
  
  // Extract gender from URL path
  const getGenderFromPath = useCallback(() => {
    const path = location.pathname
    if (path === '/men' || path === '/products/men') return 'men'
    if (path === '/women' || path === '/products/women') return 'women'
    if (path === '/unisex' || path === '/products/unisex') return 'unisex'
    return 'all'
  }, [location.pathname])
  
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedPrices, setSelectedPrices] = useState([])
  const [selectedCollections, setSelectedCollections] = useState([]) // ['new','trending','signature']
  const [sortBy, setSortBy] = useState('Featured')
  const [selectedGender, setSelectedGender] = useState(getGenderFromPath())
  
  const { data: products } = useProducts(category, selectedGender)
  const trendingProducts = useTrending()
  
  // Update selectedGender when URL changes
  useEffect(() => {
    setSelectedGender(getGenderFromPath())
  }, [getGenderFromPath])
  
  const toggleArrayValue = (arr, value) => (
    arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]
  )
  
  const handlePriceToggle = (value) => setSelectedPrices((prev) => toggleArrayValue(prev, value))
  const handleCollectionToggle = (value) => setSelectedCollections((prev) => toggleArrayValue(prev, value))
  const clearFilters = () => {
    setQuery('')
    setSelectedPrices([])
    setSelectedCollections([])
    setSortBy('Featured')
    setSelectedGender(getGenderFromPath())
  }
  
  const withinPrice = (price, range) => {
    if (range === 'under-50') return price < 500
    if (range === '50-100') return price >= 500 && price <= 1000
    if (range === '100-200') return price >= 1000 && price <= 2000
    if (range === '200-plus') return price > 2000
    return true
  }
  
  const newArrivalsSet = new Set(products
    .slice() // clone
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10)
    .map(p => String(p._id)))
  const trendingSet = new Set((trendingProducts || []).slice(0, 10).map(p => String(p._id)))
  
  const matchesCollections = (p) => {
    if (selectedCollections.length === 0) return true
    return selectedCollections.every((c) => {
      if (c === 'new') return newArrivalsSet.has(String(p._id))
      if (c === 'trending') return trendingSet.has(String(p._id))
      if (c === 'signature') return (p.brand || '').toLowerCase() === 'kinn'
      return true
    })
  }
  
  const filteredProducts = products
    .filter((p) => {
      const q = query.trim().toLowerCase()
      if (!q) return true
      return (
        (p.name || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q)
      )
    })
    .filter((p) => {
      if (selectedPrices.length === 0) return true
      const price = Number(p.price) || 0
      return selectedPrices.some((range) => withinPrice(price, range))
    })
    .filter(matchesCollections)
    .filter((p) => {
      if (selectedGender === 'all') return true
      return p.gender === selectedGender || p.gender === 'unisex'
    })

  const sortedProducts = (() => {
    const arr = [...filteredProducts]
    if (sortBy === 'Price: Low to High') arr.sort((a, b) => (a.price || 0) - (b.price || 0))
    else if (sortBy === 'Price: High to Low') arr.sort((a, b) => (b.price || 0) - (a.price || 0))
    else if (sortBy === 'Newest First') arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    else if (sortBy === 'Best Selling') arr.sort((a, b) => (b.reviews || 0) - (a.reviews || 0))
    return arr
  })()
  
  const openQuickView = (product) => {
    setQuickViewProduct(product)
    setIsQuickViewOpen(true)
  }

  const closeQuickView = () => {
    setIsQuickViewOpen(false)
    setQuickViewProduct(null)
  }
  
  // Get page title based on gender
  const getPageTitle = () => {
    const gender = getGenderFromPath()
    if (gender === 'men') return 'Men'
    if (gender === 'women') return 'Women'
    if (gender === 'unisex') return 'Unisex'
    return category || 'Products'
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
                {getPageTitle()}
              </h1>
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-gray-900 to-transparent mx-auto mb-6"></div>
              <p className="text-lg text-gray-600 font-light tracking-wide">
                Curated collection for the modern {getPageTitle().toLowerCase()}
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
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-none focus:bg_white focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all duration-200 text-gray-900 placeholder-gray-500 hover:bg-white"
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
                    { label: 'Under Rs. 500', value: 'under-50' },
                    { label: 'Rs. 500 - Rs. 1000', value: '50-100' },
                    { label: 'Rs. 1000 - Rs. 2000', value: '100-200' },
                    { label: 'Premium (Rs. 2000+)', value: '200-plus' }
                  ].map((price) => (
                    <label key={price.value} className="flex items-center group cursor-pointer">
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={selectedPrices.includes(price.value)}
                          onChange={() => handlePriceToggle(price.value)}
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
                    { label: 'New Arrivals', value: 'new' },
                    { label: 'Trending (Top 10 sold)', value: 'trending' },
                    { label: 'Signature Series (KINN)', value: 'signature' }
                  ].map((collection) => (
                    <label key={collection.value} className="flex items-center justify-between group cursor-pointer">
                      <div className="flex items-center">
                        <div className="relative">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={selectedCollections.includes(collection.value)}
                            onChange={() => handleCollectionToggle(collection.value)}
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
                    </label>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              <button onClick={clearFilters} className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm uppercase tracking-wider">
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
                  Showing <span className="text-gray-900">{sortedProducts.length}</span> of <span className="text-gray-900">{products.length}</span> products
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 font-medium">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-gray-200 px-4 py-2 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
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
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  rating={product.rating}
                  reviews={product.reviews}
                  onQuickView={() => openQuickView(product)}
                  onAddToCart={() => {
                    if (!user) {
                      window.location.href = '/login'
                      return
                    }
                    if (user.role === 'admin') {
                      return
                    }
                    addItem(product, 1)
                  }}
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
                src={(quickViewProduct.images && quickViewProduct.images[0]) || quickViewProduct.image}
                alt={quickViewProduct.name}
                className="h-full w-full object-contain bg-white"
                loading="lazy"
              />
            </div>
            <div className="w-1/2 p-6">
              <p className="text-xs uppercase tracking-wider text-gray-500">{quickViewProduct.category}</p>
              <h3 className="mt-1 text-xl font-semibold text-gray-900">{quickViewProduct.name}</h3>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-lg font-bold text-gray-900">Rs. {quickViewProduct.price.toFixed(2)}</span>
                {typeof quickViewProduct.originalPrice === 'number' && (
                  <del className="text-sm text-gray-400">Rs. {quickViewProduct.originalPrice.toFixed(2)}</del>
                )}
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  className="inline-flex flex-1 items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black"
                  onClick={() => {
                    if (!user) {
                      window.location.href = '/login'
                      return
                    }
                    if (user.role === 'admin') {
                      return
                    }
                    addItem(quickViewProduct, 1)
                  }}
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