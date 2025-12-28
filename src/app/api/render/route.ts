import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "path";
import fs from "fs";
import type { WebpackOverrideFn } from "@remotion/bundler";

const webpackOverride: WebpackOverrideFn = (config) => ({
  ...config,
  resolve: {
    ...config.resolve,
    alias: {
      ...config.resolve?.alias,
      "@": path.join(process.cwd(), "src"),
    },
  },
});

export async function POST(req: Request) {
  const { videoSrc, overlays } = await req.json();

  const entryPoint = path.join(process.cwd(), "src/lib/remotion/Root.tsx");
  const filename = `video-${Date.now()}.mp4`;
  const outputPath = path.join(process.cwd(), "out", filename);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        send({ type: "status", message: "Bundling..." });
        const bundleLocation = await bundle({ entryPoint, webpackOverride });

        send({ type: "status", message: "Preparing..." });
        const composition = await selectComposition({
          serveUrl: bundleLocation,
          id: "Video",
          inputProps: { videoSrc, overlays },
        });

        send({ type: "status", message: "Rendering..." });
        await renderMedia({
          composition,
          serveUrl: bundleLocation,
          codec: "h264",
          outputLocation: outputPath,
          inputProps: { videoSrc, overlays },
          concurrency: 1,
          onProgress: ({ progress }) => {
            send({ type: "progress", progress: Math.round(progress * 100) });
          },
        });

        send({ type: "done", filename });
        controller.close();
      } catch (error) {
        send({ type: "error", message: error instanceof Error ? error.message : "Render failed" });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
