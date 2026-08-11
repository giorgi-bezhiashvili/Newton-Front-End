"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface TopicFilterProps {
  value: string | "all";
  onChange: (value: string | "all") => void;
  options: string[];
}

export function TopicFilter({ value, onChange, options }: TopicFilterProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  // Reset search and focus the input whenever the panel opens
  useEffect(() => {
    if (open) {
      setSearch("");
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [open]);

  const filteredOptions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((topic) => topic.toLowerCase().includes(q));
  }, [options, search]);

  if (options.length === 0) return null;

  const handleSelect = (topic: string | "all") => {
    onChange(topic);
    setOpen(false);
  };

  return (
    <div className="topicDropdownWrapper" ref={containerRef}>
      <span className="gradeFilterLabel">თემები</span>

      <button
        type="button"
        className="topicDropdownTrigger"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="topicDropdownValue">
          {value === "all" ? "ყველა თემა" : value}
        </span>
        <span className="topicDropdownArrow">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="topicDropdownPanel">
          <input
            ref={inputRef}
            type="text"
            className="topicDropdownSearch"
            placeholder="ძებნა თემებში..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="topicDropdownList">
            <button
              type="button"
              className={`topicDropdownOption ${value === "all" ? "active" : ""}`}
              onClick={() => handleSelect("all")}
            >
              ყველა თემა
            </button>
            {filteredOptions.length === 0 ? (
              <div className="topicDropdownEmpty">თემა ვერ მოიძებნა</div>
            ) : (
              filteredOptions.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  className={`topicDropdownOption ${value === topic ? "active" : ""}`}
                  onClick={() => handleSelect(topic)}
                >
                  {topic}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}