# User Stories: Admin Settings Refactor - Tabbed Interface

## 1. Database & Types Update

### Story 1.1: Expand System Settings Schema

**Title:** Database Migration for Enhanced Settings Categories

**As a** system administrator,
**I want to** expand the database schema to support 5 comprehensive settings categories,
**So that** all business configuration can be stored centrally and accessed dynamically.

**Acceptance Criteria:**
1. Database migration script adds new columns to `system_settings` table using `ADD COLUMN IF NOT EXISTS`
2. New columns include:
   - `hero_title` (string) for booking page H1 title
   - `meta_title` (string) for SEO title
   - `meta_description` (string) for SEO description
   - `business_email` (string) for invoice & contact
   - `instagram_url` (string) optional social link
   - `tiktok_url` (string) optional social link
   - `maps_link` (string) optional Google Maps link
   - `bank_name` (string) for invoice display
   - `bank_number` (string) for invoice display
   - `bank_holder` (string) for invoice display
   - `invoice_notes` (text) for custom invoice footer
   - `requires_deposit` (boolean) migrated from payment logic
   - `deposit_amount` (number) migrated from payment logic
   - `tax_rate` (number) migrated from payment logic
   - `min_booking_notice` (integer) default 1 day
   - `max_booking_ahead` (integer) default 90 days
3. Migration preserves existing data and is compatible with SQLite
4. TypeScript interfaces in `lib/types/settings.ts` are updated to reflect all new fields
5. No `any` types used - all fields are properly typed

**Edge Cases:**
- Migration should handle existing columns gracefully (no data loss)
- Default values should be set for new columns where appropriate
- Backward compatibility maintained for existing API consumers

### Story 1.2: Update TypeScript Interfaces

**Title:** Type-Safe Settings Interface Refactor

**As a** developer,
**I want to** update the TypeScript interfaces to match the expanded database schema,
**So that** type safety is maintained across the application.

**Acceptance Criteria:**
1. `SystemSettings` interface in `lib/types/settings.ts` includes all new fields
2. Interface is organized by category (General, Contact, Finance, Booking Rules, Templates)
3. All fields have appropriate TypeScript types (string, number, boolean)
4. Optional fields are marked with `?` where appropriate
5. API response types in `app/api/settings/route.ts` are updated to match
6. No `any` types used in the interface definitions

**Edge Cases:**
- Nullable fields properly handled
- Default values defined for required fields
- Validation logic updated to handle new data types

## 2. UI Refactor (Tabbed Interface)

### Story 2.1: Create Tabbed Settings Layout

**Title:** Tabbed Interface for Settings Management

**As an** admin user,
**I want to** navigate settings through a tabbed interface with 5 logical categories,
**So that** I can easily find and update related settings without scrolling.

**Acceptance Criteria:**
1. Main `SettingsManagement.tsx` component refactored to use tab navigation
2. 5 tabs implemented: General & SEO, Contact & Socials, Finance, Booking Rules, Templates
3. Each tab uses consistent styling with Tailwind CSS
4. Tab icons from `lucide-react` where available
5. "Save Changes" button works for all fields across all tabs
6. Tab state persists during navigation
7. Responsive design maintained across all screen sizes

**Edge Cases:**
- Empty tabs show appropriate empty states
- Tab switching preserves unsaved changes with warning
- Mobile view collapses tabs into dropdown if needed

### Story 2.2: Create General & SEO Tab Component

**Title:** General Settings Tab with SEO Fields

**As an** admin user,
**I want to** manage site branding and SEO settings in a dedicated tab,
**So that** I can control how my business appears to customers and search engines.

**Acceptance Criteria:**
1. New component `components/admin/settings/GeneralTab.tsx` created
2. Includes existing fields: `site_name`, `site_logo`
3. Adds new fields: `hero_title`, `meta_title`, `meta_description`
4. Logo upload functionality preserved from original component
5. SEO preview shows how meta tags will appear
6. All fields validate appropriately (e.g., meta description length)
7. Changes saved when "Save Changes" clicked

**Edge Cases:**
- Logo upload handles file validation and errors
- Meta description has character count warning (>160 chars)
- Hero title supports dynamic preview on booking page

### Story 2.3: Create Contact & Socials Tab Component

**Title:** Contact Information and Social Media Links

**As an** admin user,
**I want to** manage contact details and social media profiles in one place,
**So that** customers can reach us and follow our social channels.

