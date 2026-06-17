export interface Room {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price_per_night: number;
  capacity: number;
  amenities: string[];
  imagekit_folder_path?: string;
  cover_image_url: string;
  gallery_image_urls: string[];
  is_active: boolean;
  display_order: number;
  created_at?: string;
}

export interface Attraction {
  id: string;
  name: string;
  slug: string;
  category: 'Nature' | 'History' | 'Adventure' | 'Religious' | 'Beach';
  description: string;
  distance_km: number;
  travel_time: string;
  best_time_to_visit: string;
  imagekit_image_url: string;
  google_maps_embed_url?: string;
  google_maps_directions_url?: string;
  is_active: boolean;
  display_order: number;
}

export interface FoodMenuItem {
  id: string;
  name: string;
  category: 'Veg' | 'Non-Veg' | 'Seafood' | 'Meal Package';
  sub_category: string;
  description: string;
  price: number | null;
  is_meal_package: boolean;
  package_includes?: string[];
  dietary_tags?: string[];
  imagekit_image_url: string;
  is_active: boolean;
  display_order: number;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Property Exterior' | 'Rooms' | 'Pool' | 'Food' | 'Gardens' | 'Sunset Views' | 'Drone Shots' | 'Guest Photos' | 'Videos';
  media_type: 'image' | 'video';
  imagekit_url: string;
  imagekit_file_id?: string;
  thumbnail_url?: string;
  caption?: string;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  uploaded_by?: string;
}

export interface Review {
  id: string;
  reviewer_name: string;
  reviewer_email?: string;
  rating: number;
  review_text: string;
  stay_date?: string;
  room_type?: string;
  is_approved: boolean;
  is_featured: boolean;
  source: 'Website' | 'Google' | 'Manual';
  google_review_id?: string;
  created_at: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email?: string;
  phone: string;
  check_in_date: string;
  check_out_date: string;
  number_of_guests: number;
  room_preference?: string;
  special_requests?: string;
  status: 'New' | 'Contacted' | 'Confirmed' | 'Cancelled';
  admin_notes?: string;
  created_at: string;
}

export interface SiteSettings {
  id?: string | number;
  property_name: string;
  tagline: string;
  phone_number: string;
  whatsapp_number: string;
  email: string;
  address: string;
  google_maps_embed_url: string;
  google_maps_directions_url: string;
  facebook_url: string;
  instagram_url: string;
  google_my_business_url: string;
  google_reviews_embed_code: string;
  hero_video_imagekit_url: string;
  hero_title: string;
  hero_subtitle: string;
  seo_meta_title: string;
  seo_meta_description: string;
  seo_keywords: string;
  favicon_imagekit_url: string;
  logo_imagekit_url: string;
  show_pool_showcase?: boolean;
  pool_showcase_title?: string;
  pool_showcase_description?: string;
  pool_showcase_tags?: string[];
}

export interface PoolShowcaseImage {
  id: string;
  image_url: string;
  imagekit_file_id?: string;
  display_order: number;
  created_at?: string;
}

export interface Banner {
  id: string;
  image_url: string;
  imagekit_file_id?: string;
  title?: string;
  subtitle?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}


// ----------------------------------------------------
// Mock Data Sets
// ----------------------------------------------------

