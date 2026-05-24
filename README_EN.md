# SummitRent by Kodya

**SummitRent by Kodya** is a premium mountain climbing and hiking equipment rental management application. Built on a modern web stack, it offers outdoor rental agencies a streamlined portal to manage staff cashier accounts, track equipment inventory, set custom rental prices, register customers, process rentals, and interact with a real-time AI assistant.

---

## 🚀 Technology Stack

- **Backend Framework:** Laravel 13 (PHP 8.4)
- **Frontend SPA Layer:** Inertia.js v3 (React + TypeScript)
- **Styling & Theme:** Tailwind CSS v4 (incorporating OKLCH colors, container queries)
- **UI Architecture:** Custom-styled Radix & Shadcn UI components
- **Real-Time WebSockets:** Laravel Reverb (Broadcasting & Echo)
- **AI Integration:** Laravel AI SDK (`laravel/ai`) & Ollama (`qwen2.5:3b`)
- **Testing & Formatting:** PHPUnit 12 & Laravel Pint

---

## ✨ Features

### 1. Security & Authorization (Spatie Roles & Permissions)
- **Granular Route-Level Hardening:** Every endpoint (Products, Accounts, Customers, Rentals) is strictly protected with fine-grained Spatie permission middlewares (e.g. `permission:customers.create`). This replaces coarse role-based blocks (`role:owner|kasir`) to prevent API bypass attacks.
- **Unified Account Management:** Comprehensive CRUD system with a premium **3-column flex/grid** dialog layout for configuring basic profile details, roles (Owner vs Cashier), and custom granular Spatie permission checklists.
- **Dynamic Visibilities (UI-Backend Sync):** Sidebar menus, row action menus, and page details are hidden or rendered dynamically based on role and permission properties shared globally via Inertia.
- **Pretty Badges & Flat Labels:** Displays role details using sleek colored badges and structures permission items in a clean flat layout resolved from localized metadata.
- **Profile Image & DiceBear Micah Avatars:**
  - Upload real profile pictures processed and stored securely on Laravel's public disk.
  - Modern **DiceBear 9.x Micah API** integration for automated vector avatar generation seeded with the user's name: cycles variant seeds (Left/Right buttons), customizes mouth expressions, shirts, preset backdrop gradients, and a custom color picker.
- **Deferred Asynchronous Loading:** Uses Inertia v3 deferred props to render a highly detailed **Skeleton Table** matching the exact columns, pagination, and filters of the real table during initial page loads.

### 2. Smart POS Checkout & Cashier Subsystem
- **Complete Checkout Flow:** Operators can automatically compute subtotals, apply custom discounts, select payment methods (Cash / QRIS), input cash paid, and view change return or deficit amounts in real-time.
- **Premium Popover Date Pickers:** Replaces native HTML date inputs with interactive popover calendar selectors (Shadcn Calendar) and timezone-immune calendar date computations via the `@internationalized/date` package.
- **Quick Customer Registration:** A shortcut button directly inside the checkout cart to register new customers without leaving the POS tab.

### 3. Customer Directory & Management
- **NIK & Phone Validations:** Restricts NIK/passport input to exactly 16 digits and phone numbers to Indonesian standard formats.
- **Live Database Validations (Availability Checks):** Queries `/customers/check-id` and `/customers/check-email` asynchronously while typing, rendering relative loading spinners (`Loader2`) and green checkmarks (`Check`) when available.
- **Cover Image Identity Preview Overlay ("Preview Photo Timpa"):** Redesigned the card upload zone with a full-bleed responsive container and a dark hover overlay (`backdrop-blur-[2px] bg-black/60`) for modifying or removing card files interactively.

### 4. Products & Catalog Inventory
- **Dynamic Category Filtering:** Organize products into Tents, Backpacks, Sleeping Bags, Footwear, Cooking Gear, and Climbing Gear.
- **Server-Side Search & Sorting:** Real-time query parameter synchronization debounced at `400ms` for seamless interaction.
- **Stock Tracking:** Color-coded badges indicating availability (`Available`, `Maintenance`, `Out of Stock`).
- **Asynchronous Card Grid Skeletons:** Loads product catalogs in the background using deferred props, rendering a grid of pulsing **Skeleton Card** mockups with image, header, rates, and stock blocks.

