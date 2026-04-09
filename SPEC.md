# HvacPass - HVAC Field Service Management PWA

## 1. Concept & Vision

**HvacPass** to profesjonalna aplikacja Progressive Web App dla branży HVAC (klimatyzacja, pompy ciepła), która zastępuje chaotyczną komunikację przez WhatsApp zorganizowanym systemem dokumentacji zleceń. Aplikacja wprowadza europejskie standardy jakości (Premium Quality Standard) z pełną ścieżką audit trail - od rejestracji czasu pracy, przez dokumentację fotograficzną, aż po automatyczne raporty PDF dla klientów końcowych.

**Design Philosophy**: Minimalistyczny, ale profesjonalny interfejs zoptymalizowany pod kątem pracy w terenie. Duże przyciski dotykowe, wysoki kontrast dla czytelności w świetle dziennym, offline-first architecture dla pracy bez zasięgu.

**Target Users**:
- Instalatorzy HVAC (mobile-first, intuitive workflow)
- Administratorzy firm (dashboard analityczny, zarządzanie zespołem)
- Klienci końcowi (otrzymują raporty PDF emailem)

---

## 2. Design Language

### Aesthetic Direction
**"Industrial Precision meets Digital Comfort"** - inspiracja z systemów przemysłowych SCADA, ale z ciepłym, przyjaznym interfejsem. Ciemne tło dla redukcji zmęczenia oczu podczas długich sesji, z akcentami koloru pomarańczowego (energia, profesjonalizm).

### Color Palette

```css
/* Primary Brand */
--color-primary: #F97316;        /* Orange - główny akcent */
--color-primary-dark: #EA580C;   /* Hover state */
--color-primary-light: #FFEDD5;  /* Tło akcentów */

/* Semantic Colors */
--color-success: #22C55E;        /* Green - ukończone */
--color-warning: #EAB308;        /* Yellow - w trakcie */
--color-danger: #EF4444;         /* Red - błędy/alerty */

/* Neutrals */
--color-background: #0F172A;    /* Slate 900 - główne tło */
--color-surface: #1E293B;        /* Slate 800 - karty */
--color-surface-elevated: #334155; /* Slate 700 - modale */
--color-border: #475569;        /* Slate 600 */
--color-text-primary: #F8FAFC;   /* Slate 50 */
--color-text-secondary: #94A3B8; /* Slate 400 */
--color-text-muted: #64748B;     /* Slate 500 */
```

### Typography

```css
/* Font Stack */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Scale - Mobile First */
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px - body */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px - headings */
--text-3xl: 1.875rem;    /* 30px - mobile headings */
--text-4xl: 2.25rem;     /* 36px - dashboard */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Spacing System (8px Grid)

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

### Motion Philosophy

- **Micro-interactions**: 150ms ease-out dla hover, 200ms dla focus
- **Page transitions**: 300ms slide-in, fade-out 200ms
- **Loading states**: Pulse animation 1.5s infinite
- **Touch feedback**: Scale 0.98 na tap, ripple effect na przyciskach
- **Reduced motion**: Respektuj `prefers-reduced-motion`

### Visual Assets

- **Icons**: Lucide React (outline style, 24px default)
- **Illustrations**: Minimalist line art dla empty states
- **Photos**: User-generated z kompresją do 1200px max
- **QR Codes**: Generated dynamically z `qrcode` library

---

## 3. Layout & Structure

### Mobile-First Grid

```
App Layout:
├── Header (56px fixed)
│   ├── Logo/App Name
│   ├── Language Selector
│   └── User Menu
├── Main Content (scrollable)
│   └── Page-specific content
├── Bottom Navigation (64px, fixed)
│   ├── Dashboard
│   ├── Scan QR
│   ├── My Logs
│   └── Profile
└── FAB (Floating Action Button) - contextual
```

### Page Structure

**1. Login/Auth Pages**
- Clean centered card (max-width: 400px)
- Company logo prominent
- Social login options (future)

**2. Dashboard (Home)**
```
┌─────────────────────────────┐
│  Welcome, [Name]            │
│  Today: [Date]              │
├─────────────────────────────┤
│  ┌─────────┐  ┌─────────┐   │
│  │ Active  │  │ Completed│  │
│  │   2     │  │    15    │   │
│  │ orders  │  │ this month│  │
│  └─────────┘  └─────────┘   │
├─────────────────────────────┤
│  [Active Work Order Card]   │
│  - Customer: ACME Corp      │
│  - Unit: Daikin ATX35       │
│  - Started: 2h 15m ago      │
│  [📷 2/4 photos]            │
│  [STOP WORK] ← Large CTA    │
├─────────────────────────────┤
│  Recent Orders              │
│  └─ List items...          │
└─────────────────────────────┘
```

**3. Work Order Detail**
```
┌─────────────────────────────┐
│  ← Back    ACME Corp         │
├─────────────────────────────┤
│  Unit: Daikin ATX35          │
│  SN: DKN-2024-12345          │
│  Location: Building A, Floor 3│
├─────────────────────────────┤
│  TIMER                       │
│  ┌─────────────────────────┐│
│  │       02:15:32          ││
│  │   [PAUSE]  [STOP]       ││
│  └─────────────────────────┘│
├─────────────────────────────┤
│  REQUIRED PHOTOS             │
│  [Protection] ✓ Uploaded    │
│  [Technical] ✓ Uploaded     │
│  [Final Result] ⏳ Required   │
│  [Cleaning] ⏳ Required       │
│  [Add Photo + ]              │
├─────────────────────────────┤
│  NOTES                       │
│  ┌─────────────────────────┐│
│  │ Add work notes...       ││
│  └─────────────────────────┘│
├─────────────────────────────┤
│  [✅ COMPLETE WORK ORDER]   │
│  (disabled until all photos)│
└─────────────────────────────┘
```

**4. QR Scanner**
- Full-screen camera view
- Overlay guides for QR alignment
- Haptic feedback on successful scan
- Auto-redirect to unit detail

**5. Admin Dashboard (Web-focused)**
- Data tables z pagination
- Charts (work orders per month, avg time)
- Export to CSV/Excel
- User management

### Responsive Breakpoints

```css
/* Mobile First */
@media (min-width: 640px)  { /* sm - Large phones */ }
@media (min-width: 768px)  { /* md - Tablets */ }
@media (min-width: 1024px) { /* lg - Desktop */ }
@media (min-width: 1280px) { /* xl - Large desktop */ }
```

---

## 4. Features & Interactions

### Core Workflow

#### 4.1 Selection Phase
**User Action**: Select unit from list OR scan QR code
**System Response**:
1. **List View**:
   - Filterable by customer, brand, status
   - Search by serial number, customer name
   - Tap → navigate to unit detail
2. **QR Scan**:
   - Camera opens (permission request if first time)
   - Scan QR → decode `hvacpass://unit/{qr_code_id}`
   - Auto-redirect to work order creation

**Edge Cases**:
- Invalid QR → "Unknown code. Please try again or contact admin."
- Duplicate scan → "Work order already exists. Continue with existing?"

#### 4.2 Start Work Order
**User Action**: Tap "START WORK" button
**System Response**:
1. Request GPS permission (if not granted)
2. Record: `start_time = NOW()`, `gps_start = current_coords`
3. Status: `in_progress`
4. Show timer (counting up)
5. Enable pause/resume

**Required Fields** (validation before start):
- Unit selected ✓
- GPS location acquired ✓

**Error Handling**:
- GPS unavailable → Warning: "Location unavailable. Work will be logged without coordinates."
- Offline → Queue locally, sync when online

#### 4.3 Photo Documentation (MANDATORY)
**Photo Types** (4 required):
1. **Protection** - Zabezpieczenie miejsca pracy
2. **Technical** - Newralgiczne punkty (np. przyłącze, spiętrzenie)
3. **Final** - Efekt końcowy instalacji
4. **Cleaning** - Posprzątane miejsce

**Upload Flow**:
1. Tap photo type → Camera opens
2. Capture photo
3. Client-side compression (max 1200px, 80% quality JPEG)
4. Upload to Supabase Storage
5. Show thumbnail preview
6. Allow retake if needed

**Validation**:
- Minimum 4 photos required before completion
- Each photo type has unique validation (e.g., Technical needs clear focus)

**Offline Mode**:
- Photos stored in IndexedDB
- Background upload when online
- Progress indicator (syncing 2/4)

#### 4.4 Completion
**User Action**: Tap "COMPLETE" button
**System Response**:
1. Final validation:
   - All 4 photos uploaded ✓
   - Timer stopped (auto if not)
   - GPS end recorded
2. Status: `completed`
3. Generate PDF report
4. Send notification to customer (email)
5. Show success confirmation

**PDF Report Contents**:
```
┌────────────────────────────────────────┐
│  WORK ORDER REPORT                     │
│  #WO-2024-001234                       │
├────────────────────────────────────────┤
│  Customer: ACME Corporation            │
│  Address: 123 Business Park, Warsaw   │
│  Contact: Jan Kowalski, +48 123 456 789│
├────────────────────────────────────────┤
│  UNIT INFORMATION                      │
│  Brand: Daikin                         │
│  Model: ATX35K2V1B                     │
│  Serial: DKN-2024-12345                │
├────────────────────────────────────────┤
│  WORK DETAILS                          │
│  Type: Installation                    │
│  Date: 2024-01-15 14:30                │
│  Duration: 2h 15m                      │
├────────────────────────────────────────┤
│  PHOTOS                                │
│  [4 thumbnails with labels]            │
├────────────────────────────────────────┤
│  NOTES                                  │
│  Installed on existing bracket.        │
│  Customer requested additional         │
│  insulation on copper lines.           │
├────────────────────────────────────────┤
│  INSTALLER                             │
│  Name: Piotr Nowak                     │
│  License: HVAC-2024-5432               │
└────────────────────────────────────────┘
```

#### 4.5 AI-Ready Structure (Quality Check)
Photos include metadata for future AI analysis:
- `capture_timestamp` - precise time
- `gps_coords` - location where photo taken
- `light_conditions` - estimated from EXIF
- `device_info` - phone model for consistency

---

## 5. Component Inventory

### Button Components

**Primary Button** (CTA actions)
```tsx
// States: default, hover, active, disabled, loading
// Size: h-14 (56px) for mobile touch targets
// Animation: scale(0.98) on tap
```

**Secondary Button** (Less prominent actions)
```tsx
// Border: 1px solid --color-border
// Hover: background --color-surface
```

**Icon Button** (Navigation, toolbar)
```tsx
// 44x44px minimum touch target
// Focus ring: 2px offset
```

### Form Components

**Input Field**
- Height: 48px
- Border radius: 8px
- States: default, focus (ring-2), error (red border), disabled

**Select/Dropdown**
- Native select for mobile (better UX)
- Custom dropdown for desktop

**Textarea**
- Auto-resize
- Character counter for limited fields

### Cards

**Work Order Card**
- Elevation: subtle shadow
- Status indicator: left border color
- Content: customer, unit, timer, progress

**Unit Card**
- Image placeholder (brand logo)
- Key info: brand, model, serial

### Navigation

**Bottom Tab Bar**
- 4 tabs + 1 FAB
- Active state: filled icon + label
- Inactive: outline icon only

**Header**
- Sticky
- Back button (when nested)
- Actions (right side)

### Feedback Components

**Toast Notifications**
- Position: bottom-center
- Duration: 3s (dismissible)
- Types: success, error, warning, info

**Loading States**
- Skeleton loaders for content
- Spinner for actions
- Progress bar for uploads

**Empty States**
- Illustration
- Clear message
- Action button if applicable

---

## 6. Technical Approach

### Frontend Stack

```
Framework: Next.js 14 (App Router)
Language: TypeScript 5.x
Styling: Tailwind CSS 3.x + shadcn/ui
State: Zustand (lightweight, simple)
Forms: React Hook Form + Zod
i18n: next-intl (App Router compatible)
PWA: next-pwa (Workbox)
```

### Backend Stack

```
Database: Supabase (PostgreSQL)
Auth: Supabase Auth (email + phone OTP)
Storage: Supabase Storage (photos bucket)
Functions: Supabase Edge Functions (notifications)
Realtime: Supabase Realtime (live updates)
```

### Key Libraries

```json
{
  "dependencies": {
    "next": "^14.1.0",
    "react": "^18.2.0",
    "typescript": "^5.3.0",
    "tailwindcss": "^3.4.0",
    "@supabase/supabase-js": "^2.39.0",
    "@supabase/ssr": "^0.1.0",
    "zustand": "^4.5.0",
    "react-hook-form": "^7.50.0",
    "@hookform/resolvers": "^3.3.0",
    "zod": "^3.22.0",
    "next-intl": "^3.4.0",
    "next-pwa": "^5.6.0",
    "browser-image-compression": "^2.0.2",
    "jspdf": "^2.5.1",
    "qrcode": "^1.5.3",
    "date-fns": "^3.3.0",
    "lucide-react": "^0.316.0",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-tabs": "^1.0.4",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.0",
    "vitest": "^1.2.0",
    "@testing-library/react": "^14.1.0",
    "eslint": "^8.56.0",
    "prettier": "^3.2.0"
  }
}
```

### API Design

**Work Orders**
```typescript
// GET /api/work-orders
// Query: ?status=in_progress&installer_id={id}
// Response: WorkOrder[]

// POST /api/work-orders
// Body: { unit_id, type, gps_start }
// Response: WorkOrder

// PATCH /api/work-orders/:id
// Body: { status, end_time, gps_end }
// Response: WorkOrder

// POST /api/work-orders/:id/photos
// Body: FormData (file, type)
// Response: Photo
```

**Units**
```typescript
// GET /api/units
// Query: ?customer_id, ?search, ?qr_code_id

// GET /api/units/:id
// Response: Unit with customer info
```

**Auth**
```typescript
// POST /api/auth/sign-in
// Body: { email, password }

// POST /api/auth/sign-up
// Body: { email, password, full_name, company_id }

// POST /api/auth/phone-verify
// Body: { phone, otp }
```

### Data Model (Supabase Schema)

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUMS
CREATE TYPE user_role AS ENUM ('admin', 'installer');
CREATE TYPE work_order_status AS ENUM ('draft', 'in_progress', 'completed', 'cancelled');
CREATE TYPE work_order_type AS ENUM ('install', 'service', 'warranty');
CREATE TYPE photo_type AS ENUM ('protection', 'technical', 'final', 'cleaning');

-- COMPANIES (Tenants)
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  tax_id TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROFILES (User Extension)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id),
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'installer',
  phone TEXT,
  preferred_lang TEXT DEFAULT 'pl',
  license_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CUSTOMERS
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT,
  postal_code TEXT,
  phone TEXT,
  email TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- UNITS (HVAC Equipment)
CREATE TABLE units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id),
  qr_code_id TEXT UNIQUE NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  serial_number TEXT,
  install_date DATE,
  install_params JSONB, -- { pipe_length, refrigerant_amount, etc }
  warranty_until DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- WORK ORDERS
CREATE TABLE work_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unit_id UUID NOT NULL REFERENCES units(id),
  installer_id UUID NOT NULL REFERENCES profiles(id),
  status work_order_status DEFAULT 'draft',
  type work_order_type NOT NULL,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  gps_start POINT, -- (longitude, latitude)
  gps_end POINT,
  notes TEXT,
  customer_signature TEXT, -- base64 if signed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PHOTOS
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  work_order_id UUID NOT NULL REFERENCES work_orders(id),
  type photo_type NOT NULL,
  storage_path TEXT NOT NULL,
  file_size INTEGER,
  width INTEGER,
  height INTEGER,
  capture_timestamp TIMESTAMPTZ DEFAULT NOW(),
  gps_coords POINT,
  ai_analysis JSONB, -- Future: { quality_score, issues_detected, etc }
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_profiles_company ON profiles(company_id);
CREATE INDEX idx_customers_company ON customers(company_id);
CREATE INDEX idx_units_customer ON units(customer_id);
CREATE INDEX idx_units_qr_code ON units(qr_code_id);
CREATE INDEX idx_work_orders_unit ON work_orders(unit_id);
CREATE INDEX idx_work_orders_installer ON work_orders(installer_id);
CREATE INDEX idx_work_orders_status ON work_orders(status);
CREATE INDEX idx_photos_work_order ON photos(work_order_id);

