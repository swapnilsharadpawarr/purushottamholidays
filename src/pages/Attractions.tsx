import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Compass, MapPin, Navigation, Map } from 'lucide-react';
import { supabase, isDbConfigured } from '../lib/supabase';
import { mockAttractions, Attraction } from '../lib/mockData';
import AttractionCard from '../components/AttractionCard';
import { useUIStore } from '../store/uiStore';
import SEO from '../components/SEO';

export const Attractions: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const settings = useUIStore((state) => state.settings);

  // Fetch Attractions
  const { data: attractions = [], isLoading } = useQuery<Attraction[]>({
    queryKey: ['attractions-list'],
    queryFn: async () => {
      if (!isDbConfigured()) return mockAttractions;
      const { data } = await supabase
        .from('attractions')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      return data && data.length > 0 ? data : mockAttractions;
    },
  });

  const categories = ['All', 'Nature', 'History', 'Adventure', 'Religious', 'Beach'];

  const filteredAttractions = selectedCategory === 'All'
    ? attractions
    : attractions.filter(att => att.category === selectedCategory);

  return (
    <div className="page-container py-12 md:py-16 bg-forest-50/20">
      <SEO 
        title="Tourist Attractions near Tala Fort & Raigad | Heritage Tours"
        description="Explore popular attractions near Purushottam Holiday Homestay: Tala Fort, Kuda Buddhist Caves, Raigad Fort, waterfalls, trekking trails, and local beaches."
        keywords="Tala Fort tourism, local attractions Raigad, Kuda Caves, places to visit near Tala, Konkan sightseeing, weekend trips Maharashtra"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className="text-amber-gold-dark text-xs font-bold uppercase tracking-widest bg-forest-50 border border-forest-100/60 px-3 py-1 rounded-full">
            Heritage & Sightseeing
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-black text-forest-800">
            Explore Nearby Attractions
          </h2>
          <div className="h-1 w-20 bg-amber-gold mx-auto rounded-full mt-3" />
          <p className="text-forest-500 text-sm md:text-base leading-relaxed">
            Discover the beauty, history, and adventure surrounding Purushottam Holiday Homestay. Located just minutes away from the historic Tala Fort and an easy drive to pristine coastlines and ancient caves.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-xl text-xs font-bold border transition-all duration-300 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-forest-700 text-white border-forest-700 shadow-md'
                  : 'bg-white text-forest-600 border-forest-100 hover:border-forest-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Attractions Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-80 animate-pulse border border-forest-100/50 shadow" />
            ))}
          </div>
        ) : filteredAttractions.length === 0 ? (
          <div className="text-center py-16 bg-white border border-forest-100 rounded-3xl p-8 shadow-inner">
            <Compass className="h-12 w-12 text-forest-300 mx-auto mb-3" />
            <h4 className="text-lg font-serif font-bold text-forest-700">No Attractions Available</h4>
            <p className="text-xs text-forest-500 mt-1">There are no hotspots registered under this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredAttractions.map((att) => (
              <AttractionCard key={att.id} attraction={att} />
            ))}
          </div>
        )}

        {/* Interactive Map directions teaser */}
        <div className="mt-20 grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white border border-forest-100 rounded-3xl p-6 md:p-10 shadow-xl items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center space-x-2 text-amber-gold-dark text-xs font-bold uppercase tracking-wider">
              <Map className="h-4 w-4" />
              <span>Route Planner</span>
            </div>
            <h3 className="text-2xl font-serif font-bold text-forest-800">Centrally Located Homestay</h3>
            <p className="text-sm text-forest-600 leading-relaxed font-medium">
              Purushottam Holiday Homestay acts as a perfect hub for exploring South Konkan heritage. We provide guest vehicles on rent, local guides, and detailed route maps for trekking and beach exploration.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="border-l-3 border-forest-500 pl-3">
                <span className="text-xs text-forest-400 block font-semibold">TALA HILL TREK</span>
                <span className="text-sm font-bold text-forest-800">10 min drive</span>
              </div>
              <div className="border-l-3 border-forest-500 pl-3">
                <span className="text-xs text-forest-400 block font-semibold">ARABIAN SEA BEACHES</span>
                <span className="text-sm font-bold text-forest-800">45 min drive</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 h-64 rounded-2xl overflow-hidden border border-forest-100 relative bg-forest-900 shadow-lg">
            <iframe
              src={settings.google_maps_embed_url}
              className="h-full w-full border-0 grayscale"
              allowFullScreen
              loading="lazy"
              title="Attractions Area Map"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 to-transparent flex items-end p-4">
              <a
                href={(!settings.google_maps_directions_url || settings.google_maps_directions_url === 'https://maps.app.goo.gl/y5R34J21H9x8z7A6')
                  ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address || 'Purushottam Holiday Homestay Tala Raigad')}`
                  : settings.google_maps_directions_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 bg-amber-gold hover:bg-amber-gold-dark text-forest-950 rounded-xl text-xs font-bold text-center transition-all shadow-md cursor-pointer"
              >
                Plan Custom Route
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
export default Attractions;
