import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MessageCircle, MapPin, Compass, ChevronRight, Waves, Utensils, Play, Image as ImageIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase, isDbConfigured } from '../lib/supabase';
import { mockRooms, mockAttractions, mockFoodMenuItems, mockSiteSettings, Banner, mockBanners, PoolShowcaseImage, mockPoolShowcaseImages, GalleryItem, mockGalleryItems } from '../lib/mockData';
import { useUIStore } from '../store/uiStore';
import ImageKitImage from '../components/ImageKitImage';
import RoomCard from '../components/RoomCard';
import AttractionCard from '../components/AttractionCard';
import FoodCard from '../components/FoodCard';
import SEO from '../components/SEO';
import GalleryLightbox, { LightboxMedia } from '../components/GalleryLightbox';


export const Home: React.FC = () => {
  const settings = useUIStore((state) => state.settings);

  // Fetch Banners
  const { data: banners = [] } = useQuery<Banner[]>({
    queryKey: ['banners-teaser'],
    queryFn: async () => {
      if (!isDbConfigured()) return mockBanners;
      const { data } = await supabase
        .from('banners')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      return data && data.length > 0 ? data : mockBanners;
    },
  });

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  // Fetch Pool Showcase Images
  const { data: showcaseImages = [] } = useQuery<PoolShowcaseImage[]>({
    queryKey: ['pool-showcase-images'],
    queryFn: async () => {
      if (!isDbConfigured()) {
        const stored = localStorage.getItem('demo_pool_showcase_images');
        return stored ? JSON.parse(stored) : mockPoolShowcaseImages;
      }
      try {
        const { data } = await supabase
          .from('pool_showcase_images')
          .select('*')
          .order('display_order', { ascending: true });
        return data && data.length > 0 ? data : mockPoolShowcaseImages;
      } catch (err) {
        return mockPoolShowcaseImages;
      }
    },
  });

  // Fetch Rooms
  const { data: rooms = [] } = useQuery({
    queryKey: ['rooms-teaser'],
    queryFn: async () => {
      if (!isDbConfigured()) return mockRooms.slice(0, 3);
      const { data } = await supabase
        .from('rooms')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(3);
      return data && data.length > 0 ? data : mockRooms.slice(0, 3);
    },
  });

  // Fetch Food Items
  const { data: foodItems = [] } = useQuery({
    queryKey: ['food-teaser'],
    queryFn: async () => {
      if (!isDbConfigured()) return mockFoodMenuItems.slice(0, 4);
      const { data } = await supabase
        .from('food_menu_items')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(4);
      return data && data.length > 0 ? data : mockFoodMenuItems.slice(0, 4);
    },
  });

  // Fetch Attractions
  const { data: attractions = [] } = useQuery({
    queryKey: ['attractions-teaser'],
    queryFn: async () => {
      if (!isDbConfigured()) return mockAttractions.slice(0, 4);
      const { data } = await supabase
        .from('attractions')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(4);
      return data && data.length > 0 ? data : mockAttractions.slice(0, 4);
    },
  });

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Fetch Gallery Items
  const { data: galleryItems = [] } = useQuery<GalleryItem[]>({
    queryKey: ['gallery-teaser'],
    queryFn: async () => {
      if (!isDbConfigured()) return mockGalleryItems.slice(0, 8);
      const { data } = await supabase
        .from('gallery_items')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(8);
      return data && data.length > 0 ? data : mockGalleryItems.slice(0, 8);
    },
  });

  // Map gallery items for Lightbox
  const lightboxMedia: LightboxMedia[] = galleryItems.map(item => ({
    url: item.imagekit_url,
    title: item.title || 'Homestay Photo',
    caption: item.caption,
    media_type: item.media_type,
  }));

  const renderImageGrid = (imagesList: PoolShowcaseImage[]) => {
    if (imagesList.length === 0) return null;
    
    // Limit to 4 images for the masonry layout
    const displayImages = imagesList.slice(0, 4);
    
    if (displayImages.length === 1) {
      return (
        <div className="rounded-2xl overflow-hidden shadow-lg h-96 w-full">
          <img src={displayImages[0].image_url} alt="Showcase" className="h-full w-full object-cover hover:scale-105 transition-transform duration-500" />
        </div>
      );
    }
    
    if (displayImages.length === 2) {
      return (
        <div className="grid grid-cols-2 gap-4 w-full">
          {displayImages.map((img, idx) => (
            <div key={img.id || idx} className="rounded-2xl overflow-hidden shadow-lg aspect-square">
              <img src={img.image_url} alt="Showcase" className="h-full w-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
          ))}
        </div>
      );
    }
    
    if (displayImages.length === 3) {
      return (
        <div className="grid grid-cols-3 gap-4 w-full">
          <div className="col-span-2 rounded-2xl overflow-hidden shadow-lg aspect-[4/3]">
            <img src={displayImages[0].image_url} alt="Showcase" className="h-full w-full object-cover hover:scale-105 transition-transform duration-500" />
          </div>
          <div className="flex flex-col gap-4">
            {displayImages.slice(1).map((img, idx) => (
              <div key={img.id || idx} className="rounded-2xl overflow-hidden shadow-lg flex-1">
                <img src={img.image_url} alt="Showcase" className="h-full w-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Default 4 images masonry grid
    return (
      <div className="grid grid-cols-2 gap-4 w-full">
        <div className="space-y-4">
          <div className="rounded-2xl overflow-hidden shadow-lg aspect-square">
            <img
              src={displayImages[0].image_url}
              alt="Showcase 1"
              className="h-full w-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="rounded-2xl overflow-hidden shadow-lg aspect-[3/4]">
            <img
              src={displayImages[1].image_url}
              alt="Showcase 2"
              className="h-full w-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
        <div className="space-y-4 pt-8">
          <div className="rounded-2xl overflow-hidden shadow-lg aspect-[3/4]">
            <img
              src={displayImages[2].image_url}
              alt="Showcase 3"
              className="h-full w-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="rounded-2xl overflow-hidden shadow-lg aspect-square">
            <img
              src={displayImages[3].image_url}
              alt="Showcase 4"
              className="h-full w-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </div>
    );
  };

  const whatsappLink = `https://wa.me/${settings.whatsapp_number.replace(/\+/g, '')}?text=${encodeURIComponent(
    'Hello, I want to book a room or check availability at Purushottam Holiday Homestay.'
  )}`;

  const homeJsonLd = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    "name": settings.property_name || "Purushottam Holiday Homestay",
    "description": settings.tagline || "Unwind at Purushottam Holiday Homestay near Tala Fort, Raigad. Features a pristine swimming pool, organic mango plantation sit-outs, and Konkani home-cooked meals.",
    "telephone": settings.phone_number || "+919860361361",
    "image": [
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1920&q=80",
      "https://images.unsplash.com/photo-1596422846543-75c6fc18a523?w=1920&q=80"
    ],
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "At Post Tala, Near Tala Fort",
      "addressLocality": "Raigad",
      "addressRegion": "Maharashtra",
      "postalCode": "402111",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "18.1098",
      "longitude": "73.1232"
    },
    "starRating": {
      "@type": "Rating",
      "ratingValue": "4.9",
      "bestRating": "5"
    },
    "amenityFeature": [
      {
        "@type": "LocationFeatureSpecification",
        "name": "Swimming Pool",
        "value": true
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "Free Wi-Fi",
        "value": true
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "Organic Garden Sit-out",
        "value": true
      }
    ]
  };

  return (
    <div className="flex flex-col min-h-screen">
      <SEO 
        title={settings.seo_meta_title || "Purushottam Holiday Homestay | Pool Resort & Lodge near Tala Fort"}
        description={settings.seo_meta_description || "Unwind at Purushottam Holiday Homestay near Tala Fort, Raigad. Features a pristine swimming pool, organic mango plantation sit-outs, and Konkani home-cooked meals."}
        keywords={settings.seo_keywords || "hotel near me, resort near me, lodge near me, homestay near Tala Fort, resort in Raigad, hotel in Tala, pool resort Tala"}
        jsonLd={homeJsonLd}
      />
      {/* 1. HERO SECTION */}
      <section className="relative h-[90vh] min-h-[600px] w-full flex items-center justify-center overflow-hidden">
        {/* Background media slider */}
        <div className="absolute inset-0 z-0">
          {banners.length > 0 ? (
            <div className="absolute inset-0">
              <AnimatePresence initial={false}>
                {banners.map((banner, index) => (
                  index === currentSlide && (
                    <motion.div
                      key={banner.id}
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 1.2, ease: 'easeInOut' }}
                      className="absolute inset-0"
                    >
                      <img
                        src={banner.image_url}
                        alt={banner.title || 'Purushottam Homestay'}
                        className="h-full w-full object-cover"
                      />
                    </motion.div>
                  )
                ))}
              </AnimatePresence>
            </div>
          ) : settings.hero_video_imagekit_url && settings.hero_video_imagekit_url.endsWith('.mp4') ? (
            <video
              src={settings.hero_video_imagekit_url}
              autoPlay
              loop
              muted
              playsInline
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0">
              <img
                src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1920&q=80"
                alt="Purushottam Homestay"
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Text details */}
        <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white space-y-6 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <span className="text-amber-gold uppercase tracking-widest text-xs md:text-sm font-extrabold block">
                Welcome to Purushottam Holiday Homestay
              </span>
              
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-black tracking-tight leading-tight">
                {banners.length > 0 && banners[currentSlide]?.title ? banners[currentSlide].title : settings.hero_title}
              </h2>

              <p className="text-base sm:text-lg md:text-xl text-forest-100/90 font-medium max-w-3xl mx-auto leading-relaxed">
                {banners.length > 0 && banners[currentSlide]?.subtitle ? banners[currentSlide].subtitle : settings.hero_subtitle}
              </p>
            </motion.div>
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <a
              href={`tel:${settings.phone_number}`}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-forest-800 font-bold hover:bg-forest-50 transition-colors shadow-xl flex items-center justify-center space-x-2"
            >
              <Phone className="h-4.5 w-4.5 text-forest-700 fill-current" />
              <span>Call Host Now</span>
            </a>
            
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 transition-colors shadow-xl flex items-center justify-center space-x-2 shadow-green-900/10"
            >
              <MessageCircle className="h-4.5 w-4.5 fill-current" />
              <span>Book on WhatsApp</span>
            </a>
          </motion.div>

          {/* Slide Navigation Dots */}
          {banners.length > 1 && (
            <div className="flex justify-center space-x-2.5 pt-8">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    index === currentSlide ? 'w-8 bg-amber-gold' : 'w-2.5 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 2. SWIMMING POOL SHOWCASE */}
      {settings.show_pool_showcase !== false && (
        <section className="py-20 bg-forest-50/40 animate-fade-in">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Text details */}
              <div className="lg:col-span-5 space-y-5">
                <span className="flex items-center text-amber-gold-dark text-xs font-bold uppercase tracking-wider">
                  <Waves className="h-4 w-4 mr-2" />
                  <span>Water Resort Amenities</span>
                </span>
                <h2 className="text-3xl md:text-4xl font-serif font-black text-forest-800 leading-tight">
                  {settings.pool_showcase_title || 'Take a Dip in Paradise'}
                </h2>
                <p className="text-forest-600 text-sm md:text-base leading-relaxed">
                  {settings.pool_showcase_description || 'Unwind from the city chaos inside our pristine, lapis-blue swimming pool. Surrounded by organic mango plantations, towering coconut trees, and quiet seating niches, it\'s the perfect spot to spend your afternoon.'}
                </p>
                {settings.pool_showcase_tags && settings.pool_showcase_tags.length > 0 && (
                  <div className="flex flex-wrap gap-4 text-xs font-semibold text-forest-700">
                    {settings.pool_showcase_tags.map((tag, idx) => (
                      <div key={idx} className="flex items-center space-x-1 bg-white px-3 py-1.5 rounded-full border border-forest-100 shadow-sm">
                        <span>{tag.trim().startsWith('✨') || tag.trim().startsWith('🌴') || tag.trim().startsWith('👶') ? tag : `✨ ${tag}`}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Image grids */}
              <div className="lg:col-span-7 flex justify-center">
                {renderImageGrid(showcaseImages)}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. ROOM PREVIEW SECTION */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-12">
            <div>
              <span className="text-amber-gold-dark text-xs font-bold uppercase tracking-wider block mb-1">
                Luxury Accommodations
              </span>
              <h2 className="text-3xl md:text-4xl font-serif font-black text-forest-800">
                Our Comfortable Rooms
              </h2>
            </div>
            <Link
              to="/rooms"
              className="mt-4 md:mt-0 flex items-center text-forest-700 font-bold hover:text-amber-gold transition-colors text-sm"
            >
              <span>Explore All Rooms</span>
              <ChevronRight className="h-4 w-4 ml-0.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. FOOD GALLERY TEASER */}
      <section className="py-20 bg-forest-900 text-white relative overflow-hidden">
        {/* Decorative backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(#1f4d3e_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-12">
            <div>
              <span className="text-amber-gold text-xs font-bold uppercase tracking-wider block mb-1">
                Gastronomy Experience
              </span>
              <h2 className="text-3xl md:text-4xl font-serif font-black text-white">
                Savor Local Coastal Delicacies
              </h2>
            </div>
            <Link
              to="/food"
              className="mt-4 md:mt-0 flex items-center text-amber-gold font-bold hover:text-white transition-colors text-sm"
            >
              <span>View Full Food Menu</span>
              <ChevronRight className="h-4 w-4 ml-0.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {foodItems.map((item) => (
              <div key={item.id} className="text-forest-900 bg-white rounded-2xl overflow-hidden shadow-xl flex flex-col h-full border border-forest-800">
                <div className="h-44 w-full overflow-hidden relative">
                  <ImageKitImage path={item.imagekit_image_url} alt={item.name} aspectRatio={1.5} />
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-forest-900/80 text-[10px] font-bold text-white uppercase tracking-wider">
                    {item.category}
                  </span>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-base text-forest-800 mb-1 line-clamp-1">{item.name}</h3>
                    <p className="text-xs text-forest-500 line-clamp-2 leading-relaxed">{item.description}</p>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-forest-50 mt-3">
                    <span className="text-xs font-semibold text-forest-500 uppercase">{item.sub_category}</span>
                    {item.price && <span className="text-sm font-bold text-forest-800">₹{item.price}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY TEASER SECTION */}
      {galleryItems.length > 0 && (
        <section className="py-20 bg-forest-50/20 border-y border-forest-100/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-12">
              <div>
                <span className="text-amber-gold-dark text-xs font-bold uppercase tracking-wider block mb-1">
                  Visual Experience
                </span>
                <h2 className="text-3xl md:text-4xl font-serif font-black text-forest-800">
                  Moments from Our Homestay
                </h2>
              </div>
              <Link
                to="/gallery"
                className="mt-4 md:mt-0 flex items-center text-forest-700 font-bold hover:text-amber-gold transition-colors text-sm font-semibold"
              >
                <span>View Full Gallery</span>
                <ChevronRight className="h-4 w-4 ml-0.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {galleryItems.slice(0, 8).map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => setLightboxIndex(idx)}
                  className="relative group overflow-hidden rounded-2xl aspect-square bg-forest-100 shadow-md hover:shadow-xl transition-all duration-500 cursor-pointer border border-forest-100/50"
                >
                  <ImageKitImage
                    path={item.imagekit_url}
                    alt={item.title || 'Gallery item'}
                    aspectRatio={1}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 via-forest-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 text-white">
                    <span className="text-[10px] font-bold text-amber-gold uppercase tracking-wider mb-1 flex items-center space-x-1">
                      {item.media_type === 'video' ? <Play className="h-2.5 w-2.5 fill-current" /> : <ImageIcon className="h-2.5 w-2.5" />}
                      <span>{item.category}</span>
                    </span>
                    <h4 className="font-serif font-bold text-sm leading-snug line-clamp-1">{item.title}</h4>
                    <p className="text-[10px] text-forest-100 line-clamp-1 mt-0.5">{item.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Lightbox Overlay */}
      {lightboxIndex !== null && (
        <GalleryLightbox
          mediaList={lightboxMedia}
          activeIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(idx) => setLightboxIndex(idx)}
        />
      )}

      {/* 5. NEARBY ATTRACTIONS TEASER */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-12">
            <div>
              <span className="text-amber-gold-dark text-xs font-bold uppercase tracking-wider block mb-1">
                Explore The Heritage
              </span>
              <h2 className="text-3xl md:text-4xl font-serif font-black text-forest-800">
                Nearby Tourist Attractions
              </h2>
            </div>
            <Link
              to="/attractions"
              className="mt-4 md:mt-0 flex items-center text-forest-700 font-bold hover:text-amber-gold transition-colors text-sm"
            >
              <span>View All Hotspots</span>
              <ChevronRight className="h-4 w-4 ml-0.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {attractions.map((att) => (
              <AttractionCard key={att.id} attraction={att} />
            ))}
          </div>
        </div>
      </section>

      {/* 7. GOOGLE MAPS SECTION */}
      <section className="relative h-96 w-full bg-forest-100">
        <iframe
          src={settings.google_maps_embed_url}
          className="h-full w-full border-0 grayscale hover:grayscale-0 transition-all duration-700"
          allowFullScreen
          loading="lazy"
          title="Homestay Map Location"
        />
        <div className="absolute bottom-6 left-6 z-10 bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-forest-100 max-w-xs shadow-xl">
          <h3 className="font-serif font-bold text-forest-800 text-base mb-1">Our Location</h3>
          <p className="text-xs text-forest-500 mb-3 leading-relaxed">
            Near Tala Fort, Raigad, Maharashtra. Easily reachable by car from Mumbai & Pune.
          </p>
          <a
            href={(!settings.google_maps_directions_url || settings.google_maps_directions_url === 'https://maps.app.goo.gl/y5R34J21H9x8z7A6')
              ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address || 'Purushottam Holiday Homestay Tala Raigad')}`
              : settings.google_maps_directions_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-1 px-4 py-2 bg-forest-700 hover:bg-forest-850 text-white rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <MapPin className="h-3.5 w-3.5" />
            <span>Open in Google Maps</span>
          </a>
        </div>
      </section>
    </div>
  );
};
export default Home;
