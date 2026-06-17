import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Bed,
  UtensilsCrossed,
  MapPin,
  Image as ImageIcon,
  FileQuestion,
  Settings,
  Users,
  LogOut,
  Menu,
  Home,
  Loader2,
  Sliders,
  MessageSquare,
  Waves,
} from 'lucide-react';
import { useUIStore } from '../store/uiStore';
import { isDbConfigured } from '../lib/supabase';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const {
    adminUser,
    authLoading,
    checkSession,
    logout,
    sidebarOpen,
    setSidebarOpen,
  } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    // If not loading and no adminUser, redirect to login
    if (!authLoading && !adminUser) {
      navigate('/admin/login');
    }
  }, [adminUser, authLoading, navigate]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-forest-950 flex flex-col items-center justify-center text-white space-y-4">
        <Loader2 className="h-10 w-10 text-amber-gold animate-spin" />
        <p className="text-sm font-semibold tracking-wider text-forest-200">Verifying Admin Session...</p>
      </div>
    );
  }

  if (!adminUser) {
    return null; // Will redirect via useEffect
  }

  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" />, path: '/admin/dashboard' },
    { name: 'Inquiries', icon: <FileQuestion className="h-5 w-5" />, path: '/admin/inquiries' },
    { name: 'Rooms', icon: <Bed className="h-5 w-5" />, path: '/admin/rooms' },
    { name: 'Food Menu', icon: <UtensilsCrossed className="h-5 w-5" />, path: '/admin/food' },
    { name: 'Attractions', icon: <MapPin className="h-5 w-5" />, path: '/admin/attractions' },
    { name: 'Gallery', icon: <ImageIcon className="h-5 w-5" />, path: '/admin/gallery' },
    { name: 'Banners Slider', icon: <Sliders className="h-5 w-5" />, path: '/admin/banners' },
    { name: 'Pool Showcase', icon: <Waves className="h-5 w-5" />, path: '/admin/showcase' },
    { name: 'Reviews', icon: <MessageSquare className="h-5 w-5" />, path: '/admin/reviews' },


    { name: 'Site Settings', icon: <Settings className="h-5 w-5" />, path: '/admin/settings' },
    { name: 'Admin Users', icon: <Users className="h-5 w-5" />, path: '/admin/users', adminOnly: true },
  ];

  const filteredNavItems = navItems.filter(
    (item) => !item.adminOnly || adminUser.role === 'admin'
  );

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Desktop */}
      <aside
        className={`bg-forest-900 text-white flex flex-col justify-between border-r border-forest-800 transition-all duration-300 z-30 ${
          sidebarOpen ? 'w-64' : 'w-20'
        } hidden md:flex`}
      >
        <div>
          {/* Logo Brand area */}
          <div className="h-20 border-b border-forest-800 flex items-center px-4 overflow-hidden">
            {sidebarOpen ? (
              <Link to="/admin/dashboard" className="flex items-center space-x-2.5">
                <img 
                  src="/logo.png" 
                  alt="Purushottam Holidays Logo" 
                  className="h-12 w-auto object-contain bg-white/10 p-1 rounded-xl flex-shrink-0"
                />
                <div className="leading-none">
                  <span className="text-[9px] tracking-widest text-amber-gold font-bold uppercase block">
                    ADMIN PANEL
                  </span>
                </div>
              </Link>
            ) : (
              <Link to="/admin/dashboard" className="flex items-center justify-center w-full">
                <img 
                  src="/logo.png" 
                  alt="Logo" 
                  className="h-10 w-auto object-contain bg-white/10 p-1 rounded-xl"
                />
              </Link>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {filteredNavItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-amber-gold text-forest-900 shadow-md shadow-amber-500/10'
                    : 'text-forest-300 hover:bg-forest-800 hover:text-white'
                }`}
                title={!sidebarOpen ? item.name : undefined}
              >
                {item.icon}
                {sidebarOpen && <span className="truncate">{item.name}</span>}
              </Link>
            ))}
          </nav>
        </div>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-forest-800 space-y-3">
          {sidebarOpen && (
            <div className="px-4 py-2 bg-forest-950/40 rounded-xl border border-forest-800/50">
              <span className="text-xs font-bold text-white block truncate">{adminUser.full_name}</span>
              <span className="text-[10px] text-amber-gold font-bold uppercase tracking-wider block mt-0.5">
                {adminUser.role} Account
              </span>
            </div>
          )}
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-300 hover:bg-red-950/20 hover:text-red-200 transition-colors cursor-pointer"
            title={!sidebarOpen ? 'Logout' : undefined}
          >
            <LogOut className="h-5 w-5" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-20">
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer hidden md:block"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-serif font-black text-slate-800">
              {navItems.find((item) => isActive(item.path))?.name || 'Admin Panel'}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            {!isDbConfigured() && (
              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 px-3 py-1 rounded-full uppercase tracking-wider">
                Demo Sandbox
              </span>
            )}
            
            <Link
              to="/"
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              <Home className="h-3.5 w-3.5" />
              <span>Guest Site</span>
            </Link>
          </div>
        </header>

        {/* Content body */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
export default AdminLayout;