**Acceptance Criteria:**
1. New component `components/admin/settings/ContactTab.tsx` created
2. Includes existing fields: `business_address`, `whatsapp_admin_number`
3. Adds new fields: `business_email`, `instagram_url`, `tiktok_url`, `maps_link`
4. URL validation for social media links
5. Email validation for business email
6. Google Maps link preview or validation
7. All fields grouped logically with clear labels

**Edge Cases:**
- Optional fields clearly marked as optional
- URL fields validate proper format
- WhatsApp number validates Indonesian format

### Story 2.4: Create Finance Tab Component

**Title:** Consolidated Financial Settings

**As an** admin user,
**I want to** manage all financial settings including bank details and payment rules,
**So that** invoices display correct information and payment rules are enforced.

**Acceptance Criteria:**
1. New component `components/admin/settings/FinanceTab.tsx` created
2. Includes new fields: `bank_name`, `bank_number`, `bank_holder`, `invoice_notes`
3. Migrates existing payment logic fields: `requires_deposit`, `deposit_amount`, `tax_rate`
4. Deposit amount shows as percentage or fixed amount based on configuration
5. Tax rate field with percentage input and validation (0-100%)
6. Invoice notes support markdown or plain text with preview
7. Bank details formatted for display on invoices

**Edge Cases:**
- Deposit amount validation (positive number)
- Tax rate validation (0-100%)
- Bank number validation (numeric only)
- Invoice notes character limit

### Story 2.5: Create Booking Rules Tab Component

**Title:** Booking Logic Control Settings

**As an** admin user,
**I want to** control booking constraints like minimum notice and maximum advance booking,
**So that** I can prevent same-day bookings and limit how far in advance customers can book.

**Acceptance Criteria:**
1. New component `components/admin/settings/RulesTab.tsx` created
2. Includes new fields: `min_booking_notice`, `max_booking_ahead`
3. Both fields accept integer values with appropriate defaults (1 and 90)
4. Clear explanation of what each setting does
5. Validation ensures `max_booking_ahead` > `min_booking_notice`
6. Calendar preview shows disabled dates based on rules
7. Changes immediately affect booking form validation

**Edge Cases:**
- Zero or negative values prevented
- Maximum value reasonable (e.g., not > 365 days)
- Clear error messages for invalid combinations

### Story 2.6: Create Templates Tab Component

**Title:** WhatsApp Message Templates Management

**As an** admin user,
**I want to** manage WhatsApp message templates in a dedicated tab,
**So that** I can customize automated messages sent to customers.

**Acceptance Criteria:**
1. New component `components/admin/settings/TemplatesTab.tsx` created
2. Includes existing `whatsapp_message_template` field
3. Template editor with syntax highlighting for variables
4. Variable reference list: `{{customer_name}}`, `{{service}}`, `{{date}}`, `{{time}}`, `{{total_price}}`, `{{booking_id}}`
5. Test template functionality preserved from original component
6. Template validation ensures all required variables present
7. Preview shows rendered message with sample data

**Edge Cases:**
- Template too long validation (> 1024 chars)
- Missing required variables warning
- Test functionality works with current settings

## 3. Logic Integration (Invoice Page)

### Story 3.1: Dynamic Bank Details on Invoice

**Title:** Invoice Page Uses Dynamic Finance Settings

**As a** customer receiving an invoice,
**I want to** see accurate bank details from system settings,
**So that** I can make payments to the correct account.

**Acceptance Criteria:**
1. Invoice page (`app/admin/invoices/[id]/page.tsx`) updated to use dynamic bank details
2. Bank name, account number, and account holder displayed from settings
3. Business email from settings shown in contact information
4. Social media links from settings added to invoice footer if available
5. Invoice notes from settings displayed as footer text
6. Fallback to hardcoded values if settings not configured
7. All financial information updates automatically when settings change

**Edge Cases:**
- Missing bank details shows placeholder text
- Email validation before display
- Social links only shown if populated
- Invoice notes support line breaks

### Story 3.2: Invoice Notes Customization

**Title:** Customizable Invoice Footer Notes

**As a** business owner,
**I want to** add custom notes to invoices from settings,
**So that** I can include payment terms, thank you messages, or legal disclaimers.

**Acceptance Criteria:**
1. Invoice page displays `invoice_notes` from settings
2. Notes appear in invoice footer section
3. Supports multi-line text with proper formatting
4. HTML or markdown support based on configuration
5. Notes are optional (empty field hides section)
6. Print-friendly formatting preserved

