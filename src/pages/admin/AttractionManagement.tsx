import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Compass, Plus, Pencil, Trash2, ToggleLeft, ToggleRight, X, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { supabase, isDbConfigured } from '../../lib/supabase';
import { mockAttractions, Attraction } from '../../lib/mockData';
import AdminLayout from '../../components/AdminLayout';
import ImageKitUploader from '../../components/ImageKitUploader';
import ImageKitImage from '../../components/ImageKitImage';

export const AttractionManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAttraction, setEditingAttraction] = useState<Attraction | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Attraction['category']>('History');
  const [distanceKm, setDistanceKm] = useState(0);
  const [travelTime, setTravelTime] = useState('');
  const [bestTime, setBestTime] = useState('');
  const [description, setDescription] = useState('');
  const [directionsUrl, setDirectionsUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(0);

  // Fetch Attractions
  const { data: attractions = [], isLoading } = useQuery<Attraction[]>({
    queryKey: ['admin-attractions-list'],
    queryFn: async () => {
      if (!isDbConfigured()) return mockAttractions;
      const { data, error } = await supabase
        .from('attractions')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const openAddForm = () => {
    setEditingAttraction(null);
    setName('');
    setCategory('History');
    setDistanceKm(0);
    setTravelTime('');
    setBestTime('');
    setDescription('');
    setDirectionsUrl('');
    setImageUrl('');
    setIsActive(true);
    setDisplayOrder(0);
    setIsFormOpen(true);
  };

  const openEditForm = (att: Attraction) => {
    setEditingAttraction(att);
    setName(att.name);
    setCategory(att.category);
    setDistanceKm(att.distance_km || 0);
    setTravelTime(att.travel_time || '');
    setBestTime(att.best_time_to_visit || '');
    setDescription(att.description || '');
    setDirectionsUrl(att.google_maps_directions_url || '');
    setImageUrl(att.imagekit_image_url || '');
    setIsActive(att.is_active);
    setDisplayOrder(att.display_order || 0);
    setIsFormOpen(true);
  };

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: Omit<Attraction, 'id'> = {
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        category,
        distance_km: Number(distanceKm),
        travel_time: travelTime,
        best_time_to_visit: bestTime,
        description,
        google_maps_directions_url: directionsUrl,
        imagekit_image_url: imageUrl,
        is_active: isActive,
        display_order: Number(displayOrder),
      };

      if (!isDbConfigured()) {
        if (editingAttraction) {
          const idx = mockAttractions.findIndex((x) => x.id === editingAttraction.id);
          if (idx !== -1) mockAttractions[idx] = { ...editingAttraction, ...payload } as Attraction;
        } else {
          mockAttractions.push({
            id: `att-${Date.now()}`,
            ...payload,
          } as Attraction);
        }
        return;
      }

      if (editingAttraction) {
        const { error } = await supabase
          .from('attractions')
          .update(payload)
          .eq('id', editingAttraction.id);
        if (error) throw error;
      } else {
        const insertPayload = {
          id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `att-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          ...payload,
        };
        const { error } = await supabase
          .from('attractions')
          .insert([insertPayload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editingAttraction ? 'Attraction modified.' : 'New attraction created.');
      setIsFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-attractions-list'] });
      queryClient.invalidateQueries({ queryKey: ['attractions-list'] });
      queryClient.invalidateQueries({ queryKey: ['attractions-teaser'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to save attraction details.');
    },
  });

  // Toggle Visibility
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: boolean }) => {
      if (!isDbConfigured()) {
        const idx = mockAttractions.findIndex((x) => x.id === id);
        if (idx !== -1) mockAttractions[idx].is_active = status;
        return;
      }
      const { error } = await supabase
        .from('attractions')
        .update({ is_active: status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Attraction visibility updated.');
      queryClient.invalidateQueries({ queryKey: ['admin-attractions-list'] });
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!isDbConfigured()) {
        const idx = mockAttractions.findIndex((x) => x.id === id);
        if (idx !== -1) mockAttractions.splice(idx, 1);
        return;
      }
      const { error } = await supabase.from('attractions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Attraction entry deleted.');
      queryClient.invalidateQueries({ queryKey: ['admin-attractions-list'] });
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Actions Header Row */}
        <div className="flex justify-between items-center">
          <p className="text-xs text-slate-500 font-semibold">
            Manage sightseeing spots, history monuments, adventure tracks, and distance metrics.
          </p>
          <button
            onClick={openAddForm}
            className="flex items-center justify-center space-x-1 px-4 py-2.5 rounded-xl bg-forest-800 text-white hover:bg-forest-900 transition-colors text-xs font-bold shadow-md cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Attraction</span>
          </button>
        </div>

        {/* Attractions Table */}
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
                    <th className="p-4">Attraction Name</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Distance</th>
                    <th className="p-4">Travel Time</th>
                    <th className="p-4">Visibility</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {attractions.map((att) => (
                    <tr key={att.id} className="align-middle hover:bg-slate-50/30">
                      {/* Image */}
                      <td className="p-4">
                        <div className="h-14 w-20 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                          <ImageKitImage path={att.imagekit_image_url} alt={att.name} aspectRatio={1.4} />
                        </div>
                      </td>

                      {/* Name */}
                      <td className="p-4 font-bold text-slate-800 text-sm">{att.name}</td>

                      {/* Category */}
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold border bg-slate-100 text-slate-700 border-slate-200">
                          {att.category}
                        </span>
                      </td>

                      {/* Distance */}
                      <td className="p-4 font-semibold text-xs text-slate-750">{att.distance_km} km away</td>

                      {/* Time */}
                      <td className="p-4 text-xs font-medium text-slate-500">{att.travel_time}</td>

                      {/* Visibility */}
                      <td className="p-4">
                        <button
                          onClick={() => toggleActiveMutation.mutate({ id: att.id, status: !att.is_active })}
                          className="text-slate-505 hover:text-forest-750 transition-colors cursor-pointer"
                        >
                          {att.is_active ? (
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
                            onClick={() => openEditForm(att)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-605 hover:bg-slate-55 hover:border-slate-350 transition-colors cursor-pointer"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete "${att.name}"?`)) {
                                deleteMutation.mutate(att.id);
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
                  {editingAttraction ? `Edit: ${editingAttraction.name}` : 'Add Nearby Sightseeing Attraction'}
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
                    <label className="block text-xs font-semibold text-slate-600">Attraction Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Tala Fort Heritage Trek"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-forest-500 bg-slate-50/50"
                    />
                  </div>
                  {/* Category */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-600">Attraction Type</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as Attraction['category'])}
                      className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-forest-500"
                    >
                      <option value="History">History & Forts</option>
                      <option value="Nature">Nature & Waterfalls</option>
                      <option value="Adventure">Adventure Trekking</option>
                      <option value="Religious">Religious Caves & Temples</option>
                      <option value="Beach">Sandy Coastlines & Beaches</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Distance */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-600">Distance (in Kilometers)</label>
                    <input
                      type="number"
                      value={distanceKm}
                      onChange={(e) => setDistanceKm(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-forest-500 bg-slate-50/50"
                    />
                  </div>
                  {/* Travel Time */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-600">Travel Duration</label>
                    <input
                      type="text"
                      value={travelTime}
                      onChange={(e) => setTravelTime(e.target.value)}
                      placeholder="e.g. 15 mins drive"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-forest-500 bg-slate-50/50"
                    />
                  </div>
                  {/* Best time to visit */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-600">Best Season / Time</label>
                    <input
                      type="text"
                      value={bestTime}
                      onChange={(e) => setBestTime(e.target.value)}
                      placeholder="e.g. Monsoon & Winter"
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
                    placeholder="Provide interesting details about this sightseeing spot..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-forest-500 bg-slate-50/50 resize-none"
                  />
                </div>

                {/* Directions Google Maps URL */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-600">Google Maps Route / Directions Link</label>
                  <input
                    type="text"
                    value={directionsUrl}
                    onChange={(e) => setDirectionsUrl(e.target.value)}
                    placeholder="https://maps.google.com/?q=..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-forest-500 bg-slate-50/50"
                  />
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-600">Attraction Photo</label>
                  {imageUrl && (
                    <div className="relative h-36 w-60 rounded-xl overflow-hidden border border-slate-200 mb-3 bg-slate-100">
                      <ImageKitImage path={imageUrl} alt="Attraction Preview" aspectRatio={1.6} />
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
                    <ImageKitUploader folder="attractions" onUploadSuccess={(res) => setImageUrl(res.url)} label="Upload Attraction Photo" />
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
                  <span>{editingAttraction ? 'Update Location' : 'Add Location'}</span>
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};
export default AttractionManagement;
