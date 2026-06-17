import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { supabase, isDbConfigured } from '../lib/supabase';
import { mockRooms } from '../lib/mockData';

const inquirySchema = zod.object({
  name: zod.string().min(2, 'Name must be at least 2 characters'),
  email: zod.string().email('Please enter a valid email address').optional().or(zod.string().length(0)),
  phone: zod.string().min(10, 'Please enter a valid 10-digit phone number').max(15, 'Phone number too long'),
  check_in_date: zod.string().min(1, 'Check-in date is required'),
  check_out_date: zod.string().min(1, 'Check-out date is required'),
  number_of_guests: zod.number().min(1, 'At least 1 guest is required').max(30),
  room_preference: zod.string().optional(),
  special_requests: zod.string().optional(),
});

type InquiryFormValues = zod.infer<typeof inquirySchema>;

interface InquiryFormProps {
  defaultRoomName?: string;
  onSuccess?: () => void;
}

export const InquiryForm: React.FC<InquiryFormProps> = ({ defaultRoomName = '', onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roomsList, setRoomsList] = useState<{ name: string }[]>([]);

  useEffect(() => {
    const fetchRooms = async () => {
      if (!isDbConfigured()) {
        setRoomsList(mockRooms);
        return;
      }
      try {
        const { data } = await supabase.from('rooms').select('name').eq('is_active', true);
        if (data && data.length > 0) {
          setRoomsList(data);
        } else {
          setRoomsList(mockRooms);
        }
      } catch (err) {
        setRoomsList(mockRooms);
      }
    };
    fetchRooms();
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InquiryFormValues>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      check_in_date: '',
      check_out_date: '',
      number_of_guests: 2,
      room_preference: defaultRoomName || 'Any Room',
      special_requests: '',
    },
  });

  const onSubmit = async (values: InquiryFormValues) => {
    setIsSubmitting(true);
    const toastId = toast.loading('Submitting your booking inquiry...');

    try {
      if (isDbConfigured()) {
        const { error } = await supabase.from('inquiries').insert([
          {
            id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `inq-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
            name: values.name,
            email: values.email || null,
            phone: values.phone,
            check_in_date: values.check_in_date,
            check_out_date: values.check_out_date,
            number_of_guests: values.number_of_guests,
            room_preference: values.room_preference,
            special_requests: values.special_requests || null,
            status: 'New',
          },
        ]);

        if (error) throw error;
      } else {
        // Simulate local network delay
        await new Promise((resolve) => setTimeout(resolve, 1200));
        
        // Save to demo local storage to simulate list addition
        const existing = JSON.parse(localStorage.getItem('demo_inquiries') || '[]');
        existing.push({
          id: `inq-${Date.now()}`,
          ...values,
          status: 'New',
          created_at: new Date().toISOString(),
        });
        localStorage.setItem('demo_inquiries', JSON.stringify(existing));
      }

      toast.success('Thank you! Inquiry submitted. We will contact you shortly.', { id: toastId });
      reset();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to submit inquiry. Please try again.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get current date formatted for min check-in date
  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-forest-100/50">
      <div className="text-center md:text-left mb-4">
        <h3 className="text-2xl font-serif font-bold text-forest-700">Check Availability</h3>
        <p className="text-sm text-forest-500">Send an inquiry and our team will get in touch on WhatsApp or phone within minutes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-forest-600 mb-1">YOUR NAME *</label>
          <input
            type="text"
            {...register('name')}
            placeholder="e.g. John Doe"
            className="w-full px-4 py-2.5 rounded-lg border border-forest-200 focus:outline-none focus:ring-2 focus:ring-forest-500 text-sm"
          />
          {errors.name && <p className="text-red-500 text-[10px] mt-1">{errors.name.message}</p>}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-semibold text-forest-600 mb-1">MOBILE NUMBER *</label>
          <input
            type="tel"
            {...register('phone')}
            placeholder="e.g. +91 98765 43210"
            className="w-full px-4 py-2.5 rounded-lg border border-forest-200 focus:outline-none focus:ring-2 focus:ring-forest-500 text-sm"
          />
          {errors.phone && <p className="text-red-500 text-[10px] mt-1">{errors.phone.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-forest-600 mb-1">EMAIL ADDRESS (OPTIONAL)</label>
          <input
            type="email"
            {...register('email')}
            placeholder="e.g. john@example.com"
            className="w-full px-4 py-2.5 rounded-lg border border-forest-200 focus:outline-none focus:ring-2 focus:ring-forest-500 text-sm"
          />
          {errors.email && <p className="text-red-500 text-[10px] mt-1">{errors.email.message}</p>}
        </div>

        {/* Room Preference */}
        <div>
          <label className="block text-xs font-semibold text-forest-600 mb-1">ROOM PREFERENCE</label>
          <select
            {...register('room_preference')}
            className="w-full px-4 py-2.5 rounded-lg border border-forest-200 focus:outline-none focus:ring-2 focus:ring-forest-500 text-sm bg-white"
          >
            <option value="Any Room">Any Room (Let host suggest)</option>
            {roomsList.map((room, i) => (
              <option key={i} value={room.name}>
                {room.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Check-In */}
        <div>
          <label className="block text-xs font-semibold text-forest-600 mb-1">CHECK-IN DATE *</label>
          <input
            type="date"
            min={today}
            {...register('check_in_date')}
            className="w-full px-4 py-2.5 rounded-lg border border-forest-200 focus:outline-none focus:ring-2 focus:ring-forest-500 text-sm"
          />
          {errors.check_in_date && <p className="text-red-500 text-[10px] mt-1">{errors.check_in_date.message}</p>}
        </div>

        {/* Check-Out */}
        <div>
          <label className="block text-xs font-semibold text-forest-600 mb-1">CHECK-OUT DATE *</label>
          <input
            type="date"
            min={today}
            {...register('check_out_date')}
            className="w-full px-4 py-2.5 rounded-lg border border-forest-200 focus:outline-none focus:ring-2 focus:ring-forest-500 text-sm"
          />
          {errors.check_out_date && <p className="text-red-500 text-[10px] mt-1">{errors.check_out_date.message}</p>}
        </div>

        {/* Guests */}
        <div>
          <label className="block text-xs font-semibold text-forest-600 mb-1">TOTAL GUESTS *</label>
          <select
            {...register('number_of_guests', { valueAsNumber: true })}
            className="w-full px-4 py-2.5 rounded-lg border border-forest-200 focus:outline-none focus:ring-2 focus:ring-forest-500 text-sm bg-white"
          >
            {[...Array(15)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1} {i === 0 ? 'Guest' : 'Guests'}
              </option>
            ))}
            <option value={20}>15-20 Guests</option>
            <option value={30}>20+ Guests (Group booking)</option>
          </select>
        </div>
      </div>

      {/* Special Requests */}
      <div>
        <label className="block text-xs font-semibold text-forest-600 mb-1">SPECIAL REQUESTS / QUESTIONS</label>
        <textarea
          {...register('special_requests')}
          rows={3}
          placeholder="e.g. Vegetarian meals only, extra bed, child cot, late arrival details..."
          className="w-full px-4 py-2.5 rounded-lg border border-forest-200 focus:outline-none focus:ring-2 focus:ring-forest-500 text-sm resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 rounded-xl bg-forest-600 text-white font-semibold hover:bg-forest-700 transition-colors duration-300 shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Submitting...</span>
          </>
        ) : (
          <span>Send Booking Inquiry</span>
        )}
      </button>
    </form>
  );
};
export default InquiryForm;
