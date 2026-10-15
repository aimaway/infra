import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { navigationData } from '../../data/navigationData';
import { ChevronDown, Menu, X, Zap } from 'lucide-react';

export default function Navigation() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { loginAsDemo } = useAuth();

  const handleDemoLogin = async (key: string) => {
    await loginAsDemo(key);
    if (key === 'platform-admin') navigate('/admin/dashboard');
    else if (key.includes('client-admin')) navigate('/client-admin/dashboard');
    else navigate('/dashboard');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-cyan-500/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Infracentra
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navigationData.map((item, idx) => (
              <div
                key={idx}
                className="relative"
                onMouseEnter={() => setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                {item.href ? (
                  <Link
                    to={item.href}
                    className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors rounded-lg hover:bg-slate-800/50"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <button className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors rounded-lg hover:bg-slate-800/50 flex items-center gap-1">
                    {item.label}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                )}

                {/* Dropdown */}
                {item.dropdown && activeDropdown === item.label && (
                  <div className="absolute top-full left-0 mt-2 w-[800px] bg-slate-900/98 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl shadow-cyan-500/10 p-6 grid grid-cols-3 gap-6 animate-fade-in">
                    {item.dropdown.map((section, sIdx) => (
                      <div key={sIdx}>
                        <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3 pb-2 border-b border-slate-700/50">
                          {section.category}
                        </h3>
                        <div className="space-y-1">
                          {section.items.map((subItem, iIdx) => (
                            <Link
                              key={iIdx}
                              to={subItem.href || '#'}
                              className="block p-2 rounded-lg hover:bg-slate-800/50 transition-all group/item"
                            >
                              <div className="flex items-start gap-2">
                                <subItem.icon className="w-4 h-4 text-slate-500 group-hover/item:text-cyan-400 mt-0.5 flex-shrink-0 transition-colors" />
                                <div>
                                  <p className="text-sm font-medium text-slate-200 group-hover/item:text-cyan-400 transition-colors">
                                    {subItem.label}
                                  </p>
                                  <p className="text-xs text-slate-500">{subItem.desc}</p>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/login"
              className="px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <button
              onClick={() => handleDemoLogin('platform-admin')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50"
            >
              Get Demo
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900/98 backdrop-blur-xl border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
            {navigationData.map((item, idx) => (
              <div key={idx}>
                {item.href ? (
                  <Link to={item.href} className="block px-4 py-2 text-slate-300 hover:text-cyan-400">
                    {item.label}
                  </Link>
                ) : (
                  <div>
                    <p className="px-4 py-2 text-sm font-bold text-cyan-400 uppercase">{item.label}</p>
                    {item.dropdown?.map((section, sIdx) => (
                      <div key={sIdx} className="pl-4 py-2">
                        <p className="text-xs text-slate-500 mb-2">{section.category}</p>
                        {section.items.slice(0, 3).map((sub, i) => (
                          <Link key={i} to={sub.href || '#'} className="block px-4 py-1 text-sm text-slate-400 hover:text-cyan-400">
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <Link to="/login" className="block w-full text-center px-4 py-2 text-slate-300 hover:text-white">
                Sign In
              </Link>
              <button
                onClick={() => handleDemoLogin('platform-admin')}
                className="block w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold"
              >
                Get Demo
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
