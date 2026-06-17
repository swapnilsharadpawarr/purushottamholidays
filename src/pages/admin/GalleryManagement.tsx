import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Camera, Plus, Pencil, Trash2, ToggleLeft, ToggleRight, X, Loader2, Save, Play, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { supabase, isDbConfigured } from '../../lib/supabase';
import { mockGalleryItems, GalleryItem } from '../../lib/mockData';
import AdminLayout from '../../components/AdminLayout';
import ImageKitUploader from '../../components/ImageKitUploader';
import ImageKitImage from '../../components/ImageKitImage';

export const GalleryManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState<GalleryItem['category']>('Property Exterior');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [imagekitUrl, setImagekitUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(0);

  // Fetch Gallery Items
  const { data: galleryItems = [], isLoading } = useQuery<GalleryItem[]>({
    queryKey: ['admin-gallery-list'],
    queryFn: async () => {
      if (!isDbConfigured()) return mockGalleryItems;
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const openAddForm = () => {
    setEditingItem(null);
    setTitle('');
    setCaption('');
    setCategory('Property Exterior');
    setMediaType('image');
    setImagekitUrl('');
    setIsActive(true);
    setDisplayOrder(0);
    setIsFormOpen(true);
  };

  const openEditForm = (item: GalleryItem) => {
    setEditingItem(item);
    setTitle(item.title || '');
    setCaption(item.caption || '');
    setCategory(item.category);
    setMediaType(item.media_type);
    setImagekitUrl(item.imagekit_url || '');
    setIsActive(item.is_active);
    setDisplayOrder(item.display_order || 0);
    setIsFormOpen(true);
  };

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: Omit<GalleryItem, 'id'> = {
        title,
        caption,
        category,
        media_type: mediaType,
        imagekit_url: imagekitUrl,
        is_active: isActive,
        display_order: Number(displayOrder),
        is_featured: editingItem ? editingItem.is_featured : false,
      };

      if (!isDbConfigured()) {
        if (editingItem) {
          const idx = mockGalleryItems.findIndex((x) => x.id === editingItem.id);
          if (idx !== -1) mockGalleryItems[idx] = { ...editingItem, ...payload };
        } else {
          mockGalleryItems.push({
            id: `gal-${Date.now()}`,
            ...payload,
          } as GalleryItem);
        }
        return;
      }

      if (editingItem) {
        const { error } = await supabase
          .from('gallery_items')
          .update(payload)
          .eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const insertPayload = {
          id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `gal-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          ...payload,
        };
        const { error } = await supabase
          .from('gallery_items')
          .insert([insertPayload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editingItem ? 'Gallery asset modified.' : 'New media added successfully.');
      setIsFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-gallery-list'] });
      queryClient.invalidateQueries({ queryKey: ['gallery-list'] });
      queryClient.invalidateQueries({ queryKey: ['gallery-teaser'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to save media.');
    },
  });

  // Toggle Visibility
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: boolean }) => {
      if (!isDbConfigured()) {
        const idx = mockGalleryItems.findIndex((x) => x.id === id);
        if (idx !== -1) mockGalleryItems[idx].is_active = status;
        return;
      }
      const { error } = await supabase
        .from('gallery_items')
        .update({ is_active: status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Media status modified.');
      queryClient.invalidateQueries({ queryKey: ['admin-gallery-list'] });
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!isDbConfigured()) {
        const idx = mockGalleryItems.findIndex((x) => x.id === id);
        if (idx !== -1) mockGalleryItems.splice(idx, 1);
        return;
      }
      const { error } = await supabase.from('gallery_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Media asset removed.');
      queryClient.invalidateQueries({ queryKey: ['admin-gallery-list'] });
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Actions Row */}
        <div className="flex justify-between items-center">
          <p className="text-xs text-slate-500 font-semibold">
            Upload property walkthrough videos, drone photography, sunsets, guest activities, and farm photos.
          </p>
          <button
            onClick={openAddForm}
            className="flex items-center justify-center space-x-1 px-4 py-2.5 rounded-xl bg-forest-800 text-white hover:bg-forest-900 transition-colors text-xs font-bold shadow-md cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Upload Photo/Video</span>
          </button>
        </div>

        {/* Gallery Grid */}
        {isLoading ? (
          <div className="h-64 flex items-center justify-center bg-white border border-slate-200 rounded-2xl">
            <Loader2 className="h-8 w-8 text-forest-750 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {galleryItems.map((item) => (
              <div key={item.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
                
                {/* Photo frame */}
                <div className="relative h-44 bg-slate-50">
                  <ImageKitImage path={item.imagekit_url} alt={item.title || ''} aspectRatio={1.6} />
                  
                  {/* Category labels */}
                  <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded bg-forest-900/80 text-[8px] font-bold text-white uppercase tracking-wider flex items-center space-x-1">
                    {item.media_type === 'video' ? <Play className="h-2 w-2" /> : <ImageIcon className="h-2 w-2" />}
                    <span>{item.category}</span>
                  </span>
                </div>

                {/* Details */}
                <div className="p-4 flex-1 space-y-1.5">
                  <h4 className="font-bold text-slate-800 text-sm truncate">{item.title || 'Untitled Asset'}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{item.caption || 'No description'}</p>
                </div>

                {/* Actions bottom bar */}
                <div className="p-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => toggleActiveMutation.mutate({ id: item.id, status: !item.is_active })}
                    className="text-slate-500 hover:text-forest-750 transition-colors cursor-pointer"
                  >
                    {item.is_active ? (
                      <ToggleRight className="h-7 w-7 text-emerald-600" />
                    ) : (
                      <ToggleLeft className="h-7 w-7 text-slate-350" />
                    )}
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openEditForm(item)}
                      className="p-1 rounded border border-slate-200 text-slate-600 hover:bg-white transition-colors cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete this gallery item?`)) {
                          deleteMutation.mutate(item.id);
                        }
                      }}
                      className="p-1 rounded border border-red-100 text-red-650 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* Modal Form Overlay */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-250">
              
              {/* Header */}
              <div className="h-16 border-b border-slate-200 flex items-center justify-between px-6">
                <h3 className="text-lg font-serif font-black text-slate-800">
                  {editingItem ? `Edit Gallery Details` : 'Upload Gallery Photo / Video'}
                </h3>
                <button onClick={() => setIsFormOpen(false)} className="text-slate-404 hover:text-slate-600 cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form body */}
              <div className="flex-1 p-6 overflow-y-auto space-y-5">
                
                {/* Title */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-600">Asset Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. drone capture of Tala Fort"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-forest-500 bg-slate-50/50"
                  />
                </div>

                {/* Caption */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-600">Short Caption</label>
                  <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Provide details displayed in Lightbox descriptions..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-forest-500 bg-slate-50/50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Category */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-600">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as GalleryItem['category'])}
                      className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-forest-500"
                    >
                      <option value="Property Exterior">Property Exterior</option>
                      <option value="Rooms">Rooms</option>
                      <option value="Pool">Pool</option>
                      <option value="Food">Food</option>
                      <option value="Gardens">Gardens</option>
                      <option value="Sunset Views">Sunset Views</option>
                      <option value="Drone Shots">Drone Shots</option>
                      <option value="Guest Photos">Guest Photos</option>
                      <option value="Videos">Videos</option>
                    </select>
                  </div>
                  {/* Media Type */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-600">Media Type</label>
                    <select
                      value={mediaType}
                      onChange={(e) => setMediaType(e.target.value as 'image' | 'video')}
                      className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-forest-500"
                    >
                      <option value="image">Image File</option>
                      <option value="video">Video Loop</option>
                    </select>
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

                {/* File Upload (ImageKit) */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-600">Media File</label>
                  {imagekitUrl && (
                    <div className="relative h-36 w-60 rounded-xl overflow-hidden border border-slate-200 mb-3 bg-slate-100">
                      {mediaType === 'video' ? (
                        <video src={imagekitUrl} controls className="h-full w-full object-cover" />
                      ) : (
                        <ImageKitImage path={imagekitUrl} alt="Preview" aspectRatio={1.6} />
                      )}
                      <button
                        type="button"
                        onClick={() => setImagekitUrl('')}
                        className="absolute top-2 right-2 p-1.5 bg-red-650 hover:bg-red-700 rounded-full text-white shadow-md cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  {!imagekitUrl && (
                    <ImageKitUploader folder="gallery" onUploadSuccess={(res) => setImagekitUrl(res.url)} label={`Upload Gallery ${mediaType}`} />
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
                  <span>{editingItem ? 'Update details' : 'Add media'}</span>
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};
export default GalleryManagement;