export const mockSiteSettings: SiteSettings = {
  property_name: 'Purushottam Holiday Homestay',
  tagline: 'Experience Paradise in Tala',
  phone_number: '+919860361361',
  whatsapp_number: '+919860361361',
  email: 'purushottamholidays@gmail.com',
  address: 'At Post Tala, Near Tala Fort, Raigad District, Maharashtra - 402111',
  google_maps_embed_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3789.7029315367675!2d73.1234567!3d18.1234567!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTjCsDA3JzI0LjUiTiA3M8KwMDcnMjQuNSJFCg!5e0!3m2!1sen!2sin!4v1680000000000!5m2!1sen!2sin',
  google_maps_directions_url: 'https://maps.app.goo.gl/y5R34J21H9x8z7A6',
  facebook_url: 'https://facebook.com/purushottamholidays',
  instagram_url: 'https://instagram.com/purushottam_holiday_homestay',
  google_my_business_url: 'https://g.page/r/purushottam-holiday-homestay',
  google_reviews_embed_code: '<div class="google-rating"><span class="text-xl font-bold text-amber-500">4.9 ★★★★★</span> <span class="text-sm opacity-80">(148 reviews on Google)</span></div>',
  hero_video_imagekit_url: 'drone/homestay-drone-walkthrough.mp4',
  hero_title: 'Unwind in the Lap of Nature & Heritage',
  hero_subtitle: 'A premium farmhouse homestay near Tala Fort with a crystal-clear swimming pool and authentic Konkani hospitality.',
  seo_meta_title: 'Purushottam Holiday Homestay | Premium Farmhouse & Pool in Tala, Raigad',
  seo_meta_description: 'Escape to Purushottam Holiday Homestay near Tala Fort. Enjoy lush greenery, a private swimming pool, home-cooked Konkani meals, and heritage tours.',
  seo_keywords: 'homestay tala, holiday homestay, tala fort hotel, raigad homestay, pool homestay konkan, farmhouse near tala',
  favicon_imagekit_url: 'site-assets/favicon.png',
  logo_imagekit_url: 'site-assets/logo.png',
  show_pool_showcase: true,
  pool_showcase_title: 'Take a Dip in Paradise',
  pool_showcase_description: 'Unwind from the city chaos inside our pristine, lapis-blue swimming pool. Surrounded by organic mango plantations, towering coconut trees, and quiet seating niches, it\'s the perfect spot to spend your afternoon.',
  pool_showcase_tags: ['Crystal-Clear Water', 'Poolside Orchard Sit-outs', 'Safe Kids Deck Area'],
};

export const mockRooms: Room[] = [
  {
    id: 'room-1',
    name: 'Executive AC Room',
    slug: 'executive-ac-room',
    description: 'Perfect for couples and small families. Enjoy premium air-conditioned comfort with a beautiful garden view, attached modern bathroom, smart TV, and ultra-high-speed Wi-Fi. Experience a relaxing vibe with high-quality linens and 24/7 hot water supply.',
    short_description: 'Premium air-conditioned room with garden view, attached bath, and queen bed. Perfect for 2-3 guests.',
    price_per_night: 2999,
    capacity: 3,
    amenities: ['AC', 'TV', 'WiFi', 'Hot Water', 'Attached Bathroom', 'Room Service', 'Parking'],
    cover_image_url: 'rooms/ac-room-cover.jpg',
    gallery_image_urls: [
      'rooms/ac-room-cover.jpg',
      'rooms/ac-room-bed.jpg',
      'rooms/ac-room-bath.jpg',
    ],
    is_active: true,
    display_order: 1,
  },
  {
    id: 'room-2',
    name: 'Cozy Family Suite',
    slug: 'cozy-family-suite',
    description: 'Generously spacious suite designed for families. Features two large double beds, a cozy seating area, separate vanity space, full air conditioning, and dual balconies overlooking the swimming pool. Packed with high-end amenities to make your family stay memorable.',
    short_description: 'Spacious air-conditioned suite with 2 double beds, seating lounge, and pool-view balconies. Ideal for 4-5 guests.',
    price_per_night: 4499,
    capacity: 5,
    amenities: ['AC', 'TV', 'WiFi', 'Hot Water', 'Attached Bathroom', 'Balcony', 'Room Service', 'Parking'],
    cover_image_url: 'rooms/family-room-cover.jpg',
    gallery_image_urls: [
      'rooms/family-room-cover.jpg',
      'rooms/family-room-bed.jpg',
      'rooms/family-room-balcony.jpg',
    ],
    is_active: true,
    display_order: 2,
  },
  {
    id: 'room-3',
    name: 'Heritage Group Villa',
    slug: 'heritage-group-villa',
    description: 'Live like royalty in our massive group villa. Perfectly tailored for groups of friends or corporate retreats. Accommodates up to 10 guests with comfortable multiple sleeping layouts, an expansive common veranda, outdoor sit-outs, and direct swimming pool access.',
    short_description: 'Lush group cottage that easily sleeps 10 guests. Features a large common veranda, pool access, and dynamic seating.',
    price_per_night: 7999,
    capacity: 10,
    amenities: ['AC', 'WiFi', 'Hot Water', 'Attached Bathroom', 'Pool Access', 'Group Sit-out', 'Parking'],
    cover_image_url: 'rooms/group-villa-cover.jpg',
    gallery_image_urls: [
      'rooms/group-villa-cover.jpg',
      'rooms/group-villa-interior.jpg',
      'rooms/group-villa-veranda.jpg',
    ],
    is_active: true,
    display_order: 3,
  },
];

