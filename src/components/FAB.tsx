import React, { useState } from 'react';
import { Phone, MessageCircle, MapPin, MessageSquare, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../store/uiStore';

export const FAB: React.FC = () => {
  const settings = useUIStore((state) => state.settings);
  const [isOpen, setIsOpen] = useState(false);

  const phoneLink = `tel:${settings.phone_number}`;
  const whatsappLink = `https://wa.me/${settings.whatsapp_number.replace(/\+/g, '')}?text=${encodeURIComponent(
    'Hello, I want to book a room or make an inquiry at Purushottam Holiday Homestay.'
  )}`;
  const mapsLink = settings.google_maps_directions_url;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-3">
      {/* Expanded Buttons */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="flex flex-col items-end space-y-3 mb-2"
          >
            {/* Get Directions */}
            <a
              href={mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 group"
            >
              <span className="bg-forest-800/90 text-white text-xs font-medium px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md">
                Directions
              </span>
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors duration-300 hover:scale-110 active:scale-95 cursor-pointer">
                <MapPin className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </a>

            {/* Book on WhatsApp */}
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 group"
            >
              <span className="bg-forest-800/90 text-white text-xs font-medium px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md">
                WhatsApp
              </span>
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors duration-300 hover:scale-110 active:scale-95 cursor-pointer">
                <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 fill-current" />
              </div>
            </a>

            {/* Call Now */}
            <a
              href={phoneLink}
              className="flex items-center space-x-2 group"
            >
              <span className="bg-forest-800/90 text-white text-xs font-medium px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md">
                Call Now
              </span>
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg hover:bg-emerald-700 transition-colors duration-300 hover:scale-110 active:scale-95 cursor-pointer">
                <Phone className="h-5 w-5 sm:h-6 sm:w-6 fill-current" />
              </div>
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main toggle FAB */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`h-12 w-12 sm:h-14 sm:w-14 rounded-full flex items-center justify-center shadow-2xl transition-colors duration-300 cursor-pointer ${
          isOpen
            ? 'bg-forest-700 text-white hover:bg-forest-800'
            : 'bg-amber-gold text-forest-900 hover:bg-amber-gold-dark'
        }`}
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
        </motion.div>
      </motion.button>
    </div>
  );
};
export default FAB;
