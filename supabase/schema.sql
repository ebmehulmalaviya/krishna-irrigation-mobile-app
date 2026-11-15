-- ====================================================================
-- KRISHNA IRRIGATION (કૃષ્ણા ઇરિગેશન) - SUPABASE POSTGRESQL SCHEMA
-- Agricultural Irrigation Products & Rate Management System
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')) DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 3. Categories Table (Supports Unlimited Nested Subcategories via parent_id)
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_en TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  color TEXT DEFAULT '#dcfce7',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_categories_parent ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_order ON public.categories(display_order);

-- 4. Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  subcategory_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  name_en TEXT,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON public.products(subcategory_id);

-- 5. Product Variants (Sizes, Rates & Stock)
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size TEXT NOT NULL, -- e.g. "0.5\"", "1\"", "2\"", "2.5\"", "3\""
  purchase_rate NUMERIC(12, 2) NOT NULL DEFAULT 0,
  selling_rate NUMERIC(12, 2) NOT NULL DEFAULT 0,
  opening_stock INT NOT NULL DEFAULT 0,
  current_stock INT NOT NULL DEFAULT 0,
  low_stock_limit INT NOT NULL DEFAULT 10,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_variants_product ON public.product_variants(product_id);

-- 6. Purchases Table (Stock In)
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_name TEXT,
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.purchase_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_id UUID NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE RESTRICT,
  quantity INT NOT NULL CHECK (quantity > 0),
  purchase_rate NUMERIC(12, 2) NOT NULL CHECK (purchase_rate >= 0),
  total_amount NUMERIC(12, 2) NOT NULL
);

-- 7. Sales Table (Stock Out)
CREATE TABLE IF NOT EXISTS public.sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name TEXT,
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.sale_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE RESTRICT,
  quantity INT NOT NULL CHECK (quantity > 0),
  selling_rate NUMERIC(12, 2) NOT NULL CHECK (selling_rate >= 0),
  total_amount NUMERIC(12, 2) NOT NULL
);

-- 8. Stock Transactions Audit Log
CREATE TABLE IF NOT EXISTS public.stock_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('opening', 'purchase', 'sale', 'adjustment')),
  quantity INT NOT NULL, -- positive for in, negative for out
  reference_id UUID,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_stock_trans_variant ON public.stock_transactions(variant_id);

-- ====================================================================
-- STORED PROCEDURES / FUNCTIONS FOR ATOMIC STOCK OPERATIONS
-- ====================================================================

-- Function: Atomic Stock In / Purchase
CREATE OR REPLACE FUNCTION record_purchase_entry(
  p_variant_id UUID,
  p_quantity INT,
  p_purchase_rate NUMERIC,
  p_supplier_name TEXT,
  p_notes TEXT,
  p_created_by UUID
) RETURNS UUID AS $$
DECLARE
  v_purchase_id UUID;
  v_total NUMERIC;
BEGIN
  v_total := p_quantity * p_purchase_rate;
  
  -- 1. Create Purchase Record
  INSERT INTO public.purchases (supplier_name, purchase_date, total_amount, notes, created_by)
  VALUES (p_supplier_name, CURRENT_DATE, v_total, p_notes, p_created_by)
  RETURNING id INTO v_purchase_id;

  -- 2. Insert Item
  INSERT INTO public.purchase_items (purchase_id, variant_id, quantity, purchase_rate, total_amount)
  VALUES (v_purchase_id, p_variant_id, p_quantity, p_purchase_rate, v_total);

  -- 3. Increase Stock and update purchase rate
  UPDATE public.product_variants
  SET current_stock = current_stock + p_quantity,
      purchase_rate = p_purchase_rate
  WHERE id = p_variant_id;

  -- 4. Audit Log
  INSERT INTO public.stock_transactions (variant_id, transaction_type, quantity, reference_id, notes, created_by)
  VALUES (p_variant_id, 'purchase', p_quantity, v_purchase_id, p_notes, p_created_by);

  RETURN v_purchase_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Atomic Sale / Stock Out with Availability Check
