import { create } from 'zustand';
import { supabase, isDbConfigured } from '../lib/supabase';
import { SiteSettings, mockSiteSettings } from '../lib/mockData';

interface AdminUserState {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'editor';
  is_active: boolean;
}

interface UIStore {
  // Auth State
  user: any | null;
  adminUser: AdminUserState | null;
  authLoading: boolean;
  loginError: string | null;
  checkSession: () => Promise<void>;
  logout: () => Promise<void>;
  
  // Settings State
  settings: SiteSettings;
  settingsLoading: boolean;
  fetchSettings: () => Promise<void>;
  updateSettingsState: (newSettings: Partial<SiteSettings>) => void;
  
  // UI UX States
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>((set, get) => ({
  // Auth State
  user: null,
  adminUser: null,
  authLoading: true,
  loginError: null,

  checkSession: async () => {
    set({ authLoading: true });
    if (!isDbConfigured()) {
      // In offline demo mode, we mock a logged in user if there's a flag in localStorage
      const mockSession = localStorage.getItem('demo_admin_session');
      if (mockSession) {
        const parsed = JSON.parse(mockSession);
        set({
          user: { id: parsed.id, email: parsed.email },
          adminUser: parsed,
          authLoading: false
        });
      } else {
        set({ user: null, adminUser: null, authLoading: false });
      }
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Fetch matching profile from public.admin_users
        const { data: profile, error } = await supabase
          .from('admin_users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile && profile.is_active) {
          set({
            user: session.user,
            adminUser: profile as AdminUserState,
            authLoading: false
          });
        } else {
          // Profile inactive or not found
          await supabase.auth.signOut();
          set({ user: null, adminUser: null, authLoading: false });
        }
      } else {
        set({ user: null, adminUser: null, authLoading: false });
      }
    } catch (err) {
      console.error('Session check failed', err);
      set({ user: null, adminUser: null, authLoading: false });
    }
  },

  logout: async () => {
    if (isDbConfigured()) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem('demo_admin_session');
    }
    set({ user: null, adminUser: null });
  },

  // Settings State
  settings: mockSiteSettings,
  settingsLoading: false,

  fetchSettings: async () => {
    set({ settingsLoading: true });
    if (!isDbConfigured()) {
      const localSettings = localStorage.getItem('demo_settings');
      if (localSettings) {
        try {
          const parsed = JSON.parse(localSettings);
          set({ settings: { ...mockSiteSettings, ...parsed }, settingsLoading: false });
          return;
        } catch (e) {
          console.error('Failed to parse demo_settings from localStorage', e);
        }
      }
      set({ settings: mockSiteSettings, settingsLoading: false });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single();
      
      if (data) {
        set({ settings: data as SiteSettings });
      }
    } catch (err) {
      console.error('Failed to load site settings, using defaults.', err);
    } finally {
      set({ settingsLoading: false });
    }
  },

  updateSettingsState: (newSettings) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings }
    }));
  },

  // Sidebar UI State
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
