# Payload CMS OTP Authentication Plugin

A comprehensive One-Time Password (OTP) authentication plugin for Payload CMS that enables secure passwordless authentication via SMS and email.

## Features

- 🔐 **Passwordless Authentication**: Secure login using OTP codes
- 📱 **Multi-Channel Support**: SMS and email OTP delivery
- ⚡ **Easy Integration**: Simple plugin configuration
- 🎯 **Flexible Hooks**: Customizable `afterSetOtp` hook for integrations
- 🔧 **TypeScript Support**: Full TypeScript support with proper type definitions
- 🛡️ **Security**: Automatic OTP expiration and cleanup
- 🏗️ **Payload 3.x Compatible**: Built for the latest Payload CMS

## Installation

```bash
npm install payloadcms_otp_plugin
# or
yarn add payloadcms_otp_plugin
# or
pnpm add payloadcms_otp_plugin
```

## Quick Start

### 1. Basic Configuration

Add the plugin to your Payload configuration:

```typescript
import { buildConfig } from 'payload'
import { otpPlugin } from 'payloadcms_otp_plugin'

export default buildConfig({
  // ... your existing config
  plugins: [
    otpPlugin({
      collections: { users: true },
      expiredTime: 300000, // 5 minutes
    })
  ]
})
```

### 2. Enhanced Configuration with Custom Hook

```typescript
import { buildConfig } from 'payload'
import { otpPlugin } from 'payloadcms_otp_plugin'
import { sendSMS, sendEmail } from './your-services'

export default buildConfig({
  plugins: [
    otpPlugin({
      collections: { users: true },
      expiredTime: 300000, // 5 minutes in milliseconds
      afterSetOtp: async ({ otp, credentials, otpRecord, payload, req }) => {
        // Send OTP via SMS or Email
        if (credentials.mobile) {
          await sendSMS(credentials.mobile, `Your OTP code is: ${otp}`)
        } else if (credentials.email) {
          await sendEmail(credentials.email, 'Your OTP Code', `Your verification code is: ${otp}`)
        }

        // Optional: Log OTP creation for analytics
        console.log(`OTP ${otp} created for ${credentials.mobile || credentials.email}`)
      }
    })
  ]
})
```

## API Endpoints

The plugin automatically adds these endpoints to your Payload API:

### Send OTP
```http
POST /api/otp/send
Content-Type: application/json

{
  "mobile": "+1234567890"  // or "email": "user@example.com"
}
```

**Response:**
```json
{
  "data": null,
  "message": "OTP sent successfully",
  "code": 200,
  "error": false
}
```

### Login with OTP
```http
POST /api/otp/login
Content-Type: application/json

{
  "mobile": "+1234567890",  // or "email": "user@example.com"
  "otp": "123456"
}
```

**Response:**
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "mobile": "+1234567890"
    }
  },
  "message": "Login successful",
  "code": 200,
  "error": false
}
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `collections` | `Partial<Record<CollectionSlug, true>>` | - | Collections to enhance with OTP functionality |
| `disabled` | `boolean` | `false` | Disable the plugin |
| `expiredTime` | `number` | `300000` | OTP expiration time in milliseconds (5 minutes) |
| `otpLength` | `number` | `6` | Length of the generated OTP code (4-12 digits) |
| `afterSetOtp` | `AfterSetOtpHook` | `undefined` | Hook executed after OTP creation |

### Advanced Configuration

```typescript
otpPlugin({
  collections: { users: true },
  expiredTime: 10 * 60 * 1000, // 10 minutes
  otpLength: 8,                // 8-digit OTP
  afterSetOtp: async ({ otp, credentials, otpRecord, payload, req }) => {
    // Your custom logic here
  }
})
```

### AfterSetOtp Hook

The `afterSetOtp` hook provides access to:

```typescript
type AfterSetOtpHook = (args: {
  otp: string;                                    // Generated OTP code
  credentials: { mobile?: string; email?: string }; // User credentials
  otpRecord: any;                                 // Database OTP record
  payload: any;                                   // Payload CMS instance
  req: any;                                       // Request object
}) => Promise<void> | void;
```

## Middleware Integration

The plugin includes middleware for automatic OTP flow redirection in Next.js applications.

