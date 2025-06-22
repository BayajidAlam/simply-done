import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import "../index.css";
import SideBar from "../components/Shared/SideBar";
import Header from "../components/Shared/Header";

const MainLayout = () => {
  const [isSideBarExpanded, setIsSideBarExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto-collapse sidebar on mobile
      if (mobile) {
        setIsSideBarExpanded(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setIsSideBarExpanded(!isSideBarExpanded);
  };

  const closeSidebar = () => {
    setIsSideBarExpanded(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header 
        onToggleSidebar={toggleSidebar}
        isSideBarExpanded={isSideBarExpanded}
      />

      {/* Main Content Area */}
      <div className="flex">
        {/* Sidebar - Responsive */}
        <SideBar 
          isSideBarExpanded={isSideBarExpanded} 
          onClose={closeSidebar}
        />
        
        {/* Page Content - Responsive margin */}
        <main className={`flex-1 transition-all duration-300 ${
          isMobile 
            ? 'pt-16' // Mobile: no sidebar margin, just header padding
            : isSideBarExpanded 
              ? 'ml-64 pt-16' // Desktop expanded: sidebar margin + header padding
              : 'ml-16 pt-16'  // Desktop collapsed: smaller sidebar margin + header padding
        }`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;