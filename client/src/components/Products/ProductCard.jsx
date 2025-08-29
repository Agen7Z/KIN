import React from 'react'
import { Link } from 'react-router-dom'

const StarIcon = ({ filled = false }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    aria-hidden="true"
    className={`h-4 w-4 ${filled ? 'fill-yellow-400' : 'fill-gray-300'}`}
  >
    <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z" />
  </svg>
)

const ProductCard = ({
  product,
  image,
  title,
  price,
  originalPrice,
  category,
  rating = 0,
  reviews,
  onAddToCart,
  onQuickView,
}) => {
  const cardImage = (product?.images && product.images[0]) ?? product?.image ?? image
  const cardTitle = product?.name ?? title
  const cardCategory = product?.category ?? category
  const cardPrice = product?.price ?? price
  const cardOriginal = product?.originalPrice ?? originalPrice
  const isNew = product?.isNew
  const isTrending = product?.isTrending

  const handleQuickView = (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (onQuickView) onQuickView()
  }

  const handleAddToCart = (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (onAddToCart) onAddToCart()
  }

  const formattedPrice = typeof cardPrice === 'number' ? `Rs. ${cardPrice.toFixed(2)}` : cardPrice
  const formattedOriginal = typeof cardOriginal === 'number' ? `Rs. ${cardOriginal.toFixed(2)}` : cardOriginal
  const discount =
    typeof cardPrice === 'number' && typeof cardOriginal === 'number'
      ? Math.max(0, Math.round(((cardOriginal - cardPrice) / cardOriginal) * 100))
      : null

  return (
    <article className="group relative overflow-hidden rounded-3xl bg-white shadow-[0_12px_40px_-16px_rgba(0,0,0,0.25)] ring-1 ring-gray-100 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_60px_-20px_rgba(0,0,0,0.35)]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-transparent to-white/40 opacity-60" />
      </div>
      <Link to={`/product/${product?.slug || product?._id || product?.id || ''}`} state={{ product }} className="relative block aspect-[16/13] w-full overflow-hidden">
        {cardImage ? (
          <img
            src={cardImage}
            alt={cardTitle}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            loading="lazy"
          />
        ) : null}

        {(isNew || isTrending) && (
          <div className="absolute left-4 top-4 flex gap-2">
            {isNew && (
              <span className="rounded-full bg-black/80 backdrop-blur px-3 py-1 text-[10px] font-semibold tracking-wide text-white uppercase">New</span>
            )}
            {isTrending && (
              <span className="rounded-full bg-purple-600 px-3 py-1 text-[10px] font-semibold tracking-wide text-white uppercase">Trending</span>
            )}
          </div>
        )}
        {discount ? (
          <div className="absolute right-4 top-4 rounded-full bg-emerald-500/95 px-3 py-1 text-xs font-bold text-white shadow-lg">
            -{discount}%
          </div>
        ) : null}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

        {/* Actions removed for simple card */}
      </Link>

      <div className="p-5">
        <div className="mb-1 flex items-center gap-2">
          {cardCategory ? (
            <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">{cardCategory}</p>
          ) : null}
          {product?.gender && (
            <span className={`${
              product.gender === 'men' ? 'bg-blue-50 text-blue-700' :
              product.gender === 'women' ? 'bg-pink-50 text-pink-700' :
              'bg-purple-50 text-purple-700'
            } rounded-full px-2 py-0.5 text-[10px] font-medium` }>
              {product.gender === 'unisex' ? 'Unisex' : 
               product.gender === 'men' ? 'Men' : 'Women'}
            </span>
          )}
        </div>

        <h3 className="line-clamp-1 text-[15px] font-semibold tracking-tight text-gray-900">
          <Link to={`/product/${product?.slug || product?._id || product?.id || ''}`} state={{ product }} className="hover:underline">
            {cardTitle}
          </Link>
        </h3>

        <div className="mt-1 flex items-center gap-2">
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, index) => (
              <StarIcon key={index} filled={index < Math.round(rating)} />
            ))}
          </div>
          {typeof reviews === 'number' ? (
            <span className="text-xs text-gray-500">({reviews})</span>
          ) : null}
        </div>

        <div className="mt-2 flex items-end gap-2">
          <span className="text-lg font-bold text-gray-900">{formattedPrice}</span>
          {formattedOriginal ? (
            <del className="text-sm font-medium text-gray-400">{formattedOriginal}</del>
          ) : null}
        </div>

        {/* Mobile actions removed */}
      </div>
    </article>
  )
}

export default ProductCard