### Setting Up Middleware

Create a `middleware.ts` file in your project root:

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { middlewareOtp } from 'payloadcms_otp_plugin/middleware'

export async function middleware(request: NextRequest): Promise<NextResponse> {
  // Apply OTP middleware for admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    return await middlewareOtp(request)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
```

### How Middleware Works

The middleware automatically:

1. **Intercepts admin login requests** (`/admin/login`)
2. **Redirects to OTP validation** by modifying the `redirect` parameter
3. **Preserves original redirect intent** using `admin-redirect` parameter
4. **Handles nested redirects** gracefully

### Middleware Flow Examples

**Example 1: Direct admin access**
```
User visits: /admin/login
Middleware redirects to: /admin/login?redirect=/otp-validation
After OTP: User goes to /admin (dashboard)
```

**Example 2: Deep link access**
```
User visits: /admin/login?redirect=/admin/posts
Middleware redirects to: /admin/login?redirect=/otp-validation&admin-redirect=/admin/posts
After OTP: User goes to /admin/posts
```

**Example 3: Custom redirect preservation**
```
User visits: /admin/login?redirect=/custom-page
Middleware redirects to: /admin/login?redirect=/otp-validation&admin-redirect=/custom-page
After OTP: User goes to /custom-page
```

### Customizing Middleware

You can extend the middleware for custom logic:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { middlewareOtp } from 'payloadcms_otp_plugin/middleware'

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const url = request.nextUrl
  
  // Custom logic before OTP middleware
  if (url.pathname === '/admin/special-page') {
    // Add custom headers or logic
    const response = await middlewareOtp(request)
    response.headers.set('X-Custom-Header', 'value')
    return response
  }
  
  // Apply OTP middleware for all admin routes
  if (url.pathname.startsWith('/admin')) {
    return await middlewareOtp(request)
  }

  return NextResponse.next()
}
```

### Middleware Configuration Options

The `middlewareOtp` function accepts optional configuration:

```typescript
import { middlewareOtp } from 'payloadcms_otp_plugin/middleware'

// Basic usage
await middlewareOtp(request)

// With custom OTP validation path
await middlewareOtp(request, {
  otpValidationPath: '/custom-otp-page'
})
```

## UI Components

The plugin provides ready-to-use React components for OTP functionality.

### OtpPage Component (Server Component)

A complete OTP validation page with automatic configuration fetching.

```typescript
import { OtpPage } from 'payloadcms_otp_plugin'

// app/otp-validation/page.tsx
export default function OTPValidationPage() {
  return (
    <div className="otp-container">
      <h1>Enter Verification Code</h1>
      <OtpPage 
        className="my-otp-form"
        // Optional: override auto-fetched timer
        // initialTimer={300} // 5 minutes in seconds
      />
    </div>
  )
}
```

**Props:**
- `className?: string` - CSS class for styling
- `initialTimer?: number` - Fallback timer in seconds (auto-fetched from config)

**Features:**
- ✅ Server-side configuration fetching
- ✅ Automatic OTP length detection
- ✅ Configurable expiration timer
- ✅ Built-in loading states
- ✅ Error handling
- ✅ Responsive design

### OtpView Component (Client Component)

A flexible client-side OTP input component with full control.

```typescript
'use client'
import { OtpView } from 'payloadcms_otp_plugin'

export default function CustomOTPPage() {
  return (
    <div>
      <OtpView 
        otpLength={6}        // Custom OTP length
        expiredTime={300}    // 5 minutes in seconds
        className="custom-otp"
        // Optional fallback timer
        initialTimer={120}   // 2 minutes fallback
      />
    </div>
  )
}
```

**Props:**
- `className?: string` - CSS class for styling
- `otpLength?: number` - Override OTP length (fetched from config if not provided)
- `expiredTime?: number` - Override timer in seconds (fetched from config if not provided)
- `initialTimer?: number` - Fallback timer in seconds

**Features:**
- ✅ Dynamic configuration fetching
- ✅ Manual prop override support
- ✅ Real-time input validation
- ✅ Auto-focus management
- ✅ Timer countdown with resend
- ✅ Internationalization support
- ✅ Accessibility features

### OTPInput Component

A standalone OTP input component for custom implementations.

```typescript
'use client'
import { OTPInput } from 'payloadcms_otp_plugin'
import { useState } from 'react'

export default function CustomOTPInput() {
  const [otp, setOtp] = useState('')
  const [isDisabled, setIsDisabled] = useState(false)

  const handleComplete = (code: string) => {
    console.log('OTP entered:', code)
    // Handle OTP submission
  }

  const handleReset = () => {
    setOtp('')
    setIsDisabled(false)
  }

  return (
    <OTPInput
      length={6}                    // Number of input fields
      disabled={isDisabled}         // Disable all inputs
      value={otp}                   // Controlled value
      onChange={setOtp}             // Value change handler
      onComplete={handleComplete}   // Called when all fields filled
      onReset={handleReset}         // Reset trigger
      className="my-otp-input"
    />
  )
}
```

**Props:**
- `length?: number` - Number of OTP digits (default: 6)
- `disabled?: boolean` - Disable input fields
- `value?: string` - Controlled input value
- `onChange?: (otp: string) => void` - Input change handler
- `onComplete?: (otp: string) => void` - Called when OTP is complete
- `onReset?: () => void` - Reset trigger function
- `className?: string` - CSS class for styling

**Features:**
- ✅ Numeric input validation
- ✅ Auto-focus next/previous field
- ✅ Paste support
- ✅ Keyboard navigation (arrows, backspace)
- ✅ Accessibility labels
- ✅ Mobile-optimized input mode

### Styling Components

Add custom CSS to style the OTP components:

```css
/* Custom OTP styling */
.my-otp-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
}

.otp-input__container {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin: 1rem 0;
}

.otp-input__field {
  width: 3rem;
  height: 3rem;
  text-align: center;
  font-size: 1.5rem;
  border: 2px solid #e1e5e9;
  border-radius: 0.5rem;
  transition: border-color 0.2s;
}

.otp-input__field:focus {
  outline: none;
  border-color: #0070f3;
  box-shadow: 0 0 0 3px rgba(0, 112, 243, 0.1);
}

.otp-input__field--disabled {
  background-color: #f5f5f5;
  color: #999;
}

.otp__loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.otp__timer-section {
  text-align: center;
  margin-top: 1rem;
}
```

### Component Integration Examples

**Example 1: Custom OTP Page with Branding**
```typescript
import { OtpView } from 'payloadcms_otp_plugin'

export default function BrandedOTPPage() {
  return (
    <div className="auth-container">
      <div className="brand-header">
        <img src="/logo.png" alt="Company Logo" />
        <h1>Secure Login</h1>
        <p>Enter the verification code sent to your device</p>
      </div>
      
      <OtpView className="branded-otp" />
      
      <div className="help-section">
        <p>Didn't receive the code?</p>
        <button>Contact Support</button>
      </div>
    </div>
  )
}
```

**Example 2: Multi-step Authentication Flow**
```typescript
'use client'
import { useState } from 'react'
import { OTPInput } from 'payloadcms_otp_plugin'

export default function MultiStepAuth() {
  const [step, setStep] = useState(1) // 1: phone, 2: otp, 3: success
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')

  const sendOTP = async () => {
    const response = await fetch('/api/otp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: phone })
    })
    
    if (response.ok) setStep(2)
  }

  const verifyOTP = async (code: string) => {
    const response = await fetch('/api/otp/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: phone, otp: code })
    })
    
    const data = await response.json()
    if (data.success) setStep(3)
  }

  return (
    <div className="auth-flow">
      {step === 1 && (
        <div>
          <h2>Enter Phone Number</h2>
          <input 
            type="tel" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (555) 123-4567"
          />
          <button onClick={sendOTP}>Send Code</button>
        </div>
      )}
      
      {step === 2 && (
        <div>
          <h2>Enter Verification Code</h2>
          <p>Sent to {phone}</p>
          <OTPInput
            length={6}
            onComplete={verifyOTP}
            className="auth-otp"
          />
        </div>
      )}
      
      {step === 3 && (
        <div>
          <h2>✅ Authentication Successful</h2>
          <p>Redirecting...</p>
        </div>
      )}
    </div>
  )
}
```

## Integration Examples

### SMS Integration with Twilio

```typescript
import twilio from 'twilio'

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN)

const sendSMS = async (mobile: string, message: string) => {
  await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE,
    to: mobile
  })
}

// In your plugin configuration
afterSetOtp: async ({ otp, credentials }) => {
  if (credentials.mobile) {
    await sendSMS(credentials.mobile, `Your verification code: ${otp}`)
  }
}
```

### Email Integration with SendGrid

```typescript
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendEmail = async (email: string, otp: string) => {
  await sgMail.send({
    to: email,
    from: process.env.FROM_EMAIL,
    subject: 'Your Verification Code',
    html: `<p>Your verification code is: <strong>${otp}</strong></p>`
  })
}

// In your plugin configuration
afterSetOtp: async ({ otp, credentials }) => {
  if (credentials.email) {
    await sendEmail(credentials.email, otp)
  }
}
```

## Frontend Integration

### React Example

```typescript
import { useState } from 'react'

const OTPLogin = () => {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)

  const sendOTP = async () => {
    const response = await fetch('/api/otp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: phone })
    })
    
    if (response.ok) {
      setOtpSent(true)
    }
  }

  const login = async () => {
    const response = await fetch('/api/otp/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: phone, otp })
    })
    
    const data = await response.json()
    if (data.data?.token) {
      localStorage.setItem('token', data.data.token)
      // Redirect to authenticated area
    }
  }

  return (
    <div>
      {!otpSent ? (
        <div>
          <input
            type="tel"
            placeholder="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button onClick={sendOTP}>Send OTP</button>
        </div>
      ) : (
        <div>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button onClick={login}>Login</button>
        </div>
      )}
    </div>
  )
}
```

## Security Features

- **Automatic Expiration**: OTPs expire after the configured time
- **One-Time Use**: OTPs are marked as verified after successful use
- **Cleanup**: Expired OTPs are automatically removed
- **Access Control**: Proper authentication bypass for OTP endpoints
- **JWT Integration**: Secure token generation with session management

## Best Practices & Configuration Guide

### Security Considerations

**1. OTP Length Configuration**
```typescript
// For high-security applications (banking, finance)
otpLength: 8,
expiredTime: 2 * 60 * 1000, // 2 minutes

// For standard applications (e-commerce, social)
otpLength: 6,
expiredTime: 5 * 60 * 1000, // 5 minutes

// For development/testing
otpLength: 4,
expiredTime: 10 * 60 * 1000, // 10 minutes
```

**2. Environment-based Configuration**
```typescript
otpPlugin({
  otpLength: process.env.NODE_ENV === 'production' ? 6 : 4,
  expiredTime: process.env.NODE_ENV === 'production' 
    ? 3 * 60 * 1000   // 3 minutes in production
    : 15 * 60 * 1000, // 15 minutes in development
  afterSetOtp: async ({ otp, credentials }) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔐 DEV OTP: ${otp} for ${credentials.email || credentials.mobile}`)
    } else {
      // Send via production SMS/Email service
      await sendProductionOTP(credentials, otp)
    }
  }
})
```

### Performance Optimization

**1. Rate Limiting**
```typescript
// Implement rate limiting in your afterSetOtp hook
const rateLimiter = new Map()

