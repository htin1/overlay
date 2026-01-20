"use client";

import { useState, useEffect } from "react";
import { Globe, Loader2, Plus, Copy, Check, X, AlertCircle, ChevronDown } from "lucide-react";
import { useWebsiteExtractor } from "@/hooks/useWebsiteExtractor";
import { useOverlayContext } from "@/contexts/OverlayContext";
import type { ExtractedImage } from "@/types/website";

interface WebsiteImporterProps {
  expanded: boolean;
  onToggle: () => void;
}

function getFileName(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    return pathname.split("/").pop() || "image";
  } catch {
    return "image";
  }
}

function ColorSwatch({ hex, name, onCopy }: { hex: string; name?: string; onCopy: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(hex);
    setCopied(true);
    onCopy();
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={handleCopy}
      className="group relative"
      title={`${name || hex} - Click to copy`}
    >
      <div
        className="w-8 h-8 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm transition-transform hover:scale-110"
        style={{ backgroundColor: hex }}
      />
      {copied && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-zinc-800 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap">
          Copied!
        </div>
      )}
    </button>
  );
}

function ImageThumbnail({
  image,
  onAdd,
}: {
  image: ExtractedImage;
  onAdd: (image: ExtractedImage) => void;
}) {
  const [error, setError] = useState(false);

  if (error) return null;

  return (
    <div className="group relative">
      <div className="w-16 h-16 rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden border border-zinc-200 dark:border-zinc-700">
        <img
          src={image.url}
          alt={image.alt || image.type}
          className="w-full h-full object-cover"
          onError={() => setError(true)}
        />
      </div>
      <button
        onClick={() => onAdd(image)}
        className="absolute -top-1 -right-1 w-5 h-5 bg-forest-500 hover:bg-forest-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
        title="Add to media"
      >
        <Plus size={12} />
      </button>
      <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[8px] px-1 py-0.5 text-center truncate rounded-b-lg">
        {image.type}
      </span>
    </div>
  );
}

