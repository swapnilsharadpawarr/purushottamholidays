import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  FileQuestion,
  Bed,
  UtensilsCrossed,
  Image as ImageIcon,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
} from 'lucide-react';
import { supabase, isDbConfigured } from '../../lib/supabase';
import { mockRooms, mockFoodMenuItems, mockGalleryItems, mockInquiries, Inquiry } from '../../lib/mockData';
import AdminLayout from '../../components/AdminLayout';

export const Dashboard: React.FC = () => {
  // Fetch aggregate counts
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      let roomsCount = mockRooms.length;
      let foodCount = mockFoodMenuItems.length;
      let galleryCount = mockGalleryItems.length;
      let inquiriesCount = mockInquiries.length;
      let pendingInquiries = mockInquiries.filter(i => i.status === 'New').length;

      if (isDbConfigured()) {
        try {
          const [roomsRes, foodRes, galleryRes, inquiriesRes] = await Promise.all([
            supabase.from('rooms').select('id', { count: 'exact', head: true }),
            supabase.from('food_menu_items').select('id', { count: 'exact', head: true }),
            supabase.from('gallery_items').select('id', { count: 'exact', head: true }),
            supabase.from('inquiries').select('*'),
          ]);

          roomsCount = roomsRes.count || roomsCount;
          foodCount = foodRes.count || foodCount;
          galleryCount = galleryRes.count || galleryCount;
          
          if (inquiriesRes.data) {
            inquiriesCount = inquiriesRes.data.length;
            pendingInquiries = inquiriesRes.data.filter(i => i.status === 'New').length;
          }
        } catch (e) {
          console.warn('Could not fetch counts from db, using mock counts.', e);
        }
      }

      return {
        rooms: roomsCount,
        food: foodCount,
        gallery: galleryCount,
        inquiries: inquiriesCount,
        pendingInquiries,
      };
    },
  });

  // Fetch recent inquiries
  const { data: recentInquiries = [] } = useQuery<Inquiry[]>({
    queryKey: ['recent-inquiries'],
    queryFn: async () => {
      if (!isDbConfigured()) {
        const stored = localStorage.getItem('demo_inquiries');
        if (stored) {
          const parsed = JSON.parse(stored);
          return [...mockInquiries, ...parsed].slice(-5).reverse();
        }
        return mockInquiries.slice(0, 5);
      }
      try {
        const { data } = await supabase
          .from('inquiries')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
        return data && data.length > 0 ? data : mockInquiries.slice(0, 5);
      } catch (err) {
        return mockInquiries.slice(0, 5);
      }
    },
  });

  // Pure CSS Chart Mock Data: Inquiries over last 6 days
  const chartData = [
    { day: 'Mon', count: 4 },
    { day: 'Tue', count: 7 },
    { day: 'Wed', count: 5 },
    { day: 'Thu', count: 9 },
    { day: 'Fri', count: 12 },
    { day: 'Sat', count: 15 },
    { day: 'Sun', count: 8 },
  ];

  const maxChartCount = Math.max(...chartData.map((d) => d.count));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'New':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Contacted':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Cancelled':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        
        {/* Welcome Row */}
        <div className="bg-gradient-to-r from-forest-900 to-forest-800 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-forest-950 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#1b4d3e_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
          <div className="space-y-2 relative z-10">
            <h1 className="text-2xl md:text-3xl font-serif font-black flex items-center">
              <span>Overview Dashboard</span>
              <Sparkles className="h-5 w-5 text-amber-gold ml-2 animate-bounce" />
            </h1>
            <p className="text-xs text-forest-200 font-medium">
              Manage inquiries, edit room categories, configure menus, and moderate guest reviews.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 relative z-10">
            <Link
              to="/admin/rooms"
              className="px-4 py-2 bg-white text-forest-900 text-xs font-bold rounded-xl hover:bg-forest-50 transition-all flex items-center space-x-1"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Room</span>
            </Link>
            <Link
              to="/admin/gallery"
              className="px-4 py-2 bg-amber-gold text-forest-950 text-xs font-bold rounded-xl hover:bg-amber-gold-dark transition-all flex items-center space-x-1"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Upload Gallery</span>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pending Inquiries */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Pending Inquiries</span>
              <span className="text-3xl font-black text-slate-800">{stats?.pendingInquiries ?? 0}</span>
            </div>
            <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl">
              <FileQuestion className="h-6 w-6" />
            </div>
          </div>

          {/* Rooms */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Total Rooms</span>
              <span className="text-3xl font-black text-slate-800">{stats?.rooms ?? 0}</span>
            </div>
            <div className="p-3.5 bg-forest-50 text-forest-700 rounded-xl">
              <Bed className="h-6 w-6" />
            </div>
          </div>

          {/* Menu items */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Food Menu Items</span>
              <span className="text-3xl font-black text-slate-800">{stats?.food ?? 0}</span>
            </div>
            <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <UtensilsCrossed className="h-6 w-6" />
            </div>
          </div>

          {/* Gallery Items */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Gallery Photos</span>
              <span className="text-3xl font-black text-slate-800">{stats?.gallery ?? 0}</span>
            </div>
            <div className="p-3.5 bg-amber-50 text-amber-500 rounded-xl">
              <ImageIcon className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Charts & Actions Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* CSS Chart (7 Columns) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm lg:col-span-7 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-forest-600" />
                <h3 className="font-serif font-bold text-slate-800 text-lg">Inquiries (Last 7 Days)</h3>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold uppercase">
                Active Traffic
              </span>
            </div>

            {/* Custom Bar Graph */}
            <div className="h-60 flex items-end justify-between px-2 pt-6">
              {chartData.map((d, index) => {
                const heightPercentage = `${(d.count / maxChartCount) * 85}%`;
                return (
                  <div key={index} className="flex flex-col items-center flex-1 space-y-2 group">
                    <span className="text-xs font-bold text-slate-800 opacity-0 group-hover:opacity-100 transition-opacity">
                      {d.count}
                    </span>
                    <div
                      className="w-8 bg-forest-700 hover:bg-amber-gold rounded-t transition-all duration-500"
                      style={{ height: heightPercentage }}
                    />
                    <span className="text-xs font-semibold text-slate-500">{d.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions / Shortcuts (5 Columns) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm lg:col-span-5 space-y-4">
            <h3 className="font-serif font-bold text-slate-800 text-lg flex items-center">
              <Clock className="h-5 w-5 text-forest-600 mr-2" />
              <span>Quick Shortcuts</span>
            </h3>
            
            <div className="flex flex-col gap-2">
              <Link
                to="/admin/inquiries"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-100 hover:border-slate-300 transition-all font-semibold text-slate-700 text-sm"
              >
                <span>Moderate Booking Inquiries</span>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>

              <Link
                to="/admin/settings"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-100 hover:border-slate-300 transition-all font-semibold text-slate-700 text-sm"
              >
                <span>Update Contact & SEO settings</span>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>

              <Link
                to="/admin/banners"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-100 hover:border-slate-300 transition-all font-semibold text-slate-700 text-sm"
              >
                <span>Manage Home Banner Slider</span>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>
            </div>
          </div>

        </div>

        {/* Recent Inquiries List */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-serif font-bold text-slate-800 text-lg">Incoming Booking Inquiries</h3>
            <Link
              to="/admin/inquiries"
              className="text-xs font-bold text-forest-700 hover:text-amber-gold transition-all"
            >
              View All Inquiries
            </Link>
          </div>

          {recentInquiries.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No inquiries logged in the database.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold">
                    <th className="pb-3 pr-4">Guest Name</th>
                    <th className="pb-3 pr-4">Phone</th>
                    <th className="pb-3 pr-4">Dates</th>
                    <th className="pb-3 pr-4">Preference</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {recentInquiries.map((inq) => (
                    <tr key={inq.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 pr-4 font-bold">{inq.name}</td>
                      <td className="py-3.5 pr-4 font-medium">{inq.phone}</td>
                      <td className="py-3.5 pr-4 font-medium text-xs text-slate-500">
                        {inq.check_in_date} to {inq.check_out_date}
                      </td>
                      <td className="py-3.5 pr-4 font-semibold text-xs text-forest-700">
                        {inq.room_preference || 'Any'}
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(inq.status)}`}>
                          {inq.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  );
};
export default Dashboard;
