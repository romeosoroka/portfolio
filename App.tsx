import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header';
import { SubGallery, GalleryImage, ModalState } from './types';

// FIX: Add type definition for HammerManager to fix 'Cannot find name' error on line 225.
interface HammerManager {
  on(event: string, callback: (e: any) => void): void;
  destroy(): void;
}

// Helper to disable events
const preventDefault = (e: Event) => e.preventDefault();

// --- Helper Functions ---
const scrollToElement = (elementId: string) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

const parseCsv = (text: string): string[][] => {
  if (!text) return [];
  return text.split('\n').map(row => row.split(',').map(cell => cell.trim().replace(/"/g, '')));
};


// --- Navigation Component ---
const Navigation: React.FC<{ categories: { title: string, id: string }[], activeSectionId: string | null }> = ({ categories, activeSectionId }) => {
  const [isFloating, setIsFloating] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const threshold = window.innerWidth >= 800 ? 200 : 630;
      setIsFloating(scrollPosition >= threshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
        window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleScrollBack = () => {
    const activeGalleryButton = document.querySelector('.toggleGalleryButton.active');
    if (activeGalleryButton) {
        activeGalleryButton.scrollIntoView({ behavior: 'smooth' });
        // The click to close is handled in GalleryCategory
        (activeGalleryButton as HTMLElement).click();
    }
  };

  const menuButtons = (
      <>
        {categories.map(cat => (
            <button key={cat.id} className={`toggle-button ${activeSectionId === cat.id ? 'active' : ''}`} onClick={() => scrollToElement(`${cat.id}-section`)}>
            {cat.title}
            </button>
        ))}
      </>
  );

  return (
    <>
      <div className="section-button">{menuButtons}</div>
      <div className="floating-menu" style={{ display: isFloating ? 'block' : 'none' }}>
        {menuButtons}
      </div>
      <div className="scrollback-menu">
        <button className="scrollback-button toggle-button" onClick={handleScrollBack}>SCROLL BACK</button>
      </div>
    </>
  );
};


// --- Image Gallery Component ---
const ImageGallery = React.forwardRef<HTMLDivElement, { gallery: SubGallery; openModal: (images: GalleryImage[], index: number, galleryId: string) => void; }>(({ gallery, openModal }, ref) => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!gallery.csvUrl) return;

    setIsLoading(true);
    fetch(gallery.csvUrl)
      .then(response => response.text())
      .then(csvText => {
        const rows = parseCsv(csvText);
        const imageMap = new Map<string, Partial<GalleryImage>>();
        
        rows.forEach(([fileName, fileUrl]) => {
          if (!fileName || !fileUrl) return;
          const baseName = fileName.replace('_raw.jpg', '').replace('_final.jpg', '');
          if (!imageMap.has(baseName)) {
            imageMap.set(baseName, { id: baseName, alt: `All rights reserved © ${gallery.alt}` });
          }
          const imageObject = imageMap.get(baseName)!;
          if (fileName.includes('_raw')) {
            imageObject.rawSrc = fileUrl;
          } else if (fileName.includes('_final')) {
            imageObject.finalSrc = fileUrl;
          }
        });
        
        const loadedImages = Array.from(imageMap.values())
            .filter(img => img.rawSrc && img.finalSrc) as GalleryImage[];

        setImages(loadedImages);
      }).finally(() => {
        setIsLoading(false);
      });
  }, [gallery]);

  return (
    <div className="gallery" ref={ref}>
      {isLoading ? (
          <div className="loader-container">
            <div className="loader"></div>
          </div>
      ) : (
        images.map((image, index) => (
          <div key={image.id} className="img-container" onClick={() => openModal(images, index, gallery.id)}>
            <img src={image.finalSrc} alt={image.alt} loading="lazy" decoding="async" />
          </div>
        ))
      )}
    </div>
  );
});


