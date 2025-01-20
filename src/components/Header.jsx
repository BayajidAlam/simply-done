import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-brandBg px-4 py-3 ">
      <nav className="max-w-[1500px] mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <img
            src="https://www.getrushapp.com/assets/images/games/rush-logo.png"
            alt="Rush Logo"
            className="h-8"
          />
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white z-50"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6 py-2">
          <div className="flex items-center gap-6 text-white/80">
            <button className="hover:text-white">ALL GAMES</button>
            <button className="hover:text-white">REFER & EARN</button>
            <button className="hover:text-white">FAQ'S</button>
            <button className="px-4 py-1 rounded-full bg-[#00FF85] text-black font-semibold hover:bg-[#00FF85]/90 transition-colors whitespace-nowrap">
                Get Download Link
              </button>
            <button className="flex items-center gap-1 hover:text-white">
              <span>LANGUAGE</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m19.5 8.25-7.5 7.5-7.5-7.5"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Overlay */}
        <div
          className={`${
            isMenuOpen ? "opacity-50 visible" : "opacity-0 invisible"
          } fixed inset-0 bg-black transition-opacity duration-300 md:hidden`}
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Mobile Menu Drawer */}
        <div
          className={`fixed top-0 right-0 h-full w-[280px] bg-brandBg transform ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          } transition-transform duration-300 ease-in-out md:hidden z-40`}
        >
          {/* Drawer Header */}
          <div className="p-4 border-b border-white/10">
            <h2 className="text-white font-bold text-xl">Menu</h2>
          </div>

          {/* Drawer Content */}
          <div className="flex flex-col gap-4 p-4">
            <button className="text-white/80 hover:text-white text-left">
              ALL GAMES
            </button>
            <button className="text-white/80 hover:text-white text-left">
              REFER & EARN
            </button>
            <button className="text-white/80 hover:text-white text-left">
              FAQ'S
            </button>
            <button className="bg-red-600 px-3 py-1 rounded-full text-sm text-white hover:bg-red-700 w-fit">
              LUDO TOURNAMENT
            </button>
            <button className="text-white/80 hover:text-white flex items-center gap-1">
              <span>LANGUAGE</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m19.5 8.25-7.5 7.5-7.5-7.5"
                />
              </svg>
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
