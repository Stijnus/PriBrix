# PriBrix — Design System

This document defines the visual identity, color tokens, typography, spacing, and component patterns for the PriBrix app. All values map directly to the `tailwind.config.js` theme extension used with NativeWind v4.

---

## 1. Brand Colors

### Primary — Red

Used for: brand identity, primary buttons, active states, highlights, alerts.

| Token         | Hex       | Usage                             |
| ------------- | --------- | --------------------------------- |
| `primary-50`  | `#FFF5F6` | Lightest tint, subtle backgrounds |
| `primary-100` | `#FDE8EA` | Light background, selected states |
| `primary-200` | `#F9B4BA` | Hover/pressed backgrounds         |
| `primary-300` | `#FF6B77` | Badges, icons                     |
| `primary-400` | `#F03345` | Secondary emphasis                |
| `primary-500` | `#E8192C` | **Primary brand color**           |
| `primary-600` | `#CC1426` | Primary button background         |
| `primary-700` | `#B01020` | Pressed button state              |
| `primary-800` | `#8D0D1A` | Dark accent                       |
| `primary-900` | `#6D0A14` | Darkest shade                     |

### Accent — Blue

Used for: secondary actions, links, informational elements, chart highlights.

| Token        | Hex       | Usage                    |
| ------------ | --------- | ------------------------ |
| `accent-50`  | `#EFF6FF` | Light tint               |
| `accent-100` | `#DBEAFE` | Subtle backgrounds       |
| `accent-200` | `#BFDBFE` | Light emphasis           |
| `accent-300` | `#93C5FD` | Icons, badges            |
| `accent-400` | `#60A5FA` | Links, secondary buttons |
| `accent-500` | `#2563EB` | **Accent color**         |
| `accent-600` | `#1D4ED8` | Pressed state            |
| `accent-700` | `#1E40AF` | Dark accent              |

### Neutral

Used for: text, backgrounds, borders, cards.

| Token         | Hex       | Usage                       |
| ------------- | --------- | --------------------------- |
| `neutral-50`  | `#F7F8FC` | Page background (light)     |
| `neutral-100` | `#F0F2F7` | Card background, input bg   |
| `neutral-200` | `#E4E7F0` | Borders, dividers           |
| `neutral-300` | `#C8CEDC` | Disabled text, placeholders |
| `neutral-400` | `#A3AABE` | Secondary text              |
| `neutral-500` | `#7C8499` | Body text (light theme)     |
| `neutral-600` | `#555C70` | Strong secondary text       |
| `neutral-700` | `#363C4E` | Headings (light theme)      |
| `neutral-800` | `#1F2330` | Card bg (dark), strong text |
| `neutral-900` | `#111318` | Page background (dark)      |

---

## 2. Semantic Colors

### Feedback

| Token           | Hex       | Usage                         |
| --------------- | --------- | ----------------------------- |
| `success`       | `#1A9E5C` | Confirmations, in-stock badge |
| `success-light` | `#E3F7ED` | Success background tint       |
| `error`         | `#E8192C` | Errors, destructive actions   |
| `error-light`   | `#FDE8EA` | Error background tint         |
| `warning`       | `#D97706` | Warnings, attention needed    |
| `warning-light` | `#FEF3C7` | Warning background tint       |
| `info`          | `#2563EB` | Informational, tips           |
| `info-light`    | `#DBEAFE` | Info background tint          |

### Price-Specific

| Token           | Hex       | Usage                                        |
| --------------- | --------- | -------------------------------------------- |
| `price-drop`    | `#1A9E5C` | Price decrease, deal badge, chart down trend |
| `price-drop-bg` | `#E3F7ED` | Price drop background highlight              |
| `price-up`      | `#E8192C` | Price increase indicator                     |
| `price-up-bg`   | `#FDE8EA` | Price increase background                    |

### Stock Status

