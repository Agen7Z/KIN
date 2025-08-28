import React from "react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative w-full h-screen flex items-center justify-center bg-white">
      
      <div className="absolute left-0 top-0 w-1/2 h-full overflow-hidden group">
        <img
          src="https://images.pexels.com/photos/31867225/pexels-photo-31867225.jpeg"
          alt="Men"
          className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-[1.03]"
        />

        
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center group-hover:text-white transition-colors duration-300">
          <span className="block text-black text-3xl font-bold uppercase tracking-widest group-hover:text-white transition-colors duration-300">
            Men
          </span>
          <Link to="/men" className="mt-3 px-6 py-2 bg-black text-white font-medium uppercase tracking-wide rounded-lg shadow hover:bg-white hover:text-black transition-all duration-300 hover:shadow-lg">
            Try Wears
          </Link>
        </div>
      </div>

      
      <div className="absolute right-0 top-0 w-1/2 h-full overflow-hidden group">
        <img
          src="https://images.pexels.com/photos/19064121/pexels-photo-19064121.jpeg"
          alt="Women"
          className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-[1.03]"
        />

       
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center group-hover:text-white transition-colors duration-300">
          <span className="block text-red-500 text-3xl font-bold uppercase tracking-widest group-hover:text-white transition-colors duration-300">
            Women
          </span>
          <Link to="/women" className="mt-3 px-6 py-2 bg-red-500 text-white font-medium uppercase tracking-wide rounded-lg shadow hover:bg-white hover:text-black transition-all duration-300 hover:shadow-lg">
            Try Wears
          </Link>
        </div>
      </div>

     
      <div className="z-10 text-center">
        <h1 className="text-5xl md:text-7xl font-serif text-white drop-shadow-md uppercase tracking-widest">
          KINN
        </h1>
        <p className="mt-4 text-lg md:text-xl text-white/90 drop-shadow">
        Keep Keen, Keep KINN
        </p>
      </div>
    </section>
  );
};

export default Hero;
