import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Plus, Pencil, Trash2, ToggleLeft, ToggleRight, X, Loader2, Save, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { supabase, isDbConfigured } from '../../lib/supabase';
import AdminLayout from '../../components/AdminLayout';

export interface AdminProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'editor';
  is_active: boolean;
  created_at?: string;
}

export const UserManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminProfile | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'editor'>('editor');
  const [isActive, setIsActive] = useState(true);

  // Fetch Users List
  const { data: profiles = [], isLoading } = useQuery<AdminProfile[]>({
    queryKey: ['admin-profiles-list'],
    queryFn: async () => {
      const defaultProfiles: AdminProfile[] = [
        { id: '1', email: 'admin@purushottam.com', full_name: 'Property Owner', role: 'admin', is_active: true },
        { id: '2', email: 'editor@purushottam.com', full_name: 'Homestay Manager', role: 'editor', is_active: true },
      ];

      if (!isDbConfigured()) {
        const stored = localStorage.getItem('demo_profiles');
        return stored ? JSON.parse(stored) : defaultProfiles;
      }

      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('full_name', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const openAddForm = () => {
    setEditingUser(null);
    setFullName('');
    setEmail('');
    setRole('editor');
    setIsActive(true);
    setIsFormOpen(true);
  };

  const openEditForm = (user: AdminProfile) => {
    setEditingUser(user);
    setFullName(user.full_name);
    setEmail(user.email);
    setRole(user.role);
    setIsActive(user.is_active);
    setIsFormOpen(true);
  };

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        full_name: fullName,
        email,
        role,
        is_active: isActive,
      };

      if (!isDbConfigured()) {
        // Manage in local storage for Sandbox
        const stored = localStorage.getItem('demo_profiles');
        let currentList: AdminProfile[] = stored
          ? JSON.parse(stored)
          : [
              { id: '1', email: 'admin@purushottam.com', full_name: 'Property Owner', role: 'admin', is_active: true },
              { id: '2', email: 'editor@purushottam.com', full_name: 'Homestay Manager', role: 'editor', is_active: true },
            ];

        if (editingUser) {
          currentList = currentList.map((x) => (x.id === editingUser.id ? { ...x, ...payload } : x));
        } else {
          currentList.push({
            id: `user-${Date.now()}`,
            ...payload,
            created_at: new Date().toISOString(),
          });
        }
        localStorage.setItem('demo_profiles', JSON.stringify(currentList));
        return;
      }

      if (editingUser) {
        const { error } = await supabase
          .from('admin_users')
          .update(payload)
          .eq('id', editingUser.id);
        if (error) throw error;
      } else {
        // Create auth user invite + insert to admin_users triggers
        const { error } = await supabase
          .from('admin_users')
          .insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editingUser ? 'User details updated.' : 'Staff user added successfully.');
      setIsFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-profiles-list'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to save staff profile.');
    },
  });

  // Toggle Status
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: boolean }) => {
      if (!isDbConfigured()) {
        const stored = localStorage.getItem('demo_profiles');
        if (stored) {
          const parsed = JSON.parse(stored);
          const idx = parsed.findIndex((x: any) => x.id === id);
          if (idx !== -1) {
            parsed[idx].is_active = status;
            localStorage.setItem('demo_profiles', JSON.stringify(parsed));
          }
        }
        return;
      }
      const { error } = await supabase
        .from('admin_users')
        .update({ is_active: status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Staff status updated.');
      queryClient.invalidateQueries({ queryKey: ['admin-profiles-list'] });
    },
  });

  // Delete User
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!isDbConfigured()) {
        const stored = localStorage.getItem('demo_profiles');
        if (stored) {
          let parsed = JSON.parse(stored);
          parsed = parsed.filter((x: any) => x.id !== id);
          localStorage.setItem('demo_profiles', JSON.stringify(parsed));
        }
        return;
      }
      const { error } = await supabase.from('admin_users').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Staff profile removed.');
      queryClient.invalidateQueries({ queryKey: ['admin-profiles-list'] });
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Actions Row */}
        <div className="flex justify-between items-center">
          <p className="text-xs text-slate-500 font-semibold">
            Manage administrative logins, assign editor clearance, and activate/deactivate accounts.
          </p>
          <button
            onClick={openAddForm}
            className="flex items-center justify-center space-x-1 px-4 py-2.5 rounded-xl bg-forest-800 text-white hover:bg-forest-900 transition-colors text-xs font-bold shadow-md cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Staff User</span>
          </button>
        </div>

        {/* Users Table */}
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
                    <th className="p-4">Staff Name</th>
                    <th className="p-4">Email Address</th>
                    <th className="p-4">Role / Clearance</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {profiles.map((user) => (
                    <tr key={user.id} className="align-middle hover:bg-slate-50/30">
                      {/* Name */}
                      <td className="p-4 font-bold text-slate-800">{user.full_name}</td>

                      {/* Email */}
                      <td className="p-4 font-medium text-slate-605">{user.email}</td>

                      {/* Role */}
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${
                          user.role === 'admin' 
                            ? 'bg-amber-50 text-amber-700 border-amber-200' 
                            : 'bg-forest-50 text-forest-750 border-forest-100'
                        }`}>
                          {user.role}
                        </span>
                      </td>

                      {/* Active Status */}
                      <td className="p-4">
                        <button
                          onClick={() => toggleActiveMutation.mutate({ id: user.id, status: !user.is_active })}
                          className="text-slate-500 hover:text-forest-750 transition-colors cursor-pointer"
                        >
                          {user.is_active ? (
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
                            onClick={() => openEditForm(user)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-605 hover:bg-slate-55 hover:border-slate-350 transition-colors cursor-pointer"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete staff account "${user.full_name}"?`)) {
                                deleteMutation.mutate(user.id);
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-250 animate-fade-in-up">
              
              {/* Header */}
              <div className="h-16 border-b border-slate-200 flex items-center justify-between px-6">
                <h3 className="text-lg font-serif font-black text-slate-800">
                  {editingUser ? `Edit: ${editingUser.full_name}` : 'Register New Staff User'}
                </h3>
                <button onClick={() => setIsFormOpen(false)} className="text-slate-404 hover:text-slate-600 cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form body */}
              <div className="p-6 space-y-5">
                
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-600">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rajesh Patil"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-forest-500 bg-slate-50/50"
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-605">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rajesh@purushottamhomestay.com"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-forest-500 bg-slate-50/50"
                  />
                </div>

                {/* Role / Clearance */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-606">Role / Clearance</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'admin' | 'editor')}
                    className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-forest-500"
                  >
                    <option value="editor">Editor (Inquiries, rooms, menus only)</option>
                    <option value="admin">Administrator (Full Access & Settings)</option>
                  </select>
                </div>

                {/* Status active */}
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="is_act_usr"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 text-forest-650"
                  />
                  <label htmlFor="is_act_usr" className="text-xs font-bold text-slate-600 select-none">
                    Is Active Staff Login
                  </label>
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
                  <span>{editingUser ? 'Save details' : 'Create Staff'}</span>
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};
export default UserManagement;
