import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { servicesData } from '../../data/servicesData';
import { ArrowRight, TrendingUp, Award, Zap } from 'lucide-react';

export default function ServicesGrid() {
  const [hoveredService, setHoveredService] = useState<string | null>(null);

  // Services les plus populaires (basés sur l'utilisation client)
  const popularServices = ['threat-intel', 'compliance', 'incident-response', 'endpoint-protection', 'network-monitoring'];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'security': return 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30';
      case 'networking': return 'from-purple-500/20 to-pink-500/20 border-purple-500/30';
      case 'psa': return 'from-green-500/20 to-emerald-500/20 border-green-500/30';
      default: return 'from-slate-500/20 to-slate-600/20 border-slate-500/30';
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'security': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'networking': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'psa': return 'bg-green-500/10 text-green-400 border-green-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 to-slate-800/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm text-cyan-400 font-semibold uppercase tracking-widest mb-3">Explore Services</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">16 Integrated Services</h2>
          <p className="text-lg text-slate-400 max-w-3xl mx-auto">
            Click any service to see detailed features, architecture, integrations, and use cases.
          </p>
        </div>

        {/* Category Legend */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20">
            <div className="w-3 h-3 rounded-full bg-cyan-400" />
            <span className="text-sm text-cyan-400 font-medium">Security</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20">
            <div className="w-3 h-3 rounded-full bg-purple-400" />
            <span className="text-sm text-purple-400 font-medium">Networking</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <span className="text-sm text-green-400 font-medium">PSA</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {servicesData.map((service, index) => {
            const isPopular = popularServices.includes(service.id);
            const isHovered = hoveredService === service.id;

            return (
              <Link
                key={service.id}
                to={`/service/${service.id}`}
                onMouseEnter={() => setHoveredService(service.id)}
                onMouseLeave={() => setHoveredService(null)}
                className={`group relative bg-gradient-to-br ${getCategoryColor(service.category)} border rounded-2xl p-6 transition-all duration-300 overflow-hidden ${
                  isHovered ? 'scale-105 shadow-2xl shadow-cyan-500/20' : 'hover:scale-105'
                }`}
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-[10px] font-bold shadow-lg">
                    <Award className="w-3 h-3" />
                    POPULAR
                  </div>
                )}

                {/* Animated Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryColor(service.category)} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon with Animation */}
                  <div className={`text-5xl mb-4 transition-transform duration-300 ${isHovered ? 'scale-125 rotate-6' : ''}`}>
                    {service.icon}
                  </div>

                  {/* Category Badge */}
                  <div className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase mb-2 border ${getCategoryBadgeColor(service.category)}`}>
                    {service.category}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                    {service.name}
                  </h3>

                  {/* Tagline */}
                  <p className="text-sm text-cyan-400 font-medium mb-3">{service.tagline}</p>

                  {/* Description */}
                  <p className="text-sm text-slate-400 line-clamp-2 mb-4">{service.description}</p>

                  {/* Metrics */}
                  <div className="flex items-center gap-4 mb-4 pt-4 border-t border-slate-700/50">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-green-400" />
                      <span className="text-xs text-slate-400">{service.metrics[0]?.value || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-yellow-400" />
                      <span className="text-xs text-slate-400">{service.metrics[1]?.value || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Learn More */}
                  <div className="flex items-center gap-2 text-xs text-cyan-400 font-medium group-hover:gap-3 transition-all">
                    Learn more <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Glow Effect */}
                <div className={`absolute inset-0 rounded-2xl transition-opacity duration-300 ${
                  isHovered ? 'opacity-100' : 'opacity-0'
                }`} style={{
                  background: 'radial-gradient(circle at center, rgba(6,182,212,0.1) 0%, transparent 70%)'
                }} />
              </Link>
            );
          })}
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 text-center">
            <p className="text-3xl font-bold text-cyan-400 mb-1">16</p>
            <p className="text-sm text-slate-400">Integrated Services</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 text-center">
            <p className="text-3xl font-bold text-purple-400 mb-1">200+</p>
            <p className="text-sm text-slate-400">Integrations</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 text-center">
            <p className="text-3xl font-bold text-green-400 mb-1">99.9%</p>
            <p className="text-sm text-slate-400">Uptime SLA</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 text-center">
            <p className="text-3xl font-bold text-yellow-400 mb-1">24/7</p>
            <p className="text-sm text-slate-400">Support</p>
          </div>
        </div>
      </div>
    </section>
  );
}
