# કૃષ્ણા ઇરિગેશન (Krishna Irrigation) 🌾💧
### Agricultural Irrigation Products & Rate Management Mobile App

A modern, production-grade mobile application built with **React Native (Expo Router)**, **TypeScript**, and **Supabase (PostgreSQL + RLS)** designed specifically for managing agricultural irrigation products, valves, fittings, pipes, rates, and inventory.

---

## 🎨 Visual Design & UI Features

### 1. Product Rate Cards (Category Screen)
- Recreates the exact layout from **Screenshot 1**:
  - Clean white container with distinct **green border** (`#16a34a`).
  - Product thumbnail / icon on the left.
  - Product name in **Gujarati** on top left.
  - Multi-size rate grid on the right:
    - **Red Header**: Product size (e.g., `2"`, `2.5"`, `3"`).
    - **Blue Bottom Box**: Selling rate in Indian Rupees (e.g., `₹306`, `₹410`, `₹590`).
  - Strict privacy: Normal users only see selling rates; purchase rates, margins, and internal stock quantities are hidden.

### 2. Category Grid (Home Screen)
- Recreates the two-column grid from **Screenshot 2**:
  - Professional header with **KRISHNA IRRIGATION** branding.
  - Two-column cards with soft pastel colors (Mint, Sky Blue, Amber, Lavender, Rose, Emerald).
  - Gujarati category names and nested subcategory counts.
  - Search bar supporting Gujarati & English queries.

---

## 👥 Roles & Security

| Feature | સામાન્ય ગ્રાહક (User) | સ્ટોર એડમિન (Admin) |
| :--- | :---: | :---: |
| Browse Categories & Subcategories | ✅ | ✅ |
| View Product Sizes & Selling Rates | ✅ | ✅ |
| View Purchase Rates & Profit Margins | ❌ (Strictly Hidden) | ✅ |
| View Available Stock Quantity | ❌ (Hidden) | ✅ |
| Add / Edit / Delete Categories | ❌ | ✅ |
| Add / Edit / Delete Products & Sizes | ❌ | ✅ |
| Record Stock In (Purchases) | ❌ | ✅ |
| Record Sales (Stock Out with Validation) | ❌ | ✅ |
| Inventory Adjustment & Audit Log | ❌ | ✅ |

---

## 🗄️ Database Architecture (Supabase PostgreSQL)

The full production SQL schema is available in [`supabase/schema.sql`](file:///Users/mehulpatel/krishna_irrigation/supabase/schema.sql):

- `profiles`: User roles (`admin` / `user`).
- `categories`: Recursive nested hierarchy using `parent_id`.
- `products`: Product master in Gujarati.
- `product_variants`: Size variants (`2"`, `2.5"`, etc.) with `purchase_rate`, `selling_rate`, `current_stock`, and `low_stock_limit`.
- `purchases` & `purchase_items`: Stock In transactions.
- `sales` & `sale_items`: Stock Out transactions.
- `stock_transactions`: Immutable audit log of all inventory movements.
- **Stored Procedures**: `record_purchase_entry` and `record_sale_entry` for atomic stock deduction and availability checks.
- **Row Level Security (RLS)**: Public read of active categories, products, and selling rates; Admin-only write and purchase rate access.

---

## 🚀 Running the App

```bash
# 1. Install dependencies
npm install

# 2. Run with Expo
npx expo start

# 3. Test on Web
npm run web

# 4. Test on Android Device (via USB with USB debugging enabled)
npm run android
```

### 📱 Connecting to Supabase (Optional)
The app includes an offline/local persistence engine that runs immediately out-of-the-box with pre-populated Gujarati irrigation products!

To connect your live Supabase cloud database:
1. Create a project at [supabase.com](https://supabase.com).
2. Run the SQL script from `supabase/schema.sql` in the Supabase SQL Editor.
3. Copy `.env.example` to `.env` and paste your Supabase URL & Anon Key:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

