import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import NavBar from '../components/Common/NavBar'
import apiFetch from '../utils/api'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { Star, ChevronLeft, Sparkles } from 'lucide-react'

const ProductDetail = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const params = useParams()
  const { addItem } = useCart()
  const { user } = useAuth()
  const { show } = useToast()
  const [product, setProduct] = useState(location.state?.product || null)
  const [loading, setLoading] = useState(!location.state?.product)
  const isAdmin = user?.role === 'admin'

  const averageRating = useMemo(() => {
    if (!product) return null
    const list = product.reviews || []
    if (!list.length) return null
    const avg = list.reduce((a, r) => a + (Number(r.rating) || 0), 0) / list.length
    return Number(avg.toFixed(1))
  }, [product])

  useEffect(() => {
    const fetchProduct = async () => {
      if (product) return
      const slug = params.id
      if (!slug) return
      try {
        setLoading(true)
        const res = await apiFetch(`/api/products/${slug}`)
        const json = await res.json()
        setProduct(json?.data?.product || null)
      } catch {
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [params.id, product])

  if (loading) return <LoadingState />
  if (!product) return <NotFound onBack={() => navigate(-1)} />

  const details = [
    { label: 'Category', value: product.category },
    { label: 'Brand', value: product.brand },
    { label: 'Gender', value: product.gender === 'unisex' ? 'Unisex' : product.gender?.[0]?.toUpperCase() + product.gender?.slice(1) },
    { label: 'In Stock', value: typeof product.countInStock === 'number' ? product.countInStock : undefined },
    { label: 'SKU', value: product._id },
  ].filter(d => d.value !== undefined && d.value !== null && d.value !== '')

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      {/* subtle ambient accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-gradient-to-br from-gray-200 to-white blur-3xl opacity-60" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-gradient-to-br from-gray-100 to-white blur-3xl opacity-70" />
      </div>

      <NavBar />

      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-20">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <ProductMedia images={product.images} image={product.image} name={product.name} />

          <section>
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">{product.category}</p>
            <h1 className="mt-2 text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight">{product.name}</h1>

            {/* Price */}
            <div className="mt-4 flex items-end gap-3">
              <span className="text-2xl md:text-3xl font-bold text-gray-900">Rs. {Number(product.price).toFixed(2)}</span>
              {typeof product.originalPrice === 'number' && (
                <del className="text-sm md:text-base text-gray-400">Rs. {Number(product.originalPrice).toFixed(2)}</del>
              )}
            </div>

            {/* Average Rating */}
            {averageRating !== null && (
              <div className="mt-3 flex items-center gap-2">
                <StarRow value={Math.round(averageRating)} size="md" />
                <span className="text-sm text-gray-600">{averageRating} / 5 · {(product.reviews || []).length} reviews</span>
              </div>
            )}

            {/* Details Grid */}
            {details.length > 0 && (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {details.map((d, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-xl border border-gray-100 bg-white/60 backdrop-blur px-4 py-2 shadow-sm">
                    <span className="text-xs text-gray-500">{d.label}</span>
                    <span className="text-sm font-medium text-gray-900 truncate max-w-[14rem] text-right">{String(d.value)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div className="mt-6">
                <h3 className="text-xs font-semibold text-gray-900 mb-2 uppercase tracking-wider">Description</h3>
                <p className="text-sm leading-7 text-gray-700 whitespace-pre-line">{product.description}</p>
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 flex gap-4">
              {!isAdmin && (
                <button
                  onClick={() => addItem(product, 1)}
                  className="flex-1 rounded-2xl bg-gray-900 px-6 py-3 text-sm font-medium tracking-wide text-white hover:bg-black transition"
                >
                  Add to Cart
                </button>
              )}
              <button
                onClick={() => navigate(-1)}
                className="rounded-2xl border border-gray-300 px-6 py-3 text-sm font-medium text-gray-800 hover:bg-white/60 hover:backdrop-blur transition"
              >
                Back
              </button>
            </div>

            {/* Admin */}
            {isAdmin && (
              <div className="mt-8 p-5 border border-gray-200 rounded-2xl bg-white/70 backdrop-blur">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Admin Tools</h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <p><strong>ID:</strong> {product._id || 'N/A'}</p>
                  <p><strong>Slug:</strong> {product.slug}</p>
                  <p><strong>Stock:</strong> {product.countInStock}</p>
                  <p><strong>Status:</strong> {product.isActive ? 'Active' : 'Inactive'}</p>
                </div>
              </div>
            )}

            {/* Reviews */}
            <section className="mt-12">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">Reviews</h3>
                <Sparkles className="h-4 w-4 text-gray-400" />
              </div>

              <div className="mt-4 space-y-4">
                {(product.reviews || []).length === 0 && (
                  <p className="text-sm text-gray-600">No reviews yet.</p>
                )}
                {(product.reviews || []).map((r, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-100 p-4 rounded-2xl bg-white/60 backdrop-blur shadow-sm"
                  >
                    <StarRow value={Number(r.rating) || 0} size="sm" />
                    {r.comment && (
                      <div className="text-sm text-gray-700 mt-2">{r.comment}</div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">{new Date(r.createdAt || Date.now()).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>

              {user && user.role !== 'admin' && (
                <ReviewForm
                  slug={product.slug}
                  onSubmitted={async () => {
                    try {
                      console.log('Refreshing product data after review submission...');
                      const res = await apiFetch(`/api/products/${product.slug}`)
                      if (!res.ok) {
                        throw new Error(`Failed to refresh product: ${res.status}`);
                      }
                      const json = await res.json()
                      console.log('Updated product data:', json?.data?.product);
                      setProduct(json?.data?.product || product)
                      show('Review added successfully!', { type: 'success' })
                    } catch (error) {
                      console.error('Failed to refresh product data:', error)
                      // Still show success message even if refresh fails
                      show('Review added successfully!', { type: 'success' })
                    }
                  }}
                />
              )}
            </section>
          </section>
        </div>
      </main>
    </div>
  )
}

/** Product media with 3D tilt + zoom **/
const ProductMedia = ({ images, image, name }) => {
  const ref = useRef(null)
  const [transform, setTransform] = useState('')

  const onMove = (e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    const rx = (py * -6).toFixed(2) // tilt X
    const ry = (px * 6).toFixed(2)  // tilt Y
    setTransform(`rotateX(${rx}deg) rotateY(${ry}deg) scale(1.03)`)
  }

  const reset = () => setTransform('')

  const src = (images && images[0]) || image

  return (
    <section className="relative">
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={reset}
        className="relative overflow-hidden rounded-3xl shadow-lg bg-gradient-to-b from-gray-100 to-white"
        style={{ transformStyle: 'preserve-3d', transition: 'transform 200ms ease' }}
      >
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover select-none will-change-transform transition-transform duration-700"
          style={{ transform }}
        />
        {/* soft reflection */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/0 via-white/0 to-white/20" />
        {/* bottom fade */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/10 to-transparent" />
      </div>
    </section>
  )
}

/** Star row with fill + subtle glow **/
const StarRow = ({ value = 0, size = 'md' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const active = i < value
        return (
          <Star
            key={i}
            className={`${sizes[size]} ${active ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        )
      })}
    </div>
  )
}

/** Review form component **/
const ReviewForm = ({ slug, onSubmitted }) => {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const { show } = useToast()

  const submit = async (e) => {
    e.preventDefault()
    console.log('Submitting review:', { rating, comment, slug })
    
    try {
      const token = localStorage.getItem('kin_auth') ? JSON.parse(localStorage.getItem('kin_auth')).token : null
      console.log('Auth token:', token ? 'Present' : 'Missing')
      
      if (!token) {
        show('Please log in to add a review', { type: 'error' })
        return
      }

      const res = await apiFetch(`/api/products/${slug}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating, comment }),
      })
      
      console.log('Review submission response:', res.status, res.statusText)
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        console.error('Review submission error response:', err)
        throw new Error(err.message || 'Failed to add review')
      }
      
      const responseData = await res.json()
      console.log('Review submission success:', responseData)
      
      setComment('')
      setRating(5)
      show('Review submitted successfully!', { type: 'success' })
      if (onSubmitted) onSubmitted()
    } catch (e) {
      console.error('Review submission error:', e)
      show(e.message || 'Failed to add review', { type: 'error' })
    }
  }

  return (
    <form
      onSubmit={submit}
      className="mt-6 border border-gray-100 p-5 rounded-2xl bg-white/70 backdrop-blur shadow-sm"
    >
      <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Write a review</h4>

      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            >
              <Star
                className={`h-6 w-6 transition-colors ${
                  star <= rating 
                    ? 'fill-yellow-400 text-yellow-400' 
                    : 'text-gray-300 hover:text-yellow-300'
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-500">({rating}/5)</span>
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
          Comment (optional)
        </label>
        <textarea
          id="comment"
          className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900/30"
          rows={3}
          placeholder="Share your thoughts about this product..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm hover:bg-black shadow-md transition-all"
        >
          Submit Review
        </button>
        <button
          type="button"
          onClick={() => {
            setComment('')
            setRating(5)
          }}
          className="border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-all"
        >
          Clear
        </button>
      </div>
    </form>
  )
}

const LoadingState = () => (
  <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
    <NavBar />
    <div className="max-w-5xl mx-auto px-6 pt-24 pb-16">
      <p className="text-gray-700 animate-pulse">Loading product...</p>
    </div>
  </div>
)

const NotFound = ({ onBack }) => (
  <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
    <NavBar />
    <div className="max-w-5xl mx-auto px-6 pt-24 pb-16 text-center">
      <p className="text-gray-700">Product not found.</p>
      <button
        onClick={onBack}
        className="mt-6 rounded-2xl bg-gray-900 px-6 py-2 text-sm font-medium text-white hover:bg-black"
      >
        Go Back
      </button>
    </div>
  </div>
)

export default ProductDetail
