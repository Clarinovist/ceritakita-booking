# Dynamic WhatsApp Settings - User Stories

## Epic: WhatsApp Integration Enhancement
**Goal**: Allow administrators to configure WhatsApp contact number and customizable message templates for booking confirmations.

---

## Functional Stories

### Story 1: Admin WhatsApp Number Configuration
**Title**: Configure Admin WhatsApp Contact Number

**As a** system administrator,
**I want to** set a WhatsApp contact number in system settings
**So that** customers can contact the correct WhatsApp number for booking confirmations

**Acceptance Criteria**:
1. Admin can access WhatsApp settings in the Settings Management page
2. WhatsApp number field accepts Indonesian phone formats (08xxx or +62xxx)
3. Input validation shows error for invalid phone numbers
4. Saved WhatsApp number persists across sessions
5. Default value is "+62 812 3456 7890" if not configured
6. Changes are logged in system_settings_audit table

**Edge Cases**:
- Empty field validation
- International number format support
- Number with spaces/special characters
- Maximum length validation (15 digits)

---

### Story 2: Message Template Management
**Title**: Create and Edit WhatsApp Message Templates

**As a** system administrator,
**I want to** create and edit customizable message templates with variables
**So that** booking confirmation messages can be personalized for each customer

**Acceptance Criteria**:
1. Template editor with textarea for message content
2. Variable picker with available placeholders:
   - `{{customer_name}}`
   - `{{service}}`
   - `{{date}}`
   - `{{time}}`
   - `{{total_price}}`
   - `{{booking_id}}`
3. Live preview showing rendered template with sample data
4. Template validation ensures required variables exist
5. Template length limit (500 characters for WhatsApp compatibility)
6. Save/Reset functionality

**Edge Cases**:
- Empty template validation
- Unknown variable handling
- Special character escaping
- Line break preservation

---

### Story 3: Template Variable Replacement
**Title**: Safely Replace Template Variables with Booking Data

**As a** booking system,
**I want to** replace template variables with actual booking data
**So that** customers receive personalized confirmation messages

**Acceptance Criteria**:
1. Template engine safely replaces `{{variable}}` placeholders
2. HTML/script injection prevention
3. Fallback to default message if template missing
4. Price formatting (Rp 1.000.000)
5. Date/time formatting (DD MMMM YYYY, HH:mm)
6. Missing variable handling (shows empty string)

**Edge Cases**:
- Missing booking data
- Malformed template syntax
- Nested variables prevention
- Large data truncation

---

### Story 4: WhatsApp Link Generation
**Title**: Generate WhatsApp Links with Pre-filled Messages

**As a** customer completing a booking,
**I want to** receive a WhatsApp link with my booking details pre-filled
**So that** I can easily contact the admin for confirmation

**Acceptance Criteria**:
1. Generate proper WhatsApp API link: `https://wa.me/6281234567890?text=...`
2. URL encode message text correctly
3. Link appears in booking confirmation step
4. Mobile-optimized click-to-chat experience
5. Copy-to-clipboard functionality
6. Fallback to plain text if WhatsApp not installed

**Edge Cases**:
- International number formatting
- URL length limits
- Special character encoding
- WhatsApp not installed on device

---

### Story 5: Booking Flow Integration
**Title**: Integrate WhatsApp Template into Booking Confirmation

**As a** customer completing booking,
**I want to** see my personalized WhatsApp message ready to send
**So that** I can quickly confirm my booking with the admin

**Acceptance Criteria**:
1. WhatsApp message appears in Order Summary step
2. Message uses admin-configured template
3. All variables correctly populated
4. WhatsApp button/link clearly visible
5. Message preview before sending
6. Integration with existing booking submission flow

**Edge Cases**:
- WhatsApp settings not configured
- Template rendering errors
- Network issues during booking
- Customer cancels before sending

---

### Story 6: Template Testing Functionality
**Title**: Test WhatsApp Template with Sample Data

**As a** system administrator,
**I want to** test my template with sample booking data
**So that** I can verify the message looks correct before deployment

**Acceptance Criteria**:
1. "Test Template" button in settings
2. Uses sample booking data for preview
3. Shows rendered message in preview panel
4. Shows generated WhatsApp link
5. Option to send test to actual WhatsApp number
6. Success/error feedback for test send

**Edge Cases**:
- Invalid WhatsApp number during test
- Template syntax errors
- Network timeout for test send
- Permission issues

---

## Non-functional Stories

### Story 7: Security & Validation
**Title**: Secure Template Variable Handling

**As a** security-conscious administrator,
**I want to** ensure template variables are safely handled
**So that** the system is protected against injection attacks

**Acceptance Criteria**:
1. Variable whitelist validation
2. HTML entity escaping
3. Maximum template length enforcement
4. Rate limiting on WhatsApp link generation
5. Audit logging of template changes
6. Input sanitization for WhatsApp numbers

**Edge Cases**:
- Script injection attempts
- XSS via template variables
- SQL injection via settings
- Brute force attacks

---

### Story 8: Performance & Scalability
**Title**: Efficient Template Rendering

**As a** system with many concurrent bookings,
**I want** template rendering to be fast and efficient
**So that** booking confirmation is not delayed

**Acceptance Criteria**:
1. Template rendering under 100ms
2. Caching of rendered templates for same booking data
3. Async WhatsApp link generation
4. Database query optimization for settings
5. Memory-efficient variable replacement
6. Load testing with 100+ concurrent bookings

**Edge Cases**:
- High traffic periods
- Large template sizes
- Database connection issues
- Cache invalidation

---

## Technical Stories

### Story 9: Database Schema Extension
**Title**: Extend System Settings Schema

**As a** developer,
**I want to** add WhatsApp settings to the database schema
**So that** settings persist across application restarts

**Acceptance Criteria**:
1. Add `whatsapp_admin_number` column to system_settings table
2. Add `whatsapp_message_template` column to system_settings table
3. Backward compatibility with existing settings
4. Default values in database initialization
5. Migration script for existing installations
6. TypeScript interface updates

**Edge Cases**:
- Existing data migration
- Null value handling
- Column type changes
- Rollback capability

---

### Story 10: API Endpoint Enhancement
**Title**: Extend Settings API for WhatsApp

**As a** frontend developer,
**I want to** access WhatsApp settings via API
**So that** the UI can display and update them

**Acceptance Criteria**:
1. GET `/api/settings` returns WhatsApp fields
2. POST `/api/settings` accepts WhatsApp fields
3. Validation for WhatsApp number format
4. Template syntax validation
5. Rate limiting on settings updates
6. Proper error responses for invalid data

**Edge Cases**:
- Invalid JSON payload
- Missing required fields
- Concurrent updates
- Authentication failures

---

## Story Priority
1. **P0**: Story 1 (Admin WhatsApp Number Configuration)
2. **P0**: Story 9 (Database Schema Extension)
3. **P1**: Story 2 (Message Template Management)
4. **P1**: Story 3 (Template Variable Replacement)
5. **P2**: Story 4 (WhatsApp Link Generation)
6. **P2**: Story 5 (Booking Flow Integration)
7. **P3**: Story 6 (Template Testing Functionality)
8. **P3**: Story 7 (Security & Validation)
9. **P3**: Story 8 (Performance & Scalability)
10. **P3**: Story 10 (API Endpoint Enhancement)

## Success Metrics
- 100% of bookings generate WhatsApp links
- Admin can update template in < 2 minutes
- Template rendering < 100ms at P95
- Zero security incidents from template injection
- Customer satisfaction increase via personalized messages