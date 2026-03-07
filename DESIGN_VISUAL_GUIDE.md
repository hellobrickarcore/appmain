# HelloBrick Visual Design Guide

## 🎨 Design System

### Color Palette
```
Primary Gradient: Orange-500 → Yellow-500
Background: Orange-50 → Yellow-50 gradient
Cards: White with Orange-100 borders
Text: Slate-900 (headings), Slate-600 (body)
Accents: Orange-400, Yellow-400, Orange-600
```

### Typography
- **Font Family**: Nunito (Google Fonts)
- **Weights**: 400 (regular), 600 (semibold), 700 (bold), 800 (extrabold)
- **Scale**: 
  - H1: text-3xl (30px)
  - H2: text-2xl (24px)
  - H3: text-xl (20px)
  - Body: text-base (16px)
  - Small: text-sm (14px)

### Spacing
- **Card Padding**: p-6 (24px)
- **Section Gap**: space-y-6 (24px)
- **Element Gap**: gap-3 (12px) or gap-4 (16px)
- **Border Radius**: rounded-3xl (24px) for cards, rounded-2xl (16px) for buttons

### Components

#### Buttons
- **Primary**: Orange-500 to Yellow-500 gradient
- **Size**: py-5 px-8 (large), py-3 px-6 (medium)
- **Shadow**: shadow-xl on hover
- **Transform**: scale-[1.02] on hover, scale-[0.98] on active

#### Cards
- **Background**: White
- **Border**: 2px Orange-100
- **Shadow**: shadow-lg
- **Hover**: border-orange-200, slight scale

#### Progress Bars
- **Background**: Slate-100
- **Fill**: Orange-400 to Yellow-400 gradient
- **Height**: h-2 (8px)

#### Icons
- **Size**: 20px (small), 24px (medium), 32px (large)
- **Color**: Matches context (orange-500, yellow-500, etc.)

## 📱 Screen Layouts

### Home Tab
```
┌─────────────────────────────────┐
│  Header (BrickBuddy + Streak)   │
├─────────────────────────────────┤
│  Daily Quest Card (Gradient)    │
│  ┌───────────────────────────┐  │
│  │ 🔥 Daily Quest            │  │
│  │ Find 5 Red Bricks         │  │
│  │ [Progress Bar]            │  │
│  │ [Start Quest Button]      │  │
│  └───────────────────────────┘  │
│                                  │
│  Start Quest Card                │
│  ┌───────────────────────────┐  │
│  │ Start a Brick Quest ▶     │  │
│  │ [Start Now Button]        │  │
│  └───────────────────────────┘  │
│                                  │
│  Progress Cards (2x Grid)        │
│  ┌──────────┐ ┌──────────┐     │
│  │ Progress │ │  Bricks  │     │
│  └──────────┘ └──────────┘     │
│                                  │
│  Daily Goals                     │
│  ┌───────────────────────────┐  │
│  │ ☑ Scan a Bin              │  │
│  │ ☐ Complete a Quest        │  │
│  │ ☐ Find 20 Bricks          │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

### Scan Tab
```
┌─────────────────────────────────┐
│  ← Scan Bricks        [50 XP]   │
├─────────────────────────────────┤
│                                  │
│  ┌───────────────────────────┐  │
│  │                           │  │
│  │    Camera View            │  │
│  │    (with overlays)        │  │
│  │                           │  │
│  └───────────────────────────┘  │
│                                  │
│  [Scan Bricks Button]           │
│                                  │
│  Results Card (if detected)      │
│  ┌───────────────────────────┐  │
│  │ 12 Bricks Found            │  │
│  │ 5 Colors • 8 Types         │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

### Quests Tab
```
┌─────────────────────────────────┐
│  Brick Quests            [🔍]   │
├─────────────────────────────────┤
│                                  │
│  Quest Card 1                   │
│  ┌───────────────────────────┐  │
│  │ 🔥 Daily Quest            │  │
│  │ 🔍 Find All Red Bricks    │  │
│  │ [Progress: 3/5]           │  │
│  │ [Progress Bar]            │  │
│  │ ⭐⭐⭐  [30 XP] [Play]    │  │
│  └───────────────────────────┘  │
│                                  │
│  Quest Card 2                   │
│  ...                            │
└─────────────────────────────────┘
```

## ✨ Design Principles

1. **Friendly & Approachable**: Rounded corners, soft colors, playful emojis
2. **Clear Hierarchy**: Bold headings, clear sections, visual separation
3. **Consistent Spacing**: Uniform gaps and padding throughout
4. **Smooth Interactions**: Hover effects, transitions, animations
5. **Mobile-First**: Touch-friendly buttons, readable text sizes
6. **Visual Feedback**: Loading states, progress indicators, success animations

## 🎯 Key Design Features

- ✅ Gradient backgrounds (orange to yellow)
- ✅ Rounded corners everywhere (16px-24px)
- ✅ Soft shadows for depth
- ✅ Backdrop blur effects
- ✅ Smooth transitions
- ✅ Progress bars with gradients
- ✅ Icon + text combinations
- ✅ Empty states with helpful messages
- ✅ Loading states with animations

