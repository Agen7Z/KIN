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
  const cardImage = product?.image ?? image
  const cardTitle = product?.name ?? title
  const cardCategory = product?.category ?? category
  const cardPrice = product?.price ?? price
  const cardOriginal = product?.originalPrice ?? originalPrice
  const isNew = product?.isNew
  const isTrending = product?.isTrending

  const formattedPrice = typeof cardPrice === 'number' ? `$${cardPrice.toFixed(2)}` : cardPrice
  const formattedOriginal = typeof cardOriginal === 'number' ? `$${cardOriginal.toFixed(2)}` : cardOriginal
  const discount =
    typeof cardPrice === 'number' && typeof cardOriginal === 'number'
      ? Math.max(0, Math.round(((cardOriginal - cardPrice) / cardOriginal) * 100))
      : null

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/70 backdrop-blur-md shadow-[0_10px_30px_-10px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.35)]">
      <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-br from-white/60 via-white/20 to-transparent pointer-events-none" />
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-50">
        {cardImage ? (
          <Link to={`/product/${product?.id || ''}`} state={{ product }}>
            <img
              src={cardImage}
              alt={cardTitle}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              loading="lazy"
            />
          </Link>
        ) : null}

        {(isNew || isTrending) && (
          <div className="absolute left-3 top-3 flex gap-2">
            {isNew && (
              <span className="rounded-full bg-gray-900 px-2.5 py-1 text-xs font-medium text-white">New</span>
            )}
            {isTrending && (
              <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-gray-900 ring-1 ring-gray-200">Trending</span>
            )}
          </div>
        )}
        {discount ? (
          <div className="absolute right-3 top-3 rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-bold text-white shadow">
            -{discount}%
          </div>
        ) : null}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/25 to-transparent" />

        <div className="absolute inset-0 hidden items-end justify-center gap-3 p-4 sm:flex">
          <button
            type="button"
            onClick={onQuickView}
            className="pointer-events-auto inline-flex items-center justify-center rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-gray-200 transition hover:bg-white hover:shadow-md"
          >
            Quick view
          </button>
          <button
            type="button"
            onClick={onAddToCart}
            className="pointer-events-auto inline-flex items-center justify-center rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-black/5 transition hover:bg-black hover:shadow-md"
          >
            Add to cart
          </button>
        </div>
      </div>

      <div className="space-y-2 p-4">
        {cardCategory ? (
          <p className="text-xs uppercase tracking-wider text-gray-500">{cardCategory}</p>
        ) : null}

        <h3 className="line-clamp-1 text-base font-semibold tracking-tight text-gray-900">
          <Link to={`/product/${product?.id || ''}`} state={{ product }} className="hover:underline">
            {cardTitle}
          </Link>
        </h3>

        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, index) => (
              <StarIcon key={index} filled={index < Math.round(rating)} />
            ))}
          </div>
          {typeof reviews === 'number' ? (
            <span className="text-xs text-gray-500">({reviews})</span>
          ) : null}
        </div>

        <div className="flex items-end gap-2">
          <span className="text-lg font-bold text-gray-900">{formattedPrice}</span>
          {formattedOriginal ? (
            <del className="text-sm font-medium text-gray-400">{formattedOriginal}</del>
          ) : null}
        </div>

        <div className="mt-2 flex gap-2 sm:hidden">
          <button
            type="button"
            onClick={onAddToCart}
            className="inline-flex flex-1 items-center justify-center rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-black/5 transition hover:bg-black"
          >
            Add to cart
          </button>
          <button
            type="button"
            onClick={onQuickView}
            className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-gray-200 transition hover:bg-white/90"
          >
            View
          </button>
        </div>
      </div>
    </article>
  )
}

export default ProductCard