export type UserRole = 'admin' | 'user';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  name_en?: string;
  image_url?: string;
  graphic_type?: string;
  parent_id?: string | null; // For nested subcategories
  display_order: number;
  is_active: boolean;
  color?: string; // Pastel background for home grid
  icon?: string;
  created_at?: string;
  children?: Category[]; // Populated in tree view
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: string; // e.g. "0.5\"", "0.75\"", "1\"", "2\"", "2.5\"", "3\""
  purchase_rate: number; // Admin only
  selling_rate: number; // Public rate in ₹
  opening_stock: number;
  current_stock: number;
  low_stock_limit: number;
  pack_text?: string; // e.g. "જથ્થો"
  is_active: boolean;
  created_at?: string;
}

export interface Product {
  id: string;
  sku?: string; // e.g. "1 P", "1 T", "2A", "3 P"
  graphic_type?: string;
  category_id: string;
  subcategory_id?: string | null;
  name: string; // Gujarati name, e.g. "યુનીયન વાલ્વ પ્લેન(ટેક્ષ પેડ ભાવ)"
  name_en?: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  created_at?: string;
  variants: ProductVariant[];
  category?: Category;
}

export interface PurchaseItem {
  id: string;
  purchase_id: string;
  variant_id: string;
  quantity: number;
  purchase_rate: number;
  total_amount: number;
  variant?: ProductVariant;
  product?: Product;
}

export interface Purchase {
  id: string;
  supplier_name?: string;
  purchase_date: string;
  total_amount: number;
  notes?: string;
  created_by?: string;
  created_at?: string;
  items?: PurchaseItem[];
}

export interface SaleItem {
  id: string;
  sale_id: string;
  variant_id: string;
  quantity: number;
  selling_rate: number;
  total_amount: number;
  variant?: ProductVariant;
  product?: Product;
}

export interface Sale {
  id: string;
  customer_name?: string;
  sale_date: string;
  total_amount: number;
  notes?: string;
  created_by?: string;
  created_at?: string;
  items?: SaleItem[];
}

export type StockTransactionType = 'opening' | 'purchase' | 'sale' | 'adjustment';

export interface StockTransaction {
  id: string;
  variant_id: string;
  transaction_type: StockTransactionType;
  quantity: number; // positive for addition, negative for deduction
  reference_id?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  product_name?: string;
  variant_size?: string;
}

export interface DashboardStats {
  totalCategories: number;
  totalSubcategories: number;
  totalProducts: number;
  totalInventoryQuantity: number;
  totalPurchaseValue: number;
  totalSalesValue: number;
  lowStockCount: number;
  recentSales: Sale[];
}

