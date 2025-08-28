import React, { useEffect, useState } from 'react'
import NavBar from '../components/Common/NavBar'
import Hero from '../components/Common/Hero'
import GenderSection from '../components/Common/GenderSection'

const Home = () => {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products')
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (data.success) {
          // Products loaded successfully
        }
      } catch (error) {
        // Handle error silently
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
    </>
  )
}

export default Home