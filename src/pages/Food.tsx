import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Utensils, ChefHat, Check } from 'lucide-react';
import { supabase, isDbConfigured } from '../lib/supabase';
import { mockFoodMenuItems, FoodMenuItem } from '../lib/mockData';
import FoodCard from '../components/FoodCard';
import SEO from '../components/SEO';

export const Food: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('All');

  // Fetch Food Menu Items
  const { data: menuItems = [], isLoading } = useQuery<FoodMenuItem[]>({
    queryKey: ['food-menu-list'],
    queryFn: async () => {
      if (!isDbConfigured()) return mockFoodMenuItems;
      const { data } = await supabase
        .from('food_menu_items')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      return data && data.length > 0 ? data : mockFoodMenuItems;
    },
  });

  const tabs = ['All', 'Veg', 'Non-Veg', 'Seafood', 'Meal Package'];

  const filteredItems = activeTab === 'All'
    ? menuItems
    : menuItems.filter(item => item.category === activeTab);

  // Group packages and regular items
  const mealPackages = filteredItems.filter(item => item.is_meal_package);
  const regularItems = filteredItems.filter(item => !item.is_meal_package);

  return (
    <div className="page-container py-12 md:py-16 bg-forest-50/20">
      <SEO 
        title="Authentic Konkani Food Menu | Local Dining & Meal Packages"
        description="Indulge in delicious home-cooked Konkani meals, fresh local seafood, and organic farm-to-table vegetarian dishes at Purushottam Holiday Homestay."
        keywords="Konkani food, local resort dining, seafood meal package Raigad, homestay lunch dinner, organic food Tala, best fish thali Tala"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className="text-amber-gold-dark text-xs font-bold uppercase tracking-widest bg-forest-50 border border-forest-100/60 px-3 py-1 rounded-full">
            Konkan Culinary Art
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-black text-forest-800">
            Savor the Flavors
          </h2>
          <div className="h-1 w-20 bg-amber-gold mx-auto rounded-full mt-3" />
          <p className="text-forest-500 text-sm md:text-base leading-relaxed">
            Experience authentic coastal cuisine prepared with fresh local ingredients and organic produce from our own backyard farm. Indulge in classic fish thalis, Solkadhi, and delicious rural Konkani preparations.
          </p>
        </div>

        {/* Categories Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold border transition-all duration-300 cursor-pointer ${
                activeTab === tab
                  ? 'bg-forest-700 text-white border-forest-700 shadow-md'
                  : 'bg-white text-forest-600 border-forest-100 hover:border-forest-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-96 animate-pulse border border-forest-100/50 shadow" />
            ))}
          </div>
        ) : (
          <div className="space-y-16">
            
            {/* 1. Meal Packages Section (Special highlight card design) */}
            {mealPackages.length > 0 && (
              <div className="space-y-6">
                <div className="border-b border-forest-100 pb-3 flex items-center space-x-2">
                  <ChefHat className="h-5 w-5 text-amber-gold-dark" />
                  <h3 className="text-xl md:text-2xl font-serif font-bold text-forest-800">Boarding Packages</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {mealPackages.map((item) => (
                    <FoodCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {/* 2. Standard Menu Items */}
            {regularItems.length > 0 && (
              <div className="space-y-6">
                <div className="border-b border-forest-100 pb-3 flex items-center space-x-2">
                  <Utensils className="h-5 w-5 text-forest-700" />
                  <h3 className="text-xl md:text-2xl font-serif font-bold text-forest-800">A La Carte Specials</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {regularItems.map((item) => (
                    <FoodCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredItems.length === 0 && (
              <div className="text-center py-16 bg-white border border-forest-100 rounded-3xl p-8 shadow-inner">
                <Utensils className="h-12 w-12 text-forest-300 mx-auto mb-3" />
                <h4 className="text-lg font-serif font-bold text-forest-700">No Menu Items Listed</h4>
                <p className="text-xs text-forest-500 mt-1">Check back later or inquire about custom meal requirements.</p>
              </div>
            )}

          </div>
        )}

        {/* Dietary note block */}
        <div className="mt-20 bg-forest-900 text-white rounded-3xl p-8 md:p-12 shadow-xl border border-forest-950 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#1f4d3e_1px,transparent_1px)] [background-size:20px_20px] opacity-15" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <h3 className="text-2xl font-serif font-bold text-amber-gold">Custom Meal Inquiries</h3>
            <p className="text-sm text-forest-200 leading-relaxed font-medium">
              Do you have special dietary restrictions, allergies, or requests? We gladly prepare Jain-compliant recipes, non-spicy meals for kids, and special Konkani sweets like Ukadiche Modak upon request. Let us know at least 24 hours prior to check-in.
            </p>
            <div className="flex items-center space-x-2 pt-2 text-xs font-semibold text-amber-gold">
              <Check className="h-4 w-4 text-emerald-400" />
              <span>100% Home Cooked</span>
              <span className="opacity-40">|</span>
              <Check className="h-4 w-4 text-emerald-400" />
              <span>Organic Vegetable Farm On-site</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
export default Food;