### 5. AI Assistant Chatbot & WebSockets
- **Event-Driven AI Chat:** Interactive AI dialog using a premium split-pane layout. Saves chat sessions locally (`localStorage`), and broadcasts thinking processes ("Proses Berpikir Asisten") and markdown response text streams via private Reverb WebSocket channels.
- **Real-Time Operational Alerts:** Broadcasters push immediate notifications via Laravel Reverb to a header bell component with unread count badges for:
  - Low-stock alerts on products.
  - Rental transaction lifecycle status updates (rented, returned, canceled).
  - Daily overdue rental updates.

### 6. Polish & Premium Styling
- **Circular Reveal (Ripple) Theme Toggle:** Modern theme toggling (Light/Dark/System) that performs a seamless circular reveal animation centered at the user's mouse click coordinates, powered by the **View Transitions API** (`document.startViewTransition`) and `flushSync` animations.
- **Glitch-Free Hydration:** Syncs user theme preferences inline within the HTML `<head>` block before parsing the document body to prevent flashes of unstyled content (FOUC).
- **Custom Scrollbars:** A premium adaptive transparent scrollbar design matching light/dark modes automatically.

---

## 🛠️ Installation & Setup (Local Host)

1. **Clone & Install Dependencies:**
   ```bash
   composer install
   npm install
   ```

2. **Configure Environment:**
   Copy the `.env.example` file to `.env` and generate the application key:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
   Open the newly created `.env` file and ensure your database connection parameters are adjusted to use **PostgreSQL**:
   ```env
   DB_CONNECTION=pgsql
   DB_HOST=127.0.0.1
   DB_PORT=5432
   DB_DATABASE=rentalapp
   DB_USERNAME=rentalapp_user
   DB_PASSWORD=rentalapp_password
   ```
   *(Note: If you are using Docker Compose for local development, the database host `DB_HOST` will be automatically resolved to the database service `db` inside the container)*

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
   - Default cashier account (`adol@kontol.com` / `password`) equipped with cashier-level Spatie permissions.
   - 20 realistic Indonesian customer records mapped to detailed administrative region codes.
   - 12 high-quality default climbing equipment items with real Unsplash images.

5. **Start Development Servers:**
   - Run Laravel backend:
     ```bash
     php artisan serve
     ```
   - Run Reverb WebSocket server (if required for real-time alerts or AI chatting):
     ```bash
     php artisan reverb:start
     ```
   - Run Vite development server:
     ```bash
     npm run dev
     ```

---

## 🐳 Docker & Docker Compose Setup (Laravel Octane & FrankenPHP)

The application includes a production-ready, high-performance containerized setup running on **Laravel Octane** powered by **FrankenPHP** (Debian base image). The environment is split into development and production configurations.

### 1. Local Development Stack
Runs the app in **watch (hot-reload) mode** with local directory mounting:
- Build and start services:
  ```bash
  docker compose -f compose.dev.yaml up -d --build
  ```
- View live container logs:
  ```bash
  docker compose -f compose.dev.yaml logs -f
  ```
- Run tests inside the running development container:
  ```bash
  docker compose -f compose.dev.yaml exec app php artisan test --compact
  ```
- Download and run the Qwen AI model (Ollama) inside the container:
  ```bash
  docker exec -it rentalapp_ollama_dev ollama run qwen2.5:3b
  ```
  *(Note: The `qwen2.5:3b` AI model is required for the assistant chatbot features to work)*
- Access the app locally: Open `http://localhost:8000` in your browser.

### 2. Production Stack
Runs the app with optimized configurations caching:
- Build and launch production stack:
  ```bash
  docker compose -f compose.prod.yaml up -d --build
  ```
- Run tests inside production container:
  ```bash
  docker compose -f compose.prod.yaml exec app php artisan test --compact
  ```

---

## 🧪 Verification & Testing

### Automated Feature Tests
Execute the PHPUnit suite to verify the security rules, validation constraints, and database actions:
```bash
php artisan test --compact
```

### Code Formatting
Execute Laravel Pint to ensure all backend PHP code meets cleanup and styling standards:
```bash
vendor/bin/pint --dirty --format agent
```

### Production Compilation
Bundle the TypeScript and Tailwind CSS assets to verify compilation and production readiness:
```bash
npm run build
```

---

## ☕ Support & Donation

If you find this project useful, you can support its development by donating via Saweria:

[![Donate via Saweria](https://img.shields.io/badge/Donate-Saweria-orange?style=for-the-badge&logo=coffee)](https://saweria.co/kodya)

Or scan the QR code below:

<p align="center">
  <img src="public/images/saweria.jpg" width="200" alt="Saweria QR Code">
</p>
