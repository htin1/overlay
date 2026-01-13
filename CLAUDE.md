# Overlay

Video overlay editor using Remotion Player.

## Stack

- Bun + Next.js (App Router)
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
│   ├── api/render/       # Export API routes
│   ├── page.tsx          # Main UI with 3-column layout
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Tailwind import
├── components/
│   ├── ui/               # Shared UI components
│   ├── DraggableOverlay.tsx  # Drag & resize overlay bounds
│   ├── LeftPanel.tsx     # Layers panel with visibility toggles
│   ├── MediaHandle.tsx   # Drag media within glass overlay
│   ├── RightPanel.tsx    # Properties panel
│   ├── ThemeProvider.tsx # Theme context provider
│   ├── Timeline.tsx      # Timeline with tracks and clips
│   └── TopToolbar.tsx    # Toolbar with Undo/Redo, Export
├── hooks/
│   ├── useDrag.ts        # Drag interaction hook
│   ├── useHistory.ts     # Undo/Redo state management
│   ├── usePlayerFrame.ts # Player frame tracking
│   └── useTheme.ts       # Light/dark theme hook
├── lib/
│   ├── constants.ts      # App constants (FPS, colors, etc.)
│   └── utils.ts          # Utility functions
├── overlays/
│   ├── base.ts           # BaseOverlay interface & animation types
│   ├── registry.ts       # Overlay type registry
│   ├── media.tsx         # Media overlay (images & videos)
│   ├── text.tsx          # Text overlay
│   ├── typing-text.tsx   # Typing text with cursor
│   ├── notification.tsx  # macOS notification
│   └── chat.tsx          # iMessage chat bubble
└── remotion/
    ├── Composition.tsx   # Main video composition
    ├── OverlayItem.tsx   # Renders single overlay with animations
    ├── Root.tsx          # Remotion root
    └── utils.ts          # Animation utilities
```

## Key Files

- `src/app/page.tsx` - Main page with 3-column layout (Layers | Canvas | Properties)
- `src/components/LeftPanel.tsx` - Layer list with visibility toggles
- `src/components/RightPanel.tsx` - Properties panel
- `src/components/TopToolbar.tsx` - Undo/Redo, theme toggle, Export
- `src/overlays/base.ts` - BaseOverlay interface with visible field
- `src/hooks/useHistory.ts` - Undo/Redo state management
- `src/hooks/useTheme.ts` - Light/dark theme management
