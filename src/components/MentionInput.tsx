"use client";

import { useState, useRef, useCallback, useEffect, type KeyboardEvent, type ChangeEvent } from "react";
import { X } from "lucide-react";
import { MediaAutocomplete } from "./MediaAutocomplete";
import type { MediaItem, MentionedMedia } from "@/types/media";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
  media: MediaItem[];
  mentionedMedia: MentionedMedia[];
  onMentionedMediaChange: (media: MentionedMedia[]) => void;
  submitButton?: React.ReactNode;
}

export function MentionInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Describe animation... (@ to mention media)",
  disabled = false,
  media,
  mentionedMedia,
  onMentionedMediaChange,
  submitButton,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteQuery, setAutocompleteQuery] = useState("");
  const [mentionStartIndex, setMentionStartIndex] = useState<number | null>(null);

  // Filter to only show images (not videos) that aren't already mentioned
  const availableMedia = media.filter(
    (m) => m.type === "image" && !mentionedMedia.some((mm) => mm.id === m.id)
  );

  const filteredMedia = availableMedia.filter((m) =>
    m.name.toLowerCase().includes(autocompleteQuery.toLowerCase())
  );

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;

    onChange(newValue);

    // Check if we should show autocomplete (@ character detection)
    const textBeforeCursor = newValue.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      // Only trigger if @ is at start or preceded by whitespace
      const charBeforeAt = lastAtIndex > 0 ? textBeforeCursor[lastAtIndex - 1] : " ";
      if (charBeforeAt === " " || charBeforeAt === "\n" || lastAtIndex === 0) {
        const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
        // Only show if there's no space after @
        if (!textAfterAt.includes(" ") && !textAfterAt.includes("\n")) {
          setMentionStartIndex(lastAtIndex);
          setAutocompleteQuery(textAfterAt);
          setShowAutocomplete(true);
          return;
        }
      }
    }

    setShowAutocomplete(false);
    setMentionStartIndex(null);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (showAutocomplete) {
      if (e.key === "Escape") {
        e.preventDefault();
        setShowAutocomplete(false);
        setMentionStartIndex(null);
        return;
      }
      // Let MediaAutocomplete handle arrow keys and enter
      if (["ArrowDown", "ArrowUp", "Enter", "Tab"].includes(e.key)) {
        return;
      }
    }

    // Normal enter handling for submit
    if (e.key === "Enter" && !e.shiftKey && !showAutocomplete) {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onSubmit();
      }
    }
  };

  const handleSelectMedia = useCallback(
    (mediaItem: MediaItem | "all") => {
      if (mentionStartIndex === null) return;

      let newValue: string;
      let newCursorPos: number;

      if (mediaItem === "all") {
        // Add all available media (filter duplicates)
        const newMedia = availableMedia.filter(
          (m) => !mentionedMedia.some((mm) => mm.id === m.id)
        );
        onMentionedMediaChange([...mentionedMedia, ...newMedia]);

        // Replace @query with @all
        const beforeAt = value.slice(0, mentionStartIndex);
        const afterQuery = value.slice(mentionStartIndex + 1 + autocompleteQuery.length);
        newValue = beforeAt + "@all " + afterQuery;
        newCursorPos = mentionStartIndex + 5; // "@all ".length
      } else {
        // Add single media
        onMentionedMediaChange([...mentionedMedia, {
          id: mediaItem.id,
          name: mediaItem.name,
          url: mediaItem.url,
          type: mediaItem.type,
        }]);

        // Replace @query with @filename
        const beforeAt = value.slice(0, mentionStartIndex);
        const afterQuery = value.slice(mentionStartIndex + 1 + autocompleteQuery.length);
        newValue = beforeAt + "@" + mediaItem.name + " " + afterQuery;
        newCursorPos = mentionStartIndex + mediaItem.name.length + 2; // @ + name + space
      }

      onChange(newValue);
      setShowAutocomplete(false);
      setMentionStartIndex(null);
      setAutocompleteQuery("");

      // Focus and set cursor position after state update
      requestAnimationFrame(() => {
        textareaRef.current?.focus();
        textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
      });
    },
    [mentionStartIndex, value, autocompleteQuery, mentionedMedia, availableMedia, onChange, onMentionedMediaChange]
  );

  const handleRemoveMention = (id: string) => {
    onMentionedMediaChange(mentionedMedia.filter((m) => m.id !== id));
  };

  const handleCloseAutocomplete = useCallback(() => {
    setShowAutocomplete(false);
    setMentionStartIndex(null);
  }, []);

  // Close autocomplete when clicking outside (check both textarea and autocomplete)
  useEffect(() => {
    if (!showAutocomplete) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const isInsideTextarea = textareaRef.current?.contains(target);
      const isInsideAutocomplete = autocompleteRef.current?.contains(target);

      if (!isInsideTextarea && !isInsideAutocomplete) {
        setShowAutocomplete(false);
        setMentionStartIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showAutocomplete]);

  return (
    <div>
      {/* Autocomplete dropdown - rendered inline above textarea */}
      {showAutocomplete && (
        <div className="mb-2" ref={autocompleteRef}>
          {filteredMedia.length > 0 ? (
            <MediaAutocomplete
              media={filteredMedia}
              query={autocompleteQuery}
              onSelect={handleSelectMedia}
              onClose={handleCloseAutocomplete}
            />
          ) : (
            <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-lg p-3">
              <p className="text-[11px] text-zinc-500">
                {availableMedia.length === 0
                  ? media.filter(m => m.type === "image").length === 0
                    ? "No images uploaded. Upload images in the left panel."
                    : "All images already mentioned."
                  : `No images matching "${autocompleteQuery}"`}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Mentioned media chips */}
      {mentionedMedia.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {mentionedMedia.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-1.5 px-2 py-1 bg-forest-500/10 border border-forest-500/30 rounded-full text-[11px] text-forest-600 dark:text-forest-400"
            >
              <img
                src={item.url}
                alt={item.name}
                className="w-4 h-4 rounded object-cover"
              />
              <span className="max-w-[100px] truncate">{item.name}</span>
              <button
                type="button"
                onClick={() => handleRemoveMention(item.id)}
                className="hover:text-forest-700 dark:hover:text-forest-300"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={3}
          className="w-full px-3 py-2 pr-12 text-xs bg-zinc-100 dark:bg-zinc-800 rounded-lg border-0 focus:ring-1 focus:ring-forest-500 outline-none resize-none"
          disabled={disabled}
        />
        {submitButton}
      </div>
    </div>
  );
}
