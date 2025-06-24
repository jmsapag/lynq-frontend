import React from "react";
import { Input } from "@heroui/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
}) => (
  <Input
    type="search"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className={className}
    size="sm"
    aria-label={placeholder}
    endContent={
      <MagnifyingGlassIcon
        className="h-5 w-5 text-gray-400"
        aria-hidden="true"
      />
    }
  />
);

export default SearchBar;
