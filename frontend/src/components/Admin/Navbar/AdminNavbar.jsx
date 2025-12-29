// src/components/AdminNavbar.jsx
import React, { useState, useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FiMenu,
  FiX,
  FiLogOut
} from 'react-icons/fi';
import { GiChefToque } from 'react-icons/gi';
import { CartContext } from '../../../CartContext/CartContext';
import { styles } from '../../../assets/dummyadmin';

const AdminNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { setIsAdmin } = useContext(CartContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    setIsAdmin(false);
    navigate('/login');
  };

  const adminNavLinks = [
    { name: 'Add Items', href: '/admin/add-items', icon: '➕' },
    { name: 'List Items', href: '/admin/list-items', icon: '📋' },
    { name: 'Orders', href: '/admin/orders', icon: '📦' },
    { name: 'Logout', icon: '🚪', isLogout: true },
  ];

  return (
    <nav className={styles.navWrapper}>
      <div className={styles.navContainer}>
        <div className={styles.logoSection}>
          <GiChefToque className={styles.logoIcon} />
          <span className={styles.logoText}>Admin Panel</span>
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={styles.menuButton}
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>

        <div className={styles.desktopMenu}>
          {adminNavLinks.map(link => (
            link.isLogout ? (
              <button
                key={link.name}
                onClick={handleLogout}
                className={`${styles.navLinkBase} ${styles.navLinkInactive} hover:text-red-400`}
              >
                <span>{link.icon}</span>
                <span>{link.name}</span>
              </button>
            ) : (
              <NavLink
                key={link.name}
                to={link.href}
                className={({ isActive }) =>
                  `${styles.navLinkBase} ${isActive ? styles.navLinkActive : styles.navLinkInactive
                  }`
                }
              >
                <span>{link.icon}</span>
                <span>{link.name}</span>
              </NavLink>
            )
          ))}
        </div>
      </div>

      {menuOpen && (
        <div className={styles.mobileMenu}>
          {adminNavLinks.map(link => (
            link.isLogout ? (
              <button
                key={link.name}
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
                className={`${styles.navLinkBase} ${styles.navLinkInactive} hover:text-red-400 w-full text-left`}
              >
                <span>{link.icon}</span>
                <span>{link.name}</span>
              </button>
            ) : (
              <NavLink
                key={link.name}
                to={link.href}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `${styles.navLinkBase} ${isActive ? styles.navLinkActive : styles.navLinkInactive
                  }`
                }
              >
                <span>{link.icon}</span>
                <span>{link.name}</span>
              </NavLink>
            )
          ))}
        </div>
      )}
    </nav>
  );
};

export default AdminNavbar;
