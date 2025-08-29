import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import apiFetch from '../utils/api'
import { Package, Users, ShoppingCart, Plus, Trash2, Eye, Edit3, Home, Menu, X, Megaphone, MessageSquare } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import ImageUpload from '../components/Admin/ImageUpload.jsx'
import { useToast } from '../hooks/useToast'
import { useSocket } from '../context/SocketContext.jsx'

const AdminDashboard = () => {
  const { user, logout } = useAuth()
  const { show } = useToast()
  const [activeSection, setActiveSection] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // State for data - ensure they are always arrays
  const [users, setUsers] = useState([])
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', onConfirm: null, loading: false })
  
  // Pagination and search state for products
  const [currentPage, setCurrentPage] = useState(1)
  const [productsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredProducts, setFilteredProducts] = useState([])
  const [noticeForm, setNoticeForm] = useState({ title: '', message: '' })
  const [sendingNotice, setSendingNotice] = useState(false)
  const { chatThreads, fetchRecent, setActiveChatUserId, activeChatUserId, adminSendMessage, typingState, setTyping, fetchThread } = useSocket()
  const [recentChats, setRecentChats] = useState([])
  const [userSearch, setUserSearch] = useState('')
  const [adminMsgText, setAdminMsgText] = useState('')

  // Safety function to ensure state is always an array
  const ensureArray = (value) => {
    if (Array.isArray(value)) return value
    if (value === null || value === undefined) return []
    return []
  }
  
  // Product form state
  const [form, setForm] = useState({ 
    name: '', 
    slug: '', 
    price: '', 
    description: '', 
    category: 'general',
    gender: 'unisex',
    brand: '',
    images: [],
    countInStock: 0
  })

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('kin_auth') ? JSON.parse(localStorage.getItem('kin_auth')).token : null
      
      if (!token) {
        return
      }

      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      // Fetch all data in parallel
      const [usersRes, ordersRes, productsRes] = await Promise.all([
        apiFetch('/api/users', { headers }),
        apiFetch('/api/orders', { headers }),
        apiFetch('/api/products/admin/all', { headers })
      ])

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(ensureArray(usersData.data?.users || usersData.data))
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json()
        setOrders(ensureArray(ordersData.data?.orders || ordersData.data))
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json()
        setProducts(ensureArray(productsData.data?.products || productsData.data))
      }
    } catch (error) {
      // Handle error silently
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch data from backend
  useEffect(() => {
    if (user?.role === 'admin') {
      fetchData()
    }
  }, [user, fetchData])

  // Filter and paginate products when products or search term changes
  useEffect(() => {
    const filtered = safeProducts.filter(product => 
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.gender?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredProducts(filtered)
    setCurrentPage(1) // Reset to first page when search changes
  }, [products, searchTerm])

  // Load recent chats when viewing Messages
  useEffect(() => {
    if (activeSection === 'messages') {
      fetchRecent((list) => setRecentChats(list))
    }
  }, [activeSection, fetchRecent])

  // Load selected user's thread when a user is chosen
  useEffect(() => {
    if (activeSection === 'messages' && activeChatUserId) {
      fetchThread(activeChatUserId, undefined, { limit: 20 })
    }
  }, [activeSection, activeChatUserId, fetchThread])

  // Get current products for current page
  const indexOfLastProduct = currentPage * productsPerPage
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct)
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber)







  // Calculate stats - moved inside render functions to avoid execution during component definition



    const submitProduct = async () => {
    // Validate required fields
    if (!form.name || !form.slug || !form.price) {
      show('Please fill in Product Name, Slug, and Price', { type: 'warning' })
      return
    }
    
    if (form.price <= 0) {
      show('Price must be greater than 0', { type: 'warning' })
      return
    }
    
    if (form.countInStock < 0) {
      show('Stock quantity cannot be negative', { type: 'warning' })
      return
    }
    
    try {
      setSubmitting(true)
      
      const token = localStorage.getItem('kin_auth') ? JSON.parse(localStorage.getItem('kin_auth')).token : null
      
      if (!token) {
        show('Authentication token not found. Please login again.', { type: 'error' })
        return
      }

      // Check if we're editing an existing product
      const existingProduct = safeProducts.find(p => p.slug === form.slug)
      const isEditing = existingProduct && form.name
      
      const productData = {
        ...form,
        price: Number(form.price),
        countInStock: Number(form.countInStock)
      }

      let response
      if (isEditing) {
        // Update existing product
        response = await apiFetch(`/api/products/${existingProduct._id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(productData)
        })
      } else {
        // Create new product
        response = await apiFetch('/api/products', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(productData)
        })
      }
       
      if (response.ok) {
        const result = await response.json()
        
        if (isEditing) {
          // Update products list for edited product
          setProducts(prev => ensureArray(prev).map(p => p._id === existingProduct._id ? result.data : p))
          show('Product updated successfully!', { type: 'success' })
        } else {
          // Add new product to list
          setProducts(prev => [result.data, ...ensureArray(prev)])
          show('Product added successfully!', { type: 'success' })
        }
         
        // Clear form
        setForm({ 
          name: '', 
          slug: '', 
          price: '', 
          description: '', 
          category: 'general',
          gender: 'unisex',
          brand: '',
          images: [],
          countInStock: 0
        })
        setActiveSection('products')
      } else {
        const errorData = await response.json()
        show(`Failed to ${isEditing ? 'update' : 'add'} product: ${errorData.message || 'Unknown error'}`, { type: 'error' })
      }
    } catch (error) {
      console.error('Product submission error:', error)
      show(`Failed to ${isEditing ? 'update' : 'add'} product. Please try again.`, { type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

     const deleteProduct = async (id) => {
    try {
      const token = localStorage.getItem('kin_auth') ? JSON.parse(localStorage.getItem('kin_auth')).token : null
      if (!token) return

      const response = await apiFetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setProducts(prev => ensureArray(prev).filter(p => p._id !== id))
        show('Product deleted', { type: 'success' })
      } else {
        show('Failed to delete product', { type: 'error' })
      }
    } catch (error) {
      show('Failed to delete product. Please try again.', { type: 'error' })
    }
  }

  const confirmDeleteProduct = (id) => {
    setConfirmModal({
      open: true,
      title: 'Delete product?',
      message: 'This action cannot be undone.',
      loading: false,
      onConfirm: async () => deleteProduct(id)
    })
  }

  const deleteUser = async (id) => {
    try {
      const token = localStorage.getItem('kin_auth') ? JSON.parse(localStorage.getItem('kin_auth')).token : null
      if (!token) return

      const response = await apiFetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setUsers(prev => ensureArray(prev).filter(u => u._id !== id))
        show('User deleted', { type: 'success' })
      } else {
        show('Failed to delete user', { type: 'error' })
      }
    } catch (error) {
      show('Failed to delete user. Please try again.', { type: 'error' })
    }
  }

  const confirmDeleteUser = (id) => {
    setConfirmModal({
      open: true,
      title: 'Delete user?',
      message: 'This will permanently remove the user.',
      loading: false,
      onConfirm: async () => deleteUser(id)
    })
  }

           const handleImagesChange = (newImages) => {
      setForm(prev => ({ ...prev, images: ensureArray(newImages) }))
    }

       const editProduct = (product) => {
      if (!product) return
      setForm({
        name: product.name || '',
        slug: product.slug || '',
        price: product.price || '',
        description: product.description || '',
        category: product.category || 'general',
        gender: product.gender || 'unisex',
        brand: product.brand || '',
        images: ensureArray(product.images),
        countInStock: product.countInStock || 0
      })
      setActiveSection('add-product')
    }

     const updateOrder = async (id, status) => {
     try {
       const token = localStorage.getItem('kin_auth') ? JSON.parse(localStorage.getItem('kin_auth')).token : null
       if (!token) return

      const response = await apiFetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      })

             if (response.ok) {
         setOrders(prev => ensureArray(prev).map(o => o._id === id ? { ...o, status } : o))
         show('Order updated', { type: 'success' })
       } else {
         show('Failed to update order', { type: 'error' })
       }
    } catch (error) {
      show('Failed to update order status. Please try again.', { type: 'error' })
    }
  }

  // Access control
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center max-w-md">
          <div className="text-red-500 mb-4">
            <ShoppingCart className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You need admin privileges to access this dashboard.</p>
          <button
            onClick={logout}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'products', label: 'Product List', icon: Package },
    { id: 'add-product', label: 'Add Product', icon: Plus },
    { id: 'users', label: 'Manage Users', icon: Users },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'notices', label: 'Send Notice', icon: Megaphone },
    { id: 'messages', label: 'Messages', icon: MessageSquare, external: '/admin/chat' }
  ]

  // Ensure state is always arrays before rendering
  const safeUsers = ensureArray(users)
  const safeOrders = ensureArray(orders)
  const safeProducts = ensureArray(products)

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <div className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      ) : (
        <>
                     {/* Stats Cards */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm font-medium text-gray-600">Total Products</p>
                   <p className="text-3xl font-bold text-gray-900">{safeProducts.length}</p>
                 </div>
                 <div className="bg-blue-50 rounded-lg p-3">
                   <Package className="w-8 h-8 text-blue-600" />
                 </div>
               </div>
             </div>

             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm font-medium text-gray-600">Total Users</p>
                   <p className="text-3xl font-bold text-gray-900">{safeUsers.length}</p>
                 </div>
                 <div className="bg-green-50 rounded-lg p-3">
                   <Users className="w-8 h-8 text-green-600" />
                 </div>
               </div>
             </div>

             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm font-medium text-gray-600">Total Orders</p>
                   <p className="text-3xl font-bold text-gray-900">{safeOrders.length}</p>
                 </div>
                 <div className="bg-yellow-50 rounded-lg p-3">
                   <ShoppingCart className="w-8 h-8 text-yellow-600" />
                 </div>
               </div>
             </div>
           </div>

                     {/* Recent Activity */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
               <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
               {safeOrders.length === 0 ? (
                 <p className="text-gray-500 text-center py-4">No orders yet</p>
               ) : (
                 <div className="space-y-4">
                   {safeOrders.slice(0, 3).map((order) => (
                    <div key={order._id} className="flex items-center justify-between py-2">
                      <div>
                        <p className="font-medium text-gray-900">#{order._id.slice(-6)}</p>
                        <p className="text-sm text-gray-500">{order.user?.email ? order.user.email.split('@')[0] : 'Unknown'}</p>
                      </div>
                                           <div className="text-right">
                       <p className="font-medium text-gray-900">Rs. {order.total?.toFixed(2) || '0.00'}</p>
                       <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                         order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                         order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                         'bg-gray-100 text-gray-800'
                       }`}>
                         {order.status}
                       </span>
                     </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

                         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
               <h3 className="text-lg font-semibold text-gray-900 mb-4">Latest Products</h3>
               {safeProducts.length === 0 ? (
                 <p className="text-gray-500 text-center py-4">No products yet</p>
               ) : (
                 <div className="space-y-4">
                   {safeProducts.slice(0, 3).map((product) => (
                    <div key={product._id} className="flex items-center space-x-4">
                      {product.images?.[0] && (
                        <img src={product.images[0]} alt={product.name} className="w-10 h-10 object-cover rounded-lg" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.category}</p>
                      </div>
                                           <div className="text-right">
                       <p className="font-medium text-gray-900">Rs. {product.price?.toFixed(2) || '0.00'}</p>
                     </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )

  const renderProductList = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Product List</h1>
        <button
          onClick={() => {
            setForm({ 
              name: '', 
              slug: '', 
              price: '', 
              description: '', 
              category: 'general',
              gender: 'unisex',
              brand: '',
              images: [],
              countInStock: 0
            })
            setActiveSection('add-product')
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search products by name, category, gender, or brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="px-4 py-3 text-gray-500 hover:text-gray-700 transition-colors"
              title="Clear search"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <div className="text-sm text-gray-600">
            Showing {currentProducts.length} of {filteredProducts.length} products
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
             ) : safeProducts.length === 0 ? (
         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
           <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
           <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
           <p className="text-gray-500 mb-4">Get started by adding your first product</p>
           <button
             onClick={() => setActiveSection('add-product')}
             className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
           >
             Add Product
           </button>
         </div>
               ) : filteredProducts.length === 0 ? (
         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
           <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
           <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
           <p className="text-gray-500 mb-4">Try adjusting your search terms</p>
           <button
             onClick={() => setSearchTerm('')}
             className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
           >
             Clear Search
           </button>
         </div>
               ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                All Products ({filteredProducts.length} found, {safeProducts.length} total)
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {currentProducts.map((product) => (
              <div key={product._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.name} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900">{product.name || 'Unnamed Product'}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {product.gender || 'unisex'} • {product.category || 'general'} • {product.brand || 'No Brand'}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-sm">
                      <span className="font-medium text-green-600">
                        Rs. {product.price ? product.price.toFixed(2) : '0.00'}
                      </span>
                      <span className="text-gray-500">
                        Stock: {product.countInStock || 0}
                      </span>
                      <span className="text-gray-400">
                        /{product.slug || 'no-slug'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                                         <a 
                       href={`/product/${product.slug || product._id}`}
                       className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                       title="View Product"
                     >
                       <Eye className="w-5 h-5" />
                     </a>
                     <button 
                       onClick={() => console.log('Product:', product)} 
                       className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                       title="Debug Product"
                     >
                       <span className="text-xs">DBG</span>
                     </button>
                    <button 
                      onClick={() => editProduct(product)} 
                      className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                      title="Edit Product"
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => confirmDeleteProduct(product._id)} 
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages} ({indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, filteredProducts.length)} of {filteredProducts.length} products)
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      currentPage === 1
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                    }`}
                  >
                    Previous
                  </button>
                  
                  {/* Page Numbers */}
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          currentPage === number
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                        }`}
                      >
                        {number}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      currentPage === totalPages
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )

     const renderAddProduct = () => (
     <div className="space-y-6">
       <h1 className="text-2xl font-bold text-gray-900">
         {form.name ? `Edit Product: ${form.name}` : 'Add New Product'}
       </h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="max-w-2xl">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                <input 
                  value={form.name} 
                  onChange={(e)=>setForm({...form,name:e.target.value})} 
                  placeholder="Enter product name" 
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Slug</label>
                <input 
                  value={form.slug} 
                  onChange={(e)=>setForm({...form,slug:e.target.value})} 
                  placeholder="product-url-slug" 
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                               <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Price (Rs.)</label>
                   <input 
                     type="number" 
                     step="0.01"
                     value={form.price} 
                     onChange={(e)=>setForm({...form,price:e.target.value})} 
                     placeholder="0.00" 
                     className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                   />
                 </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
                <input 
                  type="number" 
                  value={form.countInStock} 
                  onChange={(e)=>setForm({...form,countInStock:e.target.value})} 
                  placeholder="0" 
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select 
                  value={form.category} 
                  onChange={(e)=>setForm({...form,category:e.target.value})} 
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="party">Party</option>
                  <option value="classic">Classic</option>
                  <option value="formal">Formal</option>
                  <option value="general">General</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select 
                  value={form.gender} 
                  onChange={(e)=>setForm({...form,gender:e.target.value})} 
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                  <option value="unisex">Unisex</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                <input 
                  value={form.brand} 
                  onChange={(e)=>setForm({...form,brand:e.target.value})} 
                  placeholder="Brand name" 
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea 
                value={form.description} 
                onChange={(e)=>setForm({...form,description:e.target.value})} 
                placeholder="Product description" 
                rows="4"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
              <ImageUpload 
                onImagesChange={handleImagesChange}
                currentImages={form.images}
              />
            </div>
            
                         <div className="flex space-x-4">
                                <button 
                   onClick={submitProduct} 
                   disabled={submitting}
                   className={`font-medium py-3 px-6 rounded-lg transition-colors flex items-center space-x-2 ${
                     submitting 
                       ? 'bg-gray-400 cursor-not-allowed text-white' 
                       : 'bg-blue-600 hover:bg-blue-700 text-white'
                   }`}
                 >
                   {submitting ? (
                     <>
                       <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                       <span>{form.name ? 'Updating Product...' : 'Adding Product...'}</span>
                     </>
                   ) : (
                     <>
                       <Plus className="w-4 h-4" />
                       <span>{form.name ? 'Update Product' : 'Add Product'}</span>
                     </>
                   )}
                 </button>
                                <button 
                   onClick={() => {
                     setForm({ 
                       name: '', 
                       slug: '', 
                       price: '', 
                       description: '', 
                       category: 'general',
                       gender: 'unisex',
                       brand: '',
                       images: [],
                       countInStock: 0
                     })
                     setActiveSection('products')
                   }} 
                   disabled={submitting}
                   className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                 >
                   Cancel
                 </button>
                 {form.name && (
                   <button 
                     onClick={() => {
                       setForm({ 
                         name: '', 
                         slug: '', 
                         price: '', 
                         description: '', 
                         category: 'general',
                         gender: 'unisex',
                         brand: '',
                         images: [],
                         countInStock: 0
                       })
                     }}
                     disabled={submitting}
                     className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                   >
                     Clear Form
                   </button>
                 )}
             </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderUsers = () => (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
             ) : safeUsers.length === 0 ? (
         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
           <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
           <h3 className="text-lg font-medium text-gray-900 mb-2">No users yet</h3>
           <p className="text-gray-500">Users will appear here once they register</p>
         </div>
       ) : (
         <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
           <div className="p-6 border-b border-gray-200">
             <h2 className="text-lg font-semibold text-gray-900">All Users ({safeUsers.length})</h2>
           </div>
           <div className="overflow-x-auto">
             <table className="min-w-full divide-y divide-gray-200">
               <thead className="bg-gray-50">
                 <tr>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                 </tr>
               </thead>
               <tbody className="bg-white divide-y divide-gray-200">
                 {safeUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{u.username}</div>
                        <div className="text-sm text-gray-500">{u.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                        u.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button 
                        onClick={() => confirmDeleteUser(u._id)} 
                        className="text-red-600 hover:text-red-900 transition-colors font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )

  const renderOrders = () => (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
             ) : safeOrders.length === 0 ? (
         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
           <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
           <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
           <p className="text-gray-500">Orders will appear here once customers make purchases</p>
         </div>
       ) : (
         <div className="space-y-4">
           {safeOrders.map((order) => (
            <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Order #{order._id.slice(-6)}</h3>
                  <p className="text-sm text-gray-500">Customer: {order.user?.email ? order.user.email.split('@')[0] : 'Unknown'} • Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                  <p className="text-lg font-medium text-green-600 mt-1">Rs. {order.total?.toFixed(2) || '0.00'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Pending'}
                  </span>
                  <a href={`/orders/${order._id}`} className="px-3 py-1.5 rounded-lg text-sm bg-neutral-900 text-white hover:bg-black">View</a>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Update Status:</p>
                <div className="flex flex-wrap gap-2">
                  {['pending','processing','shipped','delivered','cancelled'].map((status) => (
                    <button 
                      key={status}
                      onClick={() => updateOrder(order._id, status)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        order.status === status
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderNotices = () => (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Send Notice</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-2xl">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title (optional)</label>
            <input
              value={noticeForm.title}
              onChange={(e)=>setNoticeForm(f=>({...f,title:e.target.value}))}
              placeholder="Announcement title"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
            <textarea
              value={noticeForm.message}
              onChange={(e)=>setNoticeForm(f=>({...f,message:e.target.value}))}
              placeholder="Write the notice to broadcast to all users"
              rows="4"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              disabled={sendingNotice}
              onClick={async ()=>{
                if(!noticeForm.message.trim()) { show('Notice message is required', { type:'warning' }); return }
                try {
                  setSendingNotice(true)
                  const token = localStorage.getItem('kin_auth') ? JSON.parse(localStorage.getItem('kin_auth')).token : null
                  const res = await apiFetch('/api/notices', {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ title: noticeForm.title, message: noticeForm.message })
                  })
                  if(res.ok){
                    setNoticeForm({ title: '', message: '' })
                    show('Notice sent to all users', { type:'success' })
                  } else {
                    const err = await res.json().catch(()=>({}))
                    show(err?.message || 'Failed to send notice', { type:'error' })
                  }
                } catch (e){
                  show('Failed to send notice', { type:'error' })
                } finally { setSendingNotice(false) }
              }}
              className={`font-medium py-3 px-6 rounded-lg transition-colors ${sendingNotice ? 'bg-gray-400 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
            >
              {sendingNotice ? 'Sending…' : 'Send Notice'}
            </button>
            <p className="text-sm text-gray-500">Notices auto-expire after 24 hours.</p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderMessages = () => {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Messages</h1>
          <p className="text-gray-600 mb-6">Access the dedicated chat interface for better user experience</p>
          <Link
            to="/admin/chat"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <MessageSquare className="w-5 h-5" />
            Open Chat Interface
          </Link>
        </div>
      </div>
    )
  }






  const renderContent = () => {
    return (
      <>
        {activeSection === 'overview' && renderOverview()}
        {activeSection === 'products' && renderProductList()}
        {activeSection === 'add-product' && renderAddProduct()}
        {activeSection === 'users' && renderUsers()}
        {activeSection === 'orders' && renderOrders()}
        {activeSection === 'notices' && renderNotices()}
        {activeSection === 'messages' && renderMessages()}
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors">
              KINN
            </a>
            <span className="text-gray-400">|</span>
            <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">Welcome, {user?.email ? user.email.split('@')[0] : 'Admin'}</div>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      
      <div className="flex pt-16">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
        
        {/* Sidebar */}
        <div className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex items-center justify-between p-6 lg:hidden">
            <h2 className="text-xl font-semibold text-gray-900">Menu</h2>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
          
          <nav className="mt-8 px-4">
            <div className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon
                                 if (item.external) {
                   return (
                     <Link
                       key={item.id}
                       to={item.external}
                       className="w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                     >
                       <Icon className="w-5 h-5" />
                       <span className="font-medium">{item.label}</span>
                     </Link>
                   )
                 }
                 return (
                   <button
                     key={item.id}
                     onClick={() => {
                       setActiveSection(item.id)
                       setSidebarOpen(false)
                     }}
                     className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                       activeSection === item.id
                         ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                         : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                       }`}
                   >
                     <Icon className="w-5 h-5" />
                     <span className="font-medium">{item.label}</span>
                   </button>
                 )
              })}
            </div>
          </nav>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-20 left-4 z-20 lg:hidden bg-white rounded-lg p-2 shadow-md border border-gray-200"
        >
          <Menu className="w-6 h-6 text-gray-600" />
        </button>

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          <div className="p-6 lg:p-8">
            {renderContent()}
          </div>
        </div>
      </div>

      {confirmModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => !confirmModal.loading && setConfirmModal(c => ({ ...c, open: false }))} />
          <div className="relative z-10 w-full max-w-md bg-white rounded-xl shadow-2xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900">{confirmModal.title || 'Please Confirm'}</h3>
            <p className="text-sm text-gray-600 mt-2">{confirmModal.message || 'Are you sure you want to continue?'}</p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                className="px-4 py-2 text-sm rounded border border-gray-200"
                disabled={confirmModal.loading}
                onClick={() => setConfirmModal(c => ({ ...c, open: false }))}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 text-sm rounded ${confirmModal.loading ? 'bg-red-400' : 'bg-red-600 hover:bg-red-700'} text-white`}
                disabled={confirmModal.loading}
                onClick={async () => {
                  try {
                    setConfirmModal(c => ({ ...c, loading: true }))
                    await confirmModal.onConfirm?.()
                    setConfirmModal(c => ({ ...c, open: false, loading: false }))
                  } catch {
                    setConfirmModal(c => ({ ...c, loading: false }))
                  }
                }}
              >
                {confirmModal.loading ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard