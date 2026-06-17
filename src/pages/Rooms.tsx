import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase, isDbConfigured } from '../lib/supabase';
import { mockRooms } from '../lib/mockData';
import RoomCard from '../components/RoomCard';
import SEO from '../components/SEO';

export const Rooms: React.FC = () => {
  // Fetch all active rooms
  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['rooms-list'],
    queryFn: async () => {
      if (!isDbConfigured()) return mockRooms;
      const { data } = await supabase
        .from('rooms')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      return data && data.length > 0 ? data : mockRooms;
    },
  });

  return (
    <div className="page-container py-12 md:py-16 bg-forest-50/20">
      <SEO 
        title="Comfortable Rooms & Suites | Resort & Cottage Accommodation"
        description="Browse premium rooms, heritage cottages, and cozy couple suites at Purushottam Holiday Homestay near Tala Fort, Raigad. Book direct for the best pricing."
        keywords="rooms in Tala, resort cottages Raigad, hotel rooms near me, lodge booking Tala, homestay accommodation, luxury suite, budget hotel room"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-amber-gold-dark text-xs font-bold uppercase tracking-widest bg-forest-50 border border-forest-100/60 px-3 py-1 rounded-full">
            Premium Cottages & Suites
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-black text-forest-800">
            Our Comfortable Rooms
          </h2>
          <div className="h-1 w-20 bg-amber-gold mx-auto rounded-full mt-3" />
          <p className="text-forest-500 text-sm md:text-base leading-relaxed">
            Select the perfect accommodation for your vacation. Whether it is a cozy room for two, a spacious suite for your family, or a heritage cottage for your entire group, we have got you covered.
          </p>
        </div>

        {/* Listings Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-[420px] animate-pulse border border-forest-100/50 shadow" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )}

        {/* Trust Badge / Info Section */}
        <div className="mt-20 bg-white border border-forest-100 rounded-3xl p-8 md:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left">
            <h3 className="text-2xl font-serif font-bold text-forest-800">Planning a Group Retreat?</h3>
            <p className="text-sm text-forest-500 max-w-xl">
              We offer exclusive full-homestay bookings for corporate events, family reunions, and large groups. Accommodates up to 25+ guests with customized meal packages and heritage tours.
            </p>
          </div>
          <a
            href="https://wa.me/+919860361361?text=Hello%2C%20I%20am%20interested%20in%20booking%20the%20entire%20Purushottam%20Homestay%20for%2520a%20group%20event."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full md:w-auto px-8 py-3.5 bg-forest-750 text-white text-sm font-bold rounded-xl hover:bg-forest-900 transition-colors shadow-lg shadow-forest-100 flex-shrink-0 text-center cursor-pointer"
          >
            Inquire Group Booking
          </a>
        </div>
      </div>
    </div>
  );
};
export default Rooms;
