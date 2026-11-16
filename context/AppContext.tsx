import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import {
  Category,
  Product,
  ProductVariant,
  Sale,
  Purchase,
  StockTransaction,
  UserRole,
  DashboardStats,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_SALES,
  INITIAL_PURCHASES,
  INITIAL_STOCK_TRANSACTIONS,
} from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const isServer = Platform.OS === 'web' && typeof window === 'undefined';

const safeGetItem = async (key: string): Promise<string | null> => {
  if (isServer) return null;
  return AsyncStorage.getItem(key);
};

const safeSetItem = async (key: string, value: string): Promise<void> => {
  if (isServer) return;
  return AsyncStorage.setItem(key, value);
};

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  categories: Category[];
  products: Product[];
  sales: Sale[];
  purchases: Purchase[];
  stockTransactions: StockTransaction[];
  isLoading: boolean;
  stats: DashboardStats;

  // Category Actions
  addCategory: (category: Omit<Category, 'id'>) => Promise<Category>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  getSubcategories: (parentId: string) => Category[];

  // Product Actions
  addProduct: (product: Omit<Product, 'id'>) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProductById: (id: string) => Product | undefined;

  // Variant Actions
  addVariant: (productId: string, variant: Omit<ProductVariant, 'id' | 'product_id'>) => Promise<ProductVariant>;
  updateVariant: (variantId: string, updates: Partial<ProductVariant>) => Promise<void>;
  deleteVariant: (variantId: string) => Promise<void>;

  // Stock In / Purchase Management
  recordStockIn: (
    variantId: string,
    quantity: number,
    purchaseRate: number,
    supplierName?: string,
    notes?: string
  ) => Promise<{ success: boolean; message: string }>;

  // Sales / Stock Out Management
  recordSale: (
    variantId: string,
    quantity: number,
    sellingRate: number,
    customerName?: string,
    notes?: string
  ) => Promise<{ success: boolean; message: string }>;

  // Stock Adjustment
  adjustStock: (
    variantId: string,
    quantityDelta: number,
    notes: string
  ) => Promise<void>;

  // Admin PIN / Password Management
  adminPin: string;
  verifyAdminPin: (enteredPin: string) => boolean;
  changeAdminPin: (currentPin: string, newPin: string) => Promise<{ success: boolean; message: string }>;

  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ROLE: '@krishna_user_role_v2',
  CATEGORIES: '@krishna_categories_v2',
  PRODUCTS: '@krishna_products_v2',
  SALES: '@krishna_sales_v2',
  PURCHASES: '@krishna_purchases_v2',
  TRANSACTIONS: '@krishna_transactions_v2',
  ADMIN_PIN: '@krishna_admin_pin_v2',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>('user'); // Default to 'user' so customers only see catalog & rates
  const [adminPin, setAdminPin] = useState<string>('9898'); // Default Admin PIN: 9898
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [sales, setSales] = useState<Sale[]>(INITIAL_SALES);
  const [purchases, setPurchases] = useState<Purchase[]>(INITIAL_PURCHASES);
  const [stockTransactions, setStockTransactions] = useState<StockTransaction[]>(INITIAL_STOCK_TRANSACTIONS);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load from Storage or Supabase
  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Role & Admin PIN
      const savedRole = await safeGetItem(STORAGE_KEYS.ROLE);
      if (savedRole === 'admin' || savedRole === 'user') {
        setRoleState(savedRole);
      }
      const savedPin = await safeGetItem(STORAGE_KEYS.ADMIN_PIN);
      if (savedPin) {
        setAdminPin(savedPin);
      }

      // 2. If Supabase is connected, fetch from Supabase
      if (isSupabaseConfigured()) {
        try {
          // Fetch Cloud Admin PIN if set
          const { data: pinData } = await supabase
            .from('app_settings')
            .select('value')
            .eq('key', 'admin_pin')
            .maybeSingle();

          if (pinData?.value) {
            setAdminPin(pinData.value);
            await safeSetItem(STORAGE_KEYS.ADMIN_PIN, pinData.value);
          }

          const { data: catData } = await supabase
            .from('categories')
            .select('*')
            .order('display_order', { ascending: true });

          const { data: prodData } = await supabase
            .from('products')
            .select('*, variants:product_variants(*)');

          const { data: purchData } = await supabase
            .from('purchases')
            .select('*, items:purchase_items(*)')
            .order('created_at', { ascending: false });

          const { data: salesData } = await supabase
            .from('sales')
            .select('*, items:sale_items(*)')
            .order('created_at', { ascending: false });

          const { data: transData } = await supabase
            .from('stock_transactions')
            .select('*')
            .order('created_at', { ascending: false });

          if (catData && catData.length > 0) {
            setCategories(catData as Category[]);
          }
          if (prodData && prodData.length > 0) {
            setProducts(prodData as Product[]);
          }
          if (purchData && purchData.length > 0) {
            setPurchases(purchData as Purchase[]);
          }
          if (salesData && salesData.length > 0) {
            setSales(salesData as Sale[]);
          }
          if (transData && transData.length > 0) {
            setStockTransactions(transData as StockTransaction[]);
          }
        } catch (supaErr) {
          console.warn('Supabase fetch error, fallback to local', supaErr);
        }
      } else {
        // Load from AsyncStorage if available, else initial mock
        const storedCats = await safeGetItem(STORAGE_KEYS.CATEGORIES);
        const storedProds = await safeGetItem(STORAGE_KEYS.PRODUCTS);
        const storedSales = await safeGetItem(STORAGE_KEYS.SALES);
        const storedPurchases = await safeGetItem(STORAGE_KEYS.PURCHASES);
        const storedTrans = await safeGetItem(STORAGE_KEYS.TRANSACTIONS);

        if (storedCats) setCategories(JSON.parse(storedCats));
        if (storedProds) setProducts(JSON.parse(storedProds));
        if (storedSales) setSales(JSON.parse(storedSales));
        if (storedPurchases) setPurchases(JSON.parse(storedPurchases));
        if (storedTrans) setStockTransactions(JSON.parse(storedTrans));
      }
    } catch (e) {
      console.error('Failed loading data', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Persist helpers
  const persistCategories = async (updated: Category[]) => {
    setCategories(updated);
    await safeSetItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updated));
  };

  const persistProducts = async (updated: Product[]) => {
    setProducts(updated);
    await safeSetItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
  };

  const persistSales = async (updated: Sale[]) => {
    setSales(updated);
    await safeSetItem(STORAGE_KEYS.SALES, JSON.stringify(updated));
  };

  const persistPurchases = async (updated: Purchase[]) => {
    setPurchases(updated);
    await safeSetItem(STORAGE_KEYS.PURCHASES, JSON.stringify(updated));
  };

  const persistTransactions = async (updated: StockTransaction[]) => {
    setStockTransactions(updated);
    await safeSetItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updated));
  };

  const setRole = async (newRole: UserRole) => {
    setRoleState(newRole);
    await safeSetItem(STORAGE_KEYS.ROLE, newRole);
  };

  // Admin PIN verification
  const verifyAdminPin = useCallback(
    (enteredPin: string): boolean => {
      return enteredPin.trim() === adminPin.trim();
    },
    [adminPin]
  );

  // Change Admin PIN / Password
  const changeAdminPin = async (
    currentPin: string,
    newPin: string
  ): Promise<{ success: boolean; message: string }> => {
    if (currentPin.trim() !== adminPin.trim()) {
      return { success: false, message: 'જૂનો PIN ખોટો છે! સાચો વર્તમાન PIN દાખલ કરો.' };
    }
    if (!newPin.trim() || newPin.trim().length < 4) {
      return { success: false, message: 'નવો PIN ઓછામાં ઓછો 4 અંકનો હોવો જોઈએ!' };
    }
    const cleanPin = newPin.trim();
    setAdminPin(cleanPin);
    await safeSetItem(STORAGE_KEYS.ADMIN_PIN, cleanPin);

    // Sync to Supabase cloud database
    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('app_settings')
          .upsert({ key: 'admin_pin', value: cleanPin, updated_at: new Date().toISOString() });
      } catch (err) {
        console.warn('Supabase pin sync error:', err);
      }
    }

    return { success: true, message: 'નવો એડમિન PIN સફળતાપૂર્વક અપડેટ થઈ ગયો છે!' };
  };

  // Helper: Find variant & its parent product
  const findVariantAndProduct = useCallback(
    (variantId: string): { product?: Product; variant?: ProductVariant } => {
      for (const p of products) {
        const v = p.variants.find((item) => item.id === variantId);
        if (v) return { product: p, variant: v };
      }
      return {};
    },
    [products]
  );

  // Subcategories recursive lookup
  const getSubcategories = useCallback(
    (parentId: string): Category[] => {
      return categories.filter((c) => c.parent_id === parentId && c.is_active);
    },
    [categories]
  );

  const getProductById = useCallback(
    (id: string): Product | undefined => {
      return products.find((p) => p.id === id);
    },
    [products]
  );

  // Category Actions
  const addCategory = async (categoryData: Omit<Category, 'id'>): Promise<Category> => {
    let newCatId = `cat-${Date.now()}`;

    if (isSupabaseConfigured()) {
      try {
        const payload: any = {
          name: categoryData.name,
          name_en: categoryData.name_en || null,
          image_url: categoryData.image_url || null,
          graphic_type: categoryData.graphic_type || null,
          parent_id: categoryData.parent_id || null,
          display_order: categoryData.display_order ?? categories.length + 1,
          is_active: categoryData.is_active ?? true,
          color: categoryData.color || null,
          icon: categoryData.icon || null,
        };
        const { data, error } = await supabase.from('categories').insert(payload).select().single();
        if (!error && data) {
          const updated = [...categories, data as Category];
          await persistCategories(updated);
          return data as Category;
        }
      } catch (err) {
        console.warn('Supabase addCategory error', err);
      }
    }

    const newCat: Category = {
      ...categoryData,
      id: newCatId,
      created_at: new Date().toISOString(),
    };

    const updated = [...categories, newCat];
    await persistCategories(updated);
    return newCat;
  };

  const updateCategory = async (id: string, updates: Partial<Category>): Promise<void> => {
    const updated = categories.map((c) => (c.id === id ? { ...c, ...updates } : c));
    await persistCategories(updated);

    if (isSupabaseConfigured()) {
      try {
        const { children, id: _id, created_at: _ca, ...validUpdates } = updates as any;
        if (Object.keys(validUpdates).length > 0) {
          await supabase.from('categories').update(validUpdates).eq('id', id);
        }
      } catch (err) {
        console.warn('Supabase updateCategory error', err);
      }
    }
  };

  const deleteCategory = async (id: string): Promise<void> => {
    const updated = categories.filter((c) => c.id !== id && c.parent_id !== id);
    await persistCategories(updated);

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('categories').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteCategory error', err);
      }
    }
  };

  // Product Actions
  const addProduct = async (productData: Omit<Product, 'id'>): Promise<Product> => {
    let newProdId = `prod-${Date.now()}`;

    if (isSupabaseConfigured()) {
      try {
        const { data: supaProd, error } = await supabase
          .from('products')
          .insert({
            category_id: productData.category_id,
            subcategory_id: productData.subcategory_id || null,
            name: productData.name,
            name_en: productData.name_en || null,
            sku: productData.sku || null,
            graphic_type: productData.graphic_type || null,
            description: productData.description || null,
            image_url: productData.image_url || null,
            is_active: productData.is_active ?? true,
          })
          .select()
          .single();

        if (!error && supaProd) {
          newProdId = supaProd.id;

          if (productData.variants && productData.variants.length > 0) {
            const variantPayload = productData.variants.map((v) => ({
              product_id: newProdId,
              size: v.size,
              purchase_rate: v.purchase_rate,
              selling_rate: v.selling_rate,
              opening_stock: v.opening_stock,
              current_stock: v.current_stock,
              low_stock_limit: v.low_stock_limit,
              pack_text: v.pack_text || 'જથ્થો',
              is_active: v.is_active ?? true,
            }));

            const { data: supaVariants } = await supabase
              .from('product_variants')
              .insert(variantPayload)
              .select();

            const fullProd: Product = {
              ...productData,
              id: newProdId,
              variants: (supaVariants as ProductVariant[]) || productData.variants,
            };
            const updated = [fullProd, ...products];
            await persistProducts(updated);
            return fullProd;
          }
        }
      } catch (err) {
        console.warn('Supabase addProduct error', err);
      }
    }

    const newProd: Product = {
      ...productData,
      id: newProdId,
      created_at: new Date().toISOString(),
      variants: productData.variants || [],
    };

    const updated = [newProd, ...products];
    await persistProducts(updated);
    return newProd;
  };

  const updateProduct = async (id: string, updates: Partial<Product>): Promise<void> => {
    const updated = products.map((p) => (p.id === id ? { ...p, ...updates } : p));
    await persistProducts(updated);

    if (isSupabaseConfigured()) {
      try {
        const { variants, ...prodFields } = updates;
        if (Object.keys(prodFields).length > 0) {
          await supabase.from('products').update(prodFields).eq('id', id);
        }
      } catch (err) {
        console.warn('Supabase updateProduct error', err);
      }
    }
  };

  const deleteProduct = async (id: string): Promise<void> => {
    const updated = products.filter((p) => p.id !== id);
    await persistProducts(updated);

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('products').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteProduct error', err);
      }
    }
  };

  // Variant Actions
  const addVariant = async (
    productId: string,
    variantData: Omit<ProductVariant, 'id' | 'product_id'>
  ): Promise<ProductVariant> => {
    let newVarId = `var-${Date.now()}`;

    if (isSupabaseConfigured()) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId);
        if (isUuid) {
          const { data: supaVar } = await supabase
            .from('product_variants')
            .insert({
              product_id: productId,
              size: variantData.size,
              purchase_rate: variantData.purchase_rate,
              selling_rate: variantData.selling_rate,
              opening_stock: variantData.opening_stock,
              current_stock: variantData.current_stock,
              low_stock_limit: variantData.low_stock_limit,
              pack_text: variantData.pack_text || 'જથ્થો',
              is_active: variantData.is_active ?? true,
            })
            .select()
            .single();

          if (supaVar) {
            newVarId = supaVar.id;
          }
        }
      } catch (err) {
        console.warn('Supabase addVariant error', err);
      }
    }

    const newVariant: ProductVariant = {
      ...variantData,
      id: newVarId,
      product_id: productId,
    };

    const updated = products.map((p) => {
      if (p.id === productId) {
        return {
          ...p,
          variants: [...p.variants, newVariant],
        };
      }
      return p;
    });

    await persistProducts(updated);
    return newVariant;
  };

  const updateVariant = async (variantId: string, updates: Partial<ProductVariant>): Promise<void> => {
    const updated = products.map((p) => ({
      ...p,
      variants: p.variants.map((v) => (v.id === variantId ? { ...v, ...updates } : v)),
    }));
    await persistProducts(updated);

    if (isSupabaseConfigured()) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(variantId);
        if (isUuid) {
          await supabase.from('product_variants').update(updates).eq('id', variantId);
        }
      } catch (err) {
        console.warn('Supabase updateVariant error', err);
      }
    }
  };

  const deleteVariant = async (variantId: string): Promise<void> => {
    const updated = products.map((p) => ({
      ...p,
      variants: p.variants.filter((v) => v.id !== variantId),
    }));
    await persistProducts(updated);

    if (isSupabaseConfigured()) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(variantId);
        if (isUuid) {
          await supabase.from('product_variants').delete().eq('id', variantId);
        }
      } catch (err) {
        console.warn('Supabase deleteVariant error', err);
      }
    }
  };

  // Stock In / Purchase Management
  const recordStockIn = async (
    variantId: string,
    quantity: number,
    purchaseRate: number,
    supplierName?: string,
    notes?: string
  ): Promise<{ success: boolean; message: string }> => {
    if (quantity <= 0) {
      return { success: false, message: 'જથ્થો 0 થી વધુ હોવો જોઈએ!' };
    }

    const { product, variant } = findVariantAndProduct(variantId);
    if (!product || !variant) {
      return { success: false, message: 'પ્રોડક્ટ વેરિઅન્ટ મળ્યો નથી!' };
    }

    const totalAmount = quantity * purchaseRate;
    let purchaseId = `purch-${Date.now()}`;

    // Cloud Sync: Persist Purchase, Items, Stock & Audit to Supabase
    if (isSupabaseConfigured()) {
      try {
        const { data: supaPurch } = await supabase
          .from('purchases')
          .insert({
            supplier_name: supplierName || 'સામાન્ય સપ્લાયર',
            purchase_date: new Date().toISOString().split('T')[0],
            total_amount: totalAmount,
            notes: notes || null,
          })
          .select()
          .single();

        if (supaPurch) {
          purchaseId = supaPurch.id;

          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(variantId);
          if (isUuid) {
            await supabase.from('purchase_items').insert({
              purchase_id: supaPurch.id,
              variant_id: variantId,
              quantity,
              purchase_rate: purchaseRate,
              total_amount: totalAmount,
            });

            await supabase
              .from('product_variants')
              .update({
                current_stock: variant.current_stock + quantity,
                purchase_rate: purchaseRate,
              })
              .eq('id', variantId);

            await supabase.from('stock_transactions').insert({
              variant_id: variantId,
              transaction_type: 'purchase',
              quantity,
              reference_id: supaPurch.id,
              notes: notes || `ખરીદી ઇનવોઇસ: ${supplierName || ''}`,
            });
          }
        }
      } catch (err) {
        console.warn('Supabase recordStockIn error', err);
      }
    }

    // 1. Create Purchase record
    const newPurchase: Purchase = {
      id: purchaseId,
      supplier_name: supplierName || 'સામાન્ય સપ્લાયર',
      purchase_date: new Date().toISOString().split('T')[0],
      total_amount: totalAmount,
      notes,
      items: [
        {
          id: `pi-${Date.now()}`,
          purchase_id: purchaseId,
          variant_id: variantId,
          quantity,
          purchase_rate: purchaseRate,
          total_amount: totalAmount,
          product,
          variant,
        },
      ],
    };

    // 2. Increase stock & update purchase rate
    const updatedProducts = products.map((p) => {
      if (p.id === product.id) {
        return {
          ...p,
          variants: p.variants.map((v) =>
            v.id === variantId
              ? {
                  ...v,
                  current_stock: v.current_stock + quantity,
                  purchase_rate: purchaseRate,
                }
              : v
          ),
        };
      }
      return p;
    });

    // 3. Create Audit Transaction
    const newTx: StockTransaction = {
      id: `st-${Date.now()}`,
      variant_id: variantId,
      transaction_type: 'purchase',
      quantity,
      reference_id: purchaseId,
      notes: notes || `ખરીદી ઇનવોઇસ: ${supplierName || ''}`,
      created_at: new Date().toISOString(),
      product_name: product.name,
      variant_size: variant.size,
    };

    await persistProducts(updatedProducts);
    await persistPurchases([newPurchase, ...purchases]);
    await persistTransactions([newTx, ...stockTransactions]);

    return {
      success: true,
      message: `ખરીદી સફળ! ${product.name} (${variant.size}) નો સ્ટોક +${quantity} વધારવામાં આવ્યો.`,
    };
  };

  // Sales / Stock Out Management
  const recordSale = async (
    variantId: string,
    quantity: number,
    sellingRate: number,
    customerName?: string,
    notes?: string
  ): Promise<{ success: boolean; message: string }> => {
    if (quantity <= 0) {
      return { success: false, message: 'વેચાણ જથ્થો 0 થી વધુ હોવો જોઈએ!' };
    }

    const { product, variant } = findVariantAndProduct(variantId);
    if (!product || !variant) {
      return { success: false, message: 'પ્રોડક્ટ વેરિઅન્ટ મળ્યો નથી!' };
    }

    // Availability validation!
    if (variant.current_stock < quantity) {
      return {
        success: false,
        message: `અપૂરતો સ્ટોક! હાલમાં માત્ર ${variant.current_stock} ઉપલબ્ધ છે, માંગેલ: ${quantity}`,
      };
    }

    const totalAmount = quantity * sellingRate;
    let saleId = `sale-${Date.now()}`;

    // Cloud Sync: Persist Sale, Items, Stock & Audit to Supabase
    if (isSupabaseConfigured()) {
      try {
        const { data: supaSale } = await supabase
          .from('sales')
          .insert({
            customer_name: customerName || 'રોકડ ગ્રાહક',
            sale_date: new Date().toISOString().split('T')[0],
            total_amount: totalAmount,
            notes: notes || null,
          })
          .select()
          .single();

        if (supaSale) {
          saleId = supaSale.id;

          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(variantId);
          if (isUuid) {
            await supabase.from('sale_items').insert({
              sale_id: supaSale.id,
              variant_id: variantId,
              quantity,
              selling_rate: sellingRate,
              total_amount: totalAmount,
            });

            await supabase
              .from('product_variants')
              .update({
                current_stock: variant.current_stock - quantity,
              })
              .eq('id', variantId);

            await supabase.from('stock_transactions').insert({
              variant_id: variantId,
              transaction_type: 'sale',
              quantity: -quantity,
              reference_id: supaSale.id,
              notes: notes || `વેચાણ: ${customerName || ''}`,
            });
          }
        }
      } catch (err) {
        console.warn('Supabase recordSale error', err);
      }
    }

    // 1. Create Sale record
    const newSale: Sale = {
      id: saleId,
      customer_name: customerName || 'રોકડ ગ્રાહક',
      sale_date: new Date().toISOString().split('T')[0],
      total_amount: totalAmount,
      notes,
      items: [
        {
          id: `si-${Date.now()}`,
          sale_id: saleId,
          variant_id: variantId,
          quantity,
          selling_rate: sellingRate,
          total_amount: totalAmount,
          product,
          variant,
        },
      ],
    };

    // 2. Deduct stock atomically
    const updatedProducts = products.map((p) => {
      if (p.id === product.id) {
        return {
          ...p,
          variants: p.variants.map((v) =>
            v.id === variantId
              ? {
                  ...v,
                  current_stock: v.current_stock - quantity,
                }
              : v
          ),
        };
      }
      return p;
    });

    // 3. Create Audit Transaction
    const newTx: StockTransaction = {
      id: `st-${Date.now()}`,
      variant_id: variantId,
      transaction_type: 'sale',
      quantity: -quantity,
      reference_id: saleId,
      notes: notes || `વેચાણ: ${customerName || ''}`,
      created_at: new Date().toISOString(),
      product_name: product.name,
      variant_size: variant.size,
    };

    await persistProducts(updatedProducts);
    await persistSales([newSale, ...sales]);
    await persistTransactions([newTx, ...stockTransactions]);

    return {
      success: true,
      message: `વેચાણ સફળ! ${product.name} (${variant.size}) ના ${quantity} નંગ સ્ટોકમાંથી બાદ થયા. રકમ: ₹${totalAmount}`,
    };
  };

  // Stock Adjustment
  const adjustStock = async (
    variantId: string,
    quantityDelta: number,
    notes: string
  ): Promise<void> => {
    const { product, variant } = findVariantAndProduct(variantId);
    if (!product || !variant) return;

    const newStock = Math.max(0, variant.current_stock + quantityDelta);

    if (isSupabaseConfigured()) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(variantId);
        if (isUuid) {
          await supabase
            .from('product_variants')
            .update({ current_stock: newStock })
            .eq('id', variantId);

          await supabase.from('stock_transactions').insert({
            variant_id: variantId,
            transaction_type: 'adjustment',
            quantity: quantityDelta,
            notes: `સ્ટોક એડજસ્ટમેન્ટ: ${notes}`,
          });
        }
      } catch (err) {
        console.warn('Supabase adjustStock error', err);
      }
    }

    const updatedProducts = products.map((p) => {
      if (p.id === product.id) {
        return {
          ...p,
          variants: p.variants.map((v) =>
            v.id === variantId ? { ...v, current_stock: newStock } : v
          ),
        };
      }
      return p;
    });

    const newTx: StockTransaction = {
      id: `st-${Date.now()}`,
      variant_id: variantId,
      transaction_type: 'adjustment',
      quantity: quantityDelta,
      notes: `સ્ટોક એડજસ્ટમેન્ટ: ${notes}`,
      created_at: new Date().toISOString(),
      product_name: product.name,
      variant_size: variant.size,
    };

    await persistProducts(updatedProducts);
    await persistTransactions([newTx, ...stockTransactions]);
  };

  // Dynamic Dashboard Stats calculation
  const stats: DashboardStats = useMemo(() => {
    const rootCategories = categories.filter((c) => !c.parent_id);
    const subCategories = categories.filter((c) => Boolean(c.parent_id));

    let totalInventoryQuantity = 0;
    let totalPurchaseValuation = 0;
    let lowStockCount = 0;

    products.forEach((p) => {
      p.variants.forEach((v) => {
        totalInventoryQuantity += v.current_stock;
        totalPurchaseValuation += v.current_stock * v.purchase_rate;
        if (v.current_stock <= v.low_stock_limit) {
          lowStockCount += 1;
        }
      });
    });

    const totalSalesValue = sales.reduce((sum, s) => sum + s.total_amount, 0);

    return {
      totalCategories: rootCategories.length,
      totalSubcategories: subCategories.length,
      totalProducts: products.length,
      totalInventoryQuantity,
      totalPurchaseValue: totalPurchaseValuation,
      totalSalesValue,
      lowStockCount,
      recentSales: sales.slice(0, 5),
    };
  }, [categories, products, sales]);

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        categories,
        products,
        sales,
        purchases,
        stockTransactions,
        isLoading,
        stats,
        addCategory,
        updateCategory,
        deleteCategory,
        getSubcategories,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductById,
        addVariant,
        updateVariant,
        deleteVariant,
        recordStockIn,
        recordSale,
        adjustStock,
        adminPin,
        verifyAdminPin,
        changeAdminPin,
        refreshData: loadInitialData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
