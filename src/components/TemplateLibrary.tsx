"use client";

import { Terminal, Type, Bell, MessageCircle } from "lucide-react";
import { templates, type Template } from "@/lib/templates";
import type { Overlay } from "@/lib/overlays/registry";

interface Props {
  onSelect: (overlay: Overlay) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  terminal: <Terminal size={14} />,
  type: <Type size={14} />,
  bell: <Bell size={14} />,
  messages: <MessageCircle size={14} />,
};

export function TemplateLibrary({ onSelect }: Props) {
  return (
    <div className="space-y-1">
      {templates.map((template) => (
        <button
          key={template.id}
          onClick={() => onSelect(template.create())}
          className="w-full px-2 py-2 rounded-lg hover:bg-white/5 transition-all text-left group flex items-center gap-3"
        >
          <span className="text-white/40 group-hover:text-white/60">
            {iconMap[template.icon] || <Type size={14} />}
          </span>
          <div>
            <div className="text-sm text-white/80">{template.name}</div>
            <div className="text-[11px] text-white/30">{template.description}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
