# Plan: Menangani Perubahan Harga Mid-Booking

## Problem Statement

Saat ini sistem tidak bisa menangani dua skenario bisnis yang sering terjadi:

1. **Kasus Sevia (Extra Charges)**: Customer booking Pas Foto Rp 40.000, tapi saat eksekusi bawa teman jadi total Rp 80.000. Saat ini payment Rp 80.000 tercatat tapi total booking masih Rp 40.000, menyebabkan outstanding negatif -Rp 40.000.

2. **Kasus Yofa (Package Change)**: Customer booking paket A, tapi saat eksekusi ganti ke paket B dengan harga berbeda. Sistem tidak punya cara yang jelas untuk track perubahan ini.

## User Requirements (dari Q&A)

- ✅ Solusi **simple** - tidak perlu audit trail kompleks
- ✅ Outstanding negatif **diabaikan** - tampilkan Rp 0 di laporan
- ✅ Gunakan **addon system** untuk track service upgrades
- ✅ Perubahan hanya diizinkan untuk **booking Active**

## Solution Overview

Memanfaatkan **existing addon system** yang sudah ada, dengan minimal perubahan:

1. Buat predefined addons untuk skenario umum (Extra Person, Service Upgrade, dll)
2. Gunakan existing `PUT /api/bookings/update` endpoint untuk update
3. Tambah validasi untuk perubahan harga pada Active bookings
4. Fix laporan revenue untuk handle outstanding negatif
5. (Optional) Tambah UI helper untuk memudahkan adjustment

**Keuntungan approach ini:**
- ✅ Minimal code changes (leverage existing infrastructure)
- ✅ No new database tables needed
- ✅ Compatible dengan existing bookings
- ✅ Simple untuk digunakan staff

---

## Technical Design

### 1. Data Model (No Schema Changes Needed!)

Existing structure sudah support ini:

```typescript
// bookings table
{
  id: string,
  total_price: number,  // ← Will be updated
  service_base_price: number,
  addons_total: number,  // ← Will be updated
  // ... other fields
}

// booking_addons table (existing)
{
  booking_id: string,
  addon_id: string,
  quantity: number,
  price_at_booking: number,  // ← Snapshot harga saat ditambahkan
}

// addons table (existing)
{
  id: string,
  name: string,
  price: number,
  applicable_categories: string,  // JSON array
  is_active: boolean
}
```

### 2. New Predefined Addons

Buat addon-addon khusus untuk mid-booking adjustments:

```json
[
  {
    "id": "addon-extra-person",
    "name": "Tambah Orang",
    "price": 40000,
    "applicable_categories": ["Pas Foto", "Self Photo", "Birthday", "Family"],
    "is_active": true
  },
  {
    "id": "addon-service-upgrade-silver",
    "name": "Upgrade ke Prewedding Silver",
    "price": 280000,  // Selisih Bronze → Silver
    "applicable_categories": ["Prewedding Bronze"],
    "is_active": true
  },
  {
    "id": "addon-service-downgrade-bronze",
    "name": "Downgrade ke Prewedding Bronze",
    "price": -280000,  // Negatif untuk downgrade
    "applicable_categories": ["Prewedding Silver"],
    "is_active": true
  },
  {
    "id": "addon-additional-hour",
    "name": "Tambah Jam Foto",
    "price": 200000,
    "applicable_categories": ["Wedding", "Prewedding Bronze", "Prewedding Silver", "Prewedding Gold"],
    "is_active": true
  },
  {
    "id": "addon-rush-editing",
    "name": "Percepat Editing (Rush Order)",
    "price": 150000,
    "applicable_categories": null,  // Applicable to all
    "is_active": true
  },
  {
    "id": "addon-misc-adjustment",
    "name": "Penyesuaian Lainnya",
    "price": 0,  // Price akan diinput manual
    "applicable_categories": null,
    "is_active": true
  }
]
```

### 3. API Enhancement

#### A. Enhanced Update Endpoint

**File:** `/root/ceritakita-booking/app/api/bookings/update/route.ts`

**Changes needed:**

```typescript
// Line ~77: Add validation sebelum IMMUTABLE check
// VALIDATE: Only Active bookings can have price changes
if (updates.finance && currentBooking.status !== 'Active') {
  return NextResponse.json(
    {
      error: 'Perubahan harga hanya diizinkan untuk booking dengan status Active',
      code: 'INVALID_STATUS_FOR_PRICE_CHANGE'
    },
    { status: 400 }
  );
}

// Line ~150-170: Add after addon update
// RECALCULATE total_price when addons change
if (updates.addons !== undefined) {
  // Calculate new addons_total
  const newAddonsTotal = updates.addons.reduce((sum, addon) => {
    return sum + (addon.price_at_booking * addon.quantity);
  }, 0);

  // Recalculate total_price
  const serviceBase = updates.finance?.service_base_price ?? currentBooking.finance.service_base_price ?? 0;
  const baseDiscount = updates.finance?.base_discount ?? currentBooking.finance.base_discount ?? 0;
  const couponDiscount = updates.finance?.coupon_discount ?? currentBooking.finance.coupon_discount ?? 0;

  const newTotalPrice = Math.max(0, serviceBase + newAddonsTotal - baseDiscount - couponDiscount);

  // Update finance data
  updateData.finance = {
    ...currentBooking.finance,
    ...updates.finance,
    addons_total: newAddonsTotal,
    total_price: newTotalPrice
  };

  logger.info('Booking price adjusted due to addon changes', {
    bookingId: id,
    oldTotal: currentBooking.finance.total_price,
    newTotal: newTotalPrice,
    addonsAdded: updates.addons.length,
    requestId
  });
}

// Line ~180: Update SQL to include finance fields
db.prepare(`
  UPDATE bookings SET
    status = ?,
    customer_name = ?,
    customer_whatsapp = ?,
    customer_category = ?,
    booking_date = ?,
    booking_notes = ?,
    booking_location_link = ?,
    total_price = ?,           -- ← ADD THIS
    addons_total = ?,          -- ← ADD THIS
    photographer_id = ?,
    updated_at = ?
  WHERE id = ?
`).run(
  // ... existing params
  updateData.finance?.total_price,
  updateData.finance?.addons_total,
  // ... rest
);
```

#### B. New Validation Schema

**File:** `/root/ceritakita-booking/lib/validation.ts`

Add new validation for price adjustments:

```typescript
export const priceAdjustmentSchema = z.object({
  booking_id: z.string().uuid(),
  addon_id: z.string(),
  quantity: z.number().int().positive().default(1),
  price: z.number().nonnegative().optional(), // Optional override price
  reason: z.string().max(500).optional()
});
```

### 4. Helper Function for Price Adjustment

**New File:** `/root/ceritakita-booking/lib/price-adjustments.ts`

```typescript
import { type Booking, type BookingAddon } from './types';
import { getAddon } from './addons';
import { safeNumber } from './type-utils';

export interface PriceAdjustmentInput {
  bookingId: string;
  addonId: string;
  quantity?: number;
  customPrice?: number; // For manual adjustments
  reason?: string;
}

/**
 * Add a price adjustment to an existing booking
 * Returns the new total price
 */
export async function addPriceAdjustment(
  currentBooking: Booking,
  adjustment: PriceAdjustmentInput
): Promise<{ newAddons: BookingAddon[], newTotalPrice: number }> {
  // Get addon details
  const addon = getAddon(adjustment.addonId);
  if (!addon) {
    throw new Error('Addon not found');
  }

  // Check if addon is applicable to this service category
  if (addon.applicable_categories) {
    const categories = JSON.parse(addon.applicable_categories);
    if (!categories.includes(currentBooking.customer.category)) {
      throw new Error('Addon not applicable to this service category');
    }
  }

  // Determine price (use custom price if provided, otherwise use addon price)
  const price = adjustment.customPrice ?? addon.price;
  const quantity = adjustment.quantity ?? 1;

  // Get existing addons
  const existingAddons = currentBooking.addons ?? [];

  // Check if addon already exists
  const existingAddonIndex = existingAddons.findIndex(a => a.addon_id === adjustment.addonId);

  let newAddons: BookingAddon[];
  if (existingAddonIndex >= 0) {
    // Update existing addon quantity
    newAddons = [...existingAddons];
    newAddons[existingAddonIndex] = {
      ...newAddons[existingAddonIndex],
      quantity: newAddons[existingAddonIndex].quantity + quantity
    };
  } else {
    // Add new addon
    newAddons = [
      ...existingAddons,
      {
        addon_id: adjustment.addonId,
        addon_name: addon.name,
        quantity,
        price_at_booking: price
      }
    ];
  }

  // Calculate new totals
  const newAddonsTotal = newAddons.reduce((sum, a) =>
    sum + (safeNumber(a.price_at_booking) * safeNumber(a.quantity)), 0
  );

  const serviceBase = currentBooking.finance.service_base_price ?? 0;
  const baseDiscount = currentBooking.finance.base_discount ?? 0;
  const couponDiscount = currentBooking.finance.coupon_discount ?? 0;

  const newTotalPrice = Math.max(0, serviceBase + newAddonsTotal - baseDiscount - couponDiscount);

  return { newAddons, newTotalPrice };
}

/**
 * Helper untuk skenario umum: Tambah orang
 */
export async function addExtraPerson(booking: Booking, count: number = 1) {
  return addPriceAdjustment(booking, {
    bookingId: booking.id,
    addonId: 'addon-extra-person',
    quantity: count,
    reason: `Tambah ${count} orang saat eksekusi`
  });
}

/**
 * Helper untuk upgrade service
 */
export async function upgradeService(booking: Booking, targetService: string) {
  // Map service upgrades
  const upgradeMap: Record<string, string> = {
    'Prewedding Bronze': 'addon-service-upgrade-silver',
    // Add more mappings as needed
  };

  const addonId = upgradeMap[booking.customer.category];
  if (!addonId) {
    throw new Error('Service upgrade not available for this category');
  }

  return addPriceAdjustment(booking, {
    bookingId: booking.id,
    addonId,
    quantity: 1,
    reason: `Upgrade dari ${booking.customer.category} ke ${targetService}`
  });
}
```

