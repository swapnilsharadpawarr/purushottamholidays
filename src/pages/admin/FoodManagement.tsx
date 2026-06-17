import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChefHat, Plus, Pencil, Trash2, ToggleLeft, ToggleRight, X, Loader2, Save, Check } from 'lucide-react';
import { toast } from 'sonner';
import { supabase, isDbConfigured } from '../../lib/supabase';
import { mockFoodMenuItems, FoodMenuItem } from '../../lib/mockData';
import AdminLayout from '../../components/AdminLayout';
import ImageKitUploader from '../../components/ImageKitUploader';
import ImageKitImage from '../../components/ImageKitImage';

export const FoodManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodMenuItem | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [category, setCategory] = useState<FoodMenuItem['category']>('Veg');
  const [subCategory, setSubCategory] = useState('');
  const [isMealPackage, setIsMealPackage] = useState(false);
  const [packageIncludesInput, setPackageIncludesInput] = useState('');
  const [packageIncludes, setPackageIncludes] = useState<string[]>([]);
  const [dietaryTagInput, setDietaryTagInput] = useState('');
  const [dietaryTags, setDietaryTags] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(0);

  // Fetch Food Menu Items
  const { data: foodItems = [], isLoading } = useQuery<FoodMenuItem[]>({
    queryKey: ['admin-food-list'],
    queryFn: async () => {
      if (!isDbConfigured()) return mockFoodMenuItems;
      const { data, error } = await supabase
        .from('food_menu_items')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const openAddForm = () => {
    setEditingItem(null);
    setName('');
    setDescription('');
    setPrice('');
    setCategory('Veg');
    setSubCategory('');
    setIsMealPackage(false);
    setPackageIncludes([]);
    setDietaryTags([]);
    setImageUrl('');
    setIsActive(true);
    setDisplayOrder(0);
    setIsFormOpen(true);
  };

  const openEditForm = (item: FoodMenuItem) => {
    setEditingItem(item);
    setName(item.name);
    setDescription(item.description || '');
    setPrice(item.price || '');
    setCategory(item.category);
    setSubCategory(item.sub_category || '');
    setIsMealPackage(item.is_meal_package);
    setPackageIncludes(item.package_includes || []);
    setDietaryTags(item.dietary_tags || []);
    setImageUrl(item.imagekit_image_url || '');
    setIsActive(item.is_active);
    setDisplayOrder(item.display_order || 0);
    setIsFormOpen(true);
  };

  // Add/Edit Mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: Omit<FoodMenuItem, 'id'> = {
        name,
        description,
        price: price === '' ? null : Number(price),
        category,
        sub_category: subCategory,
        is_meal_package: isMealPackage,
        package_includes: isMealPackage ? packageIncludes : [],
        dietary_tags: dietaryTags,
        imagekit_image_url: imageUrl,
        is_active: isActive,
        display_order: Number(displayOrder),
      };

      if (!isDbConfigured()) {
        if (editingItem) {
          const idx = mockFoodMenuItems.findIndex((x) => x.id === editingItem.id);
          if (idx !== -1) mockFoodMenuItems[idx] = { ...editingItem, ...payload } as FoodMenuItem;
        } else {
          mockFoodMenuItems.push({
            id: `food-${Date.now()}`,
            ...payload,
          } as FoodMenuItem);
        }
        return;
      }

      if (editingItem) {
        const { error } = await supabase
          .from('food_menu_items')
          .update(payload)
          .eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const insertPayload = {
          id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `food-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          ...payload,
        };
        const { error } = await supabase
          .from('food_menu_items')
          .insert([insertPayload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editingItem ? 'Food item updated.' : 'New food item added successfully.');
      setIsFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-food-list'] });
      queryClient.invalidateQueries({ queryKey: ['food-menu-list'] });
      queryClient.invalidateQueries({ queryKey: ['food-teaser'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to save food menu item.');
    },
  });

  // Toggle Active Mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: boolean }) => {
      if (!isDbConfigured()) {
        const idx = mockFoodMenuItems.findIndex((x) => x.id === id);
        if (idx !== -1) mockFoodMenuItems[idx].is_active = status;
        return;
      }
      const { error } = await supabase
        .from('food_menu_items')
        .update({ is_active: status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Food item visibility updated.');
      queryClient.invalidateQueries({ queryKey: ['admin-food-list'] });
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!isDbConfigured()) {
        const idx = mockFoodMenuItems.findIndex((x) => x.id === id);
        if (idx !== -1) mockFoodMenuItems.splice(idx, 1);
        return;
      }
      const { error } = await supabase.from('food_menu_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Food item deleted.');
      queryClient.invalidateQueries({ queryKey: ['admin-food-list'] });
    },
  });

  const addInclusion = () => {
    if (packageIncludesInput.trim() && !packageIncludes.includes(packageIncludesInput.trim())) {
      setPackageIncludes([...packageIncludes, packageIncludesInput.trim()]);
      setPackageIncludesInput('');
    }
  };

  const removeInclusion = (name: string) => {
    setPackageIncludes(packageIncludes.filter((i) => i !== name));
  };

  const addDietaryTag = () => {
    if (dietaryTagInput.trim() && !dietaryTags.includes(dietaryTagInput.trim())) {
      setDietaryTags([...dietaryTags, dietaryTagInput.trim()]);
      setDietaryTagInput('');
    }
  };

  const removeDietaryTag = (name: string) => {
    setDietaryTags(dietaryTags.filter((t) => t !== name));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Actions Row */}
        <div className="flex justify-between items-center">
          <p className="text-xs text-slate-500 font-semibold">
            Manage rural Konkani dishes, breakfast details, and boarding meal plans.
          </p>
          <button
            onClick={openAddForm}
            className="flex items-center justify-center space-x-1 px-4 py-2.5 rounded-xl bg-forest-800 text-white hover:bg-forest-900 transition-colors text-xs font-bold shadow-md cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Menu Item</span>
          </button>
        </div>

        {/* Menu Items Table */}
        {isLoading ? (
          <div className="h-64 flex items-center justify-center bg-white border border-slate-200 rounded-2xl">
            <Loader2 className="h-8 w-8 text-forest-750 animate-spin" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 font-bold">
                    <th className="p-4">Photo</th>
                    <th className="p-4">Item Name</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Sub Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Visibility</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {foodItems.map((item) => (
                    <tr key={item.id} className="align-middle hover:bg-slate-50/30">
                      {/* Photo */}
                      <td className="p-4">
                        <div className="h-14 w-20 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                          <ImageKitImage path={item.imagekit_image_url} alt={item.name} aspectRatio={1.4} />
                        </div>
                      </td>

                      {/* Name */}
                      <td className="p-4">
                        <span className="font-bold text-slate-800 text-sm block leading-tight">{item.name}</span>
                        {item.is_meal_package && (
                          <span className="text-[9px] bg-amber-100 text-amber-805 font-bold uppercase px-1.5 py-0.5 rounded mt-1 inline-block">
                            Board Plan
                          </span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="p-4 font-semibold text-xs text-slate-700">{item.category}</td>

                      {/* Sub-category */}
                      <td className="p-4 text-xs font-semibold text-slate-500">{item.sub_category || 'N/A'}</td>

                      {/* Price */}
                      <td className="p-4 font-bold text-slate-800">
                        {item.price ? `₹${item.price}` : 'Variable'}
                      </td>

                      {/* Visibility */}
                      <td className="p-4">
                        <button
                          onClick={() => toggleActiveMutation.mutate({ id: item.id, status: !item.is_active })}
                          className="text-slate-505 hover:text-forest-750 transition-colors cursor-pointer"
                        >
                          {item.is_active ? (
                            <ToggleRight className="h-7 w-7 text-emerald-600" />
                          ) : (
                            <ToggleLeft className="h-7 w-7 text-slate-350" />
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="p-4">
                        <div className="flex items-center justify-end space-x-2.5">
                          <button
                            onClick={() => openEditForm(item)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-605 hover:bg-slate-55 hover:border-slate-350 transition-colors cursor-pointer"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
                                deleteMutation.mutate(item.id);
                              }
                            }}
                            className="p-1.5 rounded-lg border border-red-100 text-red-650 hover:bg-red-50 hover:border-red-350 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Form Overlay */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-250">
              
              {/* Header */}
              <div className="h-16 border-b border-slate-200 flex items-center justify-between px-6">
                <h3 className="text-lg font-serif font-black text-slate-800">
                  {editingItem ? `Edit: ${editingItem.name}` : 'Add New Food Menu Item'}
                </h3>
                <button onClick={() => setIsFormOpen(false)} className="text-slate-404 hover:text-slate-600 cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form body */}
              <div className="flex-1 p-6 overflow-y-auto space-y-5">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-600">Item / Package Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Special Konkani Fish Thali"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-forest-500 bg-slate-50/50"
                    />
                  </div>
                  {/* Price */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-600">Price (INR, Leave blank if variable)</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 350"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-forest-500 bg-slate-50/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Category */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-600">Dietary Category</label>
                    <select
                      value={category}
                      onChange={(e) => {
                        setCategory(e.target.value as FoodMenuItem['category']);
                        if (e.target.value === 'Meal Package') {
                          setIsMealPackage(true);
                        }
                      }}
                      className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-forest-500"
                    >
                      <option value="Veg">Vegetarian</option>
                      <option value="Non-Veg">Non-Vegetarian</option>
                      <option value="Seafood">Seafood Special</option>
                      <option value="Meal Package">Meal Package</option>
                    </select>
                  </div>
                  {/* Sub category */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-600">Sub-Category Tag</label>
                    <input
                      type="text"
                      value={subCategory}
                      onChange={(e) => setSubCategory(e.target.value)}
                      placeholder="e.g. Starters, Lunch, Desserts"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-forest-500 bg-slate-50/50"
                    />
                  </div>
                  {/* Display Order */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-600">Display Order Rank</label>
                    <input
                      type="number"
                      value={displayOrder}
                      onChange={(e) => setDisplayOrder(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-forest-500 bg-slate-50/50"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-600">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Briefly describe dish ingredients or boarding package details..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-forest-500 bg-slate-50/50 resize-none"
                  />
                </div>

                {/* Meal Package Toggle */}
                <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <input
                    type="checkbox"
                    id="is_meal"
                    checked={isMealPackage}
                    onChange={(e) => setIsMealPackage(e.target.checked)}
                    className="h-4 w-4 rounded text-forest-650"
                  />
                  <label htmlFor="is_meal" className="text-xs font-bold text-slate-700 select-none">
                    Is this a full boarding package plan? (Includes multiple daily meals)
                  </label>
                </div>

                {/* Package Inclusions (Multi-input) */}
                {isMealPackage && (
                  <div className="space-y-2 bg-amber-50/20 border border-amber-100 p-4 rounded-2xl">
                    <label className="block text-xs font-bold text-amber-gold-dark">Package Inclusions (e.g. Dinner, Breakfast)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={packageIncludesInput}
                        onChange={(e) => setPackageIncludesInput(e.target.value)}
                        placeholder="Add inclusion (e.g. Fish Curry Lunch, Solkadhi)"
                        className="flex-1 px-3 py-1.5 border border-amber-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-forest-500 bg-white"
                      />
                      <button
                        type="button"
                        onClick={addInclusion}
                        className="px-4 py-1.5 bg-amber-gold text-forest-900 rounded-lg text-xs font-semibold hover:bg-amber-gold-dark transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {packageIncludes.map((inc, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded bg-white text-slate-700 text-xs border border-amber-200 font-semibold shadow-sm"
                        >
                          <span>{inc}</span>
                          <button type="button" onClick={() => removeInclusion(inc)} className="text-red-500 hover:text-red-750">
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dietary Tags (Multi-input) */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-600">Dietary & Style Labels (e.g. Jain, Spicy, Organic)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={dietaryTagInput}
                      onChange={(e) => setDietaryTagInput(e.target.value)}
                      placeholder="e.g. Jain Option, Organic, Less Spicy"
                      className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-forest-500 bg-slate-50/50"
                    />
                    <button
                      type="button"
                      onClick={addDietaryTag}
                      className="px-4 py-1.5 bg-forest-700 text-white rounded-lg text-xs font-semibold hover:bg-forest-800 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {dietaryTags.map((tag, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 text-xs border border-slate-200 font-semibold"
                      >
                        <span>{tag}</span>
                        <button type="button" onClick={() => removeDietaryTag(tag)} className="text-red-550 hover:text-red-750">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Food Image upload (ImageKit) */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-600">Food Photo</label>
                  {imageUrl && (
                    <div className="relative h-36 w-60 rounded-xl overflow-hidden border border-slate-200 mb-3 bg-slate-100">
                      <ImageKitImage path={imageUrl} alt="Food Preview" aspectRatio={1.6} />
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="absolute top-2 right-2 p-1.5 bg-red-650 hover:bg-red-700 rounded-full text-white shadow-md cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  {!imageUrl && (
                    <ImageKitUploader folder="food" onUploadSuccess={(res) => setImageUrl(res.url)} label="Upload Food Photo" />
                  )}
                </div>

              </div>

              {/* Footer */}
              <div className="h-16 border-t border-slate-200 flex justify-end items-center px-6 space-x-3 bg-slate-50/50 rounded-b-3xl">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => saveMutation.mutate()}
                  className="flex items-center space-x-1.5 px-4.5 py-2 bg-forest-800 text-white rounded-xl text-xs font-semibold hover:bg-forest-900 transition-colors cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  <span>{editingItem ? 'Update Item' : 'Add Item'}</span>
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};
export default FoodManagement;
