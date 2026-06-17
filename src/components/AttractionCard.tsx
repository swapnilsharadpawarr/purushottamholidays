import React from 'react';
import { MapPin, Navigation, Compass, Calendar, Clock } from 'lucide-react';
import ImageKitImage from './ImageKitImage';
import { Attraction } from '../lib/mockData';

interface AttractionCardProps {
  attraction: Attraction;
  onViewOnMap?: (attraction: Attraction) => void;
}

export const AttractionCard: React.FC<AttractionCardProps> = ({ attraction, onViewOnMap }) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'History':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Nature':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Adventure':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Beach':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Religious':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-forest-100 text-forest-800 border-forest-200';
    }
  };

  return (
    <div className="flex flex-col rounded-2xl bg-white border border-forest-100 overflow-hidden shadow-lg hover-gold-shadow transition-all duration-300">
      {/* Photo */}
      <div className="relative h-52 w-full overflow-hidden">
        <ImageKitImage
          path={attraction.imagekit_image_url}
          alt={attraction.name}
          aspectRatio={1.5}
          className="h-full w-full object-cover"
        />
        <div className="absolute top-4 left-4 flex flex-col space-y-1 items-start">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(attraction.category)} shadow-sm`}>
            {attraction.category}
          </span>
        </div>
        <div className="absolute bottom-4 left-4 bg-forest-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md">
          <MapPin className="h-3.5 w-3.5 text-amber-gold" />
          <span>{attraction.distance_km} km away</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <h3 className="text-xl font-serif font-bold text-forest-800 mb-2">{attraction.name}</h3>
        
        <p className="text-sm text-forest-600 line-clamp-3 mb-4 leading-relaxed flex-1">
          {attraction.description}
        </p>

        <div className="flex flex-col space-y-2 mb-4 text-xs text-forest-500 bg-forest-50/50 p-3 rounded-xl border border-forest-100/40">
          <div className="flex items-center space-x-2">
            <Clock className="h-3.5 w-3.5 text-forest-500" />
            <span><strong>Travel Time:</strong> {attraction.travel_time}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-3.5 w-3.5 text-forest-500" />
            <span><strong>Best Visit:</strong> {attraction.best_time_to_visit}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-forest-50">
          {onViewOnMap && (
            <button
              onClick={() => onViewOnMap(attraction)}
              className="flex items-center justify-center space-x-1 py-2 rounded-lg border border-forest-200 text-forest-700 text-xs font-semibold hover:bg-forest-50 transition-all cursor-pointer"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Locate</span>
            </button>
          )}
          
          <a
            href={attraction.google_maps_directions_url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center space-x-1 py-2 rounded-lg bg-forest-600 text-white text-xs font-semibold hover:bg-forest-700 transition-all shadow-md ${
              !onViewOnMap ? 'col-span-2' : ''
            }`}
          >
            <Navigation className="h-3.5 w-3.5" />
            <span>Directions</span>
          </a>
        </div>
      </div>
    </div>
  );
};
export default AttractionCard;