| Token           | Hex       | Usage               |
| --------------- | --------- | ------------------- |
| `stock-in`      | `#1A9E5C` | In stock badge      |
| `stock-out`     | `#D97706` | Out of stock badge  |
| `stock-unknown` | `#A3AABE` | Unknown stock badge |

---

## 3. Typography

PriBrix uses **DM Sans** and **DM Mono** custom fonts loaded via Expo.

### Font Families

| Token             | Font                  | Usage                     |
| ----------------- | --------------------- | ------------------------- |
| `font-sans`       | `DMSans_400Regular`   | Body text                 |
| `font-sans-medium`| `DMSans_500Medium`    | Labels, secondary headings|
| `font-sans-semibold`| `DMSans_600SemiBold`| Prices, card titles       |
| `font-sans-bold`  | `DMSans_700Bold`      | Screen titles, CTAs       |
| `font-sans-extrabold`| `DMSans_800ExtraBold`| Hero display           |
| `font-mono`       | `DMMono_500Medium`    | Set numbers, codes        |

### Size Scale

| Token       | Size (px) | Line Height | Usage                            |
| ----------- | --------- | ----------- | -------------------------------- |
| `text-xs`   | 11        | 16          | Captions, timestamps, fine print |
| `text-sm`   | 12        | 18          | Secondary labels, badges         |
| `text-base` | 14        | 20          | Body text (default)              |
| `text-lg`   | 15        | 22          | Emphasized body, list titles     |
| `text-xl`   | 16        | 24          | Section headers                  |
| `text-2xl`  | 20        | 28          | Screen titles                    |
| `text-3xl`  | 28        | 34          | Hero prices, large display       |
| `text-4xl`  | 42        | 46          | Hero display                     |

---

## 4. Spacing & Sizing

### Layout Spacing (from `src/theme/index.ts`)

| Token  | Value | Usage                     |
| ------ | ----- | ------------------------- |
| `xs`   | 4px   | Tight gaps                |
| `sm`   | 8px   | Inline element gap        |
| `md`   | 12px  | List item gap, card pad   |
| `base` | 16px  | Screen horizontal padding |
| `lg`   | 20px  | Section spacing           |
| `xl`   | 24px  | Section gap               |
| `xxl`  | 32px  | Large section gap         |
| `xxxl` | 48px  | Page-level spacing        |
| `xxxxl`| 64px  | Hero spacing              |

### Border Radius

| Token      | Value  | Tailwind Class  | Usage            |
| ---------- | ------ | --------------- | ---------------- |
| DEFAULT    | 12px   | `rounded`       | Cards, inputs    |
| `lg`       | 16px   | `rounded-lg`    | Buttons          |
| `xl`       | 20px   | `rounded-xl`    | Large cards      |
| `2xl`      | 24px   | `rounded-2xl`   | Modals           |
| `full`     | 9999px | `rounded-full`  | Badges, chips    |

### Shadows

| Token  | Usage                      |
| ------ | -------------------------- |
| `xs`   | Subtle elevation           |
| `sm`   | Cards                      |
| `md`   | Elevated cards             |
| `lg`   | Modals, bottom sheets      |
| `xl`   | Floating elements          |
| `red`  | Primary button glow effect |

### Icon Sizes

| Context                        | Size | Tailwind Class |
| ------------------------------ | ---- | -------------- |
| Tab bar icons                  | 24px | `w-6 h-6`      |
| Inline icons (buttons, labels) | 20px | `w-5 h-5`      |
| Small indicators               | 16px | `w-4 h-4`      |
| Feature icons (settings)       | 28px | `w-7 h-7`      |

---

## 5. Component Patterns

All components use NativeWind v4 `className` props.

### Badge (`src/components/ui/Badge.tsx`)

Pill-shaped labels. Background on the `<View>` container, text color on the `<Text>`.

