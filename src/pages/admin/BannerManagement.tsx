import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Image as ImageIcon, Plus, Pencil, Trash2, ToggleLeft, ToggleRight, X, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { supabase, isDbConfigured } from '../../lib/supabase';
import { mockBanners, Banner } from '../../lib/mockData';
import AdminLayout from '../../components/AdminLayout';
import ImageKitUploader from '../../components/ImageKitUploader';
import ImageKitImage from '../../components/ImageKitImage';

export const BannerManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Banner | null>(null);

  // Form Fields
  const [imageUrl, setImageUrl] = useState('');
  const [imagekitFileId, setImagekitFileId] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  // Fetch Banners
  const { data: banners = [], isLoading } = useQuery<Banner[]>({
    queryKey: ['admin-banners-list'],
    queryFn: async () => {
      if (!isDbConfigured()) return mockBanners;
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const openAddForm = () => {
    setEditingItem(null);
    setImageUrl('');
    setImagekitFileId('');
    setTitle('');
    setSubtitle('');
    setDisplayOrder(banners.length + 1);
    setIsActive(true);
    setIsFormOpen(true);
  };

  const openEditForm = (item: Banner) => {
    setEditingItem(item);
    setImageUrl(item.image_url);
    setImagekitFileId(item.imagekit_file_id || '');
    setTitle(item.title || '');
    setSubtitle(item.subtitle || '');
    setDisplayOrder(item.display_order);
    setIsActive(item.is_active);
    setIsFormOpen(true);
  };

  // Create or Update Mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!isDbConfigured()) {
        toast.info('Database not connected. Simulating save in demo mode.');
        return;
      }

      const payload = {
        image_url: imageUrl,
        imagekit_file_id: imagekitFileId || null,
        title: title || null,
        subtitle: subtitle || null,
        display_order: displayOrder,
        is_active: isActive,
      };

      if (editingItem) {
        const { error } = await supabase
          .from('banners')
          .update(payload)
          .eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('banners')
          .insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners-list'] });
      queryClient.invalidateQueries({ queryKey: ['banners-teaser'] });
      toast.success(editingItem ? 'Banner updated successfully!' : 'Banner added successfully!');
      setIsFormOpen(false);
    },
    onError: (err: any) => {
      toast.error(`Error saving banner: ${err.message}`);
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!isDbConfigured()) {
        toast.info('Database not connected. Simulating delete in demo mode.');
        return;
      }
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners-list'] });
      queryClient.invalidateQueries({ queryKey: ['banners-teaser'] });
      toast.success('Banner deleted successfully!');
    },
    onError: (err: any) => {
      toast.error(`Error deleting banner: ${err.message}`);
    },
  });

  // Toggle Active Status Mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      if (!isDbConfigured()) return;
      const { error } = await supabase
        .from('banners')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners-list'] });
      queryClient.invalidateQueries({ queryKey: ['banners-teaser'] });
    },
    onError: (err: any) => {
      toast.error(`Error updating status: ${err.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      toast.error('Please upload or provide a banner image URL.');
      return;
    }
    saveMutation.mutate();
  };

  const handleUploadSuccess = (res: { url: string; fileId: string }) => {
    setImageUrl(res.url);
    setImagekitFileId(res.fileId);
    toast.success('Banner image uploaded successfully!');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-serif font-black text-forest-800">Banner Slider Management</h1>
            <p className="text-slate-500 text-sm">Upload, remove, and sort the sliding banner images shown on your homepage.</p>
          </div>
          <button
            onClick={openAddForm}
            className="flex items-center justify-center space-x-1.5 px-4.5 py-2.5 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-forest-900/10 cursor-pointer self-start"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Add Banner Slide</span>
          </button>
        </div>

        {/* Form Modal overlay */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
              {/* Modal header */}
              <div className="px-6 py-4 bg-forest-900 text-white flex justify-between items-center">
                <h3 className="font-serif font-bold text-lg">
                  {editingItem ? 'Edit Banner Slide' : 'Add New Banner Slide'}
                </h3>
                <button onClick={() => setIsFormOpen(false)} className="text-forest-200 hover:text-white transition-colors cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal body (scrollable) */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
                {/* Image Upload box */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-forest-800 uppercase tracking-wider block">Banner Image</label>
                  {imageUrl ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 group aspect-[2.39/1] bg-slate-100">
                      <ImageKitImage path={imageUrl} alt="Banner Preview" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setImageUrl('');
                          setImagekitFileId('');
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-red-650 hover:bg-red-700 text-white rounded-full shadow-md transition-colors cursor-pointer"
                        title="Remove Image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <ImageKitUploader folder="site-assets" onUploadSuccess={handleUploadSuccess} />
                  )}
                </div>

                {/* Optional Title input */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-forest-800 uppercase tracking-wider block">Slide Title (Optional)</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-500 text-sm"
                    placeholder="e.g. Welcome to Purushottam Holiday Homestay"
                  />
                </div>

                {/* Optional Subtitle input */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-forest-800 uppercase tracking-wider block">Slide Subtitle (Optional)</label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-500 text-sm"
                    placeholder="e.g. Unwind in the Lap of Nature & Heritage"
                  />
                </div>

                {/* Display order and status */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-forest-800 uppercase tracking-wider block">Display Order</label>
                    <input
                      type="number"
                      value={displayOrder}
                      onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-500 text-sm"
                      min="0"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-forest-800 uppercase tracking-wider block">Status</label>
                    <div className="flex items-center h-10">
                      <button
                        type="button"
                        onClick={() => setIsActive(!isActive)}
                        className="text-forest-600 hover:text-forest-800 transition-colors cursor-pointer"
                      >
                        {isActive ? (
                          <div className="flex items-center space-x-1.5 text-forest-700">
                            <ToggleRight className="h-8 w-8 text-forest-600" />
                            <span className="text-xs font-bold uppercase tracking-wider">Active</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1.5 text-slate-400">
                            <ToggleLeft className="h-8 w-8 text-slate-300" />
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Inactive</span>
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-sm transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saveMutation.isPending}
                    className="flex items-center justify-center space-x-1.5 px-6 py-2.5 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer disabled:opacity-60"
                  >
                    {saveMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    <span>Save Slide</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Content Body / Grid of Banners */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-forest-500" />
            <p className="text-sm">Loading banners list...</p>
          </div>
        ) : banners.length === 0 ? (
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl py-20 text-center bg-white p-6">
            <div className="p-4 bg-slate-50 text-slate-400 rounded-full mb-3">
              <ImageIcon className="h-10 w-10" />
            </div>
            <h3 className="font-serif font-bold text-slate-700 text-lg mb-1">No Banner Slides Found</h3>
            <p className="text-slate-400 text-sm max-w-sm mb-6">
              Create your first slide to start showing a beautiful banner rotation slider on your landing homepage.
            </p>
            <button
              onClick={openAddForm}
              className="flex items-center justify-center space-x-1.5 px-4.5 py-2.5 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-forest-900/10 cursor-pointer"
            >
              <Plus className="h-4.5 w-4.5" />
              <span>Create Slide</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banners.map((item) => (
              <div
                key={item.id}
                className={`bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full ${
                  item.is_active ? 'border-slate-200' : 'border-slate-200 opacity-70 bg-slate-50/50'
                }`}
              >
                {/* Banner Thumbnail */}
                <div className="aspect-[2.39/1] bg-slate-100 relative overflow-hidden flex-shrink-0">
                  <ImageKitImage path={item.image_url} alt={item.title || 'Banner Slide'} className="h-full w-full object-cover" />
                  
                  {/* Badge details */}
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-forest-950/80 text-[10px] font-bold text-white uppercase tracking-wider z-10">
                    Order: {item.display_order}
                  </span>

                  {!item.is_active && (
                    <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded bg-red-650 text-[10px] font-bold text-white uppercase tracking-widest z-10 shadow-sm">
                      Inactive
                    </span>
                  )}
                </div>

                {/* Banner details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h3 className="font-serif font-black text-forest-800 text-base line-clamp-1">
                      {item.title || <span className="text-slate-400 italic">No Title (using default)</span>}
                    </h3>
                    <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
                      {item.subtitle || <span className="text-slate-400 italic">No Subtitle</span>}
                    </p>
                  </div>

                  {/* Actions row */}
                  <div className="flex justify-between items-center border-t border-slate-100 pt-4 mt-4">
                    <button
                      onClick={() =>
                        toggleActiveMutation.mutate({ id: item.id, is_active: !item.is_active })
                      }
                      className="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-forest-700 transition-colors flex items-center space-x-1 cursor-pointer"
                      title={item.is_active ? 'Set Inactive' : 'Set Active'}
                    >
                      {item.is_active ? (
                        <>
                          <ToggleRight className="h-5 w-5 text-forest-600" />
                          <span className="text-forest-700">Active</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="h-5 w-5 text-slate-300" />
                          <span className="text-slate-400">Inactive</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openEditForm(item)}
                        className="p-2 bg-slate-50 hover:bg-forest-50 text-slate-600 hover:text-forest-800 rounded-lg transition-colors border border-slate-100 cursor-pointer"
                        title="Edit Slide Details"
                      >
                        <Pencil className="h-4.5 w-4.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to remove this banner slide?')) {
                            deleteMutation.mutate(item.id);
                          }
                        }}
                        className="p-2 bg-red-50 hover:bg-red-100 text-red-650 hover:text-red-700 rounded-lg transition-colors border border-red-100 cursor-pointer"
                        title="Remove Slide"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
export default BannerManagement;
