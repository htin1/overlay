# Overlay

Video overlay editor using Remotion Player.

## Stack

- Bun + Next.js 16 (App Router)
- Remotion Player (preview only)
- Tailwind CSS v4

## Commands

```bash
bun dev      # Start dev server
bun build    # Build for production
bun start    # Start production server
```

## Structure

```
src/
├── app/
│   ├── page.tsx      # Main UI with Player
│   ├── layout.tsx    # Root layout
│   └── globals.css   # Tailwind import
└── remotion/
    ├── Composition.tsx   # Video + overlay composition
    └── GlassOverlay.tsx  # Glass-style overlay component
```

## Key Files

- `src/app/page.tsx` - Main page with Remotion Player and controls
- `src/remotion/Composition.tsx` - Main video composition
- `src/remotion/GlassOverlay.tsx` - Apple-style glass overlay with blur effect
