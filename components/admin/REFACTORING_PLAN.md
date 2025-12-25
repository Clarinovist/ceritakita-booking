# AdminDashboard & BookingForm Refactoring Plan

## Problem Statement
Both `AdminDashboard.tsx` (2,089 lines) and `BookingForm.tsx` (1,000 lines) have grown too large and are difficult to maintain. They need to be split into modular, reusable components with proper separation of concerns.

## Refactoring Strategy

### 1. Folder Structure

```
components/
├── admin/                          # NEW: Admin dashboard components
│   ├── AdminDashboard.tsx          # Main container (reduced to ~200 lines)
│   ├── AdminSidebar.tsx            # Already exists
│   ├── DashboardMetrics.tsx        # Already exists
│   ├── CouponManagement.tsx        # Already exists
│   ├── PortfolioManagement.tsx     # Already exists
│   ├── PaymentSettingsManagement.tsx # Already exists
│   ├── tables/
│   │   ├── BookingsTable.tsx
│   │   ├── ServicesTable.tsx
│   │   ├── PhotographersTable.tsx
│   │   └── AddonsTable.tsx
│   ├── modals/
│   │   ├── ServiceModal.tsx
│   │   ├── PhotographerModal.tsx
│   │   ├── AddonModal.tsx
│   │   ├── BookingModal.tsx
│   │   └── RescheduleModal.tsx
│   ├── hooks/
│   │   ├── useBookings.ts
│   │   ├── useServices.ts
│   │   ├── usePhotographers.ts
│   │   ├── useAddons.ts
│   │   └── useExport.ts
│   └── types/
│       └── admin.ts
│
├── booking/                        # NEW: Booking form components
│   ├── BookingForm.tsx             # Main container (reduced to ~150 lines)
│   ├── steps/
│   │   ├── ServiceSelection.tsx
│   │   ├── AddonsSelection.tsx
│   │   ├── PortfolioShowcase.tsx
│   │   ├── CustomerInfo.tsx
│   │   ├── ScheduleInfo.tsx
│   │   ├── PaymentInfo.tsx
│   │   └── OrderSummary.tsx
│   ├── components/
│   │   ├── CountdownTimer.tsx
│   │   ├── Lightbox.tsx
│   │   └── PaymentDetails.tsx
│   ├── hooks/
│   │   ├── useBookingForm.ts
│   │   ├── usePortfolio.ts
│   │   ├── useCoupons.ts
│   │   └── usePaymentSettings.ts
│   └── types/
│       └── booking.ts
│
└── ui/                            # Shared UI components
    ├── Modal.tsx
    ├── Table.tsx
    ├── Button.tsx
    └── LoadingSpinner.tsx
```

### 2. Custom Hooks to Extract

**Admin Hooks:**
- `useBookings` - Manages bookings state, CRUD operations, filtering
- `useServices` - Manages services state, CRUD operations
- `usePhotographers` - Manages photographers state, CRUD operations
- `useAddons` - Manages addons state, CRUD operations
- `useExport` - Handles Excel export functionality

**Booking Hooks:**
- `useBookingForm` - Manages form state, validation, submission
- `usePortfolio` - Fetches and manages portfolio images
- `useCoupons` - Handles coupon validation and suggestions
- `usePaymentSettings` - Fetches payment settings

### 3. Component Breakdown

#### AdminDashboard.tsx (Current: 2,089 lines → Target: ~200 lines)
**Responsibilities:**
- Main container with view mode state
- Renders sidebar and switches between views
- Provides data fetching coordination

**Extracted:**
- All table views → separate table components
- All modals → separate modal components
- All CRUD logic → custom hooks
- State management → custom hooks

#### BookingForm.tsx (Current: 1,000 lines → Target: ~150 lines)
**Responsibilities:**
- Main form container
- Multi-step form state management
- Renders step components

**Extracted:**
- Step components → separate files
- Calculation logic → hooks/utilities
- Lightbox → separate component
- Payment display → separate component

### 4. Implementation Steps

1. **Create folder structure**
2. **Extract custom hooks** (state management & API calls)
3. **Extract table components** (Admin)
4. **Extract modal components** (Admin)
5. **Extract booking step components**
6. **Extract utility components** (Lightbox, Countdown)
7. **Refactor main containers** to use new components
8. **Update imports** throughout the codebase
9. **Test all functionality**

### 5. Benefits

✅ **Maintainability**: Each file < 200 lines
✅ **Reusability**: Components can be reused
✅ **Testability**: Easier to unit test
✅ **Type Safety**: Centralized types
✅ **Performance**: Better code splitting
✅ **Readability**: Clear separation of concerns

### 6. Migration Strategy

- Create new files alongside existing ones
- Gradually migrate functionality
- Keep existing API endpoints unchanged
- No breaking changes to user experience
- Comprehensive testing after each step

## Implementation Order

1. ✅ Create folder structure
2. ✅ Extract types and interfaces
3. ✅ Extract custom hooks (Admin)
4. ✅ Extract custom hooks (Booking)
5. ✅ Extract table components
6. ✅ Extract modal components
7. ✅ Extract booking step components
8. ✅ Extract utility components
9. ✅ Refactor main containers
10. ✅ Update all imports
11. ✅ Comprehensive testing
12. ✅ Documentation

## Files to Create (Total: ~30 new files)

**Admin (15 files):**
- `hooks/useBookings.ts`
- `hooks/useServices.ts`
- `hooks/usePhotographers.ts`
- `hooks/useAddons.ts`
- `hooks/useExport.ts`
- `tables/BookingsTable.tsx`
- `tables/ServicesTable.tsx`
- `tables/PhotographersTable.tsx`
- `tables/AddonsTable.tsx`
- `modals/ServiceModal.tsx`
- `modals/PhotographerModal.tsx`
- `modals/AddonModal.tsx`
- `modals/BookingModal.tsx`
- `modals/RescheduleModal.tsx`
- `types/admin.ts`

**Booking (10 files):**
- `hooks/useBookingForm.ts`
- `hooks/usePortfolio.ts`
- `hooks/useCoupons.ts`
- `hooks/usePaymentSettings.ts`
- `steps/ServiceSelection.tsx`
- `steps/AddonsSelection.tsx`
- `steps/PortfolioShowcase.tsx`
- `steps/CustomerInfo.tsx`
- `steps/ScheduleInfo.tsx`
- `steps/PaymentInfo.tsx`
- `steps/OrderSummary.tsx`
- `components/CountdownTimer.tsx`
- `components/Lightbox.tsx`
- `components/PaymentDetails.tsx`
- `types/booking.ts`

**Modified (2 files):**
- `AdminDashboard.tsx` (reduced)
- `BookingForm.tsx` (reduced)

## Timeline Estimate

- Planning & Setup: 15 minutes
- Extracting Hooks: 30 minutes
- Extracting Components: 45 minutes
- Refactoring Main Files: 20 minutes
- Testing & Debugging: 25 minutes

**Total: ~2.5 hours**

## Success Criteria

✅ All files < 200 lines
✅ No duplicate code
✅ All functionality preserved
✅ Type safety maintained
✅ All imports resolved
✅ Tests pass
✅ Documentation complete
