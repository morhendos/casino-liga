# Padeliga UI Design System

## Overview

This document outlines the design system for the Padeliga application. The UI has been enhanced to reflect the vibrant, geometric style of the Padeliga logo, creating a cohesive and modern user experience.

## Brand Colors

The color palette is derived from the Padeliga logo:

- **Teal** (`hsl(210, 79%, 46%)`) - Primary color, used for primary actions and key UI elements
- **Orange** (`hsl(37, 91%, 55%)`) - Secondary color, used for accents and highlights
- **Purple** (`hsl(278, 65%, 56%)`) - Used for specific UI elements and status indicators
- **Green** (`hsl(84, 67%, 58%)`) - Used for success states and specific UI elements
- **Red** (`hsl(350, 73%, 65%)`) - Used for errors, warnings, and specific UI elements

These colors are available via CSS variables and Tailwind classes:

- CSS: `var(--orange)`, `var(--teal)`, `var(--purple)`, `var(--green)`, `var(--red)`
- Tailwind: `text-padeliga-orange`, `bg-padeliga-teal`, etc.

## Components

### Buttons

Buttons come in various variants that match the Padeliga color scheme:

```jsx
// Primary (teal) button
<Button variant="teal">Primary Action</Button>

// Orange accent button
<Button variant="orange">Secondary Action</Button>

// Gradient button with all brand colors
<Button variant="gradient">Featured Action</Button>

// Other color variants
<Button variant="purple">Action</Button>
<Button variant="green">Success Action</Button>

// Size variants
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>
```

### Cards

Cards have been enhanced with gradient borders, hover effects, and color-themed variants:

```jsx
// Default card
<Card>Content</Card>

// Card with gradient border
<Card variant="gradient">Content</Card>

// Color-themed cards
<Card variant="teal">Content</Card>
<Card variant="orange">Content</Card>
<Card variant="purple">Content</Card>
<Card variant="green">Content</Card>

// Hover effects
<Card hover="grow">Grows on hover</Card>
<Card hover="raise">Raises on hover</Card>
<Card hover="highlight">Highlights on hover</Card>
```

### Badges

Badges are available in all brand colors and subtle variants:

```jsx
// Standard badges with brand colors
<Badge variant="teal">Teal Badge</Badge>
<Badge variant="orange">Orange Badge</Badge>
<Badge variant="purple">Purple Badge</Badge>
<Badge variant="green">Green Badge</Badge>
<Badge variant="red">Red Badge</Badge>

// Gradient badge
<Badge variant="gradient">Gradient Badge</Badge>

// Subtle variants
<Badge variant="teal-subtle">Subtle Teal</Badge>
<Badge variant="orange-subtle">Subtle Orange</Badge>
```

### Geometric Background

A background component that echoes the geometric shapes in the logo:

```jsx
// Default geometric background
<GeometricBackground />

// Subtle variant (lower opacity)
<GeometricBackground variant="subtle" />

// Intense variant (higher opacity)
<GeometricBackground variant="intense" />

// Disable animations
<GeometricBackground animated={false} />
```

### Logo Component

A consistent way to display the Padeliga logo:

```jsx
// Default logo
<PadeligaLogo />

// Size variants
<PadeligaLogo size="sm" />
<PadeligaLogo size="md" />
<PadeligaLogo size="lg" />
<PadeligaLogo size="xl" />

// Without tagline
<PadeligaLogo showTagline={false} />

// Dark variant for dark backgrounds
<PadeligaLogo variant="dark" />

// Light variant for light backgrounds
<PadeligaLogo variant="light" />
```

## Typography

The heading accent class adds an underline gradient to headings:

```jsx
<h1 className="heading-accent">Heading with Accent</h1>
<h2 className="heading-accent">Subheading with Accent</h2>
```

## Usage Examples

### Landing Page

The landing page uses a combination of the GeometricBackground, gradient buttons, and accent headings to create a vibrant, engaging experience.

### League Pages

League pages use card variants, badges for status indicators, and a consistent header component.

## Responsive Design

All components are designed to be responsive and work well on mobile, tablet, and desktop screens.

## Dark Mode Support

The design system supports both light and dark mode, with appropriate color adjustments for both modes.

## Accessibility

Color contrasts have been checked to ensure readability and all interactive elements are keyboard accessible.
