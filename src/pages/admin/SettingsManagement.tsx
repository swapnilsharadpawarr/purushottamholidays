import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Save, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { supabase, isDbConfigured } from '../../lib/supabase';
import { useUIStore } from '../../store/uiStore';
import AdminLayout from '../../components/AdminLayout';

export const SettingsManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const { settings, fetchSettings } = useUIStore();

  // Form states
  const [propertyName, setPropertyName] = useState('');
  const [tagline, setTagline] = useState('');
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroVideoUrl, setHeroVideoUrl] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [mapsDirections, setMapsDirections] = useState('');
  const [mapsEmbed, setMapsEmbed] = useState('');
  const [reviewsEmbed, setReviewsEmbed] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');

  useEffect(() => {
    if (settings) {
      setPropertyName(settings.property_name || '');
      setTagline(settings.tagline || '');
      setHeroTitle(settings.hero_title || '');
      setHeroSubtitle(settings.hero_subtitle || '');
      setHeroVideoUrl(settings.hero_video_imagekit_url || '');
      setWhatsapp(settings.whatsapp_number || '');
      setPhone(settings.phone_number || '');
      setEmail(settings.email || '');
      setAddress(settings.address || '');
      setMapsDirections(settings.google_maps_directions_url || '');
      setMapsEmbed(settings.google_maps_embed_url || '');
      setReviewsEmbed(settings.google_reviews_embed_code || '');
      setFacebookUrl(settings.facebook_url || '');
      setInstagramUrl(settings.instagram_url || '');
    }
  }, [settings]);

  // Save Settings Mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        property_name: propertyName,
        tagline,
        hero_title: heroTitle,
        hero_subtitle: heroSubtitle,
        hero_video_imagekit_url: heroVideoUrl,
        whatsapp_number: whatsapp,
        phone_number: phone,
        email,
        address,
        google_maps_directions_url: mapsDirections,
        google_maps_embed_url: mapsEmbed,
        google_reviews_embed_code: reviewsEmbed,
        facebook_url: facebookUrl,
        instagram_url: instagramUrl,
      };

      if (!isDbConfigured()) {
        localStorage.setItem('demo_settings', JSON.stringify(payload));
        return;
      }

      // Supabase Update
      const { error } = await supabase
        .from('site_settings')
        .update(payload)
        .eq('id', settings.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Site configurations saved successfully.');
      fetchSettings(); // sync global store
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update settings.');
    },
  });

  const handleSave = () => {
    saveMutation.mutate();
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        
        {/* Settings blocks */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6">
          
          {/* Section 1: Branding */}
          <div className="space-y-4">
            <h3 className="font-serif font-black text-slate-800 text-lg border-b border-slate-100 pb-2">
              Branding & Tagline
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-600">Property Name</label>
                <input
                  type="text"
                  value={propertyName}
                  onChange={(e) => setPropertyName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-forest-500 bg-slate-50/50"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-600">Sub Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-forest-500 bg-slate-50/50"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Hero Video banner */}
          <div className="space-y-4 pt-2">
            <h3 className="font-serif font-black text-slate-800 text-lg border-b border-slate-100 pb-2">
              Hero Section Contents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1 md:col-span-2">
                <label className="block text-xs font-semibold text-slate-600">Hero Main Header Title</label>
                <input
                  type="text"
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-forest-500 bg-slate-50/50"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="block text-xs font-semibold text-slate-600">Hero Subtitle Paragraph</label>
                <input
                  type="text"
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-forest-500 bg-slate-50/50"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="block text-xs font-semibold text-slate-600">ImageKit Landing Video URL (.mp4 format)</label>
                <input
                  type="text"
                  value={heroVideoUrl}
                  onChange={(e) => setHeroVideoUrl(e.target.value)}
                  placeholder="https://ik.imagekit.io/..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-forest-500 bg-slate-50/50"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Contact details */}
          <div className="space-y-4 pt-2">
            <h3 className="font-serif font-black text-slate-800 text-lg border-b border-slate-100 pb-2">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-600">WhatsApp Mobile (with country code)</label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+919860361361"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-forest-500 bg-slate-50/50"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-600">Call Mobile Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+919860361361"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-forest-500 bg-slate-50/50"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-600">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="info@purushottamhomestay.com"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-forest-500 bg-slate-50/50"
                />
              </div>
              <div className="space-y-1 md:col-span-3">
                <label className="block text-xs font-semibold text-slate-600">Homestay Physical Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-forest-500 bg-slate-50/50"
                />
              </div>
            </div>
          </div>

          {/* Section 4: External Integrations (Maps & Reviews) */}
          <div className="space-y-4 pt-2">
            <h3 className="font-serif font-black text-slate-800 text-lg border-b border-slate-100 pb-2">
              Maps & Reviews Integrations
            </h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-600">Google Maps Driving Directions Route URL</label>
                <input
                  type="text"
                  value={mapsDirections}
                  onChange={(e) => setMapsDirections(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-forest-500 bg-slate-50/50"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-600">Google Maps Embed URL (for Map iframes)</label>
                <input
                  type="text"
                  value={mapsEmbed}
                  onChange={(e) => setMapsEmbed(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-forest-500 bg-slate-50/50"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-600">Google Reviews / Badge Widget Embed Code</label>
                <textarea
                  value={reviewsEmbed}
                  onChange={(e) => setReviewsEmbed(e.target.value)}
                  rows={3}
                  placeholder="Paste HTML widget tags..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-forest-500 bg-slate-50/50 resize-none font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Social Channels */}
          <div className="space-y-4 pt-2">
            <h3 className="font-serif font-black text-slate-800 text-lg border-b border-slate-100 pb-2">
              Social Links
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-600">Facebook URL</label>
                <input
                  type="text"
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-forest-500 bg-slate-50/50"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-600">Instagram URL</label>
                <input
                  type="text"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-forest-500 bg-slate-50/50"
                />
              </div>
            </div>
          </div>

          {/* Save button footer */}
          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="flex items-center space-x-1.5 px-6 py-3 bg-forest-800 text-white rounded-xl text-xs font-bold hover:bg-forest-900 transition-colors cursor-pointer shadow-lg shadow-forest-100"
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Settings</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </AdminLayout>
  );
};
export default SettingsManagement;