CREATE OR REPLACE FUNCTION record_sale_entry(
  p_variant_id UUID,
  p_quantity INT,
  p_selling_rate NUMERIC,
  p_customer_name TEXT,
  p_notes TEXT,
  p_created_by UUID
) RETURNS UUID AS $$
DECLARE
  v_sale_id UUID;
  v_total NUMERIC;
  v_current_stock INT;
BEGIN
  -- Check available stock
  SELECT current_stock INTO v_current_stock
  FROM public.product_variants
  WHERE id = p_variant_id;

  IF v_current_stock < p_quantity THEN
    RAISE EXCEPTION 'અપૂરતો સ્ટોક! હાલનો સ્ટોક: %, માંગેલ સ્ટોક: %', v_current_stock, p_quantity;
  END IF;

  v_total := p_quantity * p_selling_rate;

  -- 1. Create Sale Record
  INSERT INTO public.sales (customer_name, sale_date, total_amount, notes, created_by)
  VALUES (p_customer_name, CURRENT_DATE, v_total, p_notes, p_created_by)
  RETURNING id INTO v_sale_id;

  -- 2. Insert Item
  INSERT INTO public.sale_items (sale_id, variant_id, quantity, selling_rate, total_amount)
  VALUES (v_sale_id, p_variant_id, p_quantity, p_selling_rate, v_total);

  -- 3. Deduct Stock
  UPDATE public.product_variants
  SET current_stock = current_stock - p_quantity
  WHERE id = p_variant_id;

  -- 4. Audit Log
  INSERT INTO public.stock_transactions (variant_id, transaction_type, quantity, reference_id, notes, created_by)
  VALUES (p_variant_id, 'sale', -p_quantity, v_sale_id, p_notes, p_created_by);

  RETURN v_sale_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_transactions ENABLE ROW LEVEL SECURITY;

-- Helper function: Is user admin?
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Categories: Anyone can read active categories; Admins have full access
CREATE POLICY "Public read active categories" ON public.categories
  FOR SELECT USING (is_active = TRUE OR is_admin());
CREATE POLICY "Admin manage categories" ON public.categories
  FOR ALL USING (is_admin());

-- Products: Anyone can read active products; Admins have full access
CREATE POLICY "Public read active products" ON public.products
  FOR SELECT USING (is_active = TRUE OR is_admin());
CREATE POLICY "Admin manage products" ON public.products
  FOR ALL USING (is_admin());

-- Product Variants: Anyone can read active variants; Admins have full access
CREATE POLICY "Public read active variants" ON public.product_variants
  FOR SELECT USING (is_active = TRUE OR is_admin());
CREATE POLICY "Admin manage variants" ON public.product_variants
  FOR ALL USING (is_admin());

-- Purchases, Sales, Transactions: Admin Only
CREATE POLICY "Admin view purchases" ON public.purchases FOR ALL USING (is_admin());
CREATE POLICY "Admin view purchase_items" ON public.purchase_items FOR ALL USING (is_admin());
CREATE POLICY "Admin view sales" ON public.sales FOR ALL USING (is_admin());
CREATE POLICY "Admin view sale_items" ON public.sale_items FOR ALL USING (is_admin());
CREATE POLICY "Admin view stock_transactions" ON public.stock_transactions FOR ALL USING (is_admin());

-- ====================================================================
-- SEED INITIAL DATA (AUTHENTIC GUJARATI IRRIGATION PRODUCTS)
-- ====================================================================
DO $$
DECLARE
  v_cat_valves UUID;
  v_cat_union UUID;
  v_cat_upvc UUID;
  v_cat_drip UUID;
  v_cat_sprinkler UUID;
  v_cat_mini_sprinkler UUID;
  v_cat_rainpipe UUID;
  v_cat_filters UUID;
  
  v_prod_union_plain UUID;
  v_prod_union_thread UUID;
  v_prod_upvc_ball UUID;
  v_prod_drip_lateral UUID;
  v_prod_raingun UUID;
  v_prod_disc_filter UUID;