// --- Gallery Category Component ---
const GalleryCategory: React.FC<{
  title: string;
  categoryId: string;
  buttonsCsvUrl: string;
  galleryContainerId: string;
  openModal: (images: GalleryImage[], index: number, galleryId: string) => void;
}> = ({ title, categoryId, buttonsCsvUrl, openModal }) => {
  const [subGalleries, setSubGalleries] = useState<SubGallery[]>([]);
  const [activeGalleryId, setActiveGalleryId] = useState<string | null>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(buttonsCsvUrl)
      .then(response => response.text())
      .then(csvText => {
        const rows = parseCsv(csvText);
        const galleries = rows.map(([id, csvUrl, amount, alt, previewImage]) => ({
          id: id,
          csvUrl: csvUrl.replace(/&amp;/g, '&'),
          amount: parseInt(amount, 10),
          alt: alt,
          previewImage: previewImage
        })).filter(g => g.id);
        setSubGalleries(galleries);
      });
  }, [buttonsCsvUrl]);

  useEffect(() => {
    if (activeGalleryId && galleryRef.current) {
      // Use a small timeout to let the browser paint the new gallery before scrolling
      const timer = setTimeout(() => {
        galleryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 550);
      return () => clearTimeout(timer);
    }
  }, [activeGalleryId]);

  const toggleGallery = (id: string) => {
    const scrollbackMenu = document.querySelector('.scrollback-menu');
    if (activeGalleryId === id) {
      setActiveGalleryId(null);
      if(scrollbackMenu) (scrollbackMenu as HTMLElement).style.display = 'none';
    } else {
      setActiveGalleryId(id);
      if(scrollbackMenu) (scrollbackMenu as HTMLElement).style.display = 'block';
    }
  };

  return (
    <div id={categoryId} className="section-container">
      <div className="section">{title}</div>
      <div className="gallery-buttons-container">
        {subGalleries.map(sg => (
          <button
            key={sg.id}
            className={`toggleGalleryButton ${activeGalleryId === sg.id ? 'active' : ''}`}
            onClick={() => toggleGallery(sg.id)}
          >
            <img src={sg.previewImage} alt={sg.alt} loading="lazy" decoding="async" />
          </button>
        ))}
      </div>
      <div className={`gallery-container-animated ${activeGalleryId ? 'open' : ''}`}>
        {activeGalleryId && (
          <ImageGallery
              ref={galleryRef}
              gallery={subGalleries.find(sg => sg.id === activeGalleryId)!}
              openModal={openModal}
          />
        )}
      </div>
    </div>
  );
};


// --- Modal Component ---
const Modal: React.FC<{
  modalState: ModalState;
  closeModal: () => void;
  setModalState: React.Dispatch<React.SetStateAction<ModalState>>;
}> = ({ modalState, closeModal, setModalState }) => {
  const { isOpen, images, currentIndex, galleryId } = modalState;
  const [isAfter, setIsAfter] = useState(true);
  const [imageOrientation, setImageOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [showInstruction, setShowInstruction] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const navigate = useCallback((direction: 'next' | 'prev') => {
    if (!images.length) return;
    const newIndex = direction === 'next'
      ? (currentIndex + 1) % images.length
      : (currentIndex - 1 + images.length) % images.length;
    setModalState(prev => ({ ...prev, currentIndex: newIndex }));
    setIsAfter(true);
  }, [currentIndex, images.length, setModalState]);

  useEffect(() => {
    if (isOpen) {
      setIsAfter(true);
      if (galleryId) {
        const hasViewed = sessionStorage.getItem(`viewed_gallery_${galleryId}`);
        if (!hasViewed) {
          setShowInstruction(true);
        } else {
          setShowInstruction(false);
        }
      }
    } else {
        setShowInstruction(false);
    }
  }, [isOpen, galleryId]);

  const hideInstruction = () => {
    if (galleryId) {
        sessionStorage.setItem(`viewed_gallery_${galleryId}`, 'true');
        setShowInstruction(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (showInstruction && (e.key === ' ' || e.key === 'Enter')) {
          hideInstruction();
          return;
      }
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowRight') navigate('next');
      if (e.key === 'ArrowLeft') navigate('prev');
    };
    window.addEventListener('keydown', handleKeyDown);
    
    let hammer: HammerManager | null = null;
    if (isOpen && modalRef.current) {
        hammer = new (window as any).Hammer(modalRef.current);
        hammer.on('swipeleft', () => navigate('next'));
        hammer.on('swiperight', () => navigate('prev'));
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (hammer) hammer.destroy();
    };
  }, [isOpen, closeModal, navigate, showInstruction]);

  if (!isOpen || !images[currentIndex]) return null;

  const currentImage = images[currentIndex];

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setImageOrientation(naturalHeight > naturalWidth ? 'portrait' : 'landscape');
  };

  return (
    <div className="modal show" onClick={closeModal} role="dialog" aria-modal="true">
      <div className={`modal-content image-orientation-${imageOrientation}`} onClick={e => e.stopPropagation()} ref={modalRef}>
        <span className="close" onClick={closeModal} aria-label="Close modal">&times;</span>
        {showInstruction && (
          <div className="instruction-overlay" onClick={hideInstruction} role="button" tabIndex={0}>
              <div className="instruction-text">
                  <i className="fa-solid fa-hand-pointer" aria-hidden="true"></i>
                  <p>Click on photo to see</p>
                  <p><strong>Before / After</strong></p>
              </div>
          </div>
        )}
        <img
          className="modal-image"
          src={isAfter ? currentImage.finalSrc : currentImage.rawSrc}
          onClick={() => setIsAfter(prev => !prev)}
          alt={currentImage.alt}
          onLoad={handleImageLoad}
        />
        <div className="copyright-text">
          {currentImage.alt}
        </div>
      </div>
      <div id="prevButton" className="prev" onClick={(e) => { e.stopPropagation(); navigate('prev'); }} aria-label="Previous image">&#10094;</div>
      <div id="nextButton" className="next" onClick={(e) => { e.stopPropagation(); navigate('next'); }} aria-label="Next image">&#10095;</div>
    </div>
  );
};


