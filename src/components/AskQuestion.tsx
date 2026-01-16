"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronRight, CornerDownLeft } from "lucide-react";

export interface QuestionOption {
  id: string;
  label: string;
  description?: string;
}

interface Props {
  header?: string;
  question: string;
  options: QuestionOption[];
  onSelect: (option: QuestionOption) => void;
  disabled?: boolean;
}

const optionClass = (selected: boolean, disabled?: boolean) =>
  `w-full text-left px-2 py-1.5 rounded-md transition-colors flex items-center gap-1.5 border ${
    selected
      ? "bg-forest-500/10 border-forest-500/30 text-forest-600 dark:text-forest-400"
      : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border-transparent"
  } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`;

export function AskQuestion({ header, question, options, onSelect, disabled }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [customText, setCustomText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const totalOptions = options.length + 1;

  const startTyping = useCallback((initialText = "") => {
    setIsTyping(true);
    setSelectedIndex(options.length);
    setCustomText(initialText);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [options.length]);

  const cancelTyping = useCallback(() => {
    setIsTyping(false);
    setCustomText("");
  }, []);

  useEffect(() => {
    if (disabled || isTyping) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((i) => (i + 1) % totalOptions);
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((i) => (i - 1 + totalOptions) % totalOptions);
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex === options.length) startTyping();
          else onSelect(options[selectedIndex]);
          break;
        default:
          if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            startTyping(e.key);
          }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [disabled, isTyping, options, selectedIndex, onSelect, totalOptions, startTyping]);

  return (
    <div className="space-y-1.5">
      {header && (
        <span className="inline-block px-1.5 py-0.5 text-[10px] text-zinc-400 border border-zinc-300 dark:border-zinc-600 rounded">
          {header}
        </span>
      )}

      <p className="text-xs text-zinc-600 dark:text-zinc-300">{question}</p>

      <div className="space-y-0.5 mt-1">
        {options.map((option, index) => (
          <button
            key={option.id}
            onClick={() => !disabled && onSelect(option)}
            disabled={disabled}
            className={optionClass(index === selectedIndex && !isTyping, disabled)}
          >
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-medium block">{option.label}</span>
              {option.description && (
                <span className="text-[10px] text-zinc-400 block leading-tight">{option.description}</span>
              )}
            </div>
            {index === selectedIndex && !isTyping && <ChevronRight size={10} />}
          </button>
        ))}

        {isTyping ? (
          <div className={optionClass(true, disabled)}>
            <input
              ref={inputRef}
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && customText.trim()) {
                  e.preventDefault();
                  onSelect({ id: "custom", label: customText.trim() });
                } else if (e.key === "Escape") {
                  cancelTyping();
                }
              }}
              placeholder="Type your answer..."
              className="flex-1 bg-transparent text-[11px] outline-none text-zinc-900 dark:text-white placeholder:text-zinc-400"
              autoFocus
            />
            <button
              onClick={() => customText.trim() && onSelect({ id: "custom", label: customText.trim() })}
              disabled={!customText.trim()}
              className="p-1 text-forest-500 hover:text-forest-600 disabled:opacity-30"
            >
              <CornerDownLeft size={12} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => !disabled && startTyping()}
            disabled={disabled}
            className={optionClass(selectedIndex === options.length, disabled)}
          >
            <span className="text-[11px] text-zinc-400 italic">Type something...</span>
            {selectedIndex === options.length && <ChevronRight size={10} className="ml-auto" />}
          </button>
        )}
      </div>

      <p className="text-[9px] text-zinc-400 mt-1">
        {isTyping ? (
          <>
            <kbd className="px-0.5 bg-zinc-200 dark:bg-zinc-700 rounded text-[9px]">Enter</kbd> submit{" "}
            <kbd className="px-0.5 bg-zinc-200 dark:bg-zinc-700 rounded text-[9px]">Esc</kbd> cancel
          </>
        ) : !disabled && (
          <>
            <kbd className="px-0.5 bg-zinc-200 dark:bg-zinc-700 rounded text-[9px]">↑↓</kbd> navigate{" "}
            <kbd className="px-0.5 bg-zinc-200 dark:bg-zinc-700 rounded text-[9px]">Enter</kbd> select
          </>
        )}
      </p>
    </div>
  );
}
