export interface SubGallery {
  id: string;
  csvUrl: string;
  amount: number;
  alt: string;
  previewImage: string;
}

export interface GalleryImage {
  id: string;
  finalSrc: string;
  rawSrc: string;
  alt: string;
}

export interface ModalState {
  isOpen: boolean;
  images: GalleryImage[];
  currentIndex: number;
  galleryId: string | null;
}

// FIX: Define and export the PortfolioImage interface to fix errors in constants.ts, components/PortfolioGrid.tsx, and components/PortfolioItem.tsx.
export interface PortfolioImage {
  id: number;
  beforeSrc: string;
  afterSrc: string;
  description: string;
}