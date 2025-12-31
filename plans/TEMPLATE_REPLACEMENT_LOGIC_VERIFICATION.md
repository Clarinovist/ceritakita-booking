# Template Replacement Logic Verification

## Overview
This document verifies the safety, correctness, and performance of the WhatsApp message template replacement logic for the Dynamic WhatsApp Settings feature.

## Core Requirements

### 1. Safety Requirements
- **No Code Injection**: Prevent script/HTML injection via template variables
- **Variable Whitelist**: Only allow predefined variables
- **Input Sanitization**: Proper escaping of special characters
- **Length Limits**: Prevent buffer overflow/DoS via large templates

### 2. Functional Requirements
- **Accurate Replacement**: Correct variable substitution
- **Formatting**: Proper date, time, and price formatting
- **Encoding**: URL encoding for WhatsApp links
- **Fallback**: Graceful handling of missing data

### 3. Performance Requirements
- **Speed**: < 100ms rendering time
- **Memory**: Efficient string manipulation
- **Concurrency**: Thread-safe operations

## Implementation Strategy

### Variable Whitelist Approach
```typescript
const ALLOWED_VARIABLES = new Set([
  'customer_name',
  'service',
  'date',
  'time',
  'total_price',
  'booking_id'
]);
```

### Template Rendering Function
```typescript
function renderTemplate(
  template: string,
  variables: Record<string, string>,
  options: {
    escapeHtml?: boolean;
    maxLength?: number;
  } = {}
): string {
  const { escapeHtml = true, maxLength = 500 } = options;
  
  // 1. Validate template length
  if (template.length > maxLength) {
    throw new Error(`Template exceeds maximum length of ${maxLength} characters`);
  }
  
  // 2. Perform safe variable replacement
  const result = template.replace(/\{\{(\w+)\}\}/g, (match, variableName) => {
    // Check if variable is allowed
    if (!ALLOWED_VARIABLES.has(variableName)) {
      // Return empty string for unknown variables (or could throw error)
      return '';
    }
    
    // Get variable value
    const value = variables[variableName] || '';
    
    // Apply HTML escaping if enabled
    if (escapeHtml) {
      return escapeHtmlEntities(value);
    }
    
    return value;
  });
  
  return result;
}
```

### HTML Escaping Function
```typescript
function escapeHtmlEntities(text: string): string {
  const escapeMap: Record<string, string> = {
    '&': '&',
    '<': '<',
    '>': '>',
    '"': '"',
    "'": ''',
    '/': '&#x2F;'
  };
  
  return text.replace(/[&<>"'/]/g, (char) => escapeMap[char] || char);
}
```

### WhatsApp Link Generation
```typescript
function generateWhatsAppLink(
  phoneNumber: string,
  message: string
): string {
  // 1. Normalize phone number
  const normalizedNumber = normalizePhoneNumber(phoneNumber);
  
  // 2. URL encode the message
  const encodedMessage = encodeURIComponent(message);
  
  // 3. Construct WhatsApp link
  return `https://wa.me/${normalizedNumber}?text=${encodedMessage}`;
}

function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters
  let digits = phone.replace(/\D/g, '');
  
  // Handle Indonesian numbers
  if (digits.startsWith('0')) {
    digits = '62' + digits.substring(1);
  } else if (digits.startsWith('62')) {
    // Already in correct format
  } else if (digits.startsWith('+')) {
    // Remove leading +
    digits = digits.substring(1);
  }
  
  return digits;
}
```

## Test Cases

### Test 1: Basic Variable Replacement
```typescript
const template = "Hello {{customer_name}}, your {{service}} booking is confirmed.";
const variables = {
  customer_name: "John Doe",
  service: "Wedding Photography"
};

// Expected: "Hello John Doe, your Wedding Photography booking is confirmed."
```

### Test 2: Missing Variable Handling
```typescript
const template = "Booking ID: {{booking_id}}, Date: {{date}}";
const variables = {
  booking_id: "BK-123"
  // date is missing
};

// Expected: "Booking ID: BK-123, Date: "
```

### Test 3: HTML Escaping
```typescript
const template = "Customer: {{customer_name}}";
const variables = {
  customer_name: "<script>alert('xss')</script>"
};

// Expected: "Customer: <script>alert('xss')<&#x2F;script>"
```

### Test 4: Unknown Variable
```typescript
const template = "{{customer_name}} {{unknown_var}}";
const variables = {
  customer_name: "John"
};

// Expected: "John "
```

### Test 5: Nested Variables (Should Not Work)
```typescript
const template = "{{customer_{{type}}}}";
const variables = {
  "customer_{{type}}": "Should not match"
};

// Expected: "" (empty string because variable not in whitelist)
```

### Test 6: WhatsApp Link Generation
```typescript
const phone = "+62 812-3456-7890";
const message = "Hello World!";

