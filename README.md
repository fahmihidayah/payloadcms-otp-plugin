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
npm install @payloadcms/otp-plugin
# or
yarn add @payloadcms/otp-plugin
# or
pnpm add @payloadcms/otp-plugin
```

## Quick Start

### 1. Basic Configuration

Add the plugin to your Payload configuration:

```typescript
import { buildConfig } from 'payload'
import { otpPlugin } from '@payloadcms/otp-plugin'

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
import { otpPlugin } from '@payloadcms/otp-plugin'
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
| `expiredTime` | `number` | - | OTP expiration time in milliseconds |
| `afterSetOtp` | `AfterSetOtpHook` | `undefined` | Hook executed after OTP creation |

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

1. Check the [documentation](https://github.com/your-username/payload-otp-plugin)
2. Search [existing issues](https://github.com/your-username/payload-otp-plugin/issues)
3. Create a [new issue](https://github.com/your-username/payload-otp-plugin/issues/new)

---

Built with ❤️ for the Payload CMS community