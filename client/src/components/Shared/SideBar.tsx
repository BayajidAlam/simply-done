import { NavLink } from "react-router-dom";
import { MdLightbulbOutline } from "react-icons/md";
import { HiOutlineArchiveBoxArrowDown } from "react-icons/hi2";
import { GoTrash } from "react-icons/go";
import { BiLogOut, BiCog } from "react-icons/bi";
import { RiCloseLine } from "react-icons/ri";
import { IoKeyOutline } from "react-icons/io5";
import { useState, useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import useFetchNotes from "../../hooks/useNotes";
import { NoteStatus } from "../../Types";

const navigationItems = [
  {
    name: "Notes",
    link: "/",
    icon: <MdLightbulbOutline className="w-5 h-5" />,
    description: "All your notes",
    status: NoteStatus.ACTIVE,
  },
  {
    name: "Archive",
    link: "/archive",
    icon: <HiOutlineArchiveBoxArrowDown className="w-5 h-5" />,
    description: "Archived notes",
    status: NoteStatus.ARCHIVED,
  },
  {
    name: "Trash",
    link: "/trash",
    icon: <GoTrash className="w-5 h-5" />,
    description: "Deleted notes",
    status: NoteStatus.TRASHED,
  },
];

interface SideBarProps {
  isSideBarExpanded: boolean;
  onClose?: () => void; // For mobile close
}

const Sidebar: React.FC<SideBarProps> = ({ isSideBarExpanded, onClose }) => {
  const { user, logOutUser } = useAuth();
  const userEmail = user?.email as string;
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get note counts for each section using the new status-based approach
  const { notes: homeNotes } = useFetchNotes({
    email: userEmail,
    searchTerm: "",
    status: NoteStatus.ACTIVE,
  });

  const { notes: archiveNotes } = useFetchNotes({
    email: userEmail,
    searchTerm: "",
    status: NoteStatus.ARCHIVED,
  });

  const { notes: trashNotes } = useFetchNotes({
    email: userEmail,
    searchTerm: "",
    status: NoteStatus.TRASHED,
  });

  const getNoteCounts = (link: string) => {
    switch (link) {
      case "/":
        return Array.isArray(homeNotes) ? homeNotes.length : 0;
      case "/archive":
        return Array.isArray(archiveNotes) ? archiveNotes.length : 0;
      case "/trash":
        return Array.isArray(trashNotes) ? trashNotes.length : 0;
      default:
        return 0;
    }
  };

  const handleLogout = async () => {
    try {
      await logOutUser();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleNavClick = () => {
    // Close sidebar on mobile when navigation item is clicked
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isSideBarExpanded && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`transition-all duration-300 ease-in-out bg-white border-r border-slate-200 shadow-lg
          ${isMobile ? 'fixed top-0 left-0 h-screen z-50' : 'fixed top-0 left-0 h-screen z-30 pt-16'}
          ${isSideBarExpanded ? "w-64" : isMobile ? "-translate-x-full" : "w-16"} 
          flex flex-col ${isMobile ? 'transform' : ''}`}
      >
        {/* Mobile Header (only shown on mobile) */}
        {isMobile && (
          <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg 
                flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800">SimplyDone</h1>
                <p className="text-xs text-slate-500">Organize your thoughts</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
            >
              <RiCloseLine className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Navigation Items - Takes remaining space */}
        <div className="flex-1 py-6 overflow-y-auto min-h-0">
          <nav className="space-y-2 px-3">
            {navigationItems.map((item, index) => {
              const noteCount = getNoteCounts(item.link);
              return (
                <NavLink
                  key={index}
                  to={item.link}
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `group flex items-center px-3 py-3 rounded-xl transition-all duration-200 ease-in-out relative
                    ${
                      isActive
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }
                    ${!isSideBarExpanded || isMobile ? "" : !isSideBarExpanded ? "justify-center" : ""}
                    `
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div
                        className={`flex-shrink-0 ${
                          isActive ? "text-white" : ""
                        }`}
                      >
                        {item.icon}
                      </div>

                      {(isSideBarExpanded || isMobile) && (
                        <div className="ml-3 flex-1 min-w-0 flex items-center justify-between">
                          <div>
                            <span className="text-sm font-medium truncate">
                              {item.name}
                            </span>
                            {!isActive && (
                              <p className="text-xs text-slate-500 truncate mt-0.5">
                                {item.description}
                              </p>
                            )}
                          </div>

                          {/* Note Count Badge */}
                          {noteCount > 0 && (
                            <span
                              className={`ml-2 px-2 py-0.5 text-xs rounded-full font-medium
                              ${
                                isActive
                                  ? "bg-white/20 text-white"
                                  : "bg-slate-200 text-slate-600"
                              }`}
                            >
                              {noteCount}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Tooltip for collapsed state (desktop only) */}
                      {!isSideBarExpanded && !isMobile && (
                        <div
                          className="absolute left-full ml-2 px-3 py-2 bg-slate-800 text-white text-sm 
                          rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 
                          pointer-events-none z-50 whitespace-nowrap shadow-lg"
                        >
                          <div className="font-medium">{item.name}</div>
                          {noteCount > 0 && (
                            <div className="text-xs text-slate-300">
                              {noteCount} notes
                            </div>
                          )}
                          {/* Tooltip Arrow */}
                          <div
                            className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 
                            border-4 border-transparent border-r-slate-800"
                          ></div>
                        </div>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Section - Fixed at bottom */}
        <div className="border-t border-slate-200 p-3 bg-white flex-shrink-0">
          {(isSideBarExpanded || isMobile) ? (
            <div className="space-y-3">
              {/* User Info */}
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                <div
                  className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full 
                  flex items-center justify-center text-white text-sm font-medium flex-shrink-0"
                >
                  {user?.userName?.charAt(0).toUpperCase() ||
                    user?.email?.charAt(0).toUpperCase() ||
                    "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {user?.userName || "User"}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
              </div>

              {/* User Actions */}
              <div className="space-y-1">
                <NavLink
                  to="/user/change-password"
                  onClick={handleNavClick}
                  className="group flex items-center px-3 py-2 text-sm text-slate-600 
                    hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors"
                >
                  <IoKeyOutline className="w-4 h-4 mr-3" />
                  Change Password
                </NavLink>

                <button
                  onClick={handleLogout}
                  className="w-full group flex items-center px-3 py-2 text-sm text-slate-600 
                    hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                >
                  <BiLogOut className="w-4 h-4 mr-3" />
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {/* User Avatar */}
              <div className="flex justify-center">
                <div
                  className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full 
                    flex items-center justify-center text-white text-sm font-medium cursor-pointer
                    hover:shadow-md transition-shadow relative group"
                >
                  {user?.userName?.charAt(0).toUpperCase() ||
                    user?.email?.charAt(0).toUpperCase() ||
                    "U"}

                  {/* Tooltip */}
                  <div
                    className="absolute left-full ml-2 px-3 py-2 bg-slate-800 text-white text-sm 
                    rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 
                    pointer-events-none z-50 whitespace-nowrap"
                  >
                    {user?.userName || user?.email}
                    <div
                      className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 
                      border-4 border-transparent border-r-slate-800"
                    ></div>
                  </div>
                </div>
              </div>

              {/* Settings Button - Always Visible */}
              <div className="flex justify-center">
                <NavLink
                  to="/user/change-password"
                  className="p-2.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 
                    rounded-lg transition-colors relative group"
                >
                  <BiCog className="w-5 h-5" />

                  {/* Tooltip */}
                  <div
                    className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs 
                    rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 
                    pointer-events-none z-50 whitespace-nowrap"
                  >
                    Settings
                    <div
                      className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 
                      border-4 border-transparent border-r-slate-800"
                    ></div>
                  </div>
                </NavLink>
              </div>

              {/* Logout Button - Always Visible */}
              <div className="flex justify-center">
                <button
                  onClick={handleLogout}
                  className="p-2.5 text-slate-600 hover:bg-red-50 hover:text-red-600 
                    rounded-lg transition-colors relative group"
                >
                  <BiLogOut className="w-5 h-5" />

                  {/* Tooltip */}
                  <div
                    className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs 
                    rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 
                    pointer-events-none z-50 whitespace-nowrap"
                  >
                    Sign Out
                    <div
                      className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 
                      border-4 border-transparent border-r-slate-800"
                    ></div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;