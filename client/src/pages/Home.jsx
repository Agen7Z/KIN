import React, { useEffect, useState } from 'react'
import NavBar from '../components/Common/NavBar'
import Hero from '../components/Common/Hero'
import GenderSection from '../components/Common/GenderSection'

const Home = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/products')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        console.log('Products response:', data)
        const productsList = data?.data?.products || data?.products || []
        console.log('Extracted products:', productsList)
        setProducts(productsList)
      } catch (error) {
        console.error('Error fetching products:', error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  if (loading) {
    return (
      <>
        <NavBar />
        <Hero />
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </>
    )
  }

  return (
    <>
      <NavBar />
      <Hero />
      
      {/* Gender-based Product Sections */}
      <GenderSection 
        title="Men's Collection" 
        gender="men" 
        products={products} 
      />
      
      <GenderSection 
        title="Women's Collection" 
        gender="women" 
        products={products} 
      />
      
      <GenderSection 
        title="Unisex Collection" 
        gender="unisex" 
        products={products} 
      />
    </>
  )
}

export default Home