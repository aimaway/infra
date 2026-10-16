import React from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800 bg-slate-900/50">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-lg">Infracentra</span>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              Unified Infrastructure & Security Orchestration Platform
            </p>
            <p className="text-xs text-slate-500">
              Protecting organizations with AI-driven security operations.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-3">Platform</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li><Link to="/service/threat-intel" className="hover:text-cyan-400">Security</Link></li>
              <li><Link to="/service/network-monitoring" className="hover:text-cyan-400">Networking</Link></li>
              <li><Link to="/service/patch-management" className="hover:text-cyan-400">PSA</Link></li>
              <li><a href="#" className="hover:text-cyan-400">API Docs</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-3">Company</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li><a href="#" className="hover:text-cyan-400">About</a></li>
              <li><a href="#" className="hover:text-cyan-400">Careers</a></li>
              <li><a href="#" className="hover:text-cyan-400">Blog</a></li>
              <li><a href="#" className="hover:text-cyan-400">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-3">Legal</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li><a href="#" className="hover:text-cyan-400">Privacy</a></li>
              <li><a href="#" className="hover:text-cyan-400">Terms</a></li>
              <li><a href="#" className="hover:text-cyan-400">Security</a></li>
              <li><a href="#" className="hover:text-cyan-400">SOC 2</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">© 2027 Infracentra. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-600">SOC 2 Type II</span>
            <span className="text-xs text-slate-600">ISO 27001</span>
            <span className="text-xs text-slate-600">GDPR</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
