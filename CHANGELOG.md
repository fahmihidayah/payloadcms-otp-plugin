# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-XX

### Added
- Initial release of Payload CMS OTP Authentication Plugin
- Passwordless authentication via SMS and email
- OTP generation and verification system
- JWT token generation with session management
- `afterSetOtp` hook for custom integrations
- TypeScript support with proper type definitions
- Automatic OTP expiration and cleanup
- REST API endpoints (`/api/otp/send` and `/api/otp/login`)
- User collection enhancement with mobile field support
- Comprehensive documentation and examples
- Support for Payload CMS 3.x

### Features
- 🔐 Secure OTP-based authentication
- 📱 Multi-channel support (SMS/Email)
- ⚡ Easy plugin configuration
- 🎯 Flexible hooks for integrations
- 🔧 Full TypeScript support
- 🛡️ Built-in security features
- 🏗️ Payload 3.x compatibility