// Expected: "https://wa.me/6281234567890?text=Hello%20World%21"
```

## Security Analysis

### 1. Injection Prevention
- **Regex Pattern**: `/\{\{(\w+)\}\}/g` only matches word characters (a-z, A-Z, 0-9, _)
- **Whitelist Validation**: Variables must be in ALLOWED_VARIABLES set
- **HTML Escaping**: Applied by default to all variable values

### 2. Data Validation
```typescript
function validateTemplate(template: string): string[] {
  const errors: string[] = [];
  
  // Check for required variables
  const requiredVars = ['customer_name', 'service'];
  const foundVars = new Set<string>();
  
  template.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
    foundVars.add(varName);
    return match;
  });
  
  for (const required of requiredVars) {
    if (!foundVars.has(required)) {
      errors.push(`Missing required variable: ${required}`);
    }
  }
  
  // Check for unknown variables
  const matches = template.matchAll(/\{\{(\w+)\}\}/g);
  for (const match of matches) {
    const varName = match[1];
    if (!ALLOWED_VARIABLES.has(varName)) {
      errors.push(`Unknown variable: ${varName}`);
    }
  }
  
  return errors;
}
```

### 3. Performance Considerations
- **Regex Efficiency**: The regex `/\{\{(\w+)\}\}/g` is efficient for typical template sizes
- **Caching**: Consider caching rendered templates for identical inputs
- **Memory**: Use streaming for very large templates (though WhatsApp limits to 500 chars)

## Integration Points

### 1. Booking Creation Flow
```typescript
// In useBookingForm.ts handleSubmit function
const whatsappMessage = renderTemplate(
  settings.whatsapp_message_template,
  {
    customer_name: formData.name,
    service: formData.category,
    date: formatDate(formData.date),
    time: formData.time,
    total_price: formatPrice(calculateTotal()),
    booking_id: generatedBookingId
  }
);

const whatsappLink = generateWhatsAppLink(
  settings.whatsapp_admin_number,
  whatsappMessage
);

// Add to booking confirmation UI
```

### 2. Settings Validation
```typescript
// In settings API route
function validateWhatsAppSettings(settings: any): string[] {
  const errors: string[] = [];
  
  // Validate phone number
  if (settings.whatsapp_admin_number) {
    const normalized = normalizePhoneNumber(settings.whatsapp_admin_number);
    if (normalized.length < 10 || normalized.length > 15) {
      errors.push('Invalid WhatsApp number length');
    }
    if (!/^62\d+$/.test(normalized)) {
      errors.push('WhatsApp number must be Indonesian format');
    }
  }
  
  // Validate template
  if (settings.whatsapp_message_template) {
    const templateErrors = validateTemplate(settings.whatsapp_message_template);
    errors.push(...templateErrors);
    
    if (settings.whatsapp_message_template.length > 500) {
      errors.push('Template exceeds 500 character limit');
    }
  }
  
  return errors;
}
```

## Fallback Strategy

### 1. Missing Settings
```typescript
function getWhatsAppMessage(template: string | undefined, variables: any): string {
  if (!template) {
    // Default template
    return `Booking confirmed for ${variables.customer_name}. Service: ${variables.service}. Date: ${variables.date}`;
  }
  
  try {
    return renderTemplate(template, variables);
  } catch (error) {
    // Log error and fall back to default
    console.error('Template rendering failed:', error);
    return `Booking confirmed. Reference: ${variables.booking_id}`;
  }
}
```

### 2. Error Recovery
- **Invalid Template**: Use default template
- **Missing Variables**: Leave placeholder empty
- **Rendering Error**: Log error and continue with partial message

## Testing Strategy

### Unit Tests
1. Test `renderTemplate` with various inputs
2. Test `escapeHtmlEntities` with special characters
3. Test `generateWhatsAppLink` with different phone formats
4. Test `validateTemplate` with valid/invalid templates

### Integration Tests
1. Test full booking flow with WhatsApp integration
2. Test settings update and template persistence
3. Test WhatsApp link opening in browser

### Security Tests
1. Attempt XSS via template variables
2. Attempt SQL injection via settings
3. Test rate limiting on WhatsApp link generation

## Performance Benchmarks

### Expected Performance
- **Template Rendering**: < 5ms for 500-character template
- **Link Generation**: < 2ms per link
- **Memory Usage**: < 1MB for 1000 concurrent renders

### Load Testing
- Simulate 100 concurrent bookings
- Measure response time with WhatsApp integration
- Monitor memory usage during peak load

## Conclusion

The proposed template replacement logic is:
1. **Secure**: Whitelist validation, HTML escaping, input sanitization
2. **Performant**: Efficient regex, caching options, minimal overhead
3. **Robust**: Comprehensive error handling, fallback strategies
4. **Maintainable**: Clear separation of concerns, testable functions

This implementation meets all requirements for the Dynamic WhatsApp Settings feature while maintaining security and performance standards.