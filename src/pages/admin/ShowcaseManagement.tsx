import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Waves, Save, Loader2, Plus, Trash2, Eye, EyeOff, Image as ImageIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase, isDbConfigured } from '../../lib/supabase';
import { useUIStore } from '../../store/uiStore';
import { mockPoolShowcaseImages, PoolShowcaseImage } from '../../lib/mockData';
import AdminLayout from '../../components/AdminLayout';
import ImageKitUploader from '../../components/ImageKitUploader';
import ImageKitImage from '../../components/ImageKitImage';

export const ShowcaseManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const { settings, fetchSettings } = useUIStore();

  // Form states for texts & toggle
  const [showPoolShowcase, setShowPoolShowcase] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  
  // State for image upload form/modal
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (settings) {
      setShowPoolShowcase(settings.show_pool_showcase !== false);
      setTitle(settings.pool_showcase_title || 'Take a Dip in Paradise');
      setDescription(settings.pool_showcase_description || '');
      setTagsInput(settings.pool_showcase_tags ? settings.pool_showcase_tags.join(', ') : '');
    }
  }, [settings]);

  // Fetch showcase images
  const { data: images = [], isLoading: isImagesLoading } = useQuery<PoolShowcaseImage[]>({
    queryKey: ['admin-pool-showcase-images'],
    queryFn: async () => {
      if (!isDbConfigured()) {
        const stored = localStorage.getItem('demo_pool_showcase_images');
        return stored ? JSON.parse(stored) : mockPoolShowcaseImages;
      }
      const { data, error } = await supabase
        .from('pool_showcase_images')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  // Save Text/Visibility Settings Mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async () => {
      const tagsArray = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const payload = {
        show_pool_showcase: showPoolShowcase,
        pool_showcase_title: title,
        pool_showcase_description: description,
        pool_showcase_tags: tagsArray,
      };

      if (!isDbConfigured()) {
        const demoSettings = JSON.parse(localStorage.getItem('demo_settings') || '{}');
        const merged = { ...demoSettings, ...payload };
        localStorage.setItem('demo_settings', JSON.stringify(merged));
        // Update local UI store settings directly in mock/demo mode
        useUIStore.setState({ settings: { ...useUIStore.getState().settings, ...payload } });
        return;
      }

      const { error } = await supabase
        .from('site_settings')
        .update(payload)
        .eq('id', settings.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Showcase section configurations saved successfully.');
      fetchSettings(); // sync global store
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update showcase settings.');
    },
  });

  // Add Image Mutation
  const addImageMutation = useMutation({
    mutationFn: async (url: string) => {
      if (!isDbConfigured()) {
        const newImg: PoolShowcaseImage = {
          id: `psi-demo-${Date.now()}`,
          image_url: url,
          display_order: images.length + 1,
        };
        const updatedList = [...images, newImg];
        localStorage.setItem('demo_pool_showcase_images', JSON.stringify(updatedList));
        return;
      }

      const { error } = await supabase
        .from('pool_showcase_images')
        .insert([{ image_url: url, display_order: images.length + 1 }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pool-showcase-images'] });
      queryClient.invalidateQueries({ queryKey: ['pool-showcase-images'] });
      toast.success('Image added to showcase successfully!');
      setIsUploading(false);
    },
    onError: (err: any) => {
      toast.error(`Error adding image: ${err.message}`);
    },
  });

  // Delete Image Mutation
  const deleteImageMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!isDbConfigured()) {
        const updatedList = images.filter((img) => img.id !== id);
        localStorage.setItem('demo_pool_showcase_images', JSON.stringify(updatedList));
        return;
      }

      const { error } = await supabase
        .from('pool_showcase_images')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pool-showcase-images'] });
      queryClient.invalidateQueries({ queryKey: ['pool-showcase-images'] });
      toast.success('Image removed from showcase successfully!');
    },
    onError: (err: any) => {
      toast.error(`Error deleting image: ${err.message}`);
    },
  });

  const handleUploadSuccess = (res: { url: string; fileId: string }) => {
    addImageMutation.mutate(res.url);
  };

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-5xl">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-serif font-black text-forest-800 flex items-center gap-2">
              <Waves className="h-6 w-6 text-forest-750" />
              <span>Pool Showcase Section Management</span>
            </h1>
            <p className="text-slate-500 text-sm">
              Manage the visibility, description, highlights, and images of the showcase section located below the homepage banner slider.
            </p>
          </div>
        </div>

        {/* Section 1: Text Configurations */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="font-serif font-bold text-slate-800 text-lg">
              Section Settings & Content
            </h3>
            
            {/* Toggle Status */}
            <button
              onClick={() => setShowPoolShowcase(!showPoolShowcase)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                showPoolShowcase
                  ? 'bg-forest-50 border-forest-200 text-forest-700'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              {showPoolShowcase ? (
                <>
                  <Eye className="h-4 w-4" />
                  <span>SECTION ENABLED</span>
                </>
              ) : (
                <>
                  <EyeOff className="h-4 w-4" />
                  <span>SECTION DISABLED</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-5">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Showcase Section Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 bg-slate-50/50"
                placeholder="e.g. Take a Dip in Paradise"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Description Paragraph</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 bg-slate-50/50 resize-none leading-relaxed"
                placeholder="Write a welcoming description of the pool, mango plantations, or other outdoor features..."
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                Highlights/Tags (Comma-separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 bg-slate-50/50"
                placeholder="e.g. Crystal-Clear Water, Poolside Orchard Sit-outs, Safe Kids Deck Area"
              />
              <span className="text-[10px] text-slate-400 block pt-0.5">
                Separate each item with a comma. These appear as tags inside the showcase block.
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => saveSettingsMutation.mutate()}
              disabled={saveSettingsMutation.isPending}
              className="flex items-center space-x-1.5 px-6 py-3 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-bold hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-forest-100 disabled:opacity-60"
            >
              {saveSettingsMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Showcase Content</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Section 2: Image Configurations */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif font-black text-slate-800 text-lg">Showcase Grid Images</h3>
              <p className="text-xs text-slate-400">Add up to 4 images to showcase the pool resort layout in masonry grid.</p>
            </div>
            
            {!isUploading ? (
              <button
                onClick={() => setIsUploading(true)}
                className="flex items-center justify-center space-x-1 px-4 py-2 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add Showcase Image</span>
              </button>
            ) : (
              <button
                onClick={() => setIsUploading(false)}
                className="flex items-center justify-center space-x-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
                <span>Cancel Upload</span>
              </button>
            )}
          </div>

          {/* Upload card box */}
          {isUploading && (
            <div className="bg-slate-50 border border-dashed border-slate-200 p-6 rounded-2xl flex flex-col items-center justify-center space-y-3">
              <ImageKitUploader folder="site-assets" onUploadSuccess={handleUploadSuccess} />
              <p className="text-[10px] text-slate-400">PNG or JPG formats supported.</p>
            </div>
          )}

          {/* List of images */}
          {isImagesLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin text-forest-500 mb-2" />
              <span className="text-xs">Loading images...</span>
            </div>
          ) : images.length === 0 ? (
            <div className="flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-2xl py-12 text-center bg-white p-6">
              <div className="p-3 bg-slate-50 text-slate-400 rounded-full mb-2">
                <ImageIcon className="h-8 w-8" />
              </div>
              <h4 className="font-bold text-slate-700 text-sm mb-0.5">No Showcase Images Found</h4>
              <p className="text-slate-400 text-xs max-w-xs mb-3">
                Upload images of the pool and surroundings to display on the home page.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {images.map((img, idx) => (
                <div key={img.id || idx} className="bg-white border border-slate-250 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group relative">
                  <div className="aspect-square bg-slate-50 relative overflow-hidden">
                    <ImageKitImage path={img.image_url} alt={`Showcase Image ${idx + 1}`} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  
                  {/* Delete Hover Button Overlay */}
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to remove this image from the pool showcase?')) {
                          deleteImageMutation.mutate(img.id);
                        }
                      }}
                      className="p-3 bg-red-650 hover:bg-red-700 text-white rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                      title="Remove Showcase Image"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>

                  <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/55 text-[9px] font-bold text-white rounded">
                    Slot {idx + 1}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
export default ShowcaseManagement;
