-- HvacPass Database Schema
-- Version: 1.0.0
-- Description: Initial schema for HVAC Field Service Management application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUMS
CREATE TYPE user_role AS ENUM ('admin', 'installer');
CREATE TYPE work_order_status AS ENUM ('draft', 'in_progress', 'completed', 'cancelled');
CREATE TYPE work_order_type AS ENUM ('install', 'service', 'warranty');
CREATE TYPE photo_type AS ENUM ('protection', 'technical', 'final', 'cleaning');

-- COMPANIES (Tenants/Multi-tenancy)
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  tax_id TEXT UNIQUE,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROFILES (User Extension with role and company)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'installer',
  phone TEXT,
  avatar_url TEXT,
  preferred_lang TEXT DEFAULT 'pl',
  license_number TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CUSTOMERS
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'PL',
  phone TEXT,
  email TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- UNITS (HVAC Equipment linked to customers)
CREATE TABLE units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  qr_code_id TEXT UNIQUE NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  serial_number TEXT,
  install_date DATE,
  install_params JSONB DEFAULT '{}',
  warranty_until DATE,
  last_service_date DATE,
  status TEXT DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- WORK ORDERS
CREATE TABLE work_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
  installer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  status work_order_status DEFAULT 'draft',
  type work_order_type NOT NULL,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  paused_duration INTERVAL DEFAULT '00:00:00',
  gps_start POINT,
  gps_end POINT,
  address_override TEXT,
  notes TEXT,
  internal_notes TEXT,
  customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
  customer_feedback TEXT,
  customer_signature TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PHOTOS with AI-ready metadata
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  type photo_type NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT,
  file_size INTEGER,
  width INTEGER,
  height INTEGER,
  mime_type TEXT DEFAULT 'image/jpeg',
  capture_timestamp TIMESTAMPTZ DEFAULT NOW(),
  gps_coords POINT,
  device_info JSONB DEFAULT '{}',
  light_conditions TEXT,
  ai_analysis JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES for performance
CREATE INDEX idx_profiles_company ON profiles(company_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_customers_company ON customers(company_id);
CREATE INDEX idx_units_customer ON units(customer_id);
CREATE INDEX idx_units_qr_code ON units(qr_code_id);
CREATE INDEX idx_units_brand ON units(brand);
CREATE INDEX idx_work_orders_unit ON work_orders(unit_id);
CREATE INDEX idx_work_orders_installer ON work_orders(installer_id);
CREATE INDEX idx_work_orders_status ON work_orders(status);
CREATE INDEX idx_work_orders_created ON work_orders(created_at DESC);
CREATE INDEX idx_work_orders_active ON work_orders(installer_id, status) WHERE status = 'in_progress';
CREATE INDEX idx_photos_work_order ON photos(work_order_id);
CREATE INDEX idx_photos_type ON photos(type);

-- FUNCTIONS

-- Auto-generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'WO-' || TO_CHAR(NOW(), 'YYYYMM') || '-' || RIGHT(REPLACE(NEW.id::TEXT, '-', ''), 6);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for order number generation
CREATE TRIGGER set_order_number
  BEFORE INSERT ON work_orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_order_number();

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_units_updated_at
  BEFORE UPDATE ON units
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_work_orders_updated_at
  BEFORE UPDATE ON work_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS POLICIES

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Helper function to get user's company
CREATE OR REPLACE FUNCTION get_user_company_id(user_id UUID)
RETURNS UUID AS $$
  SELECT company_id FROM profiles WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_user_admin(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT role = 'admin' FROM profiles WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER;

-- COMPANIES POLICIES
CREATE POLICY "Users can view their company"
  ON companies FOR SELECT
  USING (id = get_user_company_id(auth.uid()));

CREATE POLICY "Admins can update their company"
  ON companies FOR UPDATE
  USING (id = get_user_company_id(auth.uid()) AND is_user_admin(auth.uid()));

-- PROFILES POLICIES
CREATE POLICY "Users can view company profiles"
  ON profiles FOR SELECT
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Admins can insert new installers"
  ON profiles FOR INSERT
  WITH CHECK (company_id = get_user_company_id(auth.uid()) AND is_user_admin(auth.uid()));

-- CUSTOMERS POLICIES
CREATE POLICY "Users can CRUD company customers"
  ON customers FOR ALL
  USING (company_id = get_user_company_id(auth.uid()));

-- UNITS POLICIES
CREATE POLICY "Users can CRUD company units"
  ON units FOR ALL
  USING (customer_id IN (SELECT id FROM customers WHERE company_id = get_user_company_id(auth.uid())));

CREATE POLICY "Users can view units by QR code"
  ON units FOR SELECT
  USING (customer_id IN (SELECT id FROM customers WHERE company_id = get_user_company_id(auth.uid())));

-- WORK ORDERS POLICIES
CREATE POLICY "Installers can view own work orders"
  ON work_orders FOR SELECT
  USING (
    installer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'admin'
        AND p.company_id = (
          SELECT company_id FROM profiles WHERE id = work_orders.installer_id
        )
    )
  );

CREATE POLICY "Installers can create work orders"
  ON work_orders FOR INSERT
  WITH CHECK (installer_id = auth.uid());

CREATE POLICY "Installers can update own work orders"
  ON work_orders FOR UPDATE
  USING (installer_id = auth.uid());

CREATE POLICY "Admins can view all company work orders"
  ON work_orders FOR SELECT
  USING (get_user_company_id(auth.uid()) = (
    SELECT company_id FROM profiles WHERE id = work_orders.installer_id
  ));

-- PHOTOS POLICIES
CREATE POLICY "Users can view photos from accessible work orders"
  ON photos FOR SELECT
  USING (work_order_id IN (
    SELECT id FROM work_orders WHERE installer_id = auth.uid()
  ));

CREATE POLICY "Users can upload photos to own work orders"
  ON photos FOR INSERT
  WITH CHECK (work_order_id IN (
    SELECT id FROM work_orders WHERE installer_id = auth.uid()
  ));

CREATE POLICY "Users can delete own photos"
  ON photos FOR DELETE
  USING (work_order_id IN (
    SELECT id FROM work_orders WHERE installer_id = auth.uid()
  ));

-- STORAGE POLICIES
CREATE POLICY "Users can upload photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'hvac_photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can view photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'hvac_photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own photos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'hvac_photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete own photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'hvac_photos' AND auth.uid() IS NOT NULL);

-- Create storage bucket for photos (run manually in Supabase dashboard if needed)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('hvac_photos', 'hvac_photos', false);

-- SEED DATA for testing (optional - remove in production)
-- INSERT INTO companies (name, tax_id) VALUES ('Test Company', '1234567890');