-- RLS POLICIES
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Company policies
CREATE POLICY "Users can view their company"
  ON companies FOR SELECT
  USING (auth.uid() IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  ));

-- Profiles: own profile + all in company (admin can see all)
CREATE POLICY "Users can view company profiles"
  ON profiles FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

-- Customers: company isolation
CREATE POLICY "Users can CRUD own company customers"
  ON customers FOR ALL
  USING (company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  ));

-- Units: company isolation via customer
CREATE POLICY "Users can CRUD own company units"
  ON units FOR ALL
  USING (customer_id IN (
    SELECT id FROM customers WHERE company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  ));

-- Work Orders: installer sees own, admin sees all in company
CREATE POLICY "Users can view own work orders"
  ON work_orders FOR SELECT
  USING (
    installer_id = auth.uid() OR
    installer_id IN (
      SELECT id FROM profiles
      WHERE company_id = (
        SELECT company_id FROM profiles WHERE id = auth.uid()
      ) AND role = 'admin'
    )
  );

CREATE POLICY "Users can create work orders"
  ON work_orders FOR INSERT
  WITH CHECK (installer_id = auth.uid());

CREATE POLICY "Users can update own work orders"
  ON work_orders FOR UPDATE
  USING (installer_id = auth.uid());

-- Photos: access via work order
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

-- Storage policies
CREATE POLICY "Users can upload photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'hvac_photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can view photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'hvac_photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete own photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'hvac_photos' AND auth.uid() IS NOT NULL);
```

### Authentication Flow

```
1. User signs up/in via email or phone (OTP)
2. Supabase creates auth.users entry
3. Trigger creates profile entry
4. User redirected to dashboard
5. JWT stored in cookies (httpOnly, secure)
6. RLS policies enforce data isolation
```

### File Structure

```
hvacpass/
├── public/
│   ├── manifest.json
│   ├── icons/
│   └── fonts/
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx (dashboard)
│   │   │   ├── units/
│   │   │   ├── work-orders/
│   │   │   ├── scan/
│   │   │   └── settings/
│   │   ├── api/
│   │   └── login/
│   ├── components/
│   │   ├── ui/ (shadcn)
│   │   ├── forms/
│   │   ├── work-order/
│   │   └── layout/
│   ├── lib/
│   │   ├── supabase/
│   │   ├── utils/
│   │   ├── hooks/
│   │   └── validators/
│   ├── stores/
│   ├── i18n/
│   │   ├── messages/
│   │   │   ├── pl.json
│   │   │   ├── en.json
│   │   │   ├── de.json
│   │   │   └── ua.json
│   │   └── config.ts
│   └── types/
├── migrations/
│   └── supabase/
│       └── 001_initial_schema.sql
├── tests/
│   ├── unit/
│   └── e2e/
├── SPEC.md
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

### Offline Strategy (PWA)

1. **Service Worker**: Cache app shell, static assets
2. **IndexedDB**: Store pending work orders, photos
3. **Background Sync**: Upload photos when online
4. **Optimistic UI**: Show success immediately, sync later

---

## 7. i18n Structure

### Translation Keys

```json
{
  "common": {
    "app_name": "HvacPass",
    "loading": "Loading...",
    "error": "Error",
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "confirm": "Confirm"
  },
  "auth": {
    "sign_in": "Sign in",
    "sign_out": "Sign out",
    "email": "Email",
    "password": "Password",
    "forgot_password": "Forgot password?"
  },
  "dashboard": {
    "welcome": "Welcome, {name}",
    "active_orders": "Active orders",
    "completed_this_month": "Completed this month"
  },
  "work_order": {
    "start": "Start Work",
    "stop": "Stop Work",
    "pause": "Pause",
    "resume": "Resume",
    "photos_required": "Required Photos",
    "photo_types": {
      "protection": "Work Protection",
      "technical": "Technical Points",
      "final": "Final Result",
      "cleaning": "Cleaned Area"
    },
    "complete": "Complete Work Order",
    "duration": "Duration",
    "notes": "Work Notes"
  },
  "validation": {
    "required": "This field is required",
    "invalid_email": "Invalid email address",
    "photos_missing": "Please upload all required photos"
  }
}
```

---

## 8. Security Implementation

### Input Validation (Zod Schemas)

```typescript
// Work Order Creation
const createWorkOrderSchema = z.object({
  unit_id: z.uuid(),
  type: z.enum(['install', 'service', 'warranty']),
  gps_start: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180)
  }).optional()
});

// Photo Upload
const photoUploadSchema = z.object({
  work_order_id: z.uuid(),
  type: z.enum(['protection', 'technical', 'final', 'cleaning']),
  file: z.instanceof(File).refine(
    (f) => f.size <= 10 * 1024 * 1024, // 10MB max
    "File too large"
  ).refine(
    (f) => ['image/jpeg', 'image/png', 'image/webp'].includes(f.type),
    "Invalid file type"
  )
});
```

### Security Headers

```typescript
// next.config.js
{
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(self), geolocation=(self)' }
        ]
      }
    ];
  }
}
```

### CSRF Protection
- SameSite=Strict cookies
- CSRF token in forms (Supabase handles)

---

## 9. Testing Strategy (Vitest)

### Unit Tests

```typescript
// __tests__/utils/time-calculator.test.ts
describe('Work Time Calculator', () => {
  it('calculates duration correctly', () => {
    const start = new Date('2024-01-15T08:00:00Z');
    const end = new Date('2024-01-15T10:15:00Z');
    expect(calculateDuration(start, end)).toBe('02:15:00');
  });

  it('handles pause/resume', () => {
    // Test paused time deduction
  });
});

// __tests__/validators/work-order.test.ts
describe('Work Order Validation', () => {
  it('rejects work order without photos', async () => {
    const invalid = { unit_id: 'uuid', status: 'completed', photos: [] };
    await expect(validateWorkOrder(invalid)).rejects.toThrow();
  });
});
```

### E2E Tests (Playwright)

```typescript
// tests/e2e/work-order-flow.spec.ts
test('complete work order flow', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'installer@test.com');
  await page.fill('[name="password"]', 'test123');
  await page.click('button[type="submit"]');

  // Navigate to unit
  await page.click('text=Scan QR');
  // ... mock camera

  // Start work
  await page.click('text=Start Work');

  // Upload photos
  await page.click('text=Protection');
  await page.uploadPhoto('test-protection.jpg');
  // ... repeat for all photos

  // Complete
  await page.click('text=Complete Work Order');
  await expect(page.locator('.toast-success')).toBeVisible();
});
```

---

## 10. Performance Optimization

### Image Compression

```typescript
// lib/utils/image-compression.ts
import imageCompression from 'browser-image-compression';

export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
    fileType: 'image/jpeg' as const,
    initialQuality: 0.8
  };

  return imageCompression(file, options);
}
```

### Code Splitting

```typescript
// Dynamic imports for heavy components
const QRScanner = dynamic(() => import('@/components/qr-scanner'), {
  ssr: false,
  loading: () => <Skeleton className="h-64" />
});
```

### Bundle Optimization

```typescript
// next.config.js
{
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns']
  }
}
```

---

## 11. Future Enhancements (Post-MVP)

1. **AI Photo Analysis** (Agent)
   - Detect quality issues
   - Verify required elements visible
   - Auto-grade documentation

2. **Multi-language Customer Portal**
   - Customer views own equipment
   - History of service visits
   - Rate service quality

3. **Offline Maps**
   - Download area maps for offline GPS
   - Navigate to customer without internet

4. **Parts Inventory**
   - Track used parts per work order
   - Automatic reorder suggestions

5. **Digital Signatures**
   - Customer signs on tablet
   - Legal documentation

---

## Appendix: Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# App
NEXT_PUBLIC_APP_URL=https://hvacpass.app
NEXT_PUBLIC_GMAPS_API_KEY=xxx
```