afterSetOtp: async ({ credentials, req }) => {
  const identifier = credentials.mobile || credentials.email
  const now = Date.now()
  const attempts = rateLimiter.get(identifier) || []
  
  // Clean old attempts (older than 1 hour)
  const recentAttempts = attempts.filter(time => now - time < 60 * 60 * 1000)
  
  if (recentAttempts.length >= 5) {
    throw new Error('Too many OTP requests. Please try again later.')
  }
  
  rateLimiter.set(identifier, [...recentAttempts, now])
  
  // Send OTP...
}
```

**2. Database Optimization**
```typescript
// Add indexes to your OTP collection for better performance
// In your Payload config:
collections: [
  {
    slug: 'otpCode',
    fields: [
      // ... existing fields
    ],
    indexes: [
      {
        fields: { mobile: 1, expiresAt: 1 }
      },
      {
        fields: { email: 1, expiresAt: 1 }
      },
      {
        fields: { expiresAt: 1 }, // For cleanup queries
        expireAfterSeconds: 0 // MongoDB TTL index
      }
    ]
  }
]
```

### Error Handling & User Experience

**1. Graceful Error Handling**
```typescript
afterSetOtp: async ({ otp, credentials, payload }) => {
  try {
    if (credentials.mobile) {
      await sendSMS(credentials.mobile, otp)
    } else if (credentials.email) {
      await sendEmail(credentials.email, otp)
    }
  } catch (error) {
    // Log error but don't expose details to user
    console.error('Failed to send OTP:', error)
    
    // Store fallback method or retry logic
    await payload.create({
      collection: 'otpFailures',
      data: {
        identifier: credentials.mobile || credentials.email,
        error: error.message,
        retryAfter: new Date(Date.now() + 5 * 60 * 1000)
      }
    })
    
    throw new Error('Failed to send verification code. Please try again.')
  }
}
```

**2. User-Friendly Component Configuration**
```typescript
// Custom error messages and loading states
<OtpView 
  className="user-friendly-otp"
  // Override default messages via props if needed
