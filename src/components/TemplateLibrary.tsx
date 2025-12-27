"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Terminal, Type, Bell, MessageCircle } from "lucide-react";
import { templateCategories, getTemplatesByCategory, type Template } from "@/lib/templates";
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

function TemplateCard({ template, onSelect }: { template: Template; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className="w-full p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all text-left group"
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-white/50 group-hover:text-white/80 transition-colors">
          {iconMap[template.icon] || <Type size={14} />}
        </span>
        <span className="text-sm text-white/90 font-medium">{template.name}</span>
      </div>
      <p className="text-xs text-white/40 leading-relaxed">{template.description}</p>
    </button>
  );
}

function CategorySection({
  category,
  expanded,
  onToggle,
  onSelectTemplate,
}: {
  category: (typeof templateCategories)[number];
  expanded: boolean;
  onToggle: () => void;
  onSelectTemplate: (overlay: Overlay) => void;
}) {
  const categoryTemplates = getTemplatesByCategory(category.id);

  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-2 text-white/30 hover:text-white/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {iconMap[category.icon]}
          <span className="text-[11px] uppercase tracking-widest">{category.name}</span>
        </div>
        {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
      </button>

      {expanded && (
        <div className="grid grid-cols-1 gap-2 pb-3">
          {categoryTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onSelect={() => onSelectTemplate(template.create())}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function TemplateLibrary({ onSelect }: Props) {
  const [isOpen, setIsOpen] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(templateCategories.map((c) => c.id))
  );

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-white/40 hover:text-white/60 transition-colors"
      >
        <span className="text-xs uppercase tracking-widest">Templates</span>
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>

      {isOpen && (
        <div className="space-y-1">
          {templateCategories.map((category) => (
            <CategorySection
              key={category.id}
              category={category}
              expanded={expandedCategories.has(category.id)}
              onToggle={() => toggleCategory(category.id)}
              onSelectTemplate={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
