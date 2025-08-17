# NPM Publication Guide

## Pre-Publication Checklist

### ✅ Code & Documentation
- [x] Comprehensive README.md with features and usage examples
- [x] LICENSE file (MIT License)
- [x] CHANGELOG.md with version history
- [x] TypeScript definitions and proper typing
- [x] Clean, documented code with proper error handling

### ✅ Package Configuration
- [x] Updated package.json with proper metadata
- [x] Scoped package name: `@payloadcms/otp-plugin`
- [x] Author information: Muhammad Fahmi Hidayah
- [x] Keywords for discoverability
- [x] Repository and homepage URLs (update with actual GitHub repo)
- [x] Proper file inclusion/exclusion

### ✅ Build & Scripts
- [x] Build configuration with TypeScript compilation
- [x] NPM publish scripts
- [x] Version management scripts
- [x] Test suite setup

### ✅ Files Structure
- [x] Source code in `/src`
- [x] Build output to `/dist`
- [x] Proper export configuration
- [x] .npmignore for clean package

## Publication Steps

### 1. Final Setup
```bash
# Update repository URLs in package.json (replace with actual GitHub repo)
# Create GitHub repository
# Push code to GitHub
```

### 2. Build & Test
```bash
pnpm install
pnpm build
pnpm test
pnpm typecheck
```

### 3. Version & Publish
```bash
# For initial release
npm login

# Publish to NPM
pnpm publish:npm

# Or for beta release
pnpm publish:beta
```

### 4. Post-Publication
- [ ] Verify package on npmjs.com
- [ ] Test installation in a separate project
- [ ] Update documentation with actual installation command
- [ ] Add GitHub topics: `payload-plugin`, `payload-cms`, `otp`, `authentication`

## Package Information

- **Name**: `@payloadcms/otp-plugin`
- **Version**: 1.0.0
- **Author**: Muhammad Fahmi Hidayah (m.fahmi.hidayah@gmail.com)
- **License**: MIT
- **Payload Compatibility**: ^3.51.0

## Features Summary

- 🔐 Passwordless OTP authentication
- 📱 SMS and email support
- ⚡ Easy integration
- 🎯 Customizable hooks
- 🔧 TypeScript support
- 🛡️ Security features
- 🏗️ Payload 3.x compatible

## Installation Command (Post-Publication)

```bash
npm install @payloadcms/otp-plugin
```

## Repository Structure

```
├── src/                    # Source code
├── dist/                   # Build output
├── dev/                    # Development environment
├── README.md              # Main documentation
├── LICENSE                # MIT License
├── CHANGELOG.md           # Version history
├── package.json           # Package configuration
├── .npmignore            # NPM ignore rules
└── PUBLISH_GUIDE.md      # This file
```