### 5. Fix Revenue Report - Handle Negative Outstanding

**Files to update:**
- `/root/ceritakita-booking/scripts/check-revenue.js`
- `/root/ceritakita-booking/scripts/check-all-revenue.js`
- Any dashboard/report that shows outstanding

**Change needed:**

```javascript
// Before:
const outstanding = totalPrice - paidAmount;

// After:
const outstanding = Math.max(0, totalPrice - paidAmount);

// Explanation: Jika customer bayar lebih (overpayment),
// anggap sebagai Rp 0 outstanding untuk simplicity
```

**Example in report script:**

```javascript
bookings.forEach(b => {
  const payments = db.prepare('SELECT * FROM payments WHERE booking_id = ?').all(b.id);
  const paid = payments.reduce((s, p) => s + (p.amount || 0), 0);
  const outstanding = Math.max(0, b.total_price - paid);  // ← FIX HERE

  // ... rest of code
});
```

### 6. (Optional) API Endpoint untuk Quick Adjustments

**New File:** `/root/ceritakita-booking/app/api/bookings/adjust-price/route.ts`

Simplified endpoint khusus untuk price adjustments:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { readBooking, updateBooking } from '@/lib/storage-sqlite';
import { addPriceAdjustment } from '@/lib/price-adjustments';
import { priceAdjustmentSchema } from '@/lib/validation';
import { logger } from '@/lib/logger';

/**
 * POST /api/bookings/adjust-price
 * Quick endpoint untuk price adjustments
 */
export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    // Auth check
    const authCheck = await requireAuth(req);
    if (authCheck) return authCheck;

    // Parse and validate
    const body = await req.json();
    const validation = priceAdjustmentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', issues: validation.error.issues },
        { status: 400 }
      );
    }

    const { booking_id, addon_id, quantity, price, reason } = validation.data;

    // Get current booking
    const currentBooking = readBooking(booking_id);
    if (!currentBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Validate status
    if (currentBooking.status !== 'Active') {
      return NextResponse.json(
        { error: 'Can only adjust price for Active bookings' },
        { status: 400 }
      );
    }

    // Calculate adjustment
    const { newAddons, newTotalPrice } = await addPriceAdjustment(currentBooking, {
      bookingId: booking_id,
      addonId: addon_id,
      quantity,
      customPrice: price,
      reason
    });

    // Update booking
    await updateBooking({
      id: booking_id,
      addons: newAddons,
      finance: {
        ...currentBooking.finance,
        addons_total: newAddons.reduce((sum, a) => sum + (a.price_at_booking * a.quantity), 0),
        total_price: newTotalPrice
      }
    });

    logger.info('Price adjustment applied', {
      bookingId: booking_id,
      oldTotal: currentBooking.finance.total_price,
      newTotal: newTotalPrice,
      addonId: addon_id,
      reason,
      requestId
    });

    return NextResponse.json({
      success: true,
      booking_id,
      old_total: currentBooking.finance.total_price,
      new_total: newTotalPrice,
      adjustment: newTotalPrice - currentBooking.finance.total_price
    });

  } catch (error) {
    logger.error('Price adjustment failed', { requestId }, error as Error);
    return NextResponse.json(
      { error: 'Failed to adjust price' },
      { status: 500 }
    );
  }
}
```

---

## Implementation Steps

### Step 1: Create Predefined Addons
**Files:** Data seeding script or manual via admin UI

1. Create addon entries untuk:
   - Tambah Orang (Extra Person)
   - Service Upgrade options
   - Additional Hours
   - Misc Adjustment (untuk kasus custom)

**Method:** Via admin UI atau script:
```typescript
// scripts/seed-adjustment-addons.js
const addons = [
  { id: 'addon-extra-person', name: 'Tambah Orang', price: 40000, ... },
  { id: 'addon-service-upgrade-silver', name: 'Upgrade ke Silver', price: 280000, ... },
  // ... etc
];

