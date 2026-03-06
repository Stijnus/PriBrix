# PriBrix — Design System

This document defines the visual identity, color tokens, typography, spacing, and component patterns for the PriBrix app. All values map directly to the `tailwind.config.js` theme extension used with NativeWind v4.

---

## 1. Brand Colors

The PriBrix palette uses warm orange/amber tones (brick-inspired, but distinct from LEGO's trademarked red/yellow) with teal accents and slate neutrals.

### Primary — Amber/Orange

Used for: brand identity, primary buttons, active tab indicators, highlights.

| Token | Hex | Usage |
|-------|-----|-------|
| `primary-50` | `#FFF8F0` | Lightest tint, subtle backgrounds |
| `primary-100` | `#FFEFD6` | Light background, selected states |
| `primary-200` | `#FFDBA8` | Hover/pressed backgrounds |
| `primary-300` | `#FFC170` | Badges, icons |
| `primary-400` | `#FFA438` | Secondary emphasis |
| `primary-500` | `#F58A07` | **Primary brand color** |
| `primary-600` | `#D97306` | Primary button background |
| `primary-700` | `#B35E05` | Pressed button state |
| `primary-800` | `#8C4A04` | Dark accent |
| `primary-900` | `#6B3803` | Darkest shade |

### Accent — Teal

Used for: secondary actions, links, informational elements, price chart lines.

| Token | Hex | Usage |
|-------|-----|-------|
| `accent-50` | `#F0FDFA` | Light tint |
| `accent-100` | `#CCFBF1` | Subtle backgrounds |
| `accent-200` | `#99F6E4` | Light emphasis |
| `accent-300` | `#5EEAD4` | Icons, badges |
| `accent-400` | `#2DD4BF` | Links, secondary buttons |
| `accent-500` | `#14B8A6` | **Accent color** |
| `accent-600` | `#0D9488` | Pressed state |
| `accent-700` | `#0F766E` | Dark accent |

### Neutral — Slate

Used for: text, backgrounds, borders, cards.

| Token | Hex | Usage |
|-------|-----|-------|
| `neutral-50` | `#F8FAFC` | Page background (light) |
| `neutral-100` | `#F1F5F9` | Card background, input bg |
| `neutral-200` | `#E2E8F0` | Borders, dividers |
| `neutral-300` | `#CBD5E1` | Disabled text, placeholders |
| `neutral-400` | `#94A3B8` | Secondary text |
| `neutral-500` | `#64748B` | Body text (light theme) |
| `neutral-600` | `#475569` | Strong secondary text |
| `neutral-700` | `#334155` | Headings (light theme) |
| `neutral-800` | `#1E293B` | Card bg (dark), strong text |
| `neutral-900` | `#0F172A` | Page background (dark) |
| `neutral-950` | `#020617` | Deepest dark |

---

## 2. Semantic Colors

### Feedback

| Token | Hex | Usage |
|-------|-----|-------|
| `success` | `#16A34A` | Confirmations, in-stock badge |
| `success-light` | `#DCFCE7` | Success background tint |
| `error` | `#DC2626` | Errors, destructive actions |
| `error-light` | `#FEE2E2` | Error background tint |
| `warning` | `#F59E0B` | Warnings, attention needed |
| `warning-light` | `#FEF3C7` | Warning background tint |
| `info` | `#0EA5E9` | Informational, tips |
| `info-light` | `#E0F2FE` | Info background tint |

### Price-Specific

| Token | Hex | Usage |
|-------|-----|-------|
| `price-drop` | `#16A34A` | Price decrease, deal badge, chart down trend |
| `price-drop-bg` | `#DCFCE7` | Price drop background highlight |
| `price-up` | `#DC2626` | Price increase indicator |
| `price-up-bg` | `#FEE2E2` | Price increase background |
| `price-neutral` | `#64748B` | No change, stable price |
| `price-best` | `#F58A07` | Best price badge (uses primary) |

### Stock Status

| Token | Hex | Usage |
|-------|-----|-------|
| `stock-in` | `#16A34A` | In stock badge |
| `stock-out` | `#DC2626` | Out of stock badge |
| `stock-unknown` | `#94A3B8` | Unknown stock badge |

---

## 3. Typography

PriBrix uses system fonts for optimal performance and native feel. No custom fonts to load.

### Font Family

- **iOS**: San Francisco (system default)
- **Android**: Roboto (system default)
- **Config**: Do not set a custom fontFamily — React Native defaults are correct

### Size Scale

| Token | Size (px) | Line Height | Usage |
|-------|-----------|-------------|-------|
| `text-xs` | 11 | 16 | Captions, timestamps, fine print |
| `text-sm` | 13 | 18 | Secondary labels, badges |
| `text-base` | 15 | 22 | Body text (default) |
| `text-lg` | 17 | 24 | Emphasized body, list titles |
| `text-xl` | 20 | 28 | Section headers |
| `text-2xl` | 24 | 32 | Screen titles |
| `text-3xl` | 30 | 36 | Hero prices, large display |

### Font Weights

| Token | Weight | Usage |
|-------|--------|-------|
| `font-normal` | 400 | Body text |
| `font-medium` | 500 | Labels, badges, secondary headings |
| `font-semibold` | 600 | Prices, emphasis, card titles |
| `font-bold` | 700 | Screen titles, CTAs, best price |

### Price Display Convention

- Current price: `text-xl font-bold` (prominent)
- Original/MSRP price: `text-sm font-normal line-through neutral-400`
- Shipping cost: `text-sm font-normal neutral-500`
- "Best price" label: `text-xs font-semibold uppercase tracking-wide primary-600`

---

## 4. Spacing & Sizing

Use Tailwind's default spacing scale. Key patterns:

### Layout Spacing

| Context | Value | Tailwind Class |
|---------|-------|----------------|
| Screen horizontal padding | 16px | `px-4` |
| Card padding | 12px | `p-3` |
| Section gap | 24px | `gap-6` |
| List item gap | 12px | `gap-3` |
| Inline element gap | 8px | `gap-2` |
| Icon-to-text gap | 6px | `gap-1.5` |

### Border Radius

| Context | Value | Tailwind Class |
|---------|-------|----------------|
| Cards | 12px | `rounded-xl` |
| Buttons | 10px | `rounded-lg` |
| Badges / chips | 9999px (pill) | `rounded-full` |
| Input fields | 8px | `rounded-lg` |
| Images (set thumbnails) | 8px | `rounded-lg` |

### Shadows (Light Mode)

| Context | Tailwind Class |
|---------|----------------|
| Cards | `shadow-sm` |
| Elevated cards (featured) | `shadow-md` |
| Modals / bottom sheets | `shadow-lg` |
| Tab bar | `shadow-sm` (top border preferred) |

### Icon Sizes

| Context | Size | Tailwind Class |
|---------|------|----------------|
| Tab bar icons | 24px | `w-6 h-6` |
| Inline icons (buttons, labels) | 20px | `w-5 h-5` |
| Small indicators | 16px | `w-4 h-4` |
| Feature icons (settings) | 28px | `w-7 h-7` |

### Set Image Sizes

| Context | Size |
|---------|------|
| Card thumbnail | 80x80 |
| List thumbnail | 56x56 |
| Detail hero | full width, 250px height |

---

## 5. Component Patterns

All components use NativeWind v4 `className` props. Below are the recommended class compositions.

### SetCard (Browse/Search Results)

```
Container:  bg-white rounded-xl shadow-sm p-3 flex-row gap-3
Image:      w-20 h-20 rounded-lg bg-neutral-100
Title:      text-base font-semibold text-neutral-700
Set number: text-xs text-neutral-400
Theme:      text-xs text-neutral-500
Price:      text-lg font-bold text-neutral-800
Deal badge: bg-price-drop-bg text-price-drop text-xs font-medium px-2 py-0.5 rounded-full
```

### OfferRow (Set Detail)

```
Container:    bg-white rounded-lg p-3 flex-row items-center gap-3 border border-neutral-200
Retailer:     text-base font-medium text-neutral-700
Price:        text-lg font-bold text-neutral-800
Shipping:     text-sm text-neutral-500
Buy button:   bg-primary-600 rounded-lg px-4 py-2.5
Buy text:     text-white font-semibold text-sm
Stock badge:  (see Badge below)
```

### PriceDisplay

```
Current price:  text-xl font-bold text-neutral-800
MSRP:           text-sm font-normal text-neutral-400 line-through
Savings:        text-sm font-semibold text-price-drop
EUR symbol:     included inline (e.g., "EUR 89.99" or "89,99")
```

### Badge

```
In stock:       bg-success-light text-success text-xs font-medium px-2 py-0.5 rounded-full
Out of stock:   bg-error-light text-error text-xs font-medium px-2 py-0.5 rounded-full
Unknown stock:  bg-neutral-100 text-neutral-500 text-xs font-medium px-2 py-0.5 rounded-full
Premium:        bg-primary-100 text-primary-700 text-xs font-medium px-2 py-0.5 rounded-full
Priority high:  bg-error-light text-error text-xs font-medium px-2 py-0.5 rounded-full
Priority med:   bg-warning-light text-warning text-xs font-medium px-2 py-0.5 rounded-full
Priority low:   bg-info-light text-info text-xs font-medium px-2 py-0.5 rounded-full
```

### Buttons

```
Primary:        bg-primary-600 rounded-lg px-5 py-3 active:bg-primary-700
Primary text:   text-white font-semibold text-base text-center

Secondary:      bg-neutral-100 rounded-lg px-5 py-3 active:bg-neutral-200
Secondary text: text-neutral-700 font-semibold text-base text-center

Outline:        border border-neutral-300 rounded-lg px-5 py-3 active:bg-neutral-50
Outline text:   text-neutral-700 font-medium text-base text-center

Destructive:    bg-error rounded-lg px-5 py-3 active:bg-red-700
Destruct. text: text-white font-semibold text-base text-center

Small variant:  px-3 py-1.5 text-sm
```

### Tab Bar

```
Container:      bg-white border-t border-neutral-200
Active icon:    text-primary-600
Active label:   text-primary-600 text-xs font-medium
Inactive icon:  text-neutral-400
Inactive label: text-neutral-400 text-xs font-normal
```

### Input Fields

```
Container:  bg-neutral-100 rounded-lg px-4 py-3 border border-neutral-200
Text:       text-base text-neutral-800
Placeholder:text-neutral-400
Focused:    border-primary-500 bg-white
Error:      border-error
```

---

## 6. Dark Mode

Dark mode uses inverted neutral scale with the same brand colors at adjusted brightness.

| Element | Light | Dark |
|---------|-------|------|
| Page background | `neutral-50` (#F8FAFC) | `neutral-900` (#0F172A) |
| Card background | `white` | `neutral-800` (#1E293B) |
| Primary text | `neutral-700` (#334155) | `neutral-100` (#F1F5F9) |
| Secondary text | `neutral-500` (#64748B) | `neutral-400` (#94A3B8) |
| Borders | `neutral-200` (#E2E8F0) | `neutral-700` (#334155) |
| Tab bar bg | `white` | `neutral-800` (#1E293B) |
| Tab bar border | `neutral-200` | `neutral-700` |
| Input background | `neutral-100` | `neutral-800` |
| Price text | `neutral-800` | `neutral-50` |

Brand and semantic colors remain the same in both modes (primary-600, accent-500, success, error, etc. have sufficient contrast on dark backgrounds).

NativeWind dark mode: use `dark:` prefix classes (e.g., `bg-white dark:bg-neutral-800`).

---

## 7. Tailwind Config

Copy-paste ready `tailwind.config.js` theme extension:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#FFF8F0',
          100: '#FFEFD6',
          200: '#FFDBA8',
          300: '#FFC170',
          400: '#FFA438',
          500: '#F58A07',
          600: '#D97306',
          700: '#B35E05',
          800: '#8C4A04',
          900: '#6B3803',
        },
        accent: {
          50:  '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
        },
        neutral: {
          50:  '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',
        },
        success:       { DEFAULT: '#16A34A', light: '#DCFCE7' },
        error:         { DEFAULT: '#DC2626', light: '#FEE2E2' },
        warning:       { DEFAULT: '#F59E0B', light: '#FEF3C7' },
        info:          { DEFAULT: '#0EA5E9', light: '#E0F2FE' },
        'price-drop':  { DEFAULT: '#16A34A', bg: '#DCFCE7' },
        'price-up':    { DEFAULT: '#DC2626', bg: '#FEE2E2' },
        'stock-in':    '#16A34A',
        'stock-out':   '#DC2626',
        'stock-unknown': '#94A3B8',
      },
      fontSize: {
        xs:   ['11px', { lineHeight: '16px' }],
        sm:   ['13px', { lineHeight: '18px' }],
        base: ['15px', { lineHeight: '22px' }],
        lg:   ['17px', { lineHeight: '24px' }],
        xl:   ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
      },
      borderRadius: {
        DEFAULT: '8px',
        lg: '10px',
        xl: '12px',
      },
    },
  },
  plugins: [],
};
```

---

## 8. Price Formatting

Locale: EUR, Benelux conventions.

- Use comma as decimal separator: `89,99` (not `89.99`)
- Currency symbol position: prefix `EUR ` or suffix ` EUR` — pick one and be consistent
- Recommended: `EUR 89,99` (matches common BE/NL retail display)
- Free shipping: display "Gratis verzending" / "Free shipping"
- Unknown shipping: display "Verzending onbekend" / "Shipping unknown"
- No price available: display "Prijs niet beschikbaar" with muted styling

Helper: create a `formatPrice(cents: number, locale: string)` utility in `src/utils/formatPrice.ts`.
