-- =========================================================================
-- PURUSHOTTAM HOLIDAY HOMESTAY - DATABASE SCHEMA & SEED CONFIGURATION
-- =========================================================================
-- This script sets up the tables, Row Level Security (RLS) policies,
-- triggers, and seed data for the Purushottam Holiday Homestay application.
-- Run this script inside the Supabase SQL Editor.

-- 1. Create Public Admin Profiles Table (admin_users)
create table public.admin_users (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  full_name text not null,
  role text not null check (role in ('admin', 'editor')),
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Site Settings Table
create table public.site_settings (
  id bigint primary key generated always as identity,
  property_name text not null,
  tagline text not null,
  phone_number text not null,
  whatsapp_number text not null,
  email text not null,
  address text not null,
  google_maps_embed_url text not null,
  google_maps_directions_url text not null,
  facebook_url text not null,
  instagram_url text not null,
  google_my_business_url text not null,
  google_reviews_embed_code text not null,
  hero_video_imagekit_url text not null,
  hero_title text not null,
  hero_subtitle text not null,
  seo_meta_title text not null,
  seo_meta_description text not null,
  seo_keywords text not null,
  favicon_imagekit_url text not null,
  logo_imagekit_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Rooms Table
create table public.rooms (
  id text not null primary key,
  name text not null,
  slug text not null unique,
  description text not null,
  short_description text not null,
  price_per_night numeric not null check (price_per_night >= 0),
  capacity integer not null check (capacity > 0),
  amenities text[] not null default '{}',
  imagekit_folder_path text,
  cover_image_url text not null,
  gallery_image_urls text[] not null default '{}',
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create Food Menu Items Table
create table public.food_menu_items (
  id text not null primary key,
  name text not null,
  category text not null check (category in ('Veg', 'Non-Veg', 'Seafood', 'Meal Package')),
  sub_category text not null,
  description text not null,
  price numeric check (price >= 0), -- Nullable for variable pricing
  is_meal_package boolean not null default false,
  package_includes text[] not null default '{}',
  dietary_tags text[] not null default '{}',
  imagekit_image_url text not null,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Create Sightseeing Attractions Table
create table public.attractions (
  id text not null primary key,
  name text not null,
  slug text not null unique,
  category text not null check (category in ('Nature', 'History', 'Adventure', 'Religious', 'Beach')),
  description text not null,
  distance_km numeric not null check (distance_km >= 0),
  travel_time text not null,
  best_time_to_visit text not null,
  imagekit_image_url text not null,
  google_maps_embed_url text,
  google_maps_directions_url text,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Create Gallery Items Table
create table public.gallery_items (
  id text not null primary key,
  title text not null,
  category text not null check (category in ('Property Exterior', 'Rooms', 'Pool', 'Food', 'Gardens', 'Sunset Views', 'Drone Shots', 'Guest Photos', 'Videos')),
  media_type text not null check (media_type in ('image', 'video')),
  imagekit_url text not null,
  imagekit_file_id text,
  thumbnail_url text,
  caption text,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  display_order integer not null default 0,
  uploaded_by uuid references public.admin_users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Create Reviews Table
create table public.reviews (
  id text not null primary key,
  reviewer_name text not null,
  reviewer_email text,
  rating integer not null check (rating >= 1 and rating <= 5),
  review_text text not null,
  stay_date text,
  room_type text,
  is_approved boolean not null default false,
  is_featured boolean not null default false,
  source text not null check (source in ('Website', 'Google', 'Manual')),
  google_review_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Create Inquiries Table
create table public.inquiries (
  id text not null primary key,
  name text not null,
  email text,
  phone text not null,
  check_in_date text not null,
  check_out_date text not null,
  number_of_guests integer not null check (number_of_guests > 0),
  room_preference text,
  special_requests text,
  status text not null check (status in ('New', 'Contacted', 'Confirmed', 'Cancelled')),
  admin_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =========================================================================
-- SECURITY AND ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

-- Enable RLS on all tables
alter table public.admin_users enable row level security;
alter table public.site_settings enable row level security;
alter table public.rooms enable row level security;
alter table public.food_menu_items enable row level security;
alter table public.attractions enable row level security;
alter table public.gallery_items enable row level security;
alter table public.reviews enable row level security;
alter table public.inquiries enable row level security;

-- Helper security functions
create or replace function public.is_active_staff()
returns boolean as $$
begin
  return exists (
    select 1 from public.admin_users
    where id = auth.uid() and is_active = true
  );
end;
$$ language plpgsql security definer;

create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.admin_users
    where id = auth.uid() and role = 'admin' and is_active = true
  );
end;
$$ language plpgsql security definer;

-- RLS Policies: admin_users (Staff Profiles)
create policy "Allow active staff to view all profiles"
  on public.admin_users for select
  using (public.is_active_staff());

create policy "Allow admins to manage all profiles"
  on public.admin_users for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Allow users to read their own profile"
  on public.admin_users for select
  using (auth.uid() = id);

-- RLS Policies: site_settings
create policy "Allow public to view site settings"
  on public.site_settings for select
  using (true);

create policy "Allow active staff to modify site settings"
  on public.site_settings for all
  using (public.is_active_staff())
  with check (public.is_active_staff());

-- RLS Policies: rooms
create policy "Allow public to view active rooms"
  on public.rooms for select
  using (is_active = true);

create policy "Allow active staff to view all rooms"
  on public.rooms for select
  using (public.is_active_staff());

create policy "Allow active staff to manage rooms"
  on public.rooms for all
  using (public.is_active_staff())
  with check (public.is_active_staff());

-- RLS Policies: food_menu_items
create policy "Allow public to view active food items"
  on public.food_menu_items for select
  using (is_active = true);

create policy "Allow active staff to view all food items"
  on public.food_menu_items for select
  using (public.is_active_staff());

create policy "Allow active staff to manage food items"
  on public.food_menu_items for all
  using (public.is_active_staff())
  with check (public.is_active_staff());

-- RLS Policies: attractions
create policy "Allow public to view active attractions"
  on public.attractions for select
  using (is_active = true);

create policy "Allow active staff to view all attractions"
  on public.attractions for select
  using (public.is_active_staff());

create policy "Allow active staff to manage attractions"
  on public.attractions for all
  using (public.is_active_staff())
  with check (public.is_active_staff());

-- RLS Policies: gallery_items
create policy "Allow public to view active gallery items"
  on public.gallery_items for select
  using (is_active = true);

create policy "Allow active staff to view all gallery items"
  on public.gallery_items for select
  using (public.is_active_staff());

create policy "Allow active staff to manage gallery items"
  on public.gallery_items for all
  using (public.is_active_staff())
  with check (public.is_active_staff());

-- RLS Policies: reviews
create policy "Allow public to view approved reviews"
  on public.reviews for select
  using (is_approved = true);

create policy "Allow public to submit reviews from website"
  on public.reviews for insert
  with check (true);

create policy "Allow active staff to view all reviews"
  on public.reviews for select
  using (public.is_active_staff());

create policy "Allow active staff to manage reviews"
  on public.reviews for all
  using (public.is_active_staff())
  with check (public.is_active_staff());

-- RLS Policies: inquiries
create policy "Allow public to submit inquiries"
  on public.inquiries for insert
  with check (true);

create policy "Allow active staff to manage inquiries"
  on public.inquiries for all
  using (public.is_active_staff())
  with check (public.is_active_staff());

-- =========================================================================
-- TRIGGERS: AUTOMATE PROFILE CREATION ON NEW AUTH SIGNUP
-- =========================================================================

-- Trigger function to automatically insert an editor profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.admin_users (id, email, full_name, role, is_active)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', substring(new.email from '^[^@]+')),
    'editor', -- Default role is editor. Admins can update this through UserManagement.
    true
  );
  return new;
end;
$$ language plpgsql security definer;

-- Attach trigger to auth.users table
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =========================================================================
-- DATABASE SEED DATA: POPULATE INITIAL CONTENT
-- =========================================================================

-- 1. Seed global site settings (Id always 1)
insert into public.site_settings (
  property_name, tagline, phone_number, whatsapp_number, email, address,
  google_maps_embed_url, google_maps_directions_url, facebook_url, instagram_url,
  google_my_business_url, google_reviews_embed_code, hero_video_imagekit_url,
  hero_title, hero_subtitle, seo_meta_title, seo_meta_description, seo_keywords,
  favicon_imagekit_url, logo_imagekit_url
) values (
  'Purushottam Holiday Homestay',
  'Experience Paradise in Tala',
  '+919860361361',
  '+919860361361',
  'purushottamholidays@gmail.com',
  'At Post Tala, Near Tala Fort, Raigad District, Maharashtra - 402111',
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3789.7029315367675!2d73.1234567!3d18.1234567!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTjCsDA3JzI0LjUiTiA3M8KwMDcnMjQuNSJFCg!5e0!3m2!1sen!2sin!4v1680000000000!5m2!1sen!2sin',
  'https://maps.app.goo.gl/y5R34J21H9x8z7A6',
  'https://facebook.com/purushottamholidays',
  'https://instagram.com/purushottam_holiday_homestay',
  'https://g.page/r/purushottam-holiday-homestay',
  '<div class="google-rating"><span class="text-xl font-bold text-amber-500">4.9 ★★★★★</span> <span class="text-sm opacity-80">(148 reviews on Google)</span></div>',
  'drone/homestay-drone-walkthrough.mp4',
  'Unwind in the Lap of Nature & Heritage',
  'A premium farmhouse homestay near Tala Fort with a crystal-clear swimming pool and authentic Konkani hospitality.',
  'Purushottam Holiday Homestay | Premium Farmhouse & Pool in Tala, Raigad',
  'Escape to Purushottam Holiday Homestay near Tala Fort. Enjoy lush greenery, a private swimming pool, home-cooked Konkani meals, and heritage tours.',
  'homestay tala, holiday homestay, tala fort hotel, raigad homestay, pool homestay konkan, farmhouse near tala',
  'site-assets/favicon.png',
  'site-assets/logo.png'
);

-- 2. Seed rooms
insert into public.rooms (
  id, name, slug, description, short_description, price_per_night, capacity,
  amenities, cover_image_url, gallery_image_urls, is_active, display_order
) values 
(
  'room-1',
  'Executive AC Room',
  'executive-ac-room',
  'Perfect for couples and small families. Enjoy premium air-conditioned comfort with a beautiful garden view, attached modern bathroom, smart TV, and ultra-high-speed Wi-Fi. Experience a relaxing vibe with high-quality linens and 24/7 hot water supply.',
  'Premium air-conditioned room with garden view, attached bath, and queen bed. Perfect for 2-3 guests.',
  2999,
  3,
  array['AC', 'TV', 'WiFi', 'Hot Water', 'Attached Bathroom', 'Room Service', 'Parking'],
  'rooms/ac-room-cover.jpg',
  array['rooms/ac-room-cover.jpg', 'rooms/ac-room-bed.jpg', 'rooms/ac-room-bath.jpg'],
  true,
  1
),
(
  'room-2',
  'Cozy Family Suite',
  'cozy-family-suite',
  'Generously spacious suite designed for families. Features two large double beds, a cozy seating area, separate vanity space, full air conditioning, and dual balconies overlooking the swimming pool. Packed with high-end amenities to make your family stay memorable.',
  'Spacious air-conditioned suite with 2 double beds, seating lounge, and pool-view balconies. Ideal for 4-5 guests.',
  4499,
  5,
  array['AC', 'TV', 'WiFi', 'Hot Water', 'Attached Bathroom', 'Balcony', 'Room Service', 'Parking'],
  'rooms/family-room-cover.jpg',
  array['rooms/family-room-cover.jpg', 'rooms/family-room-bed.jpg', 'rooms/family-room-balcony.jpg'],
  true,
  2
),
(
  'room-3',
  'Heritage Group Villa',
  'heritage-group-villa',
  'Live like royalty in our massive group villa. Perfectly tailored for groups of friends or corporate retreats. Accommodates up to 10 guests with comfortable multiple sleeping layouts, an expansive common veranda, outdoor sit-outs, and direct swimming pool access.',
  'Lush group cottage that easily sleeps 10 guests. Features a large common veranda, pool access, and dynamic seating.',
  7999,
  10,
  array['AC', 'WiFi', 'Hot Water', 'Attached Bathroom', 'Pool Access', 'Group Sit-out', 'Parking'],
  'rooms/group-villa-cover.jpg',
  array['rooms/group-villa-cover.jpg', 'rooms/group-villa-interior.jpg', 'rooms/group-villa-veranda.jpg'],
  true,
  3
);

-- 3. Seed food items
insert into public.food_menu_items (
  id, name, category, sub_category, description, price, is_meal_package,
  package_includes, dietary_tags, imagekit_image_url, is_active, display_order
) values
(
  'food-1',
  'Surmai Fish Thali',
  'Seafood',
  'Lunch',
  'Authentic Konkani style thali containing fresh Surmai fry, rich fish curry cooked in coconut milk, Solkadhi, organic rice, and hand-rolled bhakri.',
  350,
  false,
  array[]::text[],
  array['Local Specialty', 'Spicy'],
  'food/surmai-thali.jpg',
  true,
  1
),
(
  'food-2',
  'Organic Veg Thali',
  'Veg',
  'Lunch',
  'Prepared using vegetables freshly plucked from our organic farm. Includes two seasonal sabzis, varan-bhat, chapatis, salad, pickle, and sweet puran poli.',
  200,
  false,
  array[]::text[],
  array['Jain Available', 'Less Spicy', 'Organic'],
  'food/veg-thali.jpg',
  true,
  2
),
(
  'food-3',
  'Konkan Chicken Sukka',
  'Non-Veg',
  'Dinner',
  'Tender country chicken slow-cooked with roasted spices and grated fresh coconut. Best paired with local rice bhakris or hot chapatis.',
  280,
  false,
  array[]::text[],
  array['Spicy'],
  'food/chicken-sukka.jpg',
  true,
  3
),
(
  'food-4',
  'Full Konkani Boarding Package',
  'Meal Package',
  'Meal Package',
  'All-inclusive boarding plan for 1 Guest. Covers morning tea/breakfast, full lunch (veg or non-veg/seafood options), high-tea with hot snacks, and dinner.',
  900,
  true,
  array['Breakfast', 'Lunch', 'Evening High Tea', 'Dinner'],
  array['Unlimited Rice', 'Veg / Non-Veg options'],
  'food/boarding-package.jpg',
  true,
  4
);

-- 4. Seed attractions
insert into public.attractions (
  id, name, slug, category, description, distance_km, travel_time,
  best_time_to_visit, imagekit_image_url, google_maps_directions_url, is_active, display_order
) values
(
  'att-1',
  'Tala Fort',
  'tala-fort',
  'History',
  'A historic hill fort built in the 4th century, offering panoramic views of the Rajpuri creek and surrounding valleys. It was captured by Shivaji Maharaj and is popular for trekking.',
  2.5,
  '10 min by car',
  'Monsoon & Winter (July to February)',
  'attractions/tala-fort.jpg',
  'https://maps.google.com/?q=Tala+Fort+Raigad',
  true,
  1
),
(
  'att-2',
  'Mandad Fort & Bridge',
  'mandad-fort',
  'History',
  'An ancient hill fort situated near Mandad village. The scenic drive across the Mandad River bridge is breath-taking, with dense mangroves on both sides.',
  11.2,
  '20 min by car',
  'October to March',
  'attractions/mandad-bridge.jpg',
  'https://maps.google.com/?q=Mandad+Fort+Raigad',
  true,
  2
),
(
  'att-3',
  'Kuda Buddhist Caves',
  'kuda-caves',
  'History',
  'A group of 26 rock-cut Buddhist caves dating back to the 1st century BC. Features beautiful carvings, inscriptions, and stupas overlooking the Arabian Sea creeks.',
  18.0,
  '35 min by car',
  'Morning hours year-round',
  'attractions/kuda-caves.jpg',
  'https://maps.google.com/?q=Kuda+Caves+Raigad',
  true,
  3
),
(
  'att-4',
  'Murud Janjira Sea Fort',
  'janjira-fort',
  'Adventure',
  'An undefeated marine fort situated on an island off the coastal town of Murud. Reachable only by traditional sailboats from Rajapuri jetty.',
  34.5,
  '1 hour by car',
  'October to May (Ferry operations close in monsoon)',
  'attractions/janjira-fort.jpg',
  'https://maps.google.com/?q=Murud+Janjira+Fort',
  true,
  4
);

-- 5. Seed gallery items
insert into public.gallery_items (
  id, title, category, media_type, imagekit_url, caption, is_featured, is_active, display_order
) values
(
  'gal-1',
  'Drone Shot of Homestay',
  'Drone Shots',
  'image',
  'gallery/drone-homestay.jpg',
  'Aerial view of our homestay nestled between dense plantations and the historic Tala Fort hills.',
  true,
  true,
  1
),
(
  'gal-2',
  'Lapis Blue Swimming Pool',
  'Pool',
  'image',
  'gallery/pool-sunset.jpg',
  'Take a cooling dip in our crystal-clear pool, surrounded by mango orchards and coconut palms.',
  true,
  true,
  2
),
(
  'gal-3',
  'Guest Cozy Campfire Night',
  'Guest Photos',
  'image',
  'gallery/campfire-guests.jpg',
  'Guests enjoying a musical campfire night under the starlit sky.',
  true,
  true,
  3
),
(
  'gal-4',
  'Stunning sunset view from the lawn',
  'Sunset Views',
  'image',
  'gallery/lawn-sunset.jpg',
  'Catch beautiful orange sunsets directly from our manicured garden lawns.',
  true,
  true,
  4
),
(
  'gal-5',
  'Inside the Executive AC Room',
  'Rooms',
  'image',
  'rooms/ac-room-cover.jpg',
  'Comfortable king-sized beds with crisp linen and luxury cushions.',
  false,
  true,
  5
),
(
  'gal-6',
  'Konkani Solkadhi & Seafood Fry',
  'Food',
  'image',
  'food/surmai-thali.jpg',
  'Traditional Solkadhi drink and crisp Surmai fry served hot.',
  false,
  true,
  6
);

-- 6. Seed reviews (Default reviews approved by default)
insert into public.reviews (
  id, reviewer_name, reviewer_email, rating, review_text, stay_date, room_type,
  is_approved, is_featured, source, created_at
) values
(
  'rev-1',
  'Rajesh Kulkarni',
  'rajesh@gmail.com',
  5,
  'Had an absolutely wonderful weekend. The swimming pool is very well maintained, clean, and the kids loved it. The host family served us outstanding fish curry and solkadhi. Tala Fort is just a short trek away. Highly recommended!',
  '2026-05-12',
  'Cozy Family Suite',
  true,
  true,
  'Google',
  '2026-05-13T10:00:00Z'
),
(
  'rev-2',
  'Anjali Sharma',
  'anjali@sharma.in',
  5,
  'The best homestay near Tala Fort! Surrounded by nature, very peaceful. Rooms are clean and spacious. The highlight is their food - organic veg thali was full of authentic local flavors. Can''t wait to visit again.',
  '2026-06-02',
  'Executive AC Room',
  true,
  true,
  'Website',
  '2026-06-03T14:30:00Z'
),
(
  'rev-3',
  'Vikram Singh',
  'vikram@singh.com',
  4,
  'Excellent place for group outings. We stayed in the Heritage Group Villa, which was very spacious and right next to the pool. Direct WhatsApp booking made the process super smooth. Value for money.',
  '2026-04-20',
  'Heritage Group Villa',
  true,
  true,
  'Google',
  '2026-04-21T08:15:00Z'
);

-- 7. Seed inquiries
insert into public.inquiries (
  id, name, email, phone, check_in_date, check_out_date, number_of_guests,
  room_preference, special_requests, status, created_at
) values
(
  'inq-1',
  'Amit Patel',
  'amit@patel.com',
  '+919988776655',
  '2026-06-25',
  '2026-06-28',
  4,
  'Cozy Family Suite',
  'Require early check-in at 9 AM if possible. Also interested in local seafood dinners.',
  'New',
  '2026-06-16T11:20:00Z'
),
(
  'inq-2',
  'Deepika Rao',
  'deepika@outlook.com',
  '+919876543219',
  '2026-07-02',
  '2026-07-04',
  2,
  'Executive AC Room',
  'Looking for a quiet room with strong WiFi. Celebrating husband''s birthday.',
  'Contacted',
  '2026-06-15T09:40:00Z'
);

-- =========================================================================
-- SUPPLEMENTARY SETUP: IMAGEKIT UPLOAD AUTH SIGNATURE (SUPABASE EDGE FUNCTION)
-- =========================================================================
-- To enable secure, direct-from-client uploads in your Admin Panel:
-- 
-- 1. Install Supabase CLI locally.
-- 2. Run: `supabase functions new imagekit-auth`
-- 3. Replace the function's `index.ts` content with the TypeScript code below.
-- 4. Set your private key secret in Supabase:
--    `supabase secrets set IMAGEKIT_PRIVATE_KEY="private_0mnLDWEVDpZ0sLzQ6W2YzwhPI+E="`
-- 5. Deploy the function: `supabase functions deploy imagekit-auth`
-- 
-- REFERENCE CODE FOR `supabase/functions/imagekit-auth/index.ts`:
/*
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import CryptoJS from "https://esm.sh/crypto-js@4.1.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const privateKey = Deno.env.get('IMAGEKIT_PRIVATE_KEY');
    if (!privateKey) {
      throw new Error('IMAGEKIT_PRIVATE_KEY secret is not configured in Supabase.');
    }

    const token = crypto.randomUUID();
    const expire = Math.floor(Date.now() / 1000) + 1800; // expires in 30 minutes
    const signature = CryptoJS.HmacSHA1(token + expire, privateKey).toString();

    return new Response(
      JSON.stringify({ token, expire, signature }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
*/


-- =========================================================================
-- BANNER IMAGES TABLE DEFINITION
-- =========================================================================

-- Create banners table for homepage hero slider
create table if not exists public.banners (
  id uuid default gen_random_uuid() primary key,
  image_url text not null,
  imagekit_file_id text,
  title text,
  subtitle text,
  display_order integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on banners
alter table public.banners enable row level security;

-- Policies for banners
create policy "Allow public read access to active banners"
  on public.banners for select
  using (is_active = true);

create policy "Allow staff write access to banners"
  on public.banners for all
  using (
    exists (
      select 1 from public.admin_users
      where id = auth.uid() and is_active = true
    )
  );

-- Seed initial banners
insert into public.banners (image_url, title, subtitle, display_order) values
('https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1920&q=80', 'Welcome to Purushottam Holiday Homestay', 'Unwind in the Lap of Nature & Heritage', 1),
('https://images.unsplash.com/photo-1596422846543-75c6fc18a523?w=1920&q=80', 'Lapis Blue Swimming Pool', 'Take a cooling dip in our crystal-clear resort pool', 2),
('https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1920&q=80', 'Premium Comfort Suites', 'Spacious rooms surrounded by mango orchards & hills', 3);


-- =========================================================================
-- HOMEPAGE SHOWCASE (POOL SHOWCASE) DEFINITION
-- =========================================================================

-- Alter site_settings to support pool showcase configuration
alter table public.site_settings add column if not exists show_pool_showcase boolean not null default true;
alter table public.site_settings add column if not exists pool_showcase_title text not null default 'Take a Dip in Paradise';
alter table public.site_settings add column if not exists pool_showcase_description text not null default 'Unwind from the city chaos inside our pristine, lapis-blue swimming pool. Surrounded by organic mango plantations, towering coconut trees, and quiet seating niches, it''s the perfect spot to spend your afternoon.';
alter table public.site_settings add column if not exists pool_showcase_tags text[] not null default array['Crystal-Clear Water', 'Poolside Orchard Sit-outs', 'Safe Kids Deck Area'];

-- Create pool showcase images table
create table if not exists public.pool_showcase_images (
  id uuid default gen_random_uuid() primary key,
  image_url text not null,
  imagekit_file_id text,
  display_order integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on pool showcase images
alter table public.pool_showcase_images enable row level security;

-- Policies for pool showcase images
create policy "Allow public to view pool showcase images"
  on public.pool_showcase_images for select
  using (true);

create policy "Allow active staff to manage pool showcase images"
  on public.pool_showcase_images for all
  using (
    exists (
      select 1 from public.admin_users
      where id = auth.uid() and is_active = true
    )
  );

-- Seed initial pool showcase images
insert into public.pool_showcase_images (image_url, display_order) values
('https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=600&auto=format&fit=crop&q=80', 1),
('https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80', 2),
('https://images.unsplash.com/photo-1596422846543-75c6fc18a523?w=600&auto=format&fit=crop&q=80', 3),
('https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=600&auto=format&fit=crop&q=80', 4);



