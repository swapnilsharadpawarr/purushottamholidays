import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Play, Image as ImageIcon, Camera } from 'lucide-react';
import { supabase, isDbConfigured } from '../lib/supabase';
import { mockGalleryItems, GalleryItem } from '../lib/mockData';
import ImageKitImage from '../components/ImageKitImage';
import GalleryLightbox, { LightboxMedia } from '../components/GalleryLightbox';
import SEO from '../components/SEO';

export const Gallery: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Fetch Gallery Items
  const { data: galleryItems = [], isLoading } = useQuery<GalleryItem[]>({
    queryKey: ['gallery-list'],
    queryFn: async () => {
      if (!isDbConfigured()) return mockGalleryItems;
      const { data } = await supabase
        .from('gallery_items')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      return data && data.length > 0 ? data : mockGalleryItems;
    },
  });

  const categories = [
    'All',
    'Property Exterior',
    'Rooms',
    'Pool',
    'Food',
    'Gardens',
    'Sunset Views',
    'Drone Shots',
    'Guest Photos',
    'Videos',
  ];

  const filteredItems = selectedCategory === 'All'
    ? galleryItems
    : galleryItems.filter(item => item.category === selectedCategory);

  // Map gallery items for Lightbox
  const lightboxMedia: LightboxMedia[] = filteredItems.map(item => ({
    url: item.imagekit_url,
    title: item.title || 'Homestay Photo',
    caption: item.caption,
    media_type: item.media_type,
  }));

  return (
    <div className="page-container py-12 md:py-16 bg-forest-50/20">
      <SEO 
        title="Resort Photos & Video Gallery | Beautiful Tour Visuals"
        description="See scenic resort views, premium cottage interiors, swimming pool snapshots, and guests enjoying Konkani cuisine at Purushottam Holiday Homestay."
        keywords="resort photos Raigad, homestay gallery, swimming pool images, cottage interior pictures, guest gallery Tala, homestay video"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className="text-amber-gold-dark text-xs font-bold uppercase tracking-widest bg-forest-50 border border-forest-100/60 px-3 py-1 rounded-full">
            Visual Journal
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-black text-forest-800">
            Photo & Video Gallery
          </h2>
          <div className="h-1 w-20 bg-amber-gold mx-auto rounded-full mt-3" />
          <p className="text-forest-500 text-sm md:text-base leading-relaxed">
            Take a visual tour of Purushottam Holiday Homestay. Browse through aerial drone photography, room interiors, swimming pool splashes, food items, and candid moments shared by our guests.
          </p>
        </div>

        {/* Categories Tab pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12 max-w-4xl mx-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-300 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-forest-700 text-white border-forest-700 shadow-md'
                  : 'bg-white text-forest-600 border-forest-100 hover:border-forest-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading Skeletons */}
        {isLoading ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-64 animate-pulse border border-forest-100/50 shadow mb-4" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-white border border-forest-100 rounded-3xl p-8 shadow-inner">
            <Camera className="h-12 w-12 text-forest-300 mx-auto mb-3" />
            <h4 className="text-lg font-serif font-bold text-forest-700">No Media Available</h4>
            <p className="text-xs text-forest-500 mt-1">There are no photos or videos in this category yet.</p>
          </div>
        ) : (
          /* Pure CSS Masonry Grid using Tailwind Columns */
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {filteredItems.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => setLightboxIndex(idx)}
                className="break-inside-avoid bg-white border border-forest-100 rounded-2xl overflow-hidden shadow-md hover-gold-shadow transition-all duration-300 cursor-pointer group"
              >
                <div className="relative overflow-hidden bg-forest-50">
                  <ImageKitImage
                    path={item.imagekit_url}
                    alt={item.title || 'Gallery item'}
                    aspectRatio={item.media_type === 'video' ? 1.77 : undefined}
                    className="w-full h-auto object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                  
                  {/* Play icon overlay for videos */}
                  {item.media_type === 'video' ? (
                    <div className="absolute inset-0 bg-forest-950/30 flex items-center justify-center text-white">
                      <div className="p-4 bg-white/20 backdrop-blur-md rounded-full shadow-lg border border-white/30 group-hover:scale-110 transition-transform">
                        <Play className="h-6 w-6 fill-current" />
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-forest-950/0 group-hover:bg-forest-950/15 transition-colors duration-300" />
                  )}

                  {/* Icon label on bottom-left */}
                  <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-forest-900/80 text-[8px] font-bold text-white uppercase tracking-wider flex items-center space-x-1">
                    {item.media_type === 'video' ? <Play className="h-2 w-2" /> : <ImageIcon className="h-2 w-2" />}
                    <span>{item.category}</span>
                  </span>
                </div>
                
                {/* Meta details if any */}
                {(item.title || item.caption) && (
                  <div className="p-4 border-t border-forest-50">
                    {item.title && <h3 className="font-serif font-bold text-sm text-forest-800 mb-1">{item.title}</h3>}
                    {item.caption && <p className="text-xs text-forest-500 line-clamp-2 leading-relaxed">{item.caption}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Lightbox Overlay */}
      {lightboxIndex !== null && (
        <GalleryLightbox
          mediaList={lightboxMedia}
          activeIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(index) => setLightboxIndex(index)}
        />
      )}
    </div>
  );
};
export default Gallery;