addons.forEach(addon => createAddon(addon));
```

### Step 2: Update Validation & Update Endpoint
**Files:**
- `/root/ceritakita-booking/app/api/bookings/update/route.ts` (lines ~77, ~150-170, ~180)
- `/root/ceritakita-booking/lib/validation.ts` (add priceAdjustmentSchema)

**Changes:**
1. Add status validation (only Active bookings)
2. Add auto-recalculation of total_price when addons change
3. Update SQL to persist finance changes
4. Add logging for price changes

### Step 3: Create Helper Library
**New File:** `/root/ceritakita-booking/lib/price-adjustments.ts`

Implement:
- `addPriceAdjustment()` - Core function
- `addExtraPerson()` - Shortcut for common case
- `upgradeService()` - Shortcut for service changes

### Step 4: Fix Revenue Reports
**Files:**
- `/root/ceritakita-booking/scripts/check-revenue.js`
- `/root/ceritakita-booking/scripts/check-all-revenue.js`
- Dashboard components that show outstanding

**Change:** `Math.max(0, totalPrice - paidAmount)` untuk handle negative outstanding

### Step 5: (Optional) Create Quick Adjustment Endpoint
**New File:** `/root/ceritakita-booking/app/api/bookings/adjust-price/route.ts`

Simplified endpoint untuk staff usage.

### Step 6: (Optional) Add UI for Adjustments
**Files:** Admin booking detail page

Add button/form untuk:
- "Tambah Orang"
- "Upgrade Paket"
- "Penyesuaian Lainnya"

---

## How to Use (Post-Implementation)

### Scenario 1: Kasus Sevia (Tambah Orang)

**Via API:**
```bash
curl -X PUT https://your-domain.com/api/bookings/update \
  -H "Content-Type: application/json" \
  -d '{
    "id": "sevia-booking-id",
    "addons": [
      {
        "addon_id": "addon-extra-person",
        "addon_name": "Tambah Orang",
        "quantity": 1,
        "price_at_booking": 40000
      }
    ]
  }'
```

**System will:**
1. Add addon to booking
2. Recalculate addons_total = 40000
3. Recalculate total_price = 40000 + 40000 = 80000
4. Update booking in database
5. Outstanding becomes: 80000 - 80000 = 0 ✅

**Via Quick Endpoint (if implemented):**
```bash
curl -X POST https://your-domain.com/api/bookings/adjust-price \
  -d '{
    "booking_id": "sevia-booking-id",
    "addon_id": "addon-extra-person",
    "quantity": 1,
    "reason": "Customer bawa teman saat sesi foto"
  }'
```

### Scenario 2: Kasus Yofa (Ganti Paket)

**Original booking:**
- Prewedding Bronze: Rp 400.000

**Saat eksekusi, ganti ke Silver:**
- Prewedding Silver: Rp 680.000
- Selisih: +Rp 280.000

**Via API:**
```bash
curl -X PUT https://your-domain.com/api/bookings/update \
  -d '{
    "id": "yofa-booking-id",
    "addons": [
      {
        "addon_id": "addon-service-upgrade-silver",
        "addon_name": "Upgrade ke Prewedding Silver",
        "quantity": 1,
        "price_at_booking": 280000
      }
    ]
  }'
