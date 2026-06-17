import React from 'react';
import { Link } from 'react-router-dom';
import { Wifi, Tv, Wind, Droplet, Car, Shield, Users, ArrowRight, MessageSquareCode } from 'lucide-react';
import ImageKitImage from './ImageKitImage';
import { Room } from '../lib/mockData';
import { useUIStore } from '../store/uiStore';

// Map amenity strings to icons
export const getAmenityIcon = (amenity: string) => {
  const clean = amenity.toLowerCase().trim();
  if (clean.includes('ac')) return <Wind className="h-4 w-4" />;
  if (clean.includes('tv') || clean.includes('television')) return <Tv className="h-4 w-4" />;
  if (clean.includes('wifi') || clean.includes('internet')) return <Wifi className="h-4 w-4" />;
  if (clean.includes('hot water') || clean.includes('geyser')) return <Droplet className="h-4 w-4" />;
  if (clean.includes('parking')) return <Car className="h-4 w-4" />;
  return <Shield className="h-4 w-4" />;
};

interface RoomCardProps {
  room: Room;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room }) => {
  const settings = useUIStore((state) => state.settings);

  // Generate the WhatsApp booking text
  const waMessage = `Hello, I want to book the "${room.name}" at Purushottam Holiday Homestay.
Check-in: 
Check-out: 
Guests: 
Room Preference: ${room.name}`;
  
  const whatsappUrl = `https://wa.me/${settings.whatsapp_number.replace(/\+/g, '')}?text=${encodeURIComponent(waMessage)}`;

  return (
    <div className="flex flex-col rounded-2xl bg-white border border-forest-100 overflow-hidden shadow-lg hover-gold-shadow transition-all duration-300">
      {/* Cover Image */}
      <Link to={`/rooms/${room.slug}`} className="relative h-60 w-full overflow-hidden block">
        <ImageKitImage
          path={room.cover_image_url}
          alt={room.name}
          aspectRatio={1.5}
          className="h-full w-full object-cover"
        />
        <div className="absolute top-4 right-4 bg-forest-900/80 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md">
          <Users className="h-3 w-3 text-amber-gold" />
          <span>Max {room.capacity} Guests</span>
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 md:p-6">
        <div className="flex justify-between items-start mb-2">
          <Link to={`/rooms/${room.slug}`}>
            <h3 className="text-xl md:text-2xl font-serif font-bold text-forest-700 hover:text-forest-500 transition-colors">
              {room.name}
            </h3>
          </Link>
          <div className="text-right">
            <span className="text-xl font-bold text-forest-800">₹{room.price_per_night}</span>
            <span className="text-xs text-forest-500 block">/ night</span>
          </div>
        </div>

        <p className="text-sm text-forest-600 line-clamp-2 mb-4 leading-relaxed">
          {room.short_description}
        </p>

        {/* Amenities Icons */}
        <div className="mb-6">
          <h4 className="text-[10px] font-bold tracking-wider text-forest-400 uppercase mb-2">Room Amenities</h4>
          <div className="flex flex-wrap gap-2">
            {room.amenities.slice(0, 5).map((amenity, idx) => (
              <div
                key={idx}
                className="flex items-center justify-center p-2 rounded-lg bg-forest-50 text-forest-600"
                title={amenity}
              >
                {getAmenityIcon(amenity)}
              </div>
            ))}
            {room.amenities.length > 5 && (
              <div
                className="flex items-center justify-center px-2 py-1 text-[10px] font-bold rounded-lg bg-forest-100 text-forest-700 cursor-default"
                title={room.amenities.slice(5).join(', ')}
              >
                +{room.amenities.length - 5} MORE
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-forest-50">
          <Link
            to={`/rooms/${room.slug}`}
            className="flex items-center justify-center space-x-1 py-2.5 rounded-xl border border-forest-200 text-forest-700 text-sm font-semibold hover:bg-forest-50 hover:border-forest-400 transition-all duration-200"
          >
            <span>Details</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-1 py-2.5 rounded-xl bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition-all duration-200 shadow-md shadow-green-100"
          >
            <MessageSquareCode className="h-3.5 w-3.5 fill-current" />
            <span>Book Now</span>
          </a>
        </div>
      </div>
    </div>
  );
};
export default RoomCard;
