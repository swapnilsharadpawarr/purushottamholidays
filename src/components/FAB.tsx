import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import { useUIStore } from '../store/uiStore';

export const FAB: React.FC = () => {
  const settings = useUIStore((state) => state.settings);

  const phoneLink = `tel:${settings.phone_number}`;
  const whatsappLink = `https://wa.me/${settings.whatsapp_number.replace(/\+/g, '')}?text=${encodeURIComponent(
    'Hello, I want to book a room or make an inquiry at Purushottam Holiday Homestay.'
  )}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-3">
      {/* WhatsApp Button */}
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center space-x-2 group hover:scale-110 transition-transform duration-300"
      >
        <span className="bg-forest-800/90 text-white text-xs font-medium px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md">
          WhatsApp
        </span>
        <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors duration-300 cursor-pointer">
          <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 fill-current" />
        </div>
      </a>

      {/* Call Button (vibrating every 2 seconds) */}
      <a
        href={phoneLink}
        className="flex items-center space-x-2 group hover:scale-110 transition-transform duration-300 animate-vibrate"
      >
        <span className="bg-forest-800/90 text-white text-xs font-medium px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md">
          Call Now
        </span>
        <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg hover:bg-emerald-700 transition-colors duration-300 cursor-pointer">
          <Phone className="h-5 w-5 sm:h-6 sm:w-6 fill-current" />
        </div>
      </a>
    </div>
  );
};
export default FAB;
