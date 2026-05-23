# SummitRent by Kodya

**SummitRent by Kodya** is a premium mountain climbing and hiking equipment rental management application. Built on a modern web stack, it offers outdoor rental agencies a streamlined portal to manage administrative cashiers, track gear inventory, set custom rental price rates, and manage equipment status.

---

## 🚀 Technology Stack

- **Backend Framework:** Laravel 13 (PHP 8.4)
- **Frontend SPA Layer:** Inertia.js v3 (React + TypeScript)
- **Styling & Theme:** Tailwind CSS v4 (incorporating OKLCH colors, container queries)
- **UI Architecture:** Custom-styled Radix & Shadcn UI components
- **Testing Framework:** PHPUnit 12

---

## ✨ Features

### 1. Accounts Management (Cashiers & Admins)
- **CRUD Operations:** Comprehensive system to add, edit, and delete staff accounts (Admins & Cashiers).
- **Profile Photo Upload:** Direct image uploads processed and stored securely on Laravel's public storage disk.
- **DiceBear Micah Avatars:** Modern **DiceBear 9.x Micah API** integration supporting automatic avatar generation seeded with the user's name:
  - Cycle through variant seeds with Left/Right navigation.
  - Customize mouth expressions (smile, frown, pucker, smirk, etc.) and shirt colors.
  - Backdrop styles support linear gradients, presets, and a custom background color picker.
- **Deferred Asynchronous Loading:** Uses Inertia v3 deferred props to render a highly detailed **Skeleton Table** mockup matching the exact columns, pagination, and filters of the real table during page load.
- **Safety Safeguards:** Self-deletion protection prevents currently logged-in administrators from accidentally deleting their own accounts.

### 2. Rental Inventory (Products)
- **Dynamic Category Filtering:** Organize products into Tents, Backpacks, Sleeping Bags, Footwear, Cooking Gear, and Climbing Gear.
- **Server-Side Search & Sorting:** Real-time query parameter synchronization (searching by details, sorting by rate, date created, or stock) debounced at `400ms` for seamless interaction.
- **Stock Tracking:** Color-coded badges indicating availability (`Available`, `Maintenance`, `Out of Stock`).
- **Asynchronous Card Grid Skeletons:** Loads product catalogs in the background using deferred props, rendering a grid of pulsing **Skeleton Card** mockups with image, header, rates, and stock blocks.

### 3. Polish & Animations
- **Circular Reveal (Ripple) Theme Toggle:** Modern theme toggling (Light/Dark/System) that performs a seamless circular reveal animation centered at the user's mouse click coordinates, powered by the **View Transitions API** (`document.startViewTransition`) and `flushSync` animations.
- **Glitch-Free Hydration:** Syncs user theme preferences inline within the HTML `<head>` block before parsing the document body to prevent flashes of unstyled content (FOUC).

---

## 🛠️ Installation & Setup

1. **Clone & Install Dependencies:**
   ```bash
   composer install
   npm install
   ```

2. **Configure Environment:**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

3. **Link Public Storage:**
   ```bash
   php artisan storage:link
   ```

4. **Initialize Database & Seed Data:**
   ```bash
   php artisan migrate:fresh --seed
   ```
   *Seeder loads:*
   - Default administrators (`admin@example.com` / `password`).
   - Cashiers with pre-configured DiceBear vector avatar URLs.
   - 12 high-quality default climbing equipment items with real Unsplash images.

5. **Start Development Servers:**
   - Run Laravel backend:
     ```bash
     php artisan serve
     ```
   - Run Vite development server:
     ```bash
     npm run dev
     ```

---

## 🧪 Verification & Testing

### Automated Feature Tests
Execute the PHPUnit suite to verify the security rules, validation constraints, and database actions:
```bash
php artisan test --compact
```

### Production Compilation
Bundle the TypeScript and Tailwind CSS assets to verify compilation and production readiness:
```bash
npm run build
```
