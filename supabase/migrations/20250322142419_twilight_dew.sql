/*
  # Initial Schema Setup for MechConnect

  1. New Tables
    - profiles
      - Basic user profile information
      - Stores user type and contact details
    
    - vehicles
      - Client vehicle information
      - Links to client profiles
    
    - service_requests
      - Maintenance service requests from clients
      - Links vehicles and includes service details
    
    - mechanic_profiles
      - Detailed information about mechanic businesses
      - Services offered and operating hours
    
    - service_proposals
      - Proposals from mechanics for service requests
      - Includes pricing and details
    
    - tow_truck_profiles
      - Tow truck service provider information
      - Pricing and coverage area
    
    - insurance_profiles
      - Insurance company information
      - Coverage options and contact details

  2. Security
    - Enable RLS on all tables
    - Add policies for data access control
*/

-- Create distance calculation function
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 DECIMAL,
  lon1 DECIMAL,
  lat2 DECIMAL,
  lon2 DECIMAL
)
RETURNS DECIMAL
LANGUAGE plpgsql
AS $$
DECLARE
  R DECIMAL := 6371; -- Earth's radius in kilometers
  dLat DECIMAL;
  dLon DECIMAL;
  a DECIMAL;
  c DECIMAL;
BEGIN
  -- Convert degrees to radians
  dLat := radians(lat2 - lat1);
  dLon := radians(lon2 - lon1);
  
  -- Haversine formula
  a := sin(dLat/2) * sin(dLat/2) +
       cos(radians(lat1)) * cos(radians(lat2)) *
       sin(dLon/2) * sin(dLon/2);
  
  c := 2 * asin(sqrt(a));
  
  RETURN R * c;
END;
$$;

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  user_type TEXT NOT NULL CHECK (user_type IN ('client', 'mechanic', 'towtruck', 'insurance')),
  full_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create vehicles table
CREATE TABLE vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES profiles(id) NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  license_plate TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create service_requests table
CREATE TABLE service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES profiles(id) NOT NULL,
  vehicle_id uuid REFERENCES vehicles(id) NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  latitude DECIMAL,
  longitude DECIMAL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create mechanic_profiles table
CREATE TABLE mechanic_profiles (
  id uuid PRIMARY KEY REFERENCES profiles(id),
  business_name TEXT NOT NULL,
  business_hours JSONB NOT NULL,
  services_offered JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create service_proposals table
CREATE TABLE service_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES service_requests(id) NOT NULL,
  mechanic_id uuid REFERENCES mechanic_profiles(id) NOT NULL,
  price DECIMAL NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create tow_truck_profiles table
CREATE TABLE tow_truck_profiles (
  id uuid PRIMARY KEY REFERENCES profiles(id),
  company_name TEXT NOT NULL,
  price_per_km DECIMAL NOT NULL,
  base_fee DECIMAL NOT NULL,
  coverage_radius INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create insurance_profiles table
CREATE TABLE insurance_profiles (
  id uuid PRIMARY KEY REFERENCES profiles(id),
  company_name TEXT NOT NULL,
  coverage_options JSONB NOT NULL,
  partner_mechanics JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE mechanic_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tow_truck_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Clients can manage their vehicles"
  ON vehicles FOR ALL
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Clients can create and view their service requests"
  ON service_requests FOR ALL
  TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "Mechanics can view service requests within 30km"
  ON service_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles mechanic_profile
      WHERE mechanic_profile.id = auth.uid()
      AND mechanic_profile.user_type = 'mechanic'
      AND (
        CASE 
          WHEN service_requests.latitude IS NOT NULL 
               AND service_requests.longitude IS NOT NULL 
               AND mechanic_profile.latitude IS NOT NULL 
               AND mechanic_profile.longitude IS NOT NULL
          THEN calculate_distance(
            mechanic_profile.latitude,
            mechanic_profile.longitude,
            service_requests.latitude,
            service_requests.longitude
          ) <= 30
          ELSE false
        END
      )
    )
  );

CREATE POLICY "Mechanics can manage their profiles"
  ON mechanic_profiles FOR ALL
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Mechanics can manage their proposals"
  ON service_proposals FOR ALL
  TO authenticated
  USING (mechanic_id = auth.uid());

CREATE POLICY "Tow trucks can manage their profiles"
  ON tow_truck_profiles FOR ALL
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Insurance companies can manage their profiles"
  ON insurance_profiles FOR ALL
  TO authenticated
  USING (id = auth.uid());