**Edge Cases:**
- Very long notes truncated with "read more"
- Special characters properly escaped
- Line breaks preserved in print view

## 4. Logic Integration (Schedule Info)

### Story 4.1: Enforce Minimum Booking Notice

**Title:** Prevent Same-Day Bookings with Configurable Notice Period

**As a** business owner,
**I want to** prevent customers from booking sessions with less than configured notice,
**So that** I have adequate preparation time.

**Acceptance Criteria:**
1. `ScheduleInfo.tsx` component reads `min_booking_notice` from settings
2. Calendar date picker disables dates within the notice period
3. Today's date + `min_booking_notice` days is minimum selectable date
4. Clear error message if user tries to select disabled date
5. Quick action buttons (Tomorrow, 1 Week) respect minimum notice
6. Validation occurs both client-side and server-side

**Edge Cases:**
- `min_booking_notice` = 0 allows same-day booking
- `min_booking_notice` > `max_booking_ahead` handled gracefully
- Timezone considerations for date calculations

### Story 4.2: Limit Maximum Booking Advance

**Title:** Restrict How Far in Advance Customers Can Book

**As a** business owner,
**I want to** limit how far in advance customers can book sessions,
**So that** I don't overcommit my schedule too far into the future.

**Acceptance Criteria:**
1. `ScheduleInfo.tsx` component reads `max_booking_ahead` from settings
2. Calendar date picker disables dates beyond the maximum advance period
3. Today's date + `max_booking_ahead` days is maximum selectable date
4. Clear visual indication of date range limits
5. Quick action buttons respect maximum advance limit
6. Validation occurs both client-side and server-side

**Edge Cases:**
- `max_booking_ahead` = 0 (no future booking) handled
- `max_booking_ahead` < `min_booking_notice` shows appropriate error
- Leap year and month-end date calculations correct

### Story 4.3: Booking Rules Validation Integration

**Title:** Server-Side Validation of Booking Rules

**As a** system administrator,
**I want to** ensure booking rules are enforced server-side,
**So that** customers cannot bypass client-side validation.

**Acceptance Criteria:**
1. Booking API (`app/api/bookings/route.ts`) validates against settings
2. Creates booking endpoint checks `min_booking_notice` and `max_booking_ahead`
3. Returns appropriate error messages for rule violations
4. Reschedule endpoint also respects booking rules
5. Settings are fetched once and cached for performance
6. Validation occurs before booking is created/updated

**Edge Cases:**
- Settings not configured uses sensible defaults
- Timezone differences between server and client handled
- Edge cases around midnight considered

## 5. Non-Functional Requirements

### Story 5.1: Settings Performance Optimization

**Title:** Efficient Settings Loading and Caching

**As a** user,
**I want** settings to load quickly and be cached appropriately,
**So that** the admin interface remains responsive.

**Acceptance Criteria:**
1. Settings API response cached for 5 minutes (already implemented)
2. Settings context/provider caches values client-side
3. Tab switching doesn't re-fetch settings
4. Bulk save operation optimizes database updates
5. Settings audit trail doesn't impact performance

**Edge Cases:**
- Concurrent settings updates handled properly
- Cache invalidation on settings change
- Large settings payloads handled efficiently

### Story 5.2: Settings Validation and Error Handling

**Title:** Comprehensive Settings Validation

**As an** admin user,
**I want** clear validation messages for invalid settings,
**So that** I can correct mistakes before saving.

**Acceptance Criteria:**
1. Each field has appropriate validation (email, URL, number ranges)
2. Validation errors displayed inline with fields
3. Save button disabled until all validation passes
4. Server-side validation returns specific error messages
5. Audit trail logs validation failures

**Edge Cases:**
- Cross-field validation (e.g., max > min)
- Special character handling in text fields
- File upload validation for logo

## Implementation Notes

1. **Database Migration**: Create migration script in `scripts/migrate-settings.sql`
2. **Type Safety**: Update `lib/types/settings.ts` first before UI changes
3. **Component Splitting**: Create `components/admin/settings/` directory with tab components
4. **API Updates**: Ensure `/api/settings` endpoint handles all new fields
5. **Backward Compatibility**: Maintain existing functionality while adding new features
6. **Testing**: Each tab should be tested independently before integration