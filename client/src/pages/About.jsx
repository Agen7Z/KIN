import React from 'react'
import NavBar from '../components/Common/NavBar'

const About = () => {
  return (
    <div className="min-h-screen bg-neutral-50">
      <NavBar />
      <div className="max-w-6xl mx-auto px-6 pt-28 pb-28">
        {/* Hero */}
        <header className="text-center mb-16">
          <h1 className="font-display text-4xl sm:text-6xl tracking-[0.25em] text-neutral-900">KINN</h1>
          <p className="mt-4 text-neutral-600 max-w-2xl mx-auto">Modern essentials with a timeless attitude. Designed in Nepal for everywhere you go.</p>
        </header>

        {/* Our Story - split */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center mb-16">
          <div className="order-2 md:order-1">
            <h2 className="font-display text-3xl tracking-wider text-neutral-900 mb-4">Our Story</h2>
            <p className="text-neutral-700 leading-7">KINN is for those who dress with intention. We craft versatile pieces that move effortlessly from day to night—rooted in quality, fit, and comfort. Each release is built to mix, layer and live with for years.</p>
          </div>
          <div className="order-1 md:order-2">
            <div className="h-64 sm:h-80 rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-800 to-black flex items-center justify-center">
              <span className="font-display tracking-[0.3em] text-white text-xl">KINN</span>
            </div>
          </div>
        </section>

        {/* Sustainability - split inverse */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center mb-16">
          <div>
            <div className="h-64 sm:h-80 rounded-3xl bg-gradient-to-br from-neutral-200 via-white to-neutral-100 flex items-center justify-center">
              <span className="font-display tracking-[0.3em] text-neutral-900 text-xl">KINN</span>
            </div>
          </div>
          <div>
            <h2 className="font-display text-3xl tracking-wider text-neutral-900 mb-4">Sustainability</h2>
            <p className="text-neutral-700 leading-7">Small-batch production, responsible materials and recyclable packaging. We obsess over durability so you buy less—and love longer.</p>
          </div>
        </section>

        {/* Latest Collection */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="order-2 md:order-1">
            <h2 className="font-display text-3xl tracking-wider text-neutral-900 mb-4">Latest Collection</h2>
            <p className="text-neutral-700 leading-7">A focused drop of refined staples: crisp lines, soft textures and quiet detail. Built to pair with everything you own.</p>
          </div>
          <div className="order-1 md:order-2">
            <div className="h-64 sm:h-80 rounded-3xl bg-gradient-to-br from-neutral-900 to-neutral-600 flex items-center justify-center">
              <span className="font-display tracking-[0.3em] text-white text-xl">KINN</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default About


