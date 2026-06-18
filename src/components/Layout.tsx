import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, MessageSquare, MapPin, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../store/uiStore';
import ImageKitImage from './ImageKitImage';
import FAB from './FAB';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { settings, fetchSettings, adminUser } = useUIStore();

  useEffect(() => {
    fetchSettings();
  }, []);

  // Close mobile menu on page navigate
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Rooms', path: '/rooms' },
    { name: 'Food Menu', path: '/food' },
    { name: 'Attractions', path: '/attractions' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const isAdminRoute = location.pathname.startsWith('/admin');

  // If in admin dashboard, we render a different layouts
  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-forest-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Property Name */}
          <Link to="/" className="flex items-center space-x-3 py-2 group">
            <img 
              src="/logo.png" 
              alt={settings.property_name || "Purushottam Holidays"} 
              className="h-12 sm:h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03]" 
            />
            <div className="flex flex-col transition-all duration-300 group-hover:translate-x-0.5">
              <span className="text-sm sm:text-base md:text-lg font-serif font-black tracking-wider text-forest-800 uppercase leading-none">
                {settings.property_name ? settings.property_name.split(' ')[0] : 'Purushottam'}
              </span>
              <span className="text-[9px] sm:text-[10px] md:text-xs font-sans tracking-[0.2em] text-amber-gold font-bold uppercase mt-1 leading-none">
                {settings.property_name ? settings.property_name.split(' ').slice(1).join(' ') : 'Holidays'}
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-semibold tracking-wide transition-all duration-300 relative py-1 hover:text-forest-700 ${
                  isActive(link.path)
                    ? 'text-forest-700 font-bold border-b-2 border-amber-gold'
                    : 'text-forest-500'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Action buttons */}
          <div className="hidden sm:flex items-center space-x-4">
            {adminUser && (
              <Link
                to="/admin/dashboard"
                className="flex items-center space-x-1.5 px-4.5 py-2 rounded-xl bg-forest-50 text-forest-700 text-xs font-bold hover:bg-forest-100 transition-all border border-forest-200"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            )}
            
            <a
              href={`tel:${settings.phone_number}`}
              className="flex items-center space-x-2 px-4.5 py-2.5 rounded-xl bg-forest-700 text-white text-xs font-bold hover:bg-forest-800 transition-all shadow-md shadow-forest-100"
            >
              <Phone className="h-3.5 w-3.5 fill-current" />
              <span>CALL: {settings.phone_number.split('/')[0]}</span>
            </a>
          </div>

          {/* Mobile hamburger menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-forest-700 hover:bg-forest-50 transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-b border-forest-100 shadow-xl overflow-hidden fixed top-20 left-0 w-full z-30"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`block py-2.5 px-4 rounded-xl text-base font-semibold transition-all ${
                    isActive(link.path)
                      ? 'bg-forest-50 text-forest-700 font-bold border-l-4 border-amber-gold'
                      : 'text-forest-600 hover:bg-forest-50/50'
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              <div className="pt-4 border-t border-forest-50 flex flex-col space-y-3">
                {adminUser && (
                  <Link
                    to="/admin/dashboard"
                    className="flex items-center justify-center space-x-2 py-3 rounded-xl bg-forest-50 text-forest-700 text-sm font-bold border border-forest-200"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}

                <a
                  href={`tel:${settings.phone_number}`}
                  className="flex items-center justify-center space-x-2 py-3 rounded-xl bg-forest-700 text-white text-sm font-bold shadow-md"
                >
                  <Phone className="h-4 w-4 fill-current" />
                  <span>Call: {settings.phone_number}</span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-forest-800 text-forest-100 border-t border-forest-700 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Logo & Contact details */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img 
                src="/logo.png" 
                alt={settings.property_name || "Purushottam Holidays"} 
                className="h-10 sm:h-12 w-auto object-contain" 
              />
              <h3 className="text-lg font-serif font-bold text-white uppercase tracking-wider">
                {settings.property_name}
              </h3>
            </div>
            <p className="text-xs text-forest-300 leading-relaxed max-w-sm">
              {settings.tagline}
            </p>
            <div className="flex space-x-3 pt-2">
              {settings.facebook_url && (
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-full bg-forest-700 text-forest-300 hover:text-white hover:bg-amber-gold transition-colors flex items-center justify-center"
                  aria-label="Facebook"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
              )}
              {settings.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-full bg-forest-700 text-forest-300 hover:text-white hover:bg-amber-gold transition-colors flex items-center justify-center"
                  aria-label="Instagram"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white tracking-widest uppercase mb-4 border-l-2 border-amber-gold pl-2">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs text-forest-300">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="hover:text-amber-gold transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/admin/login" className="hover:text-amber-gold transition-colors">
                  Staff Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-sm font-bold text-white tracking-widest uppercase mb-4 border-l-2 border-amber-gold pl-2">
              Get In Touch
            </h4>
            <ul className="space-y-3.5 text-xs text-forest-300">
              <li className="flex items-start space-x-2.5">
                <Phone className="h-4 w-4 text-amber-gold mt-0.5 flex-shrink-0" />
                <span>{settings.phone_number}</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <MessageSquare className="h-4 w-4 text-amber-gold mt-0.5 flex-shrink-0" />
                <span>WhatsApp: {settings.whatsapp_number}</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <MapPin className="h-4 w-4 text-amber-gold mt-0.5 flex-shrink-0" />
                <span className="leading-relaxed">{settings.address}</span>
              </li>
            </ul>
          </div>

          {/* Map Teaser / Directions */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white tracking-widest uppercase mb-4 border-l-2 border-amber-gold pl-2">
              Directions
            </h4>
            <div className="h-32 rounded-xl overflow-hidden border border-forest-700/60 shadow-inner bg-forest-900 flex items-center justify-center text-xs text-forest-400">
              {/* Fallback mock map visual */}
              <div className="text-center p-3">
                <p className="mb-2 font-medium">Located near Tala Fort</p>
                <a
                  href={settings.google_maps_directions_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-amber-gold text-forest-900 rounded font-semibold inline-block hover:bg-amber-gold-dark transition-colors"
                >
                  Get GPS Route
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright info */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-forest-700/50 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-forest-400">
          <p>© 2026 Purushottam Holiday Homestay. All Rights Reserved.</p>
          <p className="mt-2 md:mt-0">
            Crafted for premium holiday experiences near Tala Fort.
          </p>
        </div>
      </footer>
      <FAB />
    </div>
  );
};
export default Layout;
