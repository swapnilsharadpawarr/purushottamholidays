import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Plus, Pencil, Trash2, ToggleLeft, ToggleRight, X, Loader2, Save, Star } from 'lucide-react';
import { toast } from 'sonner';
import { supabase, isDbConfigured } from '../../lib/supabase';
import { mockReviews, Review } from '../../lib/mockData';
import AdminLayout from '../../components/AdminLayout';

export const ReviewManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [roomType, setRoomType] = useState('');
  const [stayDate, setStayDate] = useState('');
  const [source, setSource] = useState<Review['source']>('Website');
  const [isApproved, setIsApproved] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  // Fetch Reviews
  const { data: reviews = [], isLoading } = useQuery<Review[]>({
    queryKey: ['admin-reviews-list'],
    queryFn: async () => {
      if (!isDbConfigured()) return mockReviews;
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const openAddForm = () => {
    setEditingReview(null);
    setName('');
    setRating(5);
    setReviewText('');
    setRoomType('');
    setStayDate('');
    setSource('Website');
    setIsApproved(true);
    setIsFeatured(false);
    setIsFormOpen(true);
  };

  const openEditForm = (rev: Review) => {
    setEditingReview(rev);
    setName(rev.reviewer_name);
    setRating(rev.rating);
    setReviewText(rev.review_text);
    setRoomType(rev.room_type || '');
    setStayDate(rev.stay_date || '');
    setSource(rev.source || 'Website');
    setIsApproved(rev.is_approved);
    setIsFeatured(rev.is_featured);
    setIsFormOpen(true);
  };

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        reviewer_name: name,
        rating: Number(rating),
        review_text: reviewText,
        room_type: roomType || undefined,
        stay_date: stayDate || undefined,
        source,
        is_approved: isApproved,
        is_featured: isFeatured,
      };

      if (!isDbConfigured()) {
        if (editingReview) {
          const idx = mockReviews.findIndex((x) => x.id === editingReview.id);
          if (idx !== -1) mockReviews[idx] = { ...editingReview, ...payload } as Review;
        } else {
          mockReviews.push({
            id: `rev-${Date.now()}`,
            ...payload,
            created_at: new Date().toISOString(),
          } as Review);
        }
        return;
      }

      if (editingReview) {
        const { error } = await supabase
          .from('reviews')
          .update(payload)
          .eq('id', editingReview.id);
        if (error) throw error;
      } else {
        const insertPayload = {
          id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `rev-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          ...payload,
        };
        const { error } = await supabase
          .from('reviews')
          .insert([insertPayload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editingReview ? 'Review updated.' : 'Review added successfully.');
      setIsFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-reviews-list'] });
      queryClient.invalidateQueries({ queryKey: ['reviews-teaser'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to save review details.');
    },
  });

  // Toggle Approval
  const toggleApprovedMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: boolean }) => {
      if (!isDbConfigured()) {
        const idx = mockReviews.findIndex((x) => x.id === id);
        if (idx !== -1) mockReviews[idx].is_approved = status;
        return;
      }
      const { error } = await supabase
        .from('reviews')
        .update({ is_approved: status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Review approval status toggled.');
      queryClient.invalidateQueries({ queryKey: ['admin-reviews-list'] });
      queryClient.invalidateQueries({ queryKey: ['reviews-teaser'] });
    },
  });

  // Toggle Featured
  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: boolean }) => {
      if (!isDbConfigured()) {
        const idx = mockReviews.findIndex((x) => x.id === id);
        if (idx !== -1) mockReviews[idx].is_featured = status;
        return;
      }
      const { error } = await supabase
        .from('reviews')
        .update({ is_featured: status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Review featured spotlight updated.');
      queryClient.invalidateQueries({ queryKey: ['admin-reviews-list'] });
      queryClient.invalidateQueries({ queryKey: ['reviews-teaser'] });
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!isDbConfigured()) {
        const idx = mockReviews.findIndex((x) => x.id === id);
        if (idx !== -1) mockReviews.splice(idx, 1);
        return;
      }
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Review permanently deleted.');
      queryClient.invalidateQueries({ queryKey: ['admin-reviews-list'] });
      queryClient.invalidateQueries({ queryKey: ['reviews-teaser'] });
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Actions Row */}
        <div className="flex justify-between items-center">
          <p className="text-xs text-slate-500 font-semibold">
            Moderate guest testimonials, verify reviews, and mark items to showcase on the home page.
          </p>
          <button
            onClick={openAddForm}
            className="flex items-center justify-center space-x-1 px-4 py-2.5 rounded-xl bg-forest-800 text-white hover:bg-forest-900 transition-colors text-xs font-bold shadow-md cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Review Log</span>
          </button>
        </div>

        {/* Reviews List */}
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
                    <th className="p-4">Reviewer Details</th>
                    <th className="p-4">Stars</th>
                    <th className="p-4">Testimonial Text</th>
                    <th className="p-4">Source</th>
                    <th className="p-4">Featured</th>
                    <th className="p-4">Approved</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {reviews.map((rev) => (
                    <tr key={rev.id} className="align-top hover:bg-slate-50/30">
                      {/* Details */}
                      <td className="p-4 space-y-1">
                        <span className="font-bold text-slate-800 text-sm block leading-tight">{rev.reviewer_name}</span>
                        {rev.room_type && (
                          <span className="text-[10px] text-slate-400 font-semibold block">{rev.room_type}</span>
                        )}
                        {rev.stay_date && (
                          <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-medium inline-block mt-1">
                            Stay: {rev.stay_date}
                          </span>
                        )}
                      </td>

                      {/* Stars */}
                      <td className="p-4">
                        <div className="flex space-x-0.5 text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-4 w-4 ${i < rev.rating ? 'fill-current' : 'text-slate-200'}`} />
                          ))}
                        </div>
                      </td>

                      {/* Text */}
                      <td className="p-4 max-w-sm">
                        <p className="text-xs text-slate-600 italic leading-relaxed">
                          "{rev.review_text}"
                        </p>
                      </td>

                      {/* Source */}
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold border border-slate-200 bg-slate-50 text-slate-600">
                          {rev.source}
                        </span>
                      </td>

                      {/* Featured */}
                      <td className="p-4">
                        <button
                          onClick={() => toggleFeaturedMutation.mutate({ id: rev.id, status: !rev.is_featured })}
                          className="text-slate-500 hover:text-forest-750 transition-colors cursor-pointer"
                        >
                          {rev.is_featured ? (
                            <ToggleRight className="h-7 w-7 text-amber-gold" />
                          ) : (
                            <ToggleLeft className="h-7 w-7 text-slate-350" />
                          )}
                        </button>
                      </td>

                      {/* Approved */}
                      <td className="p-4">
                        <button
                          onClick={() => toggleApprovedMutation.mutate({ id: rev.id, status: !rev.is_approved })}
                          className="text-slate-505 hover:text-forest-750 transition-colors cursor-pointer"
                        >
                          {rev.is_approved ? (
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
                            onClick={() => openEditForm(rev)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-605 hover:bg-slate-55 hover:border-slate-350 transition-colors cursor-pointer"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete this review?`)) {
                                deleteMutation.mutate(rev.id);
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
            <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-250">
              
              {/* Header */}
              <div className="h-16 border-b border-slate-200 flex items-center justify-between px-6">
                <h3 className="text-lg font-serif font-black text-slate-800">
                  {editingReview ? `Edit Guest Testimonial` : 'Record Custom Guest Review'}
                </h3>
                <button onClick={() => setIsFormOpen(false)} className="text-slate-404 hover:text-slate-600 cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form body */}
              <div className="flex-1 p-6 overflow-y-auto space-y-5">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Reviewer Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-600">Guest Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-forest-500 bg-slate-50/50"
                    />
                  </div>
                  {/* Rating Stars */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-600">Stars Rating</label>
                    <select
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-forest-500"
                    >
                      <option value={5}>5 Stars (Excellent)</option>
                      <option value={4}>4 Stars (Good)</option>
                      <option value={3}>3 Stars (Average)</option>
                      <option value={2}>2 Stars (Poor)</option>
                      <option value={1}>1 Star (Unacceptable)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Stay room */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-600">Room Accommodation</label>
                    <input
                      type="text"
                      value={roomType}
                      onChange={(e) => setRoomType(e.target.value)}
                      placeholder="e.g. Family AC Suite"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-forest-500 bg-slate-50/50"
                    />
                  </div>
                  {/* Stay Date */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-600">Stay Month / Date</label>
                    <input
                      type="text"
                      value={stayDate}
                      onChange={(e) => setStayDate(e.target.value)}
                      placeholder="e.g. May 2026"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-forest-500 bg-slate-50/50"
                    />
                  </div>
                  {/* Source */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-600">Source Platform</label>
                    <select
                      value={source}
                      onChange={(e) => setSource(e.target.value as Review['source'])}
                      className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-forest-500"
                    >
                      <option value="Website">Website</option>
                      <option value="Google">Google Maps</option>
                      <option value="Manual">Manual Book</option>
                    </select>
                  </div>
                </div>

                {/* Review Text */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-600">Testimonial Text</label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={4}
                    placeholder="Paste the guest review content here..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-forest-500 bg-slate-50/50 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Approved toggle */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_app"
                      checked={isApproved}
                      onChange={(e) => setIsApproved(e.target.checked)}
                      className="h-4 w-4 text-forest-650"
                    />
                    <label htmlFor="is_app" className="text-xs font-bold text-slate-600 select-none">
                      Approve and show on list
                    </label>
                  </div>
                  {/* Featured toggle */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_feat"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="h-4 w-4 text-forest-650"
                    />
                    <label htmlFor="is_feat" className="text-xs font-bold text-slate-600 select-none">
                      Feature on Home Carousel
                    </label>
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="h-16 border-t border-slate-200 flex justify-end items-center px-6 space-x-3 bg-slate-50/50 rounded-b-3xl">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-650 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => saveMutation.mutate()}
                  className="flex items-center space-x-1.5 px-4.5 py-2 bg-forest-800 text-white rounded-xl text-xs font-semibold hover:bg-forest-900 transition-colors cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  <span>{editingReview ? 'Update Testimonial' : 'Publish Review'}</span>
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};
export default ReviewManagement;
