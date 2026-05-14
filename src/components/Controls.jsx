import { useState, useEffect } from "react";
import { Search, ChevronDown } from "lucide-react";

export const FilterSelect = ({ value, onChange, options }) => {
  return (
    <div className="filter-select-wrap relative w-full md:flex-1 h-10 group">
      <select
        value={value}
        onChange={onChange}
        className="w-full h-full appearance-none pl-3 pr-8 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm font-bold text-gray-700 dark:text-zinc-100 outline-none transition-all duration-200 focus:ring-2 focus:ring-lpu-gold focus:border-lpu-gold cursor-pointer"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none transition-all duration-200 group-focus-within:rotate-180"
      />
    </div>
  );
};

export const SearchInput = ({
  onSearch,
  placeholder = "Search...",
  defaultValue = "",
}) => {
  const [value, setValue] = useState(defaultValue);

  // Sync internal value with defaultValue when it changes (e.g. on navigation back)
  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const commit = () => onSearch(value);
  const handleKeyDown = (e) => {
    if (e.key === "Enter") commit();
  };

  return (
    <div className="search-input-wrap w-full md:flex-1 h-10 flex items-center border border-gray-200 dark:border-zinc-800 rounded-lg overflow-hidden transition-all duration-200 focus-within:ring-2 focus-within:ring-lpu-gold focus-within:border-lpu-gold bg-white dark:bg-zinc-900">
      <Search
        size={16}
        className="shrink-0 ml-3 text-gray-400 stroke-[2.2px]"
      />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          if (e.target.value === "") onSearch("");
        }}
        onKeyDown={handleKeyDown}
        className="flex-1 min-w-0 w-full h-full px-2.5 bg-transparent text-sm font-medium outline-none text-ellipsis text-gray-800 dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500"
      />
      <button
        type="button"
        onClick={commit}
        className="shrink-0 h-8 px-4 mx-1.5 bg-lpu-maroon text-white text-sm font-semibold rounded-md shadow-sm hover:bg-lpu-gold hover:text-lpu-maroon hover:border-lpu-gold active:scale-95 transition-all duration-200 ease-in-out cursor-pointer"
      >
        Search
      </button>
    </div>
  );
};
