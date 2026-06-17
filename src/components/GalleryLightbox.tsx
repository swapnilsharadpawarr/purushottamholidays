import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getImageKitUrl } from '../lib/imagekit';

export interface LightboxMedia {
  url: string;
  title?: string;
  caption?: string;
  media_type: 'image' | 'video';
}

interface GalleryLightboxProps {
  mediaList: LightboxMedia[];
  activeIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export const GalleryLightbox: React.FC<GalleryLightboxProps> = ({
  mediaList,
  activeIndex,
  onClose,
  onNavigate,
}) => {
  const activeMedia = mediaList[activeIndex];

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    // Disable background scroll when open
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [activeIndex, mediaList]);

  const handleNext = () => {
    onNavigate((activeIndex + 1) % mediaList.length);
  };

  const handlePrev = () => {
    onNavigate((activeIndex - 1 + mediaList.length) % mediaList.length);
  };

  if (!activeMedia) return null;

  // Generate the download/full-size link
  const fullSizeUrl = getImageKitUrl(activeMedia.url, { raw: true });

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-between bg-forest-950/95 backdrop-blur-md p-4">
      {/* Top Bar controls */}
      <div className="w-full max-w-7xl flex justify-between items-center text-white z-10 py-2">
        <div className="flex flex-col">
          <h4 className="text-sm md:text-base font-semibold text-white/90">
            {activeMedia.title || 'Gallery View'}
          </h4>
          <span className="text-xs text-white/50">
            {activeIndex + 1} of {mediaList.length}
          </span>
        </div>

        <div className="flex items-center space-x-4">
          {activeMedia.media_type === 'image' && (
            <a
              href={fullSizeUrl}
              download={`purushottam_${activeIndex + 1}.jpg`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-white/10 rounded-full transition-colors duration-200"
              title="Download Full Image"
            >
              <Download className="h-5 w-5" />
            </a>
          )}
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors duration-200 cursor-pointer"
            title="Close Lightbox"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative w-full max-w-5xl flex-1 flex items-center justify-center py-4">
        {/* Navigation Left */}
        <button
          onClick={handlePrev}
          className="absolute left-0 md:left-4 z-10 p-3 bg-white/5 hover:bg-white/15 rounded-full text-white/80 hover:text-white transition-all cursor-pointer hidden md:block"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        {/* Media Frame */}
        <div className="max-h-[75vh] max-w-full flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="relative"
            >
              {activeMedia.media_type === 'video' ? (
                <video
                  src={getImageKitUrl(activeMedia.url, { raw: true })}
                  controls
                  autoPlay
                  className="max-h-[70vh] max-w-full rounded-lg shadow-2xl border border-white/10"
                />
              ) : (
                <img
                  src={getImageKitUrl(activeMedia.url, { width: 1200, quality: 90 })}
                  alt={activeMedia.title || ''}
                  className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-2xl border border-white/5"
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Right */}
        <button
          onClick={handleNext}
          className="absolute right-0 md:right-4 z-10 p-3 bg-white/5 hover:bg-white/15 rounded-full text-white/80 hover:text-white transition-all cursor-pointer hidden md:block"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile navigation bottom bar */}
      <div className="flex md:hidden items-center justify-center space-x-8 text-white pb-4 z-10">
        <button onClick={handlePrev} className="p-3 bg-white/10 rounded-full cursor-pointer">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-sm font-semibold">
          {activeIndex + 1} / {mediaList.length}
        </span>
        <button onClick={handleNext} className="p-3 bg-white/10 rounded-full cursor-pointer">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Bottom Info Bar */}
      {activeMedia.caption && (
        <div className="w-full max-w-3xl text-center text-white/80 pb-6 text-sm z-10 px-4 leading-relaxed">
          <p className="border-t border-white/10 pt-4">{activeMedia.caption}</p>
        </div>
      )}
    </div>
  );
};
export default GalleryLightbox;
