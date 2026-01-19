"use client";

import { Player, PlayerRef } from "@remotion/player";
import { renderMediaOnWeb } from "@remotion/web-renderer";
import { useState, useRef } from "react";
import { VideoComposition } from "../remotion/Composition";
import { DraggableOverlay } from "../components/DraggableOverlay";
import { Timeline } from "../components/Timeline";
import { TopToolbar } from "../components/TopToolbar";
import { LeftPanel } from "../components/LeftPanel";
import { RightPanel } from "../components/RightPanel";
import { FPS } from "../lib/constants";
import { useTheme } from "../hooks/useTheme";
import { OverlayProvider, useOverlayContext } from "../contexts/OverlayContext";

const MIN_DURATION = 300;

function EditorContent() {
  const { theme } = useTheme();
  const {
    overlays,
    selectedId,
    selected,
    visibleOverlays,
    setSelectedId,
    updateOverlay,
    removeOverlay,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useOverlayContext();

  const [exporting, setExporting] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState("transparent");
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<PlayerRef>(null);

  const totalFrames = Math.max(MIN_DURATION, ...overlays.map((o) => o.endFrame));

  const exportVideo = async () => {
    setExporting(true);
    try {
      const { getBlob } = await renderMediaOnWeb({
        composition: {
          id: "Video",
          component: VideoComposition,
          durationInFrames: totalFrames,
          fps: FPS,
          width: 1920,
          height: 1080,
          defaultProps: { overlays: [], backgroundColor: "transparent" },
        },
        inputProps: { overlays: visibleOverlays, backgroundColor },
        onProgress: ({ renderedFrames }) => {
          console.log(`Rendered ${renderedFrames} / ${totalFrames} frames`);
        },
      });

      const blob = await getBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "export.mp4";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Export failed: " + (e instanceof Error ? e.message : "Unknown error"));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white flex flex-col overflow-hidden">
      <TopToolbar
        onExport={exportVideo}
        exporting={exporting}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
      />

      <div className="flex-1 flex min-h-0">
        <LeftPanel />

        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 flex flex-col items-center justify-center p-6 min-w-0 bg-zinc-100 dark:bg-zinc-900/30">
            <div className="w-full max-w-4xl">
              <div className="flex items-center justify-end gap-2 mb-2">
                <div className="relative">
                  <input
                    type="color"
                    value={backgroundColor === "transparent" ? "#000000" : backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border border-zinc-300 dark:border-zinc-600"
                    title="Background color"
                  />
                  {backgroundColor === "transparent" && (
                    <div className="absolute inset-0 pointer-events-none rounded border border-zinc-300 dark:border-zinc-600 bg-[linear-gradient(45deg,#ccc_25%,transparent_25%,transparent_75%,#ccc_75%,#ccc),linear-gradient(45deg,#ccc_25%,transparent_25%,transparent_75%,#ccc_75%,#ccc)] bg-[length:8px_8px] bg-[position:0_0,4px_4px]" />
                  )}
                </div>
                <button
                  onClick={() => setBackgroundColor("transparent")}
                  className={`text-xs px-1.5 py-0.5 rounded transition-colors ${backgroundColor === "transparent" ? "bg-forest-500 text-white" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
                  title="Transparent background"
                >
                  transparent
                </button>
              </div>
              <div
                ref={containerRef}
                className="relative overflow-hidden shadow-lg"
              >
              <Player
                ref={playerRef}
                component={VideoComposition}
                inputProps={{ overlays: visibleOverlays, backgroundColor }}
                durationInFrames={totalFrames}
                fps={FPS}
                compositionWidth={1920}
                compositionHeight={1080}
                style={{ width: "100%" }}
                controls
                acknowledgeRemotionLicense
              />
              <div className="absolute inset-0 pointer-events-none">
                {visibleOverlays.map((o) => (
                  <DraggableOverlay
                    key={o.id}
                    x={o.x} y={o.y} width={o.w} height={o.h}
                    selected={selectedId === o.id}
                    onSelect={() => setSelectedId(o.id)}
                    onUpdate={(x, y, w, h) => updateOverlay(o.id, { x, y, w, h })}
                    containerRef={containerRef}
                  />
                ))}
              </div>
              </div>
            </div>
          </main>

          <Timeline
            playerRef={playerRef}
            totalFrames={totalFrames}
            fps={FPS}
          />
        </div>

        <RightPanel
          overlay={selected}
          onUpdate={(data) => selected && updateOverlay(selected.id, data)}
          onRemove={() => selected && removeOverlay(selected.id)}
        />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <OverlayProvider>
      <EditorContent />
    </OverlayProvider>
  );
}