export const mockAttractions: Attraction[] = [
  {
    id: 'att-1',
    name: 'Tala Fort',
    slug: 'tala-fort',
    category: 'History',
    description: 'A historic hill fort built in the 4th century, offering panoramic views of the Rajpuri creek and surrounding valleys. It was captured by Shivaji Maharaj and is popular for trekking.',
    distance_km: 2.5,
    travel_time: '10 min by car',
    best_time_to_visit: 'Monsoon & Winter (July to February)',
    imagekit_image_url: 'attractions/tala-fort.jpg',
    google_maps_directions_url: 'https://maps.google.com/?q=Tala+Fort+Raigad',
    is_active: true,
    display_order: 1,
  },
  {
    id: 'att-2',
    name: 'Mandad Fort & Bridge',
    slug: 'mandad-fort',
    category: 'History',
    description: 'An ancient hill fort situated near Mandad village. The scenic drive across the Mandad River bridge is breath-taking, with dense mangroves on both sides.',
    distance_km: 11.2,
    travel_time: '20 min by car',
    best_time_to_visit: 'October to March',
    imagekit_image_url: 'attractions/mandad-bridge.jpg',
    google_maps_directions_url: 'https://maps.google.com/?q=Mandad+Fort+Raigad',
    is_active: true,
    display_order: 2,
  },
  {
    id: 'att-3',
    name: 'Kuda Buddhist Caves',
    slug: 'kuda-caves',
    category: 'History',
    description: 'A group of 26 rock-cut Buddhist caves dating back to the 1st century BC. Features beautiful carvings, inscriptions, and stupas overlooking the Arabian Sea creeks.',
    distance_km: 18.0,
    travel_time: '35 min by car',
    best_time_to_visit: 'Morning hours year-round',
    imagekit_image_url: 'attractions/kuda-caves.jpg',
    google_maps_directions_url: 'https://maps.google.com/?q=Kuda+Caves+Raigad',
    is_active: true,
    display_order: 3,
  },
  {
    id: 'att-4',
    name: 'Murud Janjira Sea Fort',
    slug: 'janjira-fort',
    category: 'Adventure',
    description: 'An undefeated marine fort situated on an island off the coastal town of Murud. Reachable only by traditional sailboats from Rajapuri jetty.',
    distance_km: 34.5,
    travel_time: '1 hour by car',
    best_time_to_visit: 'October to May (Ferry operations close in monsoon)',
    imagekit_image_url: 'attractions/janjira-fort.jpg',
    google_maps_directions_url: 'https://maps.google.com/?q=Murud+Janjira+Fort',
    is_active: true,
    display_order: 4,
  },
];

