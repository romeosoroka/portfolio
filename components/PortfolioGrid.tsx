
import React from 'react';
import { PortfolioImage } from '../types';
import PortfolioItem from './PortfolioItem';

interface PortfolioGridProps {
  images: PortfolioImage[];
}

const PortfolioGrid: React.FC<PortfolioGridProps> = ({ images }) => {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {images.map((image) => (
        <PortfolioItem key={image.id} image={image} />
      ))}
    </section>
  );
};

export default PortfolioGrid;
