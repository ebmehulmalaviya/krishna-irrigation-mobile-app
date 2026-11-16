This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` or `app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

--------------------------------------------------------------------------------

# 🧠 PROJECT MEMORY & HISTORY: KRISHNA IRRIGATION (કૃષ્ણા ઇરિગેશન)

### 1. Identity & Language
- **Brand**: Krishna Irrigation Systems (કૃષ્ણા ઇરિગેશન), Rajkot, Gujarat.
- **Primary Language**: 100% Gujarati across all UI, screens, notifications, dialogs, and product descriptions.
- **Domain**: Agriculture irrigation equipment (valves, drip fittings, mini sprinklers, sprinklers, rain pipe, jhatka fittings).

### 2. Exact UI Match Guidelines (Based on Reference Screenshots)
- **Top Status Bar**:
  - Background color is light pastel green: `#bcf3cb`.
  - System icons (clock, battery, Wi-Fi) must sit cleanly inside this green area.
- **Home Screen Header (`app/(tabs)/index.tsx`)**:
  - Background: Pure white `#ffffff`.
  - Left: Orange rounded-rectangle menu button (`#fff7ed` background, `#fed7aa` border, `#f97316` 3-bar menu lines).
  - Center: Bold centered dark green brand title `KRISHNA IRRIGATION` (`#166534`, 18px, bold letter-spacing; Gujarati subtitle and "ભાષા બદલો" removed per user request for clean, modern look).
  - Right: Round orange search button (`#fff7ed` background, `#f97316` icon, 42x42px, perfectly symmetrical to left menu button; bell icon removed per user request).
- **Home Banner / Carousel**:
  - Bold centered black text: `ALL RATE` / `TAX PAID RATE`.
  - 7 pagination dots indicator (`● · · · · · ·`).
- **Category Grid (`components/CategoryGridCard.tsx`)**:
  - 2-column cards with exact pastel background colors:
    - `cat-valves`: `#bfe9e4` (`એગ્રીકલ્ચર વાલ્વ`)
    - `cat-jhatka`: `#e3f4cb` (`એગ્રીકલ્ચર અને ઝટકા ફિટિંગ્સ`)
    - `cat-drip`: `#fce1cc` (`ડ્રિપ ફિટિંગ્સ`)
    - `cat-mini-sprinkler`: `#eedcfa` (`મીની સ્પ્રિંકલર ફિટિંગ્સ`)
    - `cat-sprinkler`: `#cdebee` (`સ્પ્રિંકલર ફિટિંગ્સ`)
    - `cat-rainpipe`: `#dff4cb` (`રેઇન પાઇપ ફિટિંગ્સ 40MM`)
  - Center vector graphics or user-uploaded photos. Clean card without upload buttons.
- **Category & Rate Screen (`app/category/[id].tsx`)**:
  - Header: Circular solid dark green back button `<` (`#166534`, white icon), centered dark green title (e.g. `એગ્રીકલ્ચર વાલ્વ`).
  - Product Cards: 2px solid dark green border (`#166534`), white background.
  - Left: Product image with black SKU pill badge at top-left (`1 P`, `1 T`, `2A`, `3 P`).
  - Right: Title format `<Name>(ટેક્ષ પેડ ભાવ)` + 3-tiered column block per size variant:
    - Top: Solid red header box with size label (`2"`, `2.5"`, `3"`, `0.5"`, `5"`, `6"`).
    - Middle: Solid blue box with formatted price (`₹ 306.0`, `₹ 410.0`, `₹ 590.0`, `₹ 66.0`).
    - Bottom: White box with grey text `જથ્થો`.

### 3. Android Header & Status Bar Rule (Critical)
- **Do NOT rely on `SafeAreaView` from `react-native` for top insets on Android** — it applies 0 padding, causing device time (`6:43`) and battery (`20%`) to overlap the app header.
- Always use `useSafeAreaInsets` from `react-native-safe-area-context` combined with `Platform` and `StatusBar.currentHeight`:
  ```tsx
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'android'
    ? Math.max(RNStatusBar.currentHeight || 0, insets.top, 32)
    : insets.top;
  ```
- Render a `<View style={[styles.statusBarCover, { height: topInset, backgroundColor: '#bcf3cb' }]} />` at the very top of custom header screens, and start the white header immediately below it.

### 4. Image Upload Architecture Constraint
- **User Constraint**: Image upload must ONLY appear inside the Add/Edit Category and Subcategory forms (`app/admin/categories.tsx`) and Add/Edit Product (`app/admin/add-product.tsx`).
- **Never** add camera buttons or image upload controls directly onto public home cards or customer rate lists.
- Supports Gallery picker (`expo-image-picker`), Camera capture, and Web Image URL input.

### 5. Role & Authentication (Strict Permissions)
- **User / Customer Mode (Default)**:
  - Users only have read-only access to browse Categories, Subcategories, Products, Sizes, and Tax-paid Selling Rates.
  - Users have NO permission to record purchases (Stock In) or sales (Stock Out).
  - Purchase rates, stock counts, and management action buttons are strictly hidden from users.
  - Admin screens (`/admin/stock-in`, `/admin/sale-out`, `/admin/categories`, `/admin/add-product`, `/admin`) are locked and show Access Denied.
- **Admin Mode**:
  - Requires Admin PIN authentication: PIN is `9898`.
  - Once logged in, Admin has full permissions:
    - Add/Edit/Delete Categories and Subcategories with Cloud image upload.
    - Add/Edit/Delete Products and Sizes with Cloud image upload.
    - Stock In (Purchase entry) and Sale Out (Customer bill entry).
    - View purchase rates, inventory quantity, low-stock warnings, and full sales reports.
  - Logout option available to switch back to Customer Mode.

### 6. Tech Stack & Quality Checks
- Expo SDK 58, React Native 0.88, React 19, TypeScript.
- Supabase backend with offline fallback store in `context/AppContext.tsx`.
- Supabase Project: `krishna-irrigation` (Project Ref: `frkqjpefxkeoomeslrwp`, Region: `ap-south-1` Mumbai).
- Account Email: `krishnairrigation9898@gmail.com`.
- Credentials stored in `.env` (`EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`).
- Before marking any task complete, always verify type safety with `npx tsc --noEmit`.
