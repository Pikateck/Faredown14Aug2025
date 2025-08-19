import React, { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type CityOption = { 
  id: string; 
  code: string; 
  name: string; 
  country?: string; 
  type?: string;
};

export type CityAutocompleteProps = {
  label?: string;
  placeholder?: string;
  value: CityOption | null;
  onChange: (opt: CityOption | null) => void;
  onInputChange?: (text: string) => void;
  fetchOptions: (query: string) => Promise<CityOption[]>;
  disabled?: boolean;
  autoFocus?: boolean;
  required?: boolean;
  name?: string;
  icon?: React.ReactNode;
  className?: string;
};

const DEBOUNCE = 250;

export default function CityAutocomplete({
  label,
  placeholder,
  value,
  onChange,
  onInputChange,
  fetchOptions,
  disabled,
  autoFocus,
  required,
  name,
  icon,
  className,
}: CityAutocompleteProps) {
  const [text, setText] = useState(value ? `${value.code} · ${value.name}` : "");
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<CityOption[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const timer = useRef<number | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useMemo(() => `list-${Math.random().toString(36).slice(2)}`, []);

  // Update text when value changes externally
  useEffect(() => {
    setText(value ? `${value.code} · ${value.name}` : "");
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!open) return;
    if (timer.current) window.clearTimeout(timer.current);
    
    timer.current = window.setTimeout(async () => {
      const q = text.trim();
      if (!q) { 
        setItems([]); 
        setLoading(false);
        return; 
      }
      
      try {
        setLoading(true);
        const data = await fetchOptions(q);
        setItems(data);
        setActive(0);
        if (onInputChange) onInputChange(q);
      } catch (error) {
        console.error("Failed to fetch options:", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE) as unknown as number;
  }, [text, open, fetchOptions, onInputChange]);

  const select = (opt: CityOption) => {
    onChange(opt);
    setText(`${opt.code} · ${opt.name}`);
    setOpen(false);
    setItems([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    setText(newText);
    if (!open) setOpen(true);
    
    // Clear selection if input doesn't match current value
    if (value && newText !== `${value.code} · ${value.name}`) {
      onChange(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || items.length === 0) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (items[active]) {
        select(items[active]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(null);
    setText("");
    setOpen(false);
    setItems([]);
    inputRef.current?.focus();
  };

  return (
    <div className={cn("relative", className)} ref={boxRef}>
      {label && (
        <label className="block mb-1 text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
            {icon}
          </div>
        )}
        
        <input
          ref={inputRef}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={open && items[active] ? `opt-${items[active].id}` : undefined}
          aria-autocomplete="list"
          aria-label={label || placeholder}
          className={cn(
            "w-full rounded-md border border-gray-300 px-3 py-2 text-sm",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
            icon ? "pl-10" : "pl-3",
            (value || text) ? "pr-8" : "pr-3"
          )}
          placeholder={placeholder}
          value={text}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          autoFocus={autoFocus}
          name={name}
          autoComplete="off"
        />
        
        {(value || text) && !disabled && (
          <button
            type="button"
            onClick={clearSelection}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors"
            title="Clear selection"
            tabIndex={-1}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {open && (
        <div
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 w-full max-h-72 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg"
        >
          {loading ? (
            <div className="px-3 py-2 text-sm text-gray-500 flex items-center">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
              Searching...
            </div>
          ) : items.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              {text.trim() ? `No results for "${text.trim()}"` : "Start typing to search..."}
            </div>
          ) : (
            items.map((opt, idx) => {
              const isActive = idx === active;
              return (
                <div
                  id={`opt-${opt.id}`}
                  role="option"
                  aria-selected={isActive}
                  key={opt.id}
                  onMouseEnter={() => setActive(idx)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    select(opt);
                  }}
                  className={cn(
                    "cursor-pointer px-3 py-2 text-sm border-b border-gray-100 last:border-b-0",
                    isActive ? "bg-blue-50 text-blue-900" : "text-gray-900 hover:bg-gray-50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {opt.code} · {opt.name}
                      </div>
                      {opt.country && (
                        <div className="text-xs text-gray-500 truncate">
                          {opt.type && `${opt.type} in `}{opt.country}
                        </div>
                      )}
                    </div>
                    {opt.type && (
                      <div className="ml-2 flex-shrink-0">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                          {opt.type}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
