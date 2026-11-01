import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Menu, X, User, LogOut, Settings, LayoutDashboard, ChevronDown, Map } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { cn, getInitials, getAvatarColor } from '@/lib/utils';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
    setIsDropdownOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/explore', label: 'Explore' },
    { href: '/features', label: 'Features' },
    { href: '/how-it-works', label: 'How It Works' },
    { href: '/pricing', label: 'Pricing' },
    ...(isAuthenticated ? [{ href: '/dashboard', label: 'Dashboard' }] : []),
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
        isScrolled ? 'glass-nav shadow-navy' : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center shadow-accent group-hover:shadow-accent-lg transition-shadow">
              <Plane size={16} className="text-white rotate-45" />
            </div>
            <span className="font-display font-bold text-xl text-white">
              Voyage<span className="gradient-text">AI</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  location.pathname === link.href
                    ? 'text-accent-400 bg-accent-500/10'
                    : 'text-warm-200/70 hover:text-warm-200 hover:bg-white/5'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(v => !v)}
                  className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <div className={cn(
                    'w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-xs font-bold text-white',
                    getAvatarColor(user?.name || 'U')
                  )}>
                    {user?.profileImage ? (
                      <img src={user.profileImage} alt={user.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      getInitials(user?.name || 'U')
                    )}
                  </div>
                  <span className="text-sm font-medium text-warm-200">{user?.name?.split(' ')[0]}</span>
                  <ChevronDown size={14} className={cn('text-warm-200/50 transition-transform', isDropdownOpen && 'rotate-180')} />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 glass-card rounded-xl overflow-hidden py-1 z-50"
                      onMouseLeave={() => setIsDropdownOpen(false)}
                    >
                      <div className="px-4 py-2.5 border-b border-white/5">
                        <p className="text-sm font-semibold text-warm-200">{user?.name}</p>
                        <p className="text-xs text-warm-200/50 truncate">{user?.email}</p>
                      </div>
                      {[
                        { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
                        { icon: Map, label: 'My Trips', href: '/trips' },
                        { icon: User, label: 'Profile', href: '/profile' },
                        { icon: Settings, label: 'Settings', href: '/settings' },
                      ].map(item => (
                        <Link
                          key={item.href}
                          to={item.href}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-warm-200/70 hover:text-warm-200 hover:bg-white/5 transition-colors"
                        >
                          <item.icon size={15} />
                          {item.label}
                        </Link>
                      ))}
                      <div className="border-t border-white/5 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/5 transition-colors w-full"
                        >
                          <LogOut size={15} />
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Sign in</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setIsMobileOpen(v => !v)}
            className="md:hidden p-2 rounded-lg text-warm-200/70 hover:text-warm-200 hover:bg-white/5 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden glass-nav border-t border-white/5 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    'flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                    location.pathname === link.href
                      ? 'text-accent-400 bg-accent-500/10'
                      : 'text-warm-200/70 hover:text-warm-200 hover:bg-white/5'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-white/5 flex flex-col gap-2">
                {isAuthenticated ? (
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/5 rounded-xl transition-colors"
                  >
                    <LogOut size={15} /> Sign out
                  </button>
                ) : (
                  <>
                    <Link to="/login">
                      <Button variant="secondary" fullWidth>Sign in</Button>
                    </Link>
                    <Link to="/register">
                      <Button fullWidth>Get Started</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
