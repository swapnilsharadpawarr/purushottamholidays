import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileQuestion, Search, FileDown, Bell, Check, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { supabase, isDbConfigured } from '../../lib/supabase';
import { mockInquiries, Inquiry } from '../../lib/mockData';
import AdminLayout from '../../components/AdminLayout';

export const InquiryManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState('');

  // Fetch Inquiries
  const { data: inquiries = [], refetch, isLoading } = useQuery<Inquiry[]>({
    queryKey: ['admin-inquiries'],
    queryFn: async () => {
      if (!isDbConfigured()) {
        const stored = localStorage.getItem('demo_inquiries');
        const parsed = stored ? JSON.parse(stored) : [];
        return [...mockInquiries, ...parsed].reverse();
      }
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Realtime Subscription
  useEffect(() => {
    if (!isDbConfigured()) return;

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'inquiries' },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['admin-inquiries'] });
          queryClient.invalidateQueries({ queryKey: ['admin-stats'] });

          // Play notification sound
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-200.wav');
          audio.play().catch(() => {});

          toast.success(`New Inquiry received from ${payload.new.name}!`, {
            icon: <Bell className="h-5 w-5 text-amber-gold animate-bounce" />,
            duration: 6000,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Update Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      if (!isDbConfigured()) {
        const stored = localStorage.getItem('demo_inquiries');
        if (stored) {
          const parsed = JSON.parse(stored);
          const idx = parsed.findIndex((i: any) => i.id === id);
          if (idx !== -1) {
            parsed[idx].status = status;
            localStorage.setItem('demo_inquiries', JSON.stringify(parsed));
            return;
          }
        }
        const idxMock = mockInquiries.findIndex(i => i.id === id);
        if (idxMock !== -1) {
          mockInquiries[idxMock].status = status as any;
        }
        return;
      }
      const { error } = await supabase
        .from('inquiries')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Inquiry status updated successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin-inquiries'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update status.');
    },
  });

  // Update Notes Mutation
  const updateNotesMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      if (!isDbConfigured()) {
        const stored = localStorage.getItem('demo_inquiries');
        if (stored) {
          const parsed = JSON.parse(stored);
          const idx = parsed.findIndex((i: any) => i.id === id);
          if (idx !== -1) {
            parsed[idx].admin_notes = notes;
            localStorage.setItem('demo_inquiries', JSON.stringify(parsed));
            return;
          }
        }
        const idxMock = mockInquiries.findIndex(i => i.id === id);
        if (idxMock !== -1) {
          mockInquiries[idxMock].admin_notes = notes;
        }
        return;
      }
      const { error } = await supabase
        .from('inquiries')
        .update({ admin_notes: notes })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Admin notes updated.');
      setEditingNotesId(null);
      queryClient.invalidateQueries({ queryKey: ['admin-inquiries'] });
    },
  });

  const handleStatusChange = (id: string, newStatus: string) => {
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  const handleNotesSave = (id: string) => {
    updateNotesMutation.mutate({ id, notes: tempNotes });
  };

  const startEditingNotes = (id: string, currentNotes: string) => {
    setEditingNotesId(id);
    setTempNotes(currentNotes || '');
  };

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

  // CSV Export utility
  const exportToCSV = () => {
    const headers = ['Name,Phone,Email,Check In,Check Out,Guests,Preference,Status,Notes,Created At\n'];
    const rows = inquiries.map((inq) => {
      return `"${inq.name}","${inq.phone}","${inq.email || ''}","${inq.check_in_date}","${inq.check_out_date}",${
        inq.number_of_guests
      },"${inq.room_preference || ''}","${inq.status}","${(inq.admin_notes || '').replace(/"/g, '""')}","${
        inq.created_at
      }"\n`;
    });

    const blob = new Blob([...headers, ...rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `purushottam_inquiries_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredInquiries = inquiries.filter((inq) => {
    const matchesSearch =
      inq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.phone.includes(searchTerm) ||
      (inq.email && inq.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'All' || inq.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Filter / Search Bar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-1 flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by guest name, phone, email..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 bg-slate-50/50"
              />
              <Search className="h-4.5 w-4.5 text-slate-400 absolute left-3.5 top-3.5" />
            </div>

            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 bg-white"
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <button
            onClick={exportToCSV}
            className="flex items-center justify-center space-x-1.5 px-4.5 py-2.5 rounded-xl bg-forest-800 text-white hover:bg-forest-900 transition-colors text-sm font-bold shadow-md cursor-pointer"
          >
            <FileDown className="h-4.5 w-4.5" />
            <span>Export to CSV</span>
          </button>
        </div>

        {/* inquiries Table */}
        {isLoading ? (
          <div className="h-96 flex items-center justify-center bg-white rounded-2xl border border-slate-200">
            <Loader2 className="h-8 w-8 text-forest-750 animate-spin" />
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
            <FileQuestion className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm font-semibold">No inquiries match the filters.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 font-bold">
                    <th className="p-4">Guest Details</th>
                    <th className="p-4">Stay Schedule</th>
                    <th className="p-4">Party Size & Preference</th>
                    <th className="p-4">Status Action</th>
                    <th className="p-4">Admin Internal Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredInquiries.map((inq) => (
                    <tr key={inq.id} className="align-top hover:bg-slate-50/30">
                      {/* Guest Details */}
                      <td className="p-4 space-y-1">
                        <span className="font-bold text-slate-800 block text-base leading-tight">{inq.name}</span>
                        <span className="text-xs font-semibold text-slate-500 block">{inq.phone}</span>
                        {inq.email && <span className="text-xs text-forest-600 block">{inq.email}</span>}
                        {inq.special_requests && (
                          <div className="mt-2 text-xs bg-slate-100 p-2 rounded-lg text-slate-600 leading-relaxed border border-slate-200/50 max-w-xs">
                            <strong>Requests:</strong> {inq.special_requests}
                          </div>
                        )}
                      </td>

                      {/* Schedule */}
                      <td className="p-4 space-y-1 text-xs">
                        <div className="flex flex-col">
                          <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Check In</span>
                          <span className="font-semibold text-slate-700">{inq.check_in_date}</span>
                        </div>
                        <div className="flex flex-col mt-2">
                          <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Check Out</span>
                          <span className="font-semibold text-slate-700">{inq.check_out_date}</span>
                        </div>
                      </td>

                      {/* Party & Preference */}
                      <td className="p-4 space-y-1 text-xs">
                        <span className="bg-forest-50 text-forest-750 font-bold px-2 py-0.5 rounded">
                          {inq.number_of_guests} Guests
                        </span>
                        <div className="mt-2">
                          <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px] block">Preference</span>
                          <span className="font-bold text-slate-800">{inq.room_preference || 'Any Room'}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4 space-y-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border block w-fit ${getStatusBadge(inq.status)}`}>
                          {inq.status}
                        </span>
                        <select
                          value={inq.status}
                          onChange={(e) => handleStatusChange(inq.id, e.target.value)}
                          className="mt-2 px-2 py-1 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-forest-500 bg-white"
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>

                      {/* Admin Notes */}
                      <td className="p-4">
                        {editingNotesId === inq.id ? (
                          <div className="space-y-2 max-w-xs">
                            <textarea
                              value={tempNotes}
                              onChange={(e) => setTempNotes(e.target.value)}
                              rows={3}
                              className="w-full p-2 border border-slate-350 rounded text-xs focus:outline-none focus:ring-1 focus:ring-forest-500 bg-slate-50"
                              placeholder="Write log notes..."
                            />
                            <div className="flex space-x-1.5 justify-end">
                              <button
                                onClick={() => setEditingNotesId(null)}
                                className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-650 text-[10px] font-semibold"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleNotesSave(inq.id)}
                                className="flex items-center space-x-0.5 px-2 py-1 rounded bg-forest-700 hover:bg-forest-800 text-white text-[10px] font-semibold"
                              >
                                <Save className="h-3 w-3" />
                                <span>Save</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1.5 max-w-xs">
                            <p className="text-xs text-slate-600 leading-relaxed italic">
                              {inq.admin_notes || 'No notes compiled yet.'}
                            </p>
                            <button
                              onClick={() => startEditingNotes(inq.id, inq.admin_notes || '')}
                              className="text-[10px] text-forest-750 font-bold hover:text-amber-gold-dark cursor-pointer block"
                            >
                              Edit Notes
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};
export default InquiryManagement;
