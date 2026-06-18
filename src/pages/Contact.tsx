import React from 'react';
import { Phone, MessageCircle, Mail, MapPin, Map } from 'lucide-react';
import { useUIStore } from '../store/uiStore';
import InquiryForm from '../components/InquiryForm';
import SEO from '../components/SEO';

export const Contact: React.FC = () => {
  const settings = useUIStore((state) => state.settings);

  const phoneLink = `tel:${settings.phone_number}`;
  const whatsappLink = `https://wa.me/${settings.whatsapp_number.replace(/\+/g, '')}?text=${encodeURIComponent(
    'Hello, I want to book a room or make an inquiry at Purushottam Holiday Homestay.'
  )}`;
  const mailLink = `mailto:${settings.email}`;

  return (
    <div className="page-container py-12 md:py-16 bg-forest-50/20">
      <SEO 
        title="Contact Us & Direct Booking | Directions & Maps"
        description="Get in touch with Purushottam Holiday Homestay. Find driving directions, GPS location near Tala Fort, contact phone numbers, WhatsApp, and booking form."
        keywords="contact hotel Tala, homestay booking phone, resort directions Raigad, hotel near Tala Fort, homestay contact number"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-amber-gold-dark text-xs font-bold uppercase tracking-widest bg-forest-50 border border-forest-100/60 px-3 py-1 rounded-full">
            Connect With Us
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-black text-forest-800">
            Get in Touch
          </h2>
          <div className="h-1 w-20 bg-amber-gold mx-auto rounded-full mt-3" />
          <p className="text-forest-500 text-sm md:text-base leading-relaxed">
            Have questions about check-in, customized food menu, or heritage treks? Reach out to us directly via call, WhatsApp, email, or fill out the inquiry form below and we will contact you shortly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Contact info & map (5 Columns) */}
          <div className="lg:col-span-5 space-y-8">
            
            <div className="space-y-4">
              <h3 className="text-2xl font-serif font-bold text-forest-850">Contact Information</h3>
              <p className="text-xs text-forest-500 font-medium">
                Our staff is available for inquiries and reservations from 8:00 AM to 10:00 PM IST.
              </p>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Phone */}
              <a
                href={phoneLink}
                className="flex flex-col bg-white border border-forest-100 p-5 rounded-2xl shadow-sm hover-gold-shadow transition-all duration-300"
              >
                <div className="p-2.5 bg-forest-50 text-forest-700 rounded-xl w-fit mb-4">
                  <Phone className="h-5 w-5 fill-current" />
                </div>
                <span className="text-[10px] font-bold tracking-wider text-forest-400 uppercase">Call Host</span>
                <span className="text-sm font-bold text-forest-800 mt-1 block truncate">
                  {settings.phone_number.split('/')[0]}
                </span>
              </a>

              {/* WhatsApp */}
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col bg-white border border-forest-100 p-5 rounded-2xl shadow-sm hover-gold-shadow transition-all duration-300"
              >
                <div className="p-2.5 bg-green-50 text-green-600 rounded-xl w-fit mb-4">
                  <MessageCircle className="h-5 w-5 fill-current" />
                </div>
                <span className="text-[10px] font-bold tracking-wider text-forest-400 uppercase">Chat WhatsApp</span>
                <span className="text-sm font-bold text-forest-800 mt-1 block truncate">
                  {settings.whatsapp_number}
                </span>
              </a>

              {/* Email */}
              <a
                href={mailLink}
                className="flex flex-col bg-white border border-forest-100 p-5 rounded-2xl shadow-sm hover-gold-shadow transition-all duration-300 sm:col-span-2"
              >
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl w-fit mb-4">
                  <Mail className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold tracking-wider text-forest-400 uppercase">Send Email</span>
                <span className="text-sm font-bold text-forest-800 mt-1 block truncate">
                  {settings.email}
                </span>
              </a>

              {/* Address */}
              <div className="flex flex-col bg-white border border-forest-100 p-5 rounded-2xl shadow-sm sm:col-span-2">
                <div className="p-2.5 bg-forest-50 text-forest-750 rounded-xl w-fit mb-4">
                  <MapPin className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold tracking-wider text-forest-400 uppercase">Homestay Address</span>
                <span className="text-xs font-semibold text-forest-700 mt-2 leading-relaxed">
                  {settings.address}
                </span>
                <a
                  href={settings.google_maps_directions_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address || 'Purushottam Holiday Homestay Tala Raigad')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 text-xs font-bold text-amber-gold-dark hover:text-forest-700 transition-colors flex items-center"
                >
                  <span>Get GPS Driving Route</span>
                  <span className="ml-1">→</span>
                </a>
              </div>

            </div>

          </div>

          {/* Right Column: Inquiry Form (7 Columns) */}
          <div className="lg:col-span-7">
            <InquiryForm />
          </div>

        </div>

        {/* Full-width Map Location Section */}
        <div className="mt-20 space-y-4">
          <div className="flex items-center space-x-2 text-forest-800">
            <Map className="h-5 w-5" />
            <h3 className="text-xl font-serif font-bold">Find Us On The Map</h3>
          </div>
          <div className="h-96 rounded-3xl overflow-hidden border border-forest-100 shadow-xl bg-forest-100">
            <iframe
              src={settings.google_maps_embed_url}
              className="h-full w-full border-0 grayscale hover:grayscale-0 transition-all duration-700"
              allowFullScreen
              loading="lazy"
              title="Full Contact Location Map"
            />
          </div>
        </div>

      </div>
    </div>
  );
};
export default Contact;