const categories = [
  { title: 'LIFESTYLE', id: 'lifestyle', buttonsCsv: 'https://docs.google.com/spreadsheets/d/1bB3jXwpXBAK4mxLVMHGceFb2hvMUCXT_wIWBUroLpY8/export?format=csv&gid=815935544' },
  { title: 'SPORT', id: 'sport', buttonsCsv: 'https://docs.google.com/spreadsheets/d/1bB3jXwpXBAK4mxLVMHGceFb2hvMUCXT_wIWBUroLpY8/export?format=csv&gid=1331204404' },
  { title: 'BUSINESS', id: 'business', buttonsCsv: 'https://docs.google.com/spreadsheets/d/1bB3jXwpXBAK4mxLVMHGceFb2hvMUCXT_wIWBUroLpY8/export?format=csv&gid=729258307' },
  { title: 'STILL-LIFE', id: 'still_life', buttonsCsv: 'https://docs.google.com/spreadsheets/d/1bB3jXwpXBAK4mxLVMHGceFb2hvMUCXT_wIWBUroLpY8/export?format=csv&gid=1060238046' },
  { title: 'MISC', id: 'misc', buttonsCsv: 'https://docs.google.com/spreadsheets/d/1bB3jXwpXBAK4mxLVMHGceFb2hvMUCXT_wIWBUroLpY8/export?format=csv&gid=2124139059' },
];

// --- Main App Component ---
const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [modalState, setModalState] = useState<ModalState>({ isOpen: false, images: [], currentIndex: 0, galleryId: null });
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark-mode', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    document.addEventListener('contextmenu', preventDefault);
    document.addEventListener('dragstart', preventDefault);
    return () => {
      document.removeEventListener('contextmenu', preventDefault);
      document.removeEventListener('dragstart', preventDefault);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const offset = 200; // A pixel offset from the top to trigger the active state
      let currentActiveId: string | null = null;

      categories.forEach(cat => {
        const element = document.getElementById(`${cat.id}-section`);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Check if the section is within the viewport around the offset
          if (rect.top <= offset && rect.bottom >= offset) {
            currentActiveId = cat.id;
          }
        }
      });
      setActiveSectionId(currentActiveId);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check on page load

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  const toggleDarkMode = () => setIsDarkMode(prev => !prev);
  
  const openModal = useCallback((images: GalleryImage[], index: number, galleryId: string) => {
    setModalState({ isOpen: true, images, currentIndex: index, galleryId: galleryId });
  }, []);

  const closeModal = useCallback(() => {
    setModalState(prevState => ({ ...prevState, isOpen: false, galleryId: null }));
  }, []);
  
  return (
    <>
      <Header toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />
      <Navigation categories={categories} activeSectionId={activeSectionId} />
      <div className="content">
        {categories.map(cat => (
          <GalleryCategory
            key={cat.id}
            title={cat.title}
            categoryId={`${cat.id}-section`}
            buttonsCsvUrl={cat.buttonsCsv}
            galleryContainerId={`${cat.id}-gallery-container`}
            openModal={openModal}
          />
        ))}
      </div>
      <Modal modalState={modalState} closeModal={closeModal} setModalState={setModalState} />
    </>
  );
};

export default App;