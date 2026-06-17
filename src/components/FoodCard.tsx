import React from 'react';
import { ChefHat, CheckCircle2, MessageSquareCode } from 'lucide-react';
import ImageKitImage from './ImageKitImage';
import { FoodMenuItem } from '../lib/mockData';
import { useUIStore } from '../store/uiStore';

interface FoodCardProps {
  item: FoodMenuItem;
}

export const FoodCard: React.FC<FoodCardProps> = ({ item }) => {
  const settings = useUIStore((state) => state.settings);

  // Generate WhatsApp inquiry text
  const waMessage = `Hello, I want to inquire about the food menu at Purushottam Holiday Homestay.
Item/Package: ${item.name}
Details: ${item.description}`;
  
  const whatsappUrl = `https://wa.me/${settings.whatsapp_number.replace(/\+/g, '')}?text=${encodeURIComponent(waMessage)}`;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Veg':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Non-Veg':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Seafood':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Meal Package':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-forest-50 text-forest-700 border-forest-200';
    }
  };

  return (
    <div className={`flex flex-col rounded-2xl overflow-hidden shadow-lg border transition-all duration-300 hover-gold-shadow ${
      item.is_meal_package 
        ? 'border-amber-gold bg-gradient-to-b from-amber-50/20 to-white' 
        : 'border-forest-100 bg-white'
    }`}>
      {/* Food Photo */}
      <div className="relative h-56 w-full overflow-hidden">
        <ImageKitImage
          path={item.imagekit_image_url}
          alt={item.name}
          aspectRatio={1.5}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute top-4 left-4">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(item.category)} shadow-sm`}>
            {item.category}
          </span>
        </div>
        {item.sub_category && (
          <div className="absolute bottom-4 left-4 bg-forest-900/80 backdrop-blur-md px-2.5 py-1 rounded-md text-white text-[10px] font-bold uppercase tracking-wider">
            {item.sub_category}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 md:p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-serif font-bold text-forest-800">{item.name}</h3>
          <div className="text-right">
            {item.price ? (
              <span className="text-lg font-bold text-forest-800">₹{item.price}</span>
            ) : (
              <span className="text-xs font-medium text-amber-gold-dark bg-amber-50 px-2 py-0.5 rounded border border-amber-200 block">
                Enquire Price
              </span>
            )}
            {item.is_meal_package && item.price && <span className="text-[10px] text-forest-500 block">per person / day</span>}
          </div>
        </div>

        <p className="text-sm text-forest-600 mb-4 leading-relaxed flex-1">
          {item.description}
        </p>

        {/* Inclusions for Meal Packages */}
        {item.is_meal_package && item.package_includes && item.package_includes.length > 0 && (
          <div className="mb-4 bg-amber-50/40 border border-amber-100 p-4 rounded-xl">
            <h4 className="text-xs font-semibold text-amber-gold-dark mb-2 flex items-center">
              <ChefHat className="h-4 w-4 mr-1" />
              <span>Package Inclusions:</span>
            </h4>
            <ul className="grid grid-cols-2 gap-2">
              {item.package_includes.map((inc, index) => (
                <li key={index} className="flex items-center text-xs text-forest-700">
                  <CheckCircle2 className="h-3.5 w-3.5 text-amber-gold mr-1.5 flex-shrink-0" />
                  <span>{inc}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Dietary Tags */}
        {item.dietary_tags && item.dietary_tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {item.dietary_tags.map((tag, i) => (
              <span
                key={i}
                className="text-[10px] font-semibold text-forest-600 bg-forest-50 border border-forest-100/60 px-2.5 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Action Button */}
        <div className="pt-4 border-t border-forest-50 mt-auto">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer shadow-md ${
              item.is_meal_package
                ? 'bg-amber-gold text-forest-900 hover:bg-amber-gold-dark shadow-amber-100'
                : 'bg-forest-600 text-white hover:bg-forest-700 shadow-forest-100'
            }`}
          >
            <MessageSquareCode className="h-4 w-4 fill-current" />
            <span>{item.is_meal_package ? 'Enquire Package Details' : 'Inquire on WhatsApp'}</span>
          </a>
        </div>
      </div>
    </div>
  );
};
export default FoodCard;