export function WebsiteImporter({ expanded, onToggle }: WebsiteImporterProps) {
  const [url, setUrl] = useState("");
  const { extraction, isLoading, error, extract, reset } = useWebsiteExtractor();
  const { addMedia, setBrandAssets } = useOverlayContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    const result = await extract(url.trim());
    if (result) {
      setBrandAssets(result);
    }
  };

  const handleAddImage = (image: ExtractedImage) => {
    addMedia({
      id: crypto.randomUUID(),
      name: getFileName(image.url),
      url: image.url,
      type: "image",
    });
  };

  const handleReset = () => {
    reset();
    setUrl("");
    setBrandAssets(null);
  };

  return (
    <div>
      <div className="h-10 flex items-center justify-between px-3 bg-zinc-50 dark:bg-zinc-900/50">
        <button
          onClick={onToggle}
          className="flex-1 flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
        >
          <ChevronDown
            size={12}
            className={`transition-transform ${expanded ? "" : "-rotate-90"}`}
          />
          <Globe size={12} />
          Website Import
        </button>
        {extraction && (
          <button
            onClick={handleReset}
            className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white p-1 rounded-lg transition-all"
            title="Clear"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {expanded && (
      <div className="p-2">
        <form onSubmit={handleSubmit} className="flex gap-1.5">
          <div className="flex-1 relative">
            <Globe size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter website URL..."
              className="w-full pl-6 pr-2 py-1.5 text-[11px] bg-zinc-100 dark:bg-zinc-800 rounded border-0 focus:ring-1 focus:ring-forest-500 outline-none"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={!url.trim() || isLoading}
            className="px-2 py-1.5 bg-forest-500 hover:bg-forest-600 disabled:opacity-30 text-white rounded transition-colors text-[11px] flex items-center gap-1"
          >
            {isLoading ? (
              <>
                <Loader2 size={10} className="animate-spin" />
                <span>Extracting...</span>
              </>
            ) : (
              "Extract"
            )}
          </button>
        </form>

        {error && (
          <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
            <AlertCircle size={12} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-[11px] text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {extraction && (
          <div className="mt-3 space-y-3">
            {/* Domain info */}
            <div className="text-[10px] text-zinc-400">
              Extracted from <span className="text-zinc-600 dark:text-zinc-300">{extraction.domain}</span>
            </div>

            {/* Colors */}
            {extraction.colors.length > 0 && (
              <div>
                <div className="text-[10px] text-zinc-500 mb-1.5 font-medium">Colors</div>
                <div className="flex flex-wrap gap-1.5">
                  {extraction.colors.map((color, i) => (
                    <ColorSwatch
                      key={`${color.hex}-${i}`}
                      hex={color.hex}
                      name={color.name}
                      onCopy={() => {}}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Images */}
            {extraction.images.length > 0 && (
              <div>
                <div className="text-[10px] text-zinc-500 mb-1.5 font-medium">Images</div>
                <div className="flex flex-wrap gap-2">
                  {extraction.images.map((image, i) => (
                    <ImageThumbnail
                      key={`${image.url}-${i}`}
                      image={image}
                      onAdd={handleAddImage}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Fonts */}
            {extraction.fonts && extraction.fonts.length > 0 && (
              <div>
                <div className="text-[10px] text-zinc-500 mb-1.5 font-medium">Fonts</div>
                <div className="space-y-1">
                  {extraction.fonts.slice(0, 5).map((font, i) => (
                    <FontItem key={`${font}-${i}`} name={font} />
                  ))}
                </div>
              </div>
            )}

            {/* Text */}
            {extraction.text.length > 0 && (
              <div>
                <div className="text-[10px] text-zinc-500 mb-1.5 font-medium">Text</div>
                <div className="space-y-1">
                  {extraction.text.slice(0, 4).map((item, i) => (
                    <TextSnippet key={i} content={item.content} type={item.type} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      )}
    </div>
  );
}

function TextSnippet({ content, type }: { content: string; type: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="group flex items-start gap-1.5 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
      <span className="text-[8px] uppercase text-zinc-400 bg-zinc-100 dark:bg-zinc-700 px-1 py-0.5 rounded shrink-0 mt-0.5">
        {type}
      </span>
      <p className="text-[11px] text-zinc-600 dark:text-zinc-300 line-clamp-2 flex-1">
        {content}
      </p>
      <button
        onClick={handleCopy}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5"
        title="Copy"
      >
        {copied ? <Check size={10} /> : <Copy size={10} />}
      </button>
    </div>
  );
}

function FontItem({ name }: { name: string }) {
  const [copied, setCopied] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Clean name for Google Fonts lookup
  const googleName = name
    .replace(/-Regular|-Bold|-Italic|-Book|-Medium|-Light|-Semibold|-Heavy|-Web.*$/gi, "")
    .replace(/^Test\s+/i, "")
    .replace(/-/g, " ")
    .trim();

  useEffect(() => {
    const id = `font-${googleName.replace(/\s+/g, "-").toLowerCase()}`;
    if (document.getElementById(id)) {
      setLoaded(true);
      return;
    }
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(googleName).replace(/%20/g, "+")}:wght@400;700&display=swap`;
    link.onload = () => setLoaded(true);
    document.head.appendChild(link);
  }, [googleName]);

  const handleCopy = () => {
    navigator.clipboard.writeText(name);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className="group flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
      onClick={handleCopy}
    >
      <span
        className="text-[13px] text-zinc-600 dark:text-zinc-300 flex-1 truncate"
        style={loaded ? { fontFamily: `"${googleName}", sans-serif` } : undefined}
      >
        {name}
      </span>
      <span className="text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200">
        {copied ? <Check size={10} /> : <Copy size={10} />}
      </span>
    </div>
  );
}