/>

// Add custom CSS for better UX
.user-friendly-otp .otp__loading {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Testing Strategies

**1. Unit Testing Components**
```typescript
// __tests__/OTPInput.test.tsx
import { render, fireEvent, screen } from '@testing-library/react'
import { OTPInput } from 'payloadcms_otp_plugin'

describe('OTPInput', () => {
  it('should handle OTP completion', () => {
    const onComplete = jest.fn()
    render(<OTPInput length={6} onComplete={onComplete} />)
    
    // Simulate typing OTP
    const inputs = screen.getAllByRole('textbox')
    inputs.forEach((input, index) => {
      fireEvent.change(input, { target: { value: `${index + 1}` } })
    })
    
    expect(onComplete).toHaveBeenCalledWith('123456')
  })
})
```

**2. Integration Testing**
```typescript
// __tests__/otp-flow.test.ts
import { testApiHandler } from 'next-test-api-route-handler'
import sendOtpHandler from '../pages/api/otp/send'

describe('/api/otp/send', () => {
  it('should send OTP successfully', async () => {
    await testApiHandler({
      handler: sendOtpHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'POST',
          body: JSON.stringify({ mobile: '+1234567890' }),
          headers: { 'Content-Type': 'application/json' }
        })
        
        const data = await res.json()
        expect(res.status).toBe(200)
        expect(data.success).toBe(true)
      }
    })
  })
})
```

### Monitoring & Analytics

**1. OTP Success Rate Tracking**
```typescript
afterSetOtp: async ({ otp, credentials, payload }) => {
  // Track OTP generation
  await payload.create({
    collection: 'otpAnalytics',
    data: {
      type: 'generated',
      identifier: credentials.mobile || credentials.email,
      method: credentials.mobile ? 'sms' : 'email',
      timestamp: new Date()
    }
  })
  
  // Send OTP...
}

// In your OTP verification endpoint, track success/failure
await payload.create({
  collection: 'otpAnalytics',
  data: {
    type: isValid ? 'success' : 'failure',
    identifier: credentials.mobile || credentials.email,
    timestamp: new Date()
  }
})
```

**2. Performance Monitoring**
```typescript
// Add timing metrics
const startTime = Date.now()

afterSetOtp: async ({ otp, credentials }) => {
  try {
    await sendOTP(credentials, otp)
    
    // Log success timing
    console.log(`OTP sent in ${Date.now() - startTime}ms`)
  } catch (error) {
    // Log failure timing
    console.error(`OTP failed after ${Date.now() - startTime}ms:`, error)
    throw error
  }
}
```

## Development

### Building the Plugin

```bash
pnpm install
pnpm build
```

### Running Tests

```bash
pnpm test
```

### Development Server

```bash
pnpm dev
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Author

**Muhammad Fahmi Hidayah**  
Email: m.fahmi.hidayah@gmail.com

## Support

If you encounter any issues or have questions, please:

1. Check the [documentation](https://github.com/fahmihidayah/payloadcms_otp_plugin)
2. Search [existing issues](https://github.com/fahmihidayah/payloadcms_otp_plugin/issues)
3. Create a [new issue](https://github.com/fahmihidayah/payloadcms_otp_plugin/issues/new)

---

Built with ❤️ for the Payload CMS community