```

**System will:**
1. Add "Upgrade ke Silver" addon
2. Recalculate total_price = 400000 + 280000 = 680000
3. Update booking
4. Di sistem akan terlihat: Original service (Bronze) + Addon (Upgrade) = Final (Silver price)

---

## Verification & Testing

### Manual Testing

1. **Test Extra Person (Sevia Case):**
   ```bash
   # Create test booking: Pas Foto Rp 40.000
   # Payment: Rp 80.000
   # Expected before fix: Outstanding = -40.000

   # Apply addon "Extra Person"
   # Expected after:
   #   - total_price = 80.000
   #   - outstanding = 0
   ```

2. **Test Service Upgrade (Yofa Case):**
   ```bash
   # Create test booking: Prewedding Bronze Rp 400.000
   # Apply addon "Upgrade to Silver" (+280.000)
   # Expected:
   #   - total_price = 680.000
   #   - addons shows upgrade item
   ```

3. **Test Validation:**
   ```bash
   # Try to adjust price on Completed booking
   # Expected: Error "Only Active bookings can be adjusted"
   ```

4. **Test Revenue Report:**
   ```bash
   docker exec ceritakita-booking node /app/scripts/check-all-revenue.js
   # Check that:
   #   - No negative outstanding shown
   #   - Sevia shows Rp 0 outstanding (not -40k)
   ```

### Automated Testing

**Test file:** `/root/ceritakita-booking/__tests__/price-adjustments.test.ts`

```typescript
describe('Price Adjustments', () => {
  it('should add extra person charge', async () => {
    const booking = createTestBooking({ total: 40000 });
    const result = await addPriceAdjustment(booking, {
      bookingId: booking.id,
      addonId: 'addon-extra-person',
      quantity: 1
    });

    expect(result.newTotalPrice).toBe(80000);
    expect(result.newAddons).toHaveLength(1);
  });

  it('should prevent adjustment on non-Active bookings', async () => {
    const booking = createTestBooking({ status: 'Completed' });
    await expect(updateBooking({ id: booking.id, finance: { total_price: 100000 } }))
      .rejects.toThrow('Only Active bookings');
  });

  it('should handle negative outstanding as zero', () => {
    const outstanding = calculateOutstanding(40000, 80000);
    expect(outstanding).toBe(0); // Not -40000
  });
});
```

### End-to-End Testing

1. Login ke admin panel
2. Buka booking Sevia
3. Klik "Adjust Price" atau equivalent button
4. Tambah addon "Extra Person"
5. Verify:
   - Total price berubah jadi Rp 80.000
   - Outstanding jadi Rp 0
   - History shows addon added
6. Check revenue report
7. Verify outstanding tidak negatif

---

## Rollback Plan

Jika ada masalah, rollback mudah karena:

1. **No schema changes** - database structure tetap sama
2. **Backward compatible** - existing bookings tidak terpengaruh
3. **Addons are optional** - bisa dihapus tanpa break data
4. **Simple revert** - tinggal revert file changes via git

**Rollback steps:**
```bash
git revert <commit-hash>
docker-compose restart ceritakita-booking
```

---

## Alternative Approaches (Not Chosen)

### Alternative 1: Complex Audit Trail System
**Rejected because:** User prefer simple solution

Would require:
- New tables: price_adjustment_history, service_change_history
- More complex UI
- More code to maintain

### Alternative 2: Immutable Bookings with Amendments
**Rejected because:** Over-engineered for this use case

Would treat price changes as separate "amendment" documents.

### Alternative 3: Direct Price Override
**Rejected because:** No traceability

Just allow direct edit of total_price without any justification.

---

## Critical Files

### Must Modify:
1. `/root/ceritakita-booking/app/api/bookings/update/route.ts` - Add validation & recalculation
2. `/root/ceritakita-booking/scripts/check-revenue.js` - Fix negative outstanding
3. `/root/ceritakita-booking/scripts/check-all-revenue.js` - Fix negative outstanding

### Must Create:
1. `/root/ceritakita-booking/lib/price-adjustments.ts` - Helper functions
2. Predefined addons data (via admin UI or seed script)

### Optional Create:
1. `/root/ceritakita-booking/app/api/bookings/adjust-price/route.ts` - Quick adjustment endpoint
2. UI components for price adjustment forms

---

## Success Criteria

✅ **Sevia case solved:**
- Booking awal Rp 40k, payment Rp 80k
- Add "Extra Person" addon
- Total jadi Rp 80k
- Outstanding = Rp 0 (not -Rp 40k)

✅ **Yofa case solved:**
- Booking Bronze Rp 400k
- Add "Upgrade to Silver" addon (+Rp 280k)
- Total jadi Rp 680k
- Payment history tetap jelas

✅ **Validation works:**
- Only Active bookings can be adjusted
- Price changes logged properly
- Revenue reports show correct data

✅ **User Experience:**
- Simple untuk digunakan staff
- Clear explanation di addon name
- Tidak perlu training kompleks

---

## Estimated Implementation Time

- Step 1 (Create addons): 30 min
- Step 2 (Update endpoint): 2 hours
- Step 3 (Helper library): 1.5 hours
- Step 4 (Fix reports): 1 hour
- Step 5 (Optional endpoint): 1 hour
- Step 6 (Optional UI): 2-3 hours

**Total Core Features:** ~5 hours
**With Optional Features:** ~8 hours

---

## Notes & Assumptions

1. Assumes staff akan input adjustments via admin panel or API
2. Assumes addon system sudah familiar untuk staff
3. Assumes tidak perlu multi-level approval untuk price changes
4. Assumes logging via existing logger.info() cukup untuk audit Assumes overpayment cases jarang terjadi dan bisa handled ml
