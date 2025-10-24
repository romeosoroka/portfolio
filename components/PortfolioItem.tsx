
import React, { useState } from 'react';
import { PortfolioImage } from '../types';

interface PortfolioItemProps {
  image: PortfolioImage;
}

const PortfolioItem: React.FC<PortfolioItemProps> = ({ image }) => {
  const [isAfter, setIsAfter] = useState(true);

  const toggleImage = () => {
    setIsAfter(!isAfter);
  };

  return (
    <div
      className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-2xl cursor-pointer group transform hover:scale-105 transition-transform duration-300 ease-in-out"
      onClick={toggleImage}
    >
      <img
        src={isAfter ? image.afterSrc : image.beforeSrc}
        alt={image.description}
        className="w-full h-full object-cover transition-opacity duration-500"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
      
      <div className={`absolute top-3 right-3 px-3 py-1 text-xs font-semibold rounded-full transition-all duration-300 ${isAfter ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
        {isAfter ? 'After' : 'Before'}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <p className="text-white text-sm translate-y-4 group-hover:translate-y-0 transition-transform duration-300 ease-in-out">
          {image.description}
        </p>
      </div>
    </div>
  );
};

export default PortfolioItem;
