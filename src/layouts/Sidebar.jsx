import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; // Assuming you have react-toastify for notifications
import NotificationBadge from '../admin/notifications/NotificationBadge'
import {
  FiHome,
  FiUsers,
  FiLogOut,
  FiBell, // FiBell is not used directly, NotificationBadge handles it
  FiTrendingUp,
  FiUserCheck,
  FiMenu, // For the hamburger icon
  FiX,    // For the close icon
} from 'react-icons/fi';

export default function App({ user }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false); // State to control sidebar visibility on small screens
  const sidebarRef = useRef(null); // Ref for the sidebar element

  const logout = () => {
    localStorage.removeItem('token');
    toast.info("Vous avez été déconnecté."); // Notification on logout
    navigate('/login');
  };

  // Function to toggle sidebar visibility
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Function to close sidebar
  const closeSidebar = () => {
    setIsOpen(false);
  };

  // Close sidebar when clicking outside of it (for mobile)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        closeSidebar();
      }
    };

    // Add event listener when sidebar is open
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Clean up event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]); // Re-run effect when isOpen changes

  // Define specific routes based on user role
  const isRevendeur = user?.role === 'revendeur';
  const baseRoute = isRevendeur ? '/dash_rev' : '/dashboard';

  // Tailwind CSS classes for NavLink based on active state
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2 rounded-lg transition duration-150 ease-in-out text-sm font-medium
     ${isActive
        ? 'bg-gray-700 text-white shadow-inner'
        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`;

  return (
    <>
      {/* Hamburger menu button for small screens */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleSidebar}
          className="p-2 text-white bg-gray-800 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
          aria-label="Toggle sidebar"
        >
          {isOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-800 flex flex-col shadow-lg
                   transform transition-transform duration-300 ease-in-out
                   ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                   md:translate-x-0 md:static md:h-screen md:flex`} // md:flex ensures it's always visible on desktop
      >
        {/* Logo */}
        <div className="p-6 text-white text-2xl font-bold border-b border-gray-700 flex items-center justify-between">
          Forma Fusion
          {/* Close button for mobile sidebar */}
          <button
            onClick={closeSidebar}
            className="md:hidden text-gray-400 hover:text-white focus:outline-none"
            aria-label="Close sidebar"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 text-sm font-medium overflow-y-auto">
          <NavLink to={baseRoute} className={linkClass} onClick={closeSidebar}>
            <FiHome className="h-5 w-5" /> Accueil
          </NavLink>

          <NavLink to={`${baseRoute}/clients`} className={linkClass} onClick={closeSidebar}>
            <FiUsers className="h-5 w-5" /> Clients
          </NavLink>

          <NavLink to={`${baseRoute}/transactions`} className={linkClass} onClick={closeSidebar}>
            <FiTrendingUp className="h-5 w-5" /> Transactions
          </NavLink>

          {user?.role === 'admin' && (
            <NavLink to="/revendeurs" className={linkClass} onClick={closeSidebar}>
              <FiUserCheck className="h-5 w-5" /> Revendeurs
            </NavLink>
          )}

          <NavLink to={`${baseRoute}/notifications`} className={linkClass} onClick={closeSidebar}>
            <NotificationBadge /> Notifications
          </NavLink>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={() => { logout(); closeSidebar(); }} // Close sidebar on logout
            className="flex items-center gap-2 w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition duration-150 ease-in-out shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-600 focus:ring-white"
          >
            <FiLogOut className="h-5 w-5" /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Overlay for small screens when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={closeSidebar}
          aria-hidden="true" // For accessibility
        ></div>
      )}
    </>
  );
}
