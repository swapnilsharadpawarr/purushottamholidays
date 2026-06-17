import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bed, Plus, Pencil, Trash2, ToggleLeft, ToggleRight, X, Loader2, Save, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { supabase, isDbConfigured } from '../../lib/supabase';
import { mockRooms, Room } from '../../lib/mockData';
import AdminLayout from '../../components/AdminLayout';
import ImageKitUploader from '../../components/ImageKitUploader';
import ImageKitImage from '../../components/ImageKitImage';

export const RoomManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [price, setPrice] = useState(2000);
  const [capacity, setCapacity] = useState(2);
  const [amenityInput, setAmenityInput] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [coverUrl, setCoverUrl] = useState('');
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(0);

  // Fetch Rooms
  const { data: rooms = [], isLoading } = useQuery<Room[]>({
    queryKey: ['admin-rooms-list'],
    queryFn: async () => {
      if (!isDbConfigured()) return mockRooms;
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  };

  const openAddForm = () => {
    setEditingRoom(null);
    setName('');
    setSlug('');
    setDescription('');
    setShortDescription('');
    setPrice(2000);
    setCapacity(2);
    setAmenities(['AC', 'TV', 'WiFi', 'Hot Water', 'Attached Bathroom']);
    setCoverUrl('');
    setGalleryUrls([]);
    setIsActive(true);
    setDisplayOrder(0);
    setIsFormOpen(true);
  };

  const openEditForm = (room: Room) => {
    setEditingRoom(room);
    setName(room.name);
    setSlug(room.slug);
    setDescription(room.description || '');
    setShortDescription(room.short_description || '');
    setPrice(room.price_per_night);
    setCapacity(room.capacity || 2);
    setAmenities(room.amenities || []);
    setCoverUrl(room.cover_image_url || '');
    setGalleryUrls(room.gallery_image_urls || []);
    setIsActive(room.is_active);
    setDisplayOrder(room.display_order || 0);
    setIsFormOpen(true);
  };

  // Add/Edit Mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const roomPayload = {
        name,
        slug,
        description,
        short_description: shortDescription,
        price_per_night: Number(price),
        capacity: Number(capacity),
        amenities,
        cover_image_url: coverUrl,
        gallery_image_urls: galleryUrls,
        is_active: isActive,
        display_order: Number(displayOrder),
      };

      if (!isDbConfigured()) {
        // Mock Sandbox mutations
        if (editingRoom) {
          const idx = mockRooms.findIndex((r) => r.id === editingRoom.id);
          if (idx !== -1) mockRooms[idx] = { ...editingRoom, ...roomPayload };
        } else {
          mockRooms.push({
            id: `room-${Date.now()}`,
            ...roomPayload,
          });
        }
        return;
      }

      if (editingRoom) {
        const { error } = await supabase
          .from('rooms')
          .update(roomPayload)
          .eq('id', editingRoom.id);
        if (error) throw error;
      } else {
        const insertPayload = {
          id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `room-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          ...roomPayload,
        };
        const { error } = await supabase
          .from('rooms')
          .insert([insertPayload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editingRoom ? 'Room details updated.' : 'New room added successfully.');
      setIsFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-rooms-list'] });
      queryClient.invalidateQueries({ queryKey: ['rooms-list'] });
      queryClient.invalidateQueries({ queryKey: ['rooms-teaser'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to save room.');
    },
  });

  // Toggle Active Mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: boolean }) => {
      if (!isDbConfigured()) {
        const idx = mockRooms.findIndex((r) => r.id === id);
        if (idx !== -1) mockRooms[idx].is_active = status;
        return;
      }
      const { error } = await supabase
        .from('rooms')
        .update({ is_active: status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Room visibility modified.');
      queryClient.invalidateQueries({ queryKey: ['admin-rooms-list'] });
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!isDbConfigured()) {
        const idx = mockRooms.findIndex((r) => r.id === id);
        if (idx !== -1) mockRooms.splice(idx, 1);
        return;
      }
      const { error } = await supabase.from('rooms').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Room permanently deleted.');
      queryClient.invalidateQueries({ queryKey: ['admin-rooms-list'] });
    },
  });

  const addAmenity = () => {
    if (amenityInput.trim() && !amenities.includes(amenityInput.trim())) {
      setAmenities([...amenities, amenityInput.trim()]);
      setAmenityInput('');
    }
  };

  const removeAmenity = (name: string) => {
    setAmenities(amenities.filter((a) => a !== name));
  };

  const addGalleryUrl = (url: string) => {
    setGalleryUrls([...galleryUrls, url]);
  };

  const removeGalleryUrl = (url: string) => {
    setGalleryUrls(galleryUrls.filter((u) => u !== url));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Header Action Row */}
        <div className="flex justify-between items-center">
          <p className="text-xs text-slate-500 font-semibold">
            Manage rooms, update overnight rates, edit features, and upload showcase galleries.
          </p>
          <button
            onClick={openAddForm}
            className="flex items-center justify-center space-x-1 px-4 py-2.5 rounded-xl bg-forest-800 text-white hover:bg-forest-900 transition-colors text-xs font-bold shadow-md cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Room</span>
          </button>
        </div>

        {/* Rooms Table */}
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
                    <th className="p-4">Cover Image</th>
                    <th className="p-4">Room Details</th>
                    <th className="p-4">Capacity</th>
                    <th className="p-4">Rate per Night</th>
                    <th className="p-4">Order</th>
                    <th className="p-4">Visibility</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {rooms.map((room) => (
                    <tr key={room.id} className="align-middle hover:bg-slate-50/30">
                      {/* Image */}
                      <td className="p-4">
                        <div className="h-16 w-24 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                          <ImageKitImage path={room.cover_image_url} alt={room.name} aspectRatio={1.5} />
                        </div>
                      </td>

                      {/* Details */}
                      <td className="p-4">
                        <span className="font-bold text-slate-800 text-sm block leading-tight">{room.name}</span>
                        <span className="text-[10px] text-slate-400 font-medium block mt-0.5">/{room.slug}</span>
                      </td>

                      {/* Capacity */}
                      <td className="p-4 font-semibold text-xs text-slate-700">{room.capacity} Guests</td>

                      {/* Rate */}
                      <td className="p-4 font-bold text-slate-800">₹{room.price_per_night}</td>

                      {/* Display order */}
                      <td className="p-4 font-medium text-slate-600">Order: {room.display_order}</td>

                      {/* Status */}
                      <td className="p-4">
                        <button
                          onClick={() => toggleActiveMutation.mutate({ id: room.id, status: !room.is_active })}
                          className="text-slate-500 hover:text-forest-700 transition-colors cursor-pointer"
                        >
                          {room.is_active ? (
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
                            onClick={() => openEditForm(room)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-55 hover:border-slate-350 transition-colors cursor-pointer"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete "${room.name}"?`)) {
                                deleteMutation.mutate(room.id);
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
            <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-250 animate-fade-in-up">
              {/* Header */}
              <div className="h-16 border-b border-slate-200 flex items-center justify-between px-6">
                <h3 className="text-lg font-serif font-black text-slate-800">
                  {editingRoom ? `Edit: ${editingRoom.name}` : 'Add New Room Accommodation'}
                </h3>
                <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form body */}
              <div className="flex-1 p-6 overflow-y-auto space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-600">Room Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="e.g. Deluxe AC Cottage"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-forest-500 bg-slate-50/50"
                    />
                  </div>
                  {/* Slug */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-600">Slug</label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="deluxe-ac-cottage"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-forest-500 bg-slate-100"
                      disabled
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Price */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-600">Rate / Night (INR)</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-forest-500 bg-slate-50/50"
                    />
                  </div>
                  {/* Capacity */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-600">Max Guest Capacity</label>
                    <input
                      type="number"
                      value={capacity}
                      onChange={(e) => setCapacity(Number(e.target.value))}
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

                {/* Short Description */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-600">Short Description (Max 150 Chars)</label>
                  <input
                    type="text"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value.slice(0, 150))}
                    placeholder="Brief highlight details..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-forest-500 bg-slate-50/50"
                  />
                  <span className="text-[10px] text-slate-400 block text-right">{shortDescription.length}/150</span>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-600">Full Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Enter detailed room layout descriptions..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-forest-500 bg-slate-50/50 resize-none"
                  />
                </div>

                {/* Amenities Tag list */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-600">Amenities (Tags)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={amenityInput}
                      onChange={(e) => setAmenityInput(e.target.value)}
                      placeholder="Add amenity (e.g. WiFi, AC, TV)"
                      className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-forest-500 bg-slate-50/50"
                    />
                    <button
                      type="button"
                      onClick={addAmenity}
                      className="px-4 py-1.5 bg-forest-700 text-white rounded-lg text-xs font-semibold hover:bg-forest-800 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {amenities.map((a, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 text-xs border border-slate-200 font-semibold"
                      >
                        <span>{a}</span>
                        <button type="button" onClick={() => removeAmenity(a)} className="text-red-500 hover:text-red-700">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Cover Image Upload (ImageKit) */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-600">Cover Image</label>
                  {coverUrl && (
                    <div className="relative h-36 w-60 rounded-xl overflow-hidden border border-slate-200 mb-3 bg-slate-100">
                      <ImageKitImage path={coverUrl} alt="Cover Preview" aspectRatio={1.6} />
                      <button
                        type="button"
                        onClick={() => setCoverUrl('')}
                        className="absolute top-2 right-2 p-1.5 bg-red-650 hover:bg-red-700 rounded-full text-white shadow-md cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  {!coverUrl && (
                    <ImageKitUploader folder="rooms" onUploadSuccess={(res) => setCoverUrl(res.url)} label="Upload Cover Image" />
                  )}
                </div>

                {/* Gallery Uploads (Multiple URLs) */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-600">Gallery Images</label>
                  <div className="grid grid-cols-4 gap-3 mb-3">
                    {galleryUrls.map((url, i) => (
                      <div key={i} className="relative h-20 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                        <ImageKitImage path={url} alt={`Preview ${i}`} aspectRatio={1.3} />
                        <button
                          type="button"
                          onClick={() => removeGalleryUrl(url)}
                          className="absolute top-1 right-1 p-1 bg-red-650 rounded-full text-white shadow"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <ImageKitUploader folder="rooms" onUploadSuccess={(res) => addGalleryUrl(res.url)} label="Upload Gallery Image" />
                </div>
              </div>

              {/* Footer Buttons */}
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
                  <span>{editingRoom ? 'Update Room' : 'Add Room'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};
export default RoomManagement;
