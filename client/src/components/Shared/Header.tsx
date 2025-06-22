import { useState, useEffect, useMemo } from "react";
import { HiOutlineMenuAlt2 } from "react-icons/hi";
import { BiSearch, BiGrid, BiListUl, BiChevronRight } from "react-icons/bi";
import { RxHamburgerMenu } from "react-icons/rx";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { useAppContext } from "../../providers/AppProvider";
import { debounce } from "lodash";

interface HeaderProps {
  onToggleSidebar?: () => void;
  isSideBarExpanded?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  isSideBarExpanded,
}) => {
  const { isListView, setIsListView, searchTerm, setSearchTerm } =
    useAppContext();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [inputValue, setInputValue] = useState(searchTerm);

  // Create debounced function to update the actual search term
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearchTerm(value);
      }, 300), 
    [setSearchTerm]
  );

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Update local input value when searchTerm changes externally
  useEffect(() => {
    setInputValue(searchTerm);
  }, [searchTerm]);

  // Handle input change with debouncing
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedSearch(value);
  };

  // Clear search function
  const clearSearch = () => {
    setInputValue("");
    setSearchTerm("");
    debouncedSearch.cancel();
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm fixed top-0 left-0 right-0 z-50 h-16">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left Section - Logo & Menu */}
        <div className="flex items-center gap-4">
          {/* Sidebar Toggle Button with Dynamic Icons */}
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 
              transition-colors duration-200 flex items-center justify-center"
            aria-label="Toggle sidebar"
            title={isSideBarExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isMobile ? (
              <HiOutlineMenuAlt2 className="w-5 h-5" />
            ) : isSideBarExpanded ? (
              <BiChevronRight className="w-5 h-5" />
            ) : (
              <RxHamburgerMenu className="w-5 h-5" />
            )}
          </button>

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg 
              flex items-center justify-center"
            >
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <h1 className="text-xl font-bold text-slate-800 hidden sm:block">
              NotesApp
            </h1>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-2xl mx-4">
          <div
            className={`relative transition-all duration-200 ${
              isSearchFocused ? "transform scale-105" : ""
            }`}
          >
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <BiSearch
                className={`w-5 h-5 transition-colors ${
                  isSearchFocused ? "text-blue-500" : "text-slate-400"
                }`}
              />
            </div>
            <input
              type="text"
              value={inputValue}
              onChange={handleSearchChange}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder="Search notes..."
              className={`w-full pl-10 pr-12 py-2 border-2 rounded-xl transition-all duration-200
                ${
                  isSearchFocused
                    ? "border-blue-300 bg-blue-50/50 shadow-md"
                    : "border-slate-200 bg-slate-50 hover:border-slate-300"
                }
                focus:outline-none focus:ring-0 text-slate-700 placeholder-slate-500`}
            />

            {/* Search Results Indicator & Clear Button */}
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
              {inputValue && (
                <>
                  {/* Clear button */}
                  <button
                    onClick={clearSearch}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                    title="Clear search"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>

                  {/* Search indicator */}
                  {inputValue !== searchTerm && (
                    <span className="text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded-full">
                      Searching...
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Section - Controls */}
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="hidden sm:flex items-center bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setIsListView(false)}
              className={`p-2 rounded-md transition-all duration-200 ${
                !isListView
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-800"
              }`}
              title="Grid View"
            >
              <BiGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsListView(true)}
              className={`p-2 rounded-md transition-all duration-200 ${
                isListView
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-800"
              }`}
              title="List View"
            >
              <BiListUl className="w-4 h-4" />
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 
              transition-colors duration-200"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? (
              <MdLightMode className="w-5 h-5" />
            ) : (
              <MdDarkMode className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
