import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Menu, X, Briefcase, ChevronDown, LogOut, User, LayoutDashboard, BookmarkCheck, FileText, BarChart2, Users } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const candidateLinks = [
    { to: '/candidate/dashboard', icon: <LayoutDashboard size={16} />, label: 'Dashboard' },
    { to: '/jobs', icon: <Briefcase size={16} />, label: 'Browse Jobs' },
    { to: '/candidate/applications', icon: <FileText size={16} />, label: 'Applications' },
    { to: '/candidate/saved', icon: <BookmarkCheck size={16} />, label: 'Saved Jobs' },
  ];

  const employerLinks = [
    { to: '/employer/dashboard', icon: <LayoutDashboard size={16} />, label: 'Dashboard' },
    { to: '/employer/post-job', icon: <Briefcase size={16} />, label: 'Post Job' },
    { to: '/employer/jobs', icon: <FileText size={16} />, label: 'My Jobs' },
    { to: '/employer/applications', icon: <Users size={16} />, label: 'Applications' },
    { to: '/employer/analytics', icon: <BarChart2 size={16} />, label: 'Analytics' },
  ];

  const links = user?.role === 'employer' ? employerLinks : user?.role === 'candidate' ? candidateLinks : [];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-indigo-600">
            <Briefcase size={24} />
            <span>JobPortal</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(l => (
              <Link key={l.to} to={l.to} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                {l.icon}{l.label}
              </Link>
            ))}
            {!user && (
              <>
                <Link to="/jobs" className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50">Browse Jobs</Link>
              </>
            )}
          </div>

          {/* Right */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link to={`/${user.role}/notifications`} className="relative p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                  <Bell size={20} />
                </Link>
                <div className="relative">
                  <button onClick={() => setDropdownOpen(v => !v)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm">
                      {(user.email?.[0] || 'U').toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">{user.email}</span>
                    <ChevronDown size={16} className="text-gray-500" />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
                      <Link to={`/${user.role}/profile`} onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <User size={16} /> Profile
                      </Link>
                      <hr className="my-1 border-gray-100" />
                      <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left">
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">Login</Link>
                <Link to="/register" className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">Sign Up</Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100" onClick={() => setMobileOpen(v => !v)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-3 flex flex-col gap-1">
          {links.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50">
              {l.icon}{l.label}
            </Link>
          ))}
          {!user ? (
            <div className="flex gap-2 pt-2 border-t border-gray-100 mt-1">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 px-4 py-2 border border-gray-300 text-center text-sm font-medium rounded-lg text-gray-700 hover:border-indigo-500">Login</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1 px-4 py-2 bg-indigo-600 text-center text-sm font-medium text-white rounded-lg hover:bg-indigo-700">Sign Up</Link>
            </div>
          ) : (
            <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 mt-1 rounded-lg text-sm text-red-600 hover:bg-red-50">
              <LogOut size={16} /> Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
