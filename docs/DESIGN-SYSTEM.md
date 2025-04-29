# Padeliga Design System

*Modern, engaging, and accessible design system for Padeliga application*

## Table of Contents

- [Introduction](#introduction)
- [Design Principles](#design-principles)
- [Color Palette](#color-palette)
- [Typography](#typography)
- [Components](#components)
  - [Cards](#cards)
  - [Buttons](#buttons)
  - [Forms](#forms)
  - [Tables](#tables)
  - [Stats and Metrics](#stats-and-metrics)
  - [Status Indicators](#status-indicators)
- [Layout Patterns](#layout-patterns)
- [Animations and Effects](#animations-and-effects)
- [Responsive Design](#responsive-design)
- [Implementation Examples](#implementation-examples)

## Introduction

This design system documents the modern UI approach implemented across the Padeliga application. It serves as a guide for maintaining visual consistency while creating engaging, accessible, and user-friendly interfaces.

## Design Principles

1. **Glass Morphism** - Translucent UI elements with blur effects that create depth and hierarchy
2. **Gradient Accents** - Strategic use of gradients to draw attention and enhance visual appeal
3. **Subtle Animation** - Purposeful animations that provide feedback and enhance the experience
4. **Consistent Spacing** - Harmonious proportions and whitespace to improve readability
5. **Contextual Colors** - Color as a functional element to convey status and importance
6. **Visual Hierarchy** - Clear ordering of elements by importance for better usability
7. **Accessibility** - High contrast and intuitive design for users of all abilities

## Color Palette

### Primary Brand Colors

- **Padeliga Purple** - `hsl(var(--purple))` - Main brand color for primary elements
- **Padeliga Teal** - `hsl(var(--teal))` - Secondary brand color for accents and highlights
- **Padeliga Orange** - `hsl(var(--orange))` - Tertiary color for calls to action and important elements
- **Padeliga Green** - `hsl(var(--green))` - Success states and positive indicators

### Context Colors

- **Success** - `from-green-600 to-emerald-500` - Indicates successful actions or positive status
- **Warning** - `from-orange-600 to-amber-500` - Indicates caution or pending status
- **Error** - `from-red-600 to-rose-500` - Indicates errors or negative status
- **Info** - `from-blue-600 to-indigo-500` - Indicates informational content

### Neutral Colors

- **Background** - Dark mode: `bg-gray-900/80` - Light mode: `bg-white/50`
- **Card Background** - Dark mode: `bg-gray-900/80` - Light mode: `bg-white/50`
- **Text Primary** - Dark mode: `text-white` - Light mode: `text-gray-900`
- **Text Secondary** - Dark mode: `text-gray-400` - Light mode: `text-gray-600`
- **Borders** - Dark mode: `border-gray-800/60` - Light mode: `border-gray-200/60`

## Typography

### Text Hierarchy

- **Page Titles** - 3xl (30px), font-bold, with gradient text effect when appropriate
- **Section Headers** - 2xl (24px), font-bold, often with icon pairing
- **Card Titles** - xl (20px), font-bold/semibold, often with gradient text effect
- **Body Text** - base (16px), normal weight, high contrast for readability
- **Small Text** - sm (14px), normal weight or medium for emphasis
- **Micro Text** - xs (12px), used for timestamps, captions, and supporting information

### Text Effects

- **Gradient Text** - `bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent`
- **Accented Headings** - Using brand colors in gradient form for important titles

## Components

### Cards

Modern cards feature:

1. **Glass Morphism** - `bg-gray-900/80 backdrop-blur-sm border border-gray-800/60`
2. **Gradient Accent Line** - Thin line at top in contextual color: `absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[color] to-[color]`
3. **Subtle Background Elements** - Blurred circles or shapes: `absolute -right-16 -top-16 w-32 h-32 rounded-full bg-[color]/5 blur-xl`
4. **Hover Effects** - Subtle transitions on hover: `transition-all hover:bg-gray-800/70`
5. **Consistent Internal Structure** - Header, content, and footer sections with appropriate spacing
6. **Shadow Effects** - `shadow-xl` with appropriate opacity

Example:
```jsx
<div className="relative overflow-hidden rounded-lg bg-gray-900/80 backdrop-blur-sm border border-gray-800/60 shadow-xl">
  {/* Gradient accent line */}
  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-padeliga-purple to-purple-500"></div>
  
  {/* Decorative background elements */}
  <div className="absolute -right-16 -top-16 w-32 h-32 rounded-full bg-purple-500/5 blur-xl"></div>
  
  {/* Card header */}
  <div className="p-5 border-b border-gray-800/60">
    <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
      Card Title
    </h2>
  </div>
  
  {/* Card content */}
  <div className="p-5">
    Content goes here
  </div>
</div>
```

### Buttons

Modern buttons include:

1. **Skewed Button Design** - Slightly skewed shape for unique appearance
2. **Gradient Background** - Brand colors in gradient form
3. **Hover Effects** - Scale, shadow, or shine effects on interaction
4. **Icon Integration** - Icons paired with text for clarity
5. **State Indicators** - Loading, success, error states visually distinct
6. **Consistent Padding** - Appropriate padding for different button sizes

Primary Button Example:
```jsx
<button
  className="relative overflow-hidden group px-8 py-4 
            bg-gradient-to-r from-padeliga-teal to-padeliga-blue rounded-md
            shadow-lg shadow-padeliga-teal/20
            transform transition-all duration-300
            hover:scale-[1.02] active:scale-[0.98]"
>
  {/* Shine effect */}
  <div 
    className="absolute -inset-full top-0 block w-1/2 h-full z-5 transform -skew-x-20 
              bg-gradient-to-r from-transparent to-white opacity-20 
              group-hover:animate-shine"
  ></div>
  
  {/* Button content */}
  <div className="relative z-10 flex items-center justify-center">
    <span className="text-white font-semibold">Button Text</span>
  </div>
</button>
```

### Forms

Forms feature:

1. **Enhanced Input Fields** - Subtle glow on focus: `focus:border-padeliga-teal pl-4 py-6 bg-gray-800/70 border-gray-700`
2. **Validation Feedback** - Visual indicators for field validation state
3. **Floating Labels** - Clear labeling with appropriate spacing
4. **Grouped Controls** - Logical grouping of related fields
5. **Contextual Help** - Supporting text for user guidance

Example:
```jsx
<div>
  <label htmlFor="fieldName" className="flex items-center text-base mb-2">
    <Icon className="h-4 w-4 mr-2 text-padeliga-teal" />
    Field Label
    <span className="text-red-500 ml-1">*</span>
  </label>
  
  <div className="relative">
    <div className="absolute inset-0 bg-gradient-to-r from-padeliga-teal/20 to-transparent rounded-md blur-sm opacity-50"></div>
    <input
      id="fieldName"
      placeholder="Enter value..."
      className="pl-4 py-6 text-base bg-gray-800/70 border-gray-700 focus:border-padeliga-teal 
                transition-all duration-300 w-full rounded-md relative z-10"
    />
    
    {/* Validation icon */}
    <div className="absolute right-3 top-1/2 -translate-y-1/2">
      <CheckCircle className="h-4 w-4 text-padeliga-green" />
    </div>
  </div>
  
  <p className="text-sm text-gray-400 mt-2">
    Supporting information about this field
  </p>
</div>
```

### Tables

Tables feature:

1. **Clean Header Design** - Distinct header styling: `bg-gray-800/50 text-xs font-medium text-gray-400 uppercase tracking-wider`
2. **Row Alternation** - Subtle alternating row colors for readability
3. **Hover Effects** - Highlight rows on hover: `hover:bg-gray-800/30`
4. **Contextual Data Styling** - Using color for data meaning (positive/negative values)
5. **Status Indicators** - Visual indicators for row status
6. **Responsive Design** - Proper handling on smaller screens

Example:
```jsx
<div className="overflow-x-auto">
  <table className="w-full">
    <thead>
      <tr className="bg-gray-800/50">
        <th className="p-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
          Column 1
        </th>
        <th className="p-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
          Column 2
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-800/30">
      <tr className="hover:bg-gray-800/30 transition-colors">
        <td className="p-3 whitespace-nowrap text-sm font-medium text-white">
          Cell 1
        </td>
        <td className="p-3 whitespace-nowrap text-sm text-gray-400">
          Cell 2
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### Stats and Metrics

Stat displays feature:

1. **Card-Based Layout** - Stats in consistent card containers
2. **Brand Color Coding** - Color-coded by meaning or category
3. **Icon Integration** - Relevant icons to enhance understanding
4. **Large Numeric Display** - Emphasized numbers with gradient text effects
5. **Descriptive Labels** - Clear, concise labels for each metric

Example:
```jsx
<div className="relative overflow-hidden rounded-lg bg-gray-900/80 backdrop-blur-sm border border-gray-800/60 shadow-lg p-4">
  {/* Gradient accent line */}
  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-padeliga-purple to-purple-500"></div>
  
  <div className="relative flex flex-col items-center justify-center">
    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-500/10 mb-2">
      <Icon className="h-5 w-5 text-purple-400" />
    </div>
    <p className="text-gray-400 text-sm">Metric Label</p>
    <p className="text-2xl font-bold mt-1 bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
      42
    </p>
  </div>
</div>
```

### Status Indicators

Status indicators include:

1. **Contextual Colors** - Color-coding by status type
2. **Icon Integration** - Relevant icons paired with status text
3. **Badge Design** - Pill or rounded rectangle shapes with appropriate padding
4. **Gradient Effects** - Subtle gradients for visual appeal
5. **Consistent Sizing** - Appropriate text size and padding for readability

Example:
```jsx
<div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium 
               bg-gradient-to-r from-green-600 to-emerald-500 text-white shadow-sm">
  <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
  Completed
</div>
```

## Layout Patterns

### Page Structure

1. **Header Area** - Title and key information, often with subtle background effects
2. **Content Area** - Main content with appropriate padding and max-width
3. **Grid Layouts** - Responsive grid systems for organizing content
4. **Card-Based Content** - Content organized into card components
5. **Consistent Spacing** - Uniform spacing system (4px increments preferred)

### Common Patterns

1. **Two-Column Layout** - Sidebar and main content (for dashboards)
2. **Card Grid** - Grid of card components with responsive behavior
3. **List-Detail** - Master-detail pattern for showing relationships
4. **Tabs Interface** - Tabbed content for organizing related information
5. **Stats-Content** - Stats row followed by detailed content

## Animations and Effects

### Subtle Animations

1. **Hover Effects** - Scale, color transitions, shadow changes
2. **Loading States** - Skeleton screens, spinners, or progress indicators
3. **Success Feedback** - Brief animations for successful actions
4. **Transition Effects** - Smooth transitions between states (300-500ms)
5. **Focus Indicators** - Clear visual feedback for focused elements

### Special Effects

1. **Gradient Shifts** - Subtle changes in gradient direction or color
2. **Glow Effects** - Gentle glow on interactive elements
3. **Shine Effects** - Diagonal shine animation on buttons and cards
4. **Floating Effects** - Subtle up/down movement for visual interest
5. **Pulse Animations** - Drawing attention to important elements

## Responsive Design

### Breakpoints

- **Small (sm)** - 640px and up
- **Medium (md)** - 768px and up
- **Large (lg)** - 1024px and up
- **Extra Large (xl)** - 1280px and up

### Responsive Patterns

1. **Grid Adjustments** - Changing column count at different breakpoints
2. **Stack on Mobile** - Converting horizontal layouts to vertical on small screens
3. **Simplified UI** - Hiding non-essential elements on small screens
4. **Touch-Friendly** - Larger touch targets on mobile devices
5. **Adaptive Typography** - Text size adjustments across breakpoints

## Implementation Examples

### Player Profile Page

The player profile page demonstrates:
- Two-column layout with profile status and form sections
- Glass morphism for card backgrounds
- Gradient accents for visual hierarchy
- Interactive form elements with validation states
- Subtle animation effects for user feedback

### Leagues Dashboard

The leagues dashboard showcases:
- Card grid for displaying multiple leagues
- Status badges with contextual colors
- Progress indicators for team registration
- Hover effects for interactive elements
- Consistent spacing and alignment

### Public League Page

The public league page features:
- Stats cards with brand color coding
- Modern table design for rankings
- Card-based layout for matches
- Visual indicators for match status
- Responsive design for all screen sizes

---

This design system is a living document and will evolve as the Padeliga application continues to grow. All UI enhancements should aim to maintain consistency with these guidelines while improving usability and visual appeal.