BEGIN
  -- 1. Main Categories
  INSERT INTO public.categories (name, name_en, display_order, is_active, color)
  VALUES ('એગ્રીકલ્ચર વાલ્વ', 'Agriculture Valves', 1, TRUE, '#dcfce7')
  RETURNING id INTO v_cat_valves;

  INSERT INTO public.categories (name, name_en, display_order, is_active, color)
  VALUES ('ડ્રિપ ફિટિંગ્સ', 'Drip Fittings', 2, TRUE, '#e0f2fe')
  RETURNING id INTO v_cat_drip;

  INSERT INTO public.categories (name, name_en, display_order, is_active, color)
  VALUES ('સ્પ્રિંકલર ફિટિંગ્સ', 'Sprinkler Fittings', 3, TRUE, '#fef3c7')
  RETURNING id INTO v_cat_sprinkler;

  INSERT INTO public.categories (name, name_en, display_order, is_active, color)
  VALUES ('મીની સ્પ્રિંકલર ફિટિંગ્સ', 'Mini Sprinkler Fittings', 4, TRUE, '#f3e8ff')
  RETURNING id INTO v_cat_mini_sprinkler;

  INSERT INTO public.categories (name, name_en, display_order, is_active, color)
  VALUES ('રેઇન પાઇપ ફિટિંગ્સ', 'Rain Pipe Fittings', 5, TRUE, '#ffe4e6')
  RETURNING id INTO v_cat_rainpipe;

  INSERT INTO public.categories (name, name_en, display_order, is_active, color)
  VALUES ('ફિલ્ટરેશન સિસ્ટમ્સ', 'Filtration Systems', 6, TRUE, '#d1fae5')
  RETURNING id INTO v_cat_filters;

  -- 2. Nested Subcategories under Agriculture Valves
  INSERT INTO public.categories (name, name_en, parent_id, display_order, is_active, color)
  VALUES ('યુનિયન વાલ્વ', 'Union Valve', v_cat_valves, 1, TRUE, '#ecfdf5')
  RETURNING id INTO v_cat_union;

  INSERT INTO public.categories (name, name_en, parent_id, display_order, is_active, color)
  VALUES ('UPVC બોલ વાલ્વ', 'UPVC Ball Valve', v_cat_valves, 2, TRUE, '#ecfdf5')
  RETURNING id INTO v_cat_upvc;

  -- 3. Products: યુનિયન વાલ્વ પ્લેન (Matches Screenshot 1 UI)
  INSERT INTO public.products (category_id, subcategory_id, name, name_en, description, is_active)
  VALUES (v_cat_valves, v_cat_union, 'યુનિયન વાલ્વ પ્લેન', 'Union Valve Plain', 'હેવી ડ્યુટી એગ્રીકલ્ચર યુનિયન બોલ વાલ્વ પ્લેન ફિટિંગ', TRUE)
  RETURNING id INTO v_prod_union_plain;

  -- Variants for યુનિયન વાલ્વ પ્લેન (2", 2.5", 3") -> Rate matches Screenshot!
  INSERT INTO public.product_variants (product_id, size, purchase_rate, selling_rate, opening_stock, current_stock, low_stock_limit)
  VALUES
    (v_prod_union_plain, '2"', 250.00, 306.00, 100, 100, 15),
    (v_prod_union_plain, '2.5"', 340.00, 410.00, 80, 80, 10),
    (v_prod_union_plain, '3"', 480.00, 590.00, 50, 50, 10);

  -- Products: યુનિયન વાલ્વ થ્રેડ
  INSERT INTO public.products (category_id, subcategory_id, name, name_en, description, is_active)
  VALUES (v_cat_valves, v_cat_union, 'યુનિયન વાલ્વ થ્રેડ', 'Union Valve Thread', 'હેવી બ્રાસ થ્રેડેડ યુનિયન બોલ વાલ્વ', TRUE)
  RETURNING id INTO v_prod_union_thread;

  INSERT INTO public.product_variants (product_id, size, purchase_rate, selling_rate, opening_stock, current_stock, low_stock_limit)
  VALUES
    (v_prod_union_thread, '2"', 270.00, 335.00, 75, 75, 12),
    (v_prod_union_thread, '2.5"', 365.00, 445.00, 60, 60, 10),
    (v_prod_union_thread, '3"', 510.00, 625.00, 40, 40, 8);

  -- Products: UPVC બોલ વાલ્વ
  INSERT INTO public.products (category_id, subcategory_id, name, name_en, description, is_active)
  VALUES (v_cat_valves, v_cat_upvc, 'UPVC બોલ વાલ્વ સોકેટ', 'UPVC Ball Valve Socket', 'હાઇ પ્રેશર વર્જિન મટિરિયલ UPVC બોલ વાલ્વ', TRUE)
  RETURNING id INTO v_prod_upvc_ball;

  INSERT INTO public.product_variants (product_id, size, purchase_rate, selling_rate, opening_stock, current_stock, low_stock_limit)
  VALUES
    (v_prod_upvc_ball, '0.5"', 45.00, 62.00, 200, 200, 25),
    (v_prod_upvc_ball, '0.75"', 65.00, 88.00, 180, 180, 25),
    (v_prod_upvc_ball, '1"', 95.00, 130.00, 150, 150, 20),
    (v_prod_upvc_ball, '1.5"', 170.00, 220.00, 100, 100, 15),
    (v_prod_upvc_ball, '2"', 260.00, 320.00, 90, 90, 15);

  -- Drip Product: ડ્રિપ લેટરલ પાઇપ 16mm (ISI Class 2)
  INSERT INTO public.products (category_id, name, name_en, description, is_active)
  VALUES (v_cat_drip, 'ઇનલાઇન ડ્રિપ લેટરલ 16mm (ક્લાસ 2)', 'Inline Drip Lateral 16mm Class 2', 'ISI 13488 માર્કા સાથે 40cm સ્પેસિંગ 2 LPH ફ્લો', TRUE)
  RETURNING id INTO v_prod_drip_lateral;

  INSERT INTO public.product_variants (product_id, size, purchase_rate, selling_rate, opening_stock, current_stock, low_stock_limit)
  VALUES
    (v_prod_drip_lateral, '400m', 2850.00, 3450.00, 45, 45, 10),
    (v_prod_drip_lateral, '500m', 3550.00, 4250.00, 30, 30, 8);

  -- Sprinkler Product: રેઇન ગન 50mm
  INSERT INTO public.products (category_id, name, name_en, description, is_active)
  VALUES (v_cat_sprinkler, 'રેઇન ગન હાઇ ઇમ્પેક્ટ 50mm (2")', 'High Impact Rain Gun 50mm', '35 મીટર રેડિયસ કવરેજ, એડજસ્ટેબલ રોટેશન 360°', TRUE)
  RETURNING id INTO v_prod_raingun;

  INSERT INTO public.product_variants (product_id, size, purchase_rate, selling_rate, opening_stock, current_stock, low_stock_limit)
  VALUES
    (v_prod_raingun, '50mm (2")', 4600.00, 5800.00, 25, 25, 5),
    (v_prod_raingun, '63mm (2.5")', 6200.00, 7800.00, 15, 15, 4);

  -- Filter Product: ટી-ટાઈપ ડિસ્ક ફિલ્ટર
  INSERT INTO public.products (category_id, name, name_en, description, is_active)
  VALUES (v_cat_filters, 'હેવી ડ્યુટી ટી-ટાઈપ ડિસ્ક ફિલ્ટર 120 મેશ', 'T-Type Disc Filter 120 Mesh', '120 મેશ ગ્રોવ્ડ ડિસ્ક ફિલ્ટર, ક્લીનિંગ માટે ઇઝી ઓપનેબલ', TRUE)
  RETURNING id INTO v_prod_disc_filter;

  INSERT INTO public.product_variants (product_id, size, purchase_rate, selling_rate, opening_stock, current_stock, low_stock_limit)
  VALUES
    (v_prod_disc_filter, '2"', 2200.00, 2800.00, 35, 35, 6),
    (v_prod_disc_filter, '2.5"', 3100.00, 3950.00, 25, 25, 5),
    (v_prod_disc_filter, '3"', 3900.00, 4950.00, 20, 20, 4);

END $$;

