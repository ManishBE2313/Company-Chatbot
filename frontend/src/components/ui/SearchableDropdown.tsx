"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";

interface Option {
  id: string;
  name: string;
}

interface SearchableDropdownProps {
  options: Option[];
  onSelect: (id: string) => void;
  placeholder?: string;
}

export const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  options,
  onSelect,
  placeholder = "+ add skill",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search query
  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(query.toLowerCase())
  );

  // Handle click outside to close the dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setQuery(""); // Clear search when closed
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-focus the search input when the dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={wrapperRef}>
      {/* 1. The Trigger Button (Looks like text) */}
      <button
        type="button"
        className="flex items-center px-2 py-1 text-[13px] font-medium text-slate-400 transition-colors hover:text-indigo-600 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        {placeholder}
      </button>

      {/* 2. The Popover Menu */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 flex w-56 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl animate-in fade-in zoom-in-95 duration-100">
          
          {/* Search Input Header */}
          <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/50 px-3 py-2">
            <Search size={14} className="shrink-0 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              className="w-full bg-transparent text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none"
              placeholder="Search skills..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {/* Scrollable Results List */}
          <div className="max-h-48 overflow-y-auto p-1.5">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-center text-[12px] text-slate-400">
                No skills found.
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className="flex w-full items-center rounded-lg px-3 py-2 text-left text-[13px] text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
                  onClick={() => {
                    onSelect(option.id);
                    setIsOpen(false);
                    setQuery("");
                  }}
                >
                  {option.name}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};