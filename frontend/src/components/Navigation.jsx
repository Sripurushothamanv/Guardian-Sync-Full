import React, { useContext, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { AppContext } from '../AppContext';
import { 
  Activity, Moon, Coffee, Apple, Clock, Brain, Car, Flame, 
  MessageSquare, Settings, User, Bell, FileText, Sliders, 
  ChevronRight, LogOut, Menu, X, ShieldAlert, BadgeAlert, HelpCircle
} from 'lucide-react';

export default function Navigation() {
  const { user, logout, notifications } = useContext(AppContext);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const coreLinks = [
    { path: '/', label: 'Dashboard', icon: Activity },
    { path: '/sleep', label: 'Sleep Log', icon: Moon },
    { path: '/caffeine', label: 'Caffeine Track', icon: Coffee },
    { path: '/nutrition', label: 'Nutrition & Macros', icon: Apple },
    { path: '/shifts', label: 'Shift Roster', icon: Clock },
  ];

  const intelligenceLinks = [
    { path: '/fatigue', label: 'Fatigue Meter', icon: Brain },
    { path: '/drive-safety', label: 'Drive Safety Check', icon: Car },
    { path: '/burnout', label: 'Burnout Risk Index', icon: ShieldAlert },
    { path: '/sleep-analyzer', label: 'Sleep Analyzer', icon: Sliders },
    { path: '/recovery', label: 'Recovery Center', icon: Flame },
  ];

  const aiLinks = [
    { path: '/ai-chat', label: 'Voice/AI Assistant', icon: MessageSquare, highlight: true },
    { path: '/reports', label: 'Weekly Summary', icon: FileText },
    { path: '/goals', label: 'Wellness Goals', icon: Flame },
  ];

  const utilityLinks = [
    { path: '/profile', label: 'My Profile', icon: User },
    { path: '/notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const NavItem = ({ link }) => {
    const Icon = link.icon;
    return (
      <NavLink
        to={link.path}
        onClick={() => setIsOpen(false)}
        className={({ isActive }) => 
          `nav-item ${isActive ? 'active' : ''} ${link.highlight ? 'highlight' : ''}`
        }
      >
        <Icon size={18} className="nav-icon" />
        <span className="nav-label">{link.label}</span>
        {link.badge > 0 && <span className="nav-badge">{link.badge}</span>}
        {link.highlight && <span className="sparkle-badge">AI</span>}
      </NavLink>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sidebar glass-panel">
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo">
            <span className="logo-pulse"></span>
            GUARDIAN<span>SYNC</span>
          </Link>
          {user && (
            <div className="user-capsule">
              <span className="user-dot"></span>
              <span className="user-role">{user.role}</span>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          <div className="nav-group">
            <span className="group-title">Core Tracking</span>
            {coreLinks.map(link => <NavItem key={link.path} link={link} />)}
          </div>

          <div className="nav-group">
            <span className="group-title">Analytics & Intelligence</span>
            {intelligenceLinks.map(link => <NavItem key={link.path} link={link} />)}
          </div>

          <div className="nav-group">
            <span className="group-title">AI & Reports</span>
            {aiLinks.map(link => <NavItem key={link.path} link={link} />)}
          </div>

          <div className="nav-group">
            <span className="group-title">System</span>
            {utilityLinks.map(link => <NavItem key={link.path} link={link} />)}
          </div>
        </nav>

        {user && (
          <div className="sidebar-footer">
            <div className="user-summary">
              <div className="avatar">{user.name.charAt(0)}</div>
              <div className="user-info">
                <div className="user-name">{user.name}</div>
                <div className="user-dept">{user.department || 'General Practice'}</div>
              </div>
            </div>
            <button className="logout-btn" onClick={logout}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        )}
      </aside>

      {/* Mobile Top Navbar */}
      <header className="mobile-header glass-panel">
        <Link to="/" className="sidebar-logo">
          GUARDIAN<span>SYNC</span>
        </Link>
        <div className="mobile-header-right">
          <Link to="/notifications" className="mobile-notif-btn">
            <Bell size={20} />
            {unreadCount > 0 && <span className="mobile-notif-badge">{unreadCount}</span>}
          </Link>
          <button className="menu-btn" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="mobile-drawer glass-panel">
          <nav className="mobile-drawer-nav">
            {coreLinks.map(link => <NavItem key={link.path} link={link} />)}
            <div className="drawer-separator"></div>
            {intelligenceLinks.map(link => <NavItem key={link.path} link={link} />)}
            <div className="drawer-separator"></div>
            {aiLinks.map(link => <NavItem key={link.path} link={link} />)}
            <div className="drawer-separator"></div>
            {utilityLinks.map(link => <NavItem key={link.path} link={link} />)}
            {user && (
              <button className="logout-btn mobile-logout" onClick={logout}>
                <LogOut size={18} /> Logout
              </button>
            )}
          </nav>
        </div>
      )}

      {/* Mobile Bottom Quick-Navigation Bar */}
      <nav className="mobile-bottom-nav glass-panel">
        <NavLink to="/" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <Activity size={20} />
          <span>Home</span>
        </NavLink>
        <NavLink to="/sleep" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <Moon size={20} />
          <span>Sleep</span>
        </NavLink>
        <NavLink to="/ai-chat" className="bottom-nav-item ai-action-btn">
          <div className="ai-btn-glow"></div>
          <MessageSquare size={20} color="white" />
        </NavLink>
        <NavLink to="/caffeine" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <Coffee size={20} />
          <span>Caffeine</span>
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <User size={20} />
          <span>Profile</span>
        </NavLink>
      </nav>

      {/* Embedded CSS specific to Navigation Component */}
      <style>{`
        /* Navigation Sidebar Layout Styles */
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          width: 260px;
          height: 100vh;
          display: flex;
          flex-direction: column;
          border-radius: 0;
          border-top: none;
          border-bottom: none;
          border-left: none;
          z-index: 100;
          padding: 1.5rem 1rem;
          background: rgba(12, 17, 34, 0.7);
        }

        .sidebar-header {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .sidebar-logo {
          font-size: 1.25rem;
          font-weight: 800;
          color: white;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          letter-spacing: 1px;
        }

        .sidebar-logo span {
          color: var(--color-primary);
        }

        .logo-pulse {
          width: 8px;
          height: 8px;
          background-color: var(--color-safe);
          border-radius: 50%;
          display: inline-block;
          box-shadow: 0 0 10px var(--color-safe);
          animation: pulseGlow 1.5s infinite;
        }

        .user-capsule {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.2);
          padding: 0.2rem 0.5rem;
          border-radius: 30px;
          align-self: flex-start;
        }

        .user-dot {
          width: 6px;
          height: 6px;
          background-color: var(--color-primary);
          border-radius: 50%;
        }

        .user-role {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .sidebar-nav {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem 0;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .nav-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .group-title {
          font-size: 0.7rem;
          text-transform: uppercase;
          color: var(--text-muted);
          font-weight: 700;
          letter-spacing: 1.5px;
          padding-left: 0.75rem;
          margin-bottom: 0.25rem;
        }

        .nav-item {
          display: flex;
          align-items: center;
          padding: 0.65rem 0.75rem;
          border-radius: var(--border-radius-md);
          color: var(--text-secondary);
          text-decoration: none;
          transition: var(--transition-smooth);
          font-size: 0.9rem;
          font-weight: 500;
          position: relative;
        }

        .nav-item:hover {
          color: white;
          background: rgba(255, 255, 255, 0.04);
        }

        .nav-item.active {
          color: white;
          background: linear-gradient(90deg, rgba(139, 92, 246, 0.15), rgba(6, 182, 212, 0.05));
          border-left: 3px solid var(--color-primary);
        }

        .nav-icon {
          margin-right: 0.75rem;
          transition: var(--transition-smooth);
        }

        .nav-item.active .nav-icon {
          color: var(--color-primary);
          filter: drop-shadow(0 0 5px var(--color-primary-glow));
        }

        .nav-badge {
          background-color: var(--color-danger);
          color: white;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.1rem 0.35rem;
          border-radius: 20px;
          margin-left: auto;
        }

        .sparkle-badge {
          background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
          color: white;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 0.1rem 0.35rem;
          border-radius: 4px;
          margin-left: auto;
          text-transform: uppercase;
        }

        .nav-item.highlight {
          border: 1px dashed rgba(6, 182, 212, 0.3);
          background: rgba(6, 182, 212, 0.03);
        }

        .nav-item.highlight:hover {
          border-color: var(--color-secondary);
          background: rgba(6, 182, 212, 0.08);
        }

        .sidebar-footer {
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .user-summary {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .avatar {
          width: 38px;
          height: 38px;
          background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: white;
        }

        .user-info {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: white;
        }

        .user-dept {
          font-size: 0.72rem;
          color: var(--text-secondary);
        }

        .logout-btn {
          width: 100%;
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.15);
          color: #f87171;
          padding: 0.5rem;
          border-radius: var(--border-radius-md);
          font-family: var(--font-main);
          font-weight: 600;
          font-size: 0.8rem;
          cursor: pointer;
          transition: var(--transition-smooth);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
        }

        .logout-btn:hover {
          background: var(--color-danger);
          color: white;
          border-color: transparent;
        }

        /* Mobile Header & Bottom-nav styles */
        .mobile-header {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 60px;
          padding: 0 1rem;
          align-items: center;
          justify-content: space-between;
          z-index: 110;
          border-radius: 0;
          border-left: none;
          border-right: none;
          border-top: none;
          background: rgba(12, 17, 34, 0.85);
        }

        .mobile-header-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .mobile-notif-btn {
          color: var(--text-primary);
          position: relative;
        }

        .mobile-notif-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: var(--color-danger);
          color: white;
          font-size: 0.6rem;
          font-weight: 700;
          border-radius: 50%;
          width: 14px;
          height: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .menu-btn {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
        }

        .mobile-drawer {
          display: none;
          position: fixed;
          top: 60px;
          left: 0;
          width: 100%;
          height: calc(100vh - 120px);
          z-index: 105;
          overflow-y: auto;
          padding: 1.5rem;
          border-radius: 0;
          background: rgba(12, 17, 34, 0.95);
        }

        .mobile-drawer-nav {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .drawer-separator {
          height: 1px;
          background: rgba(255, 255, 255, 0.05);
          margin: 0.5rem 0;
        }

        .mobile-bottom-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 65px;
          justify-content: space-around;
          align-items: center;
          z-index: 100;
          border-radius: 0;
          border-left: none;
          border-right: none;
          border-bottom: none;
          background: rgba(12, 17, 34, 0.9);
          padding: 0 0.5rem;
        }

        .bottom-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.7rem;
          gap: 0.25rem;
          transition: var(--transition-smooth);
        }

        .bottom-nav-item.active {
          color: var(--color-primary);
        }

        .ai-action-btn {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, var(--color-secondary), var(--color-primary));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: -30px;
          box-shadow: 0 4px 15px var(--color-secondary-glow);
          position: relative;
          z-index: 5;
        }

        .ai-btn-glow {
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(135deg, var(--color-secondary), var(--color-primary));
          border-radius: 50%;
          z-index: -1;
          filter: blur(8px);
          opacity: 0.6;
        }

        /* Responsive Breakpoints */
        @media (max-width: 992px) {
          .sidebar {
            display: none;
          }
          .mobile-header, .mobile-bottom-nav {
            display: flex;
          }
          .mobile-drawer {
            display: ${isOpen ? 'block' : 'none'};
          }
        }
      `}</style>
    </>
  );
}
