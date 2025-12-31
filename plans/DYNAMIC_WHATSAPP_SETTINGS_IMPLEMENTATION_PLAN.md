# Dynamic WhatsApp Settings Implementation Plan

## Overview
Add admin-configurable WhatsApp number and message template functionality to the booking system. This will allow administrators to set a WhatsApp contact number and customize booking confirmation messages with template variables.

## Current State Analysis

### Database Schema
- **System Settings Table**: Already exists (`system_settings`) with key-value pairs
- **Current Fields**: `site_name`, `site_logo`, `business_phone`, `business_address`
- **Extensibility**: Schema supports adding new key-value pairs without migration

### Settings Management UI
- **Location**: `/app/admin/settings/page.tsx` and `components/admin/SettingsManagement.tsx`
- **Current Functionality**: Basic branding settings (name, logo, phone, address)
- **API**: `/api/settings` handles GET/POST operations

### Booking Flow
- **Booking Hook**: `useBookingForm.ts` handles form state and submission
- **Booking API**: `/api/bookings` creates bookings with customer data
- **Current WhatsApp**: Hardcoded in booking confirmation logic

## Implementation Requirements

### 1. Database Schema Changes
**Add new system settings keys:**
- `whatsapp_admin_number` - Admin WhatsApp number for booking notifications
- `whatsapp_message_template` - Template for booking confirmation messages

**No migration needed** - system_settings table uses INSERT OR REPLACE for new keys.

### 2. Type Definitions Update
**File**: `lib/types/settings.ts`
```typescript
export interface SystemSettings {
  site_name: string;
  site_logo: string;
  business_phone: string;
  business_address: string;
  whatsapp_admin_number: string;      // New
  whatsapp_message_template: string;   // New
}
```

### 3. API Layer Updates
**File**: `app/api/settings/route.ts`
- No changes needed - API already accepts any key-value pairs
- Add validation for WhatsApp number format
- Add validation for template variables

**New API Endpoint** (optional): `/api/settings/whatsapp-test` for testing template rendering

### 4. Admin UI Updates
**File**: `components/admin/SettingsManagement.tsx`
- Add two new form fields:
  1. WhatsApp Admin Number (with validation)
  2. Message Template (with preview functionality)
- Include template variable help text
- Add test button to send sample message

**Template Variables**:
- `{{customer_name}}` - Customer's name
- `{{service}}` - Service category
- `{{date}}` - Booking date
- `{{time}}` - Booking time
- `{{total_price}}` - Total price (formatted)
- `{{booking_id}}` - Booking reference ID

### 5. Booking Flow Integration
**File**: `components/booking/hooks/useBookingForm.ts`
- Add function to generate WhatsApp message using template
- Integrate into booking submission flow
- Send booking confirmation via WhatsApp link

**File**: `app/api/bookings/route.ts`
- After booking creation, generate WhatsApp message
- Return WhatsApp link in response for frontend

### 6. Template Replacement Logic
**Safe Template Engine**:
```typescript
function renderTemplate(template: string, variables: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] || match;
  });
}
```

**Security Considerations**:
- HTML escaping for WhatsApp text
- Prevent script injection
- Validate template variables exist in allowed list

## Implementation Steps

### Phase 1: Database & Types (Backend)
1. Update `SystemSettings` interface in `lib/types/settings.ts`
2. Add default values in `lib/storage-sqlite.ts` `initializeSystemSettings()`
3. Update `getSystemSettings()` to include new fields

### Phase 2: API & Validation
1. Add validation for WhatsApp number format (Indonesian phone numbers)
2. Add template validation to ensure required variables exist
3. Create template rendering utility function

### Phase 3: Admin UI
1. Add WhatsApp settings section to SettingsManagement component
2. Implement template editor with live preview
3. Add test functionality to verify WhatsApp integration

### Phase 4: Booking Integration
1. Modify booking creation to generate WhatsApp message
2. Add WhatsApp link generation in booking response
3. Update booking confirmation UI to show WhatsApp option

### Phase 5: Testing & Deployment
1. Test template rendering with edge cases
2. Test WhatsApp link generation
3. Deploy and verify admin settings persistence

## Technical Details

### WhatsApp Link Format
```
https://wa.me/6281234567890?text=URL_ENCODED_MESSAGE
```

### Template Example
```
Halo {{customer_name}}!

Booking Anda untuk {{service}} pada {{date}} pukul {{time}} telah dikonfirmasi.

Total: Rp {{total_price}}
ID Booking: {{booking_id}}

Terima kasih telah memilih Cerita Kita!
```

### Validation Rules
1. **WhatsApp Number**: Must be valid Indonesian format (08xxx or +62xxx)
2. **Template**: Must contain at least `{{customer_name}}` and `{{service}}`
3. **Variables**: Only allow predefined variables for security

## Files to Modify

### Backend Files
1. `lib/types/settings.ts` - Add new fields
2. `lib/storage-sqlite.ts` - Update initialization and getter
3. `app/api/settings/route.ts` - Add validation
4. `lib/validation/schemas.ts` - Add WhatsApp validation schema

### Frontend Files
1. `components/admin/SettingsManagement.tsx` - Add form fields
2. `app/admin/settings/page.tsx` - Mirror changes
3. `components/booking/hooks/useBookingForm.ts` - Add WhatsApp integration
4. `components/booking/steps/OrderSummary.tsx` - Show WhatsApp option

### New Files
1. `lib/whatsapp-template.ts` - Template rendering utility
2. `components/admin/WhatsAppTemplatePreview.tsx` - Preview component

## Success Criteria
1. Admin can set WhatsApp number in settings
2. Admin can create/edit message templates with variables
3. Booking confirmation generates proper WhatsApp link
4. Template variables are safely replaced
5. System falls back gracefully if WhatsApp not configured

## Risks & Mitigations
1. **Risk**: Template injection attacks
   **Mitigation**: Strict variable whitelist, HTML escaping

2. **Risk**: Invalid WhatsApp numbers
   **Mitigation**: Format validation, test functionality

3. **Risk**: Breaking existing bookings
   **Mitigation**: Backward compatibility, default templates

## Timeline Estimate
- **Phase 1**: 2 hours
- **Phase 2**: 3 hours  
- **Phase 3**: 4 hours
- **Phase 4**: 3 hours
- **Phase 5**: 2 hours
- **Total**: 14 hours

## Dependencies
- No external libraries needed
- Uses existing Next.js and SQLite infrastructure
- Compatible with current authentication system