| Variant         | Container                                    | Text                  |
| --------------- | -------------------------------------------- | --------------------- |
| `in-stock`      | `bg-success-light`                           | `text-success`        |
| `out-of-stock`  | `bg-neutral-100`                             | `text-neutral-600`    |
| `unknown`       | `bg-neutral-100`                             | `text-neutral-500`    |
| `premium`       | `bg-neutral-900`                             | `text-white`          |
| `priority-high` | `bg-primary-100`                             | `text-primary-500`    |
| `priority-medium`| `bg-warning-light`                          | `text-warning`        |
| `priority-low`  | `bg-info-light`                              | `text-info`           |
| `country`       | `bg-primary-100`                             | `text-primary-500`    |
| `red`           | `bg-primary-500`                             | `text-white`          |
| `red-soft`      | `bg-primary-100`                             | `text-primary-500`    |
| `success`       | `bg-success-light`                           | `text-success`        |
| `warning`       | `bg-warning-light`                           | `text-warning`        |
| `dark`          | `bg-neutral-900`                             | `text-white`          |
| `gray`          | `bg-neutral-100`                             | `text-neutral-600`    |
| `outline`       | `bg-transparent border-[1.5px] border-neutral-300` | `text-neutral-700` |

### AppButton (`src/components/ui/AppButton.tsx`)

| Variant     | Container                                     | Text               |
| ----------- | --------------------------------------------- | ------------------- |
| `primary`   | `bg-primary-500` + red shadow                 | `text-white`        |
| `secondary` | `bg-neutral-100`                              | `text-neutral-700`  |
| `ghost`     | `border-[1.5px] border-primary-300 bg-transparent` | `text-primary-500` |
| `dark`      | `bg-neutral-900`                              | `text-white`        |

Sizes: `xs` (h-8), `sm` (h-10), `md` (h-12), `lg` (h-14).

### AppChip (`src/components/ui/AppChip.tsx`)

Pill toggle buttons. Active: `bg-primary-500 text-white`. Inactive: `bg-white border-neutral-200`. Font size: 13px.

### AppSearchInput (`src/components/ui/AppSearchInput.tsx`)

Search field with icon. Default: `bg-neutral-100` transparent border. Focus state: white background, `border-[1.5px] border-primary-400`, pink shadow ring (`#FDE8EA`).

### LoadingSkeleton (`src/components/ui/LoadingSkeleton.tsx`)

Placeholder cards with animated opacity pulse (reanimated). Pulses between 1.0 and 0.4 opacity over 1.5s.

### ProgressBar (`src/components/ui/ProgressBar.tsx`)

Animated horizontal bar. `bg-neutral-100` track, `bg-primary-500` fill. Sizes: `sm` (4px), `md` (8px), `lg` (12px).

### AlertCTACard (`src/components/ui/AlertCTACard.tsx`)

Centered card with icon, title, description, and CTA button. Container: `bg-primary-50 border-[1.5px] border-primary-100 rounded-xl p-6`.

---

## 6. Dark Mode

Dark mode uses inverted neutral scale with the same brand colors.

| Element          | Light                    | Dark                     |
| ---------------- | ------------------------ | ------------------------ |
| Page background  | `neutral-50` (#F7F8FC)   | `neutral-900` (#111318)  |
| Card background  | `white`                  | `neutral-800` (#1F2330)  |
| Primary text     | `neutral-700` (#363C4E)  | `neutral-100` (#F0F2F7)  |
| Secondary text   | `neutral-500` (#7C8499)  | `neutral-400` (#A3AABE)  |
| Borders          | `neutral-200` (#E4E7F0)  | `neutral-700` (#363C4E)  |
| Input background | `neutral-100`            | `neutral-800`            |

Use `dark:` prefix classes (e.g., `bg-white dark:bg-neutral-800`).

---

## 7. Price Formatting

Locale: EUR, Benelux conventions.

- Comma as decimal separator: `89,99`
- Format: `EUR 89,99`
- Free shipping: "Gratis verzending" / "Free shipping"
- No price: "Prijs niet beschikbaar" with muted styling

Helper: `src/utils/formatPrice.ts`
