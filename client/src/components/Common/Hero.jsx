import React from "react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative w-full h-screen flex items-center justify-center bg-white">
      
      {/* Left Section - Men (Desktop) / Top Section (Mobile) */}
      <Link to="/men" className="absolute left-0 top-0 w-full md:w-1/2 h-1/2 md:h-full overflow-hidden group block">
        <img
          src="https://images.pexels.com/photos/31867225/pexels-photo-31867225.jpeg"
          alt="Men"
          className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-[1.03]"
        />

        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300" />
        
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center group-hover:text-white transition-colors duration-300 z-10">
          <span className="block text-white text-2xl sm:text-3xl font-bold uppercase tracking-widest group-hover:text-white transition-colors duration-300 drop-shadow-lg">
            Men
          </span>
          <span className="mt-6 inline-block px-4 sm:px-5 py-2 bg-black text-white font-medium uppercase tracking-wide rounded-lg shadow group-hover:bg-white group-hover:text-black transition-all duration-300 text-sm sm:text-base">
            Explore Men
          </span>
        </div>
      </Link>

      {/* Right Section - Women (Desktop) / Bottom Section (Mobile) */}
      <Link to="/women" className="absolute right-0 bottom-0 md:top-0 w-full md:w-1/2 h-1/2 md:h-full overflow-hidden group block">
        <img
          src="https://images.pexels.com/photos/19064121/pexels-photo-19064121.jpeg"
          alt="Women"
          className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-[1.03]"
        />

        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300" />
        
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center group-hover:text-white transition-colors duration-300 z-10">
          <span className="block text-white text-2xl sm:text-3xl font-bold uppercase tracking-widest group-hover:text-white transition-colors duration-300 drop-shadow-lg">
            Women
          </span>
          <span className="mt-6 inline-block px-4 sm:px-5 py-2 bg-red-500 text-white font-medium uppercase tracking-wide rounded-lg shadow group-hover:bg-white group-hover:text-black transition-all duration-300 text-sm sm:text-base">
            Explore Women
          </span>
        </div>
      </Link>

      {/* Centered Brand Text - Hidden on mobile, shown on desktop */}
      <div className="hidden md:flex absolute inset-0 z-20 items-center justify-center pointer-events-none">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-white drop-shadow-lg uppercase tracking-widest">
            KINN
          </h1>
          <p className="mt-2 sm:mt-4 text-base sm:text-lg md:text-xl text-white/90 drop-shadow-lg">
            Keep Keen, Keep KINN
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
