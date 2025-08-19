import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { searchAirports, type Airport } from "../../shared/airportSearch";

type CityAutocompleteProps = {
  label: string;
  placeholder?: string;
  value?: Airport | null;
  onChange?: (value: Airport | null) => void;
  required?: boolean;
  autoFocus?: boolean;
  className?: string;
};

export default function CityAutocomplete({
  label,
  placeholder = "Type a city or airport…",
  value,
  onChange,
  required,
  autoFocus,
  className,
}: CityAutocompleteProps) {
  const inputId = useId();
  const listboxId = useId();

  const [query, setQuery] = useState(value ? `${value.code} · ${value.city}` : "");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Airport[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  // Keep input text in sync when a value is externally changed
  useEffect(() => {
    if (value) setQuery(`${value.code} · ${value.city}`);
  }, [value]);

  // Debounced fetch
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setItems([]);
      setOpen(false);
      return;
    }
    const h = setTimeout(async () => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      try {
        setLoading(true);
        const res = await searchAirports(q, ac.signal);
        setItems(res);
        setOpen(true);
        setActiveIndex(res.length ? 0 : -1);
      } catch {
        setItems([]);
        setOpen(true); // show "no results"
        setActiveIndex(-1);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(h);
  }, [query]);

  const select = (a: Airport) => {
    onChange?.(a);
    setQuery(`${a.code} · ${a.city}`);
    setOpen(false);
  };

  const clear = () => {
    onChange?.(null);
    setQuery("");
    setItems([]);
    setActiveIndex(-1);
    setOpen(false);
    inputRef.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % Math.max(items.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? items.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && items[activeIndex]) {
        e.preventDefault();
        select(items[activeIndex]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  // Close listbox on outside click
  useEffect(() => {
    if (!open) return;
    const onDocClick = (ev: MouseEvent) => {
      if (
        !inputRef.current?.contains(ev.target as Node) &&
        !listRef.current?.contains(ev.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  return (
    <div className={className} style={{ position: "relative" }}>
      <label htmlFor={inputId} className="block text-sm font-medium mb-1">
        {label} {required && <span className="text-red-600">*</span>}
      </label>

      <div className="relative">
        <input
          id={inputId}
          ref={inputRef}
          type="text"
          value={query}
          placeholder={placeholder}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange?.(null); // reset selection if they edit text
          }}
          onFocus={() => query && setOpen(true)}
          onKeyDown={onKeyDown}
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-expanded={open}
          aria-activedescendant={
            open && activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined
          }
          className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring"
          autoFocus={autoFocus}
        />

        {!!query && (
          <button
            type="button"
            aria-label="Clear"
            onClick={clear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
          >
            ×
          </button>
        )}
      </div>

      {open && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-md border bg-white shadow"
        >
          {loading && (
            <li className="px-3 py-2 text-sm text-gray-500">Searching…</li>
          )}

          {!loading && items.length === 0 && (
            <li className="px-3 py-2 text-sm text-gray-500">No results</li>
          )}

          {!loading &&
            items.map((a, i) => {
              const active = i === activeIndex;
              return (
                <li
                  id={`${listboxId}-opt-${i}`}
                  key={`${a.code}-${i}`}
                  role="option"
                  aria-selected={active}
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseDown={(e) => {
                    // prevent input blur before click
                    e.preventDefault();
                    select(a);
                  }}
                  className={`cursor-pointer px-3 py-2 text-sm ${
                    active ? "bg-blue-600 text-white" : "hover:bg-gray-100"
                  }`}
                >
                  <div className="font-medium">
                    {a.code} · {a.city}
                  </div>
                  <div className="text-xs opacity-80">
                    {a.name}
                    {a.country ? ` — ${a.country}` : ""}
                  </div>
                </li>
              );
            })}
        </ul>
      )}
    </div>
  );
}