export const mockFoodMenuItems: FoodMenuItem[] = [
  {
    id: 'food-1',
    name: 'Surmai Fish Thali',
    category: 'Seafood',
    sub_category: 'Lunch',
    description: 'Authentic Konkani style thali containing fresh Surmai fry, rich fish curry cooked in coconut milk, Solkadhi, organic rice, and hand-rolled bhakri.',
    price: 350,
    is_meal_package: false,
    dietary_tags: ['Local Specialty', 'Spicy'],
    imagekit_image_url: 'food/surmai-thali.jpg',
    is_active: true,
    display_order: 1,
  },
  {
    id: 'food-2',
    name: 'Organic Veg Thali',
    category: 'Veg',
    sub_category: 'Lunch',
    description: 'Prepared using vegetables freshly plucked from our organic farm. Includes two seasonal sabzis, varan-bhat, chapatis, salad, pickle, and sweet puran poli.',
    price: 200,
    is_meal_package: false,
    dietary_tags: ['Jain Available', 'Less Spicy', 'Organic'],
    imagekit_image_url: 'food/veg-thali.jpg',
    is_active: true,
    display_order: 2,
  },
  {
    id: 'food-3',
    name: 'Konkan Chicken Sukka',
    category: 'Non-Veg',
    sub_category: 'Dinner',
    description: 'Tender country chicken slow-cooked with roasted spices and grated fresh coconut. Best paired with local rice bhakris or hot chapatis.',
    price: 280,
    is_meal_package: false,
    dietary_tags: ['Spicy'],
    imagekit_image_url: 'food/chicken-sukka.jpg',
    is_active: true,
    display_order: 3,
  },
  {
    id: 'food-4',
    name: 'Full Konkani Boarding Package',
    category: 'Meal Package',
    sub_category: 'Meal Package',
    description: 'All-inclusive boarding plan for 1 Guest. Covers morning tea/breakfast, full lunch (veg or non-veg/seafood options), high-tea with hot snacks, and dinner.',
    price: 900,
    is_meal_package: true,
    package_includes: ['Breakfast', 'Lunch', 'Evening High Tea', 'Dinner'],
    dietary_tags: ['Unlimited Rice', 'Veg / Non-Veg options'],
    imagekit_image_url: 'food/boarding-package.jpg',
    is_active: true,
    display_order: 4,
  },
];

export const mockGalleryItems: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Drone Shot of Homestay',
    category: 'Drone Shots',
    media_type: 'image',
    imagekit_url: 'gallery/drone-homestay.jpg',
    caption: 'Aerial view of our homestay nestled between dense plantations and the historic Tala Fort hills.',
    is_featured: true,
    is_active: true,
    display_order: 1,
  },
  {
    id: 'gal-2',
    title: 'Lapis Blue Swimming Pool',
    category: 'Pool',
    media_type: 'image',
    imagekit_url: 'gallery/pool-sunset.jpg',
    caption: 'Take a cooling dip in our crystal-clear pool, surrounded by mango orchards and coconut palms.',
    is_featured: true,
    is_active: true,
    display_order: 2,
  },
  {
    id: 'gal-3',
    title: 'Guest Cozy Campfire Night',
    category: 'Guest Photos',
    media_type: 'image',
    imagekit_url: 'gallery/campfire-guests.jpg',
    caption: 'Guests enjoying a musical campfire night under the starlit sky.',
    is_featured: true,
    is_active: true,
    display_order: 3,
  },
  {
    id: 'gal-4',
    title: 'Stunning sunset view from the lawn',
    category: 'Sunset Views',
    media_type: 'image',
    imagekit_url: 'gallery/lawn-sunset.jpg',
    caption: 'Catch beautiful orange sunsets directly from our manicured garden lawns.',
    is_featured: true,
    is_active: true,
    display_order: 4,
  },
  {
    id: 'gal-5',
    title: 'Inside the Executive AC Room',
    category: 'Rooms',
    media_type: 'image',
    imagekit_url: 'rooms/ac-room-cover.jpg',
    caption: 'Comfortable king-sized beds with crisp linen and luxury cushions.',
    is_featured: false,
    is_active: true,
    display_order: 5,
  },
  {
    id: 'gal-6',
    title: 'Konkani Solkadhi & Seafood Fry',
    category: 'Food',
    media_type: 'image',
    imagekit_url: 'food/surmai-thali.jpg',
    caption: 'Traditional Solkadhi drink and crisp Surmai fry served hot.',
    is_featured: false,
    is_active: true,
    display_order: 6,
  },
];

