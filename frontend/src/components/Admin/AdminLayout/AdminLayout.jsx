import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBoxes, FaClipboardList, FaHome, FaSignOutAlt } from 'react-icons/fa';
import { GiChefToque } from 'react-icons/gi';
import { useAuth } from '../../../contexts/AuthContext';

const AdminLayout = ({ children }) => {
  const { logout, user } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      window.location.href = '/';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Navbar */}
      <div className="bg-gradient-to-r from-[#8B4513] to-[#654321] text-white shadow-lg">
        <div className="flex items-center justify-between px-8 py-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <GiChefToque size={32} className="text-amber-300" />
            <h1 className="text-2xl font-bold text-amber-200">Admin Panel</h1>
          </div>

          {/* Navigation Menu */}
          <nav className="flex items-center gap-6">
            <Link
              to="/admin"
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${
                isActive('/admin')
                  ? 'bg-amber-600 text-amber-100 border border-amber-400'
                  : 'hover:bg-[#7A3F0F] text-gray-200'
              }`}
            >
              <FaHome size={18} />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/admin/add-items"
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${
                isActive('/admin/add-items')
                  ? 'bg-amber-600 text-amber-100 border border-amber-400'
                  : 'hover:bg-[#7A3F0F] text-gray-200'
              }`}
            >
              <span>⊕</span>
              <span>Add Items</span>
            </Link>

            <Link
              to="/admin/list-items"
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${
                isActive('/admin/list-items')
                  ? 'bg-amber-600 text-amber-100 border border-amber-400'
                  : 'hover:bg-[#7A3F0F] text-gray-200'
              }`}
            >
              <span>≡</span>
              <span>List Items</span>
            </Link>

            <Link
              to="/admin/orders"
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${
                isActive('/admin/orders')
                  ? 'bg-amber-600 text-amber-100 border border-amber-400'
                  : 'hover:bg-[#7A3F0F] text-gray-200'
              }`}
            >
              <span>⊕</span>
              <span>Orders</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-full transition hover:bg-red-600 text-gray-200"
            >
              <FaSignOutAlt size={18} />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-900">
        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
