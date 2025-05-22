# StockPulse Logo Assets

This directory contains all logo assets in various dimensions for different use cases.

## Asset Categories

### Favicon Assets
- `favicon-16.png`: 16x16px favicon for browsers
- `favicon-32.png`: 32x32px favicon for browsers
- `favicon-48.png`: 48x48px favicon for browsers
- `favicon-64.png`: 64x64px favicon for browsers
- Note: The actual `favicon.ico` file is stored in the public directory root

### Apple Touch Icons
- `apple-57.png`: 57x57px icon for older iPhones
- `apple-60.png`: 60x60px icon for iPhones
- `apple-72.png`: 72x72px icon for iPads
- `apple-76.png`: 76x76px icon for iPads
- `apple-114.png`: 114x114px icon for iPhones with retina display
- `apple-120.png`: 120x120px icon for iPhones with retina display
- `apple-144.png`: 144x144px icon for iPads with retina display
- `apple-152.png`: 152x152px icon for iPads with retina display
- `apple-180.png`: 180x180px icon for iPhone 6 Plus

### Android Icons
- `android-36.png`: 36x36px icon for Android
- `android-48.png`: 48x48px icon for Android
- `android-72.png`: 72x72px icon for Android
- `android-96.png`: 96x96px icon for Android
- `android-144.png`: 144x144px icon for Android
- `android-192.png`: 192x192px icon for Android
- `android-512.png`: 512x512px icon for Android

### Microsoft Tile Icons
- `msTile-70.png`: 70x70px icon for Microsoft Tiles
- `msTile-150.png`: 150x150px icon for Microsoft Tiles
- `msTile-310.png`: 310x310px icon for Microsoft Tiles

### General Purpose Icons
- `general-16.png`: 16x16px general purpose icon
- `general-32.png`: 32x32px general purpose icon
- `general-64.png`: 64x64px general purpose icon
- `general-128.png`: 128x128px general purpose icon
- `general-192.png`: 192x192px general purpose icon
- `general-256.png`: 256x256px general purpose icon
- `general-512.png`: 512x512px general purpose icon

### Logo Variations
- `logo-horizontal.png`: 200x50px horizontal logo
- `logo-horizontal@2x.png`: 400x100px horizontal logo for retina displays
- `logo-square.png`: 100x100px square logo
- `logo-square@2x.png`: 200x200px square logo for retina displays

## Usage

These assets are automatically included in the application through:
1. HTML head references for favicons and touch icons
2. Web app manifest for PWA support
3. The `<Logo />` React component

### Using the Logo Component

```tsx
import Logo from '@/components/Logo';

// Default usage
<Logo />

// With specific size
<Logo size="small" />
<Logo size="medium" />
<Logo size="large" />

// With specific variant
<Logo variant="square" />
<Logo variant="horizontal" />

// With custom dimensions
<Logo width={120} height={40} />

// With additional CSS classes
<Logo className="my-custom-class" />
```

## Regenerating Assets

To regenerate all logo assets, run:

```bash
npm run generate:logo
```

This script will resize the source logo (stored in `tools/assets/StockPulseLogo-main.png`) into all the dimensions needed for the application. 