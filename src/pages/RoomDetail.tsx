import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Info, Check, ShieldAlert } from 'lucide-react';
import { supabase, isDbConfigured } from '../lib/supabase';
import { mockRooms, Room } from '../lib/mockData';
import ImageKitImage from '../components/ImageKitImage';
import InquiryForm from '../components/InquiryForm';
import GalleryLightbox, { LightboxMedia } from '../components/GalleryLightbox';
import { getAmenityIcon } from '../components/RoomCard';
import SEO from '../components/SEO';

export const RoomDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Fetch individual room details based on slug
  const { data: room, isLoading, error } = useQuery<Room | null>({
    queryKey: ['room-detail', slug],
    queryFn: async () => {
      if (!isDbConfigured()) {
        return mockRooms.find((r) => r.slug === slug) || null;
      }
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();
      
      if (error) {
        // Fall back to mock if not found in db
        return mockRooms.find((r) => r.slug === slug) || null;
      }
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-forest-700" />
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="page-container flex flex-col items-center justify-center space-y-4 px-4 text-center">
        <ShieldAlert className="h-16 w-16 text-amber-gold" />
        <h2 className="text-2xl font-serif font-bold text-forest-800">Room Not Found</h2>
        <p className="text-sm text-forest-500 max-w-sm">
          The accommodation you are looking for does not exist or has been temporarily unlisted.
        </p>
        <Link to="/rooms" className="px-6 py-2.5 bg-forest-750 text-white rounded-xl text-sm font-bold shadow-md">
          Back to Rooms
        </Link>
      </div>
    );
  }

  // Pre-process images for the lightbox component
  const galleryMedia: LightboxMedia[] = [
    { url: room.cover_image_url, title: room.name, caption: 'Main Cover Photo', media_type: 'image' },
    ...(room.gallery_image_urls || []).map((url, i) => ({
      url,
      title: `${room.name} Gallery`,
      caption: `View ${i + 1}`,
      media_type: 'image' as const,
    })),
  ];

  const roomJsonLd = {
    "@context": "https://schema.org",
    "@type": "HotelRoom",
    "name": room.name,
    "description": room.description || `Book ${room.name} at Purushottam Holiday Homestay. Accommodates up to ${room.capacity} guests.`,
    "occupancy": {
      "@type": "QuantitativeValue",
      "maxValue": room.capacity
    },
    "amenityFeature": room.amenities.map(amenity => ({
      "@type": "LocationFeatureSpecification",
      "name": amenity,
      "value": true
    })),
    "offers": {
      "@type": "Offer",
      "price": room.price_per_night,
      "priceCurrency": "INR"
    }
  };

  return (
    <div className="page-container py-10 md:py-16 bg-forest-50/10">
      <SEO 
        title={`${room.name} | Room Details`}
        description={room.description?.slice(0, 155) || `Book ${room.name} with premium pool access, Konkani home meals, and spacious amenities near Tala Fort, Raigad.`}
        keywords={`${room.name}, lodge rooms Tala, rent cottage Raigad, hotel room booking, resort stay, pool cottage`}
        jsonLd={roomJsonLd}
        ogImage={room.cover_image_url}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back navigation */}
        <Link to="/rooms" className="inline-flex items-center text-sm font-bold text-forest-600 hover:text-amber-gold transition-colors mb-8">
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span>Back to Rooms</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Room Details & Images (8 Columns) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Title & Info */}
            <div className="space-y-3">
              <h2 className="text-3xl md:text-4xl font-serif font-black text-forest-800">
                {room.name}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-forest-500">
                <span className="bg-forest-50 border border-forest-100 px-3 py-1 rounded">
                  Up to {room.capacity} Guests
                </span>
                <span className="bg-forest-50 border border-forest-100 px-3 py-1 rounded text-forest-700">
                  ₹{room.price_per_night} / Night
                </span>
              </div>
            </div>

            {/* Main Cover Display */}
            <div
              className="relative rounded-2xl overflow-hidden shadow-xl aspect-[16/9] cursor-zoom-in"
              onClick={() => setLightboxIndex(0)}
            >
              <ImageKitImage
                path={room.cover_image_url}
                alt={room.name}
                aspectRatio={16 / 9}
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-4 right-4 bg-forest-950/80 backdrop-blur px-3 py-1.5 rounded-lg text-white text-xs font-semibold shadow-md">
                Click to expand gallery
              </div>
            </div>

            {/* Gallery Grid */}
            {room.gallery_image_urls && room.gallery_image_urls.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold tracking-wider text-forest-400 uppercase">Room Gallery</h4>
                <div className="grid grid-cols-3 gap-3">
                  {room.gallery_image_urls.map((img, i) => (
                    <div
                      key={i}
                      className="rounded-xl overflow-hidden aspect-[4/3] shadow-md cursor-zoom-in border border-forest-100/50"
                      onClick={() => setLightboxIndex(i + 1)}
                    >
                      <ImageKitImage
                        path={img}
                        alt={`${room.name} ${i + 1}`}
                        aspectRatio={4 / 3}
                        className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="space-y-3">
              <h3 className="text-xl font-serif font-bold text-forest-800 border-l-3 border-amber-gold pl-2">
                Room Description
              </h3>
              <p className="text-sm md:text-base text-forest-600 leading-relaxed font-medium">
                {room.description || 'No detailed description available.'}
              </p>
            </div>

            {/* Amenities Grid */}
            <div className="space-y-4">
              <h3 className="text-xl font-serif font-bold text-forest-800 border-l-3 border-amber-gold pl-2">
                Amenities Included
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {room.amenities.map((amenity, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 bg-white p-3.5 rounded-xl border border-forest-100/60 shadow-sm"
                  >
                    <div className="p-2 rounded-lg bg-forest-50 text-forest-600">
                      {getAmenityIcon(amenity)}
                    </div>
                    <span className="text-xs font-semibold text-forest-700">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* House Rules */}
            <div className="bg-amber-50/30 border border-amber-100 p-6 rounded-2xl space-y-3">
              <h4 className="text-sm font-bold text-amber-gold-dark flex items-center">
                <Info className="h-4.5 w-4.5 mr-1.5" />
                <span>Important Check-in Notes</span>
              </h4>
              <ul className="space-y-2 text-xs text-forest-700">
                <li className="flex items-start">
                  <Check className="h-3.5 w-3.5 text-amber-gold mr-1.5 mt-0.5" />
                  <span>Standard check-in is at 12:00 PM and check-out is at 10:00 AM.</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-3.5 w-3.5 text-amber-gold mr-1.5 mt-0.5" />
                  <span>Please present a valid government-issued ID card during check-in.</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-3.5 w-3.5 text-amber-gold mr-1.5 mt-0.5" />
                  <span>No prepayment is requested. Bookings are processed via WhatsApp inquiry.</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Right Column: Inquiry Form (4 Columns) */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
            <InquiryForm defaultRoomName={room.name} />
          </div>

        </div>

      </div>

      {/* Lightbox Overlay */}
      {lightboxIndex !== null && (
        <GalleryLightbox
          mediaList={galleryMedia}
          activeIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(index) => setLightboxIndex(index)}
        />
      )}
    </div>
  );
};
export default RoomDetail;
