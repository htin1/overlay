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
│   ├── page.tsx      # Main UI with Player + drag controls
│   ├── layout.tsx    # Root layout
│   └── globals.css   # Tailwind import
├── components/
│   └── DraggableOverlay.tsx  # Drag & resize interaction layer
└── remotion/
    ├── Composition.tsx   # Video + overlay composition
    └── GlassOverlay.tsx  # Glass-style overlay (x/y/width/height)
```

## Key Files

- `src/app/page.tsx` - Main page with Player and draggable overlay
- `src/components/DraggableOverlay.tsx` - Drag/resize handles for positioning overlay
- `src/remotion/Composition.tsx` - Main video composition
- `src/remotion/GlassOverlay.tsx` - Apple-style glass overlay with blur effect
