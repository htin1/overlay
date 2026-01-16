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
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<PlayerRef>(null);

  const totalFrames = Math.max(MIN_DURATION, ...overlays.map((o) => o.endFrame));
  const backgroundColor = theme === "dark" ? "#09090b" : "#ffffff";

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
          defaultProps: { overlays: [], backgroundColor: "#000000" },
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
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 flex min-h-0">
            <LeftPanel />

            <main className="flex-1 flex flex-col items-center justify-center p-6 min-w-0 bg-zinc-100 dark:bg-zinc-900/30">
              <div
                ref={containerRef}
                className="relative overflow-hidden bg-black shadow-lg w-full max-w-4xl"
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
            </main>
          </div>

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