export const mockReviews: Review[] = [
  {
    id: 'rev-1',
    reviewer_name: 'Rajesh Kulkarni',
    reviewer_email: 'rajesh@gmail.com',
    rating: 5,
    review_text: 'Had an absolutely wonderful weekend. The swimming pool is very well maintained, clean, and the kids loved it. The host family served us outstanding fish curry and solkadhi. Tala Fort is just a short trek away. Highly recommended!',
    stay_date: '2026-05-12',
    room_type: 'Cozy Family Suite',
    is_approved: true,
    is_featured: true,
    source: 'Google',
    created_at: '2026-05-13T10:00:00Z',
  },
  {
    id: 'rev-2',
    reviewer_name: 'Anjali Sharma',
    reviewer_email: 'anjali@sharma.in',
    rating: 5,
    review_text: 'The best homestay near Tala Fort! Surrounded by nature, very peaceful. Rooms are clean and spacious. The highlight is their food - organic veg thali was full of authentic local flavors. Can\'t wait to visit again.',
    stay_date: '2026-06-02',
    room_type: 'Executive AC Room',
    is_approved: true,
    is_featured: true,
    source: 'Website',
    created_at: '2026-06-03T14:30:00Z',
  },
  {
    id: 'rev-3',
    reviewer_name: 'Vikram Singh',
    rating: 4,
    review_text: 'Excellent place for group outings. We stayed in the Heritage Group Villa, which was very spacious and right next to the pool. Direct WhatsApp booking made the process super smooth. Value for money.',
    stay_date: '2026-04-20',
    room_type: 'Heritage Group Villa',
    is_approved: true,
    is_featured: true,
    source: 'Google',
    created_at: '2026-04-21T08:15:00Z',
  },
];

export const mockInquiries: Inquiry[] = [
  {
    id: 'inq-1',
    name: 'Amit Patel',
    email: 'amit@patel.com',
    phone: '+919988776655',
    check_in_date: '2026-06-25',
    check_out_date: '2026-06-28',
    number_of_guests: 4,
    room_preference: 'Cozy Family Suite',
    special_requests: 'Require early check-in at 9 AM if possible. Also interested in local seafood dinners.',
    status: 'New',
    created_at: '2026-06-16T11:20:00Z',
  },
  {
    id: 'inq-2',
    name: 'Deepika Rao',
    email: 'deepika@outlook.com',
    phone: '+919876543219',
    check_in_date: '2026-07-02',
    check_out_date: '2026-07-04',
    number_of_guests: 2,
    room_preference: 'Executive AC Room',
    special_requests: 'Looking for a quiet room with strong WiFi. Celebrating husband\'s birthday.',
    status: 'Contacted',
    admin_notes: 'Spoke on WhatsApp. Shared menu card and room videos. Waiting for confirmation.',
    created_at: '2026-06-15T09:40:00Z',
  },
];

export const mockBanners: Banner[] = [
  {
    id: 'ban-1',
    image_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1920&q=80',
    title: 'Welcome to Purushottam Holiday Homestay',
    subtitle: 'Unwind in the Lap of Nature & Heritage',
    display_order: 1,
    is_active: true,
    created_at: '2026-06-16T12:00:00Z',
  },
  {
    id: 'ban-2',
    image_url: 'https://images.unsplash.com/photo-1596422846543-75c6fc18a523?w=1920&q=80',
    title: 'Lapis Blue Swimming Pool',
    subtitle: 'Take a cooling dip in our crystal-clear resort pool',
    display_order: 2,
    is_active: true,
    created_at: '2026-06-16T12:00:00Z',
  },
  {
    id: 'ban-3',
    image_url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1920&q=80',
    title: 'Premium Comfort Suites',
    subtitle: 'Spacious rooms surrounded by mango orchards & hills',
    display_order: 3,
    is_active: true,
    created_at: '2026-06-16T12:00:00Z',
  },
];

export const mockPoolShowcaseImages: PoolShowcaseImage[] = [
  { id: 'psi-1', image_url: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=600&auto=format&fit=crop&q=80', display_order: 1 },
  { id: 'psi-2', image_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80', display_order: 2 },
  { id: 'psi-3', image_url: 'https://images.unsplash.com/photo-1596422846543-75c6fc18a523?w=600&auto=format&fit=crop&q=80', display_order: 3 },
  { id: 'psi-4', image_url: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=600&auto=format&fit=crop&q=80', display_order: 4 }
];


