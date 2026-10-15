import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Play, Eye, Layers, Shield, Target, Zap, Sparkles, ArrowRight } from 'lucide-react';
import ImageSlider from '../ImageSlider';

export default function HeroSection() {
  const navigate = useNavigate();
  const { loginAsDemo } = useAuth();

  const handleDemoLogin = async () => {
    await loginAsDemo('platform-admin');
    navigate('/admin/dashboard');
  };

  const sliderImages = [
    {
      url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&h=600&fit=crop',
      title: 'Advanced Threat Detection',
      description: 'AI-powered security operations center with real-time threat intelligence'
    },
    {
      url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&h=600&fit=crop',
      title: 'Unified Security Platform',
      description: '16 integrated services for complete infrastructure protection'
    },
    {
      url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=600&fit=crop',
      title: 'Network Security Monitoring',
      description: '24/7 network visibility with intelligent monitoring and policy enforcement'
    },
    {
      url: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1200&h=600&fit=crop',
      title: 'Automated Response',
      description: 'SOAR-powered incident response with machine speed'
    }
  ];

  return (
    <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(0,212,255,0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(139,92,246,0.15) 0%, transparent 50%)'
      }} />

      <div className="relative max-w-7xl mx-auto">
        {/* Hero Content */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-8 animate-pulse">
            <Sparkles className="w-4 h-4 text-cyber-yellow" />
            <span className="text-sm text-cyan-400 font-medium">The Complete ISOC Platform</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              See. Know. Act.
            </span>
          </h1>

          <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            Infracentra delivers a complete <span className="text-cyan-400 font-semibold">Integrated Security Operations Center (ISOC)</span> through 
            a unified platform that connects security data, detection, investigation, and response to reduce complexity 
            and accelerate threat response.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={handleDemoLogin}
              className="group px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all shadow-2xl shadow-cyan-500/30 flex items-center gap-3 text-lg"
            >
              <Play className="w-5 h-5" />
              Request Platform Demo
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <Link
              to="/login"
              className="px-8 py-4 rounded-xl border border-slate-600 text-slate-300 font-semibold hover:bg-slate-800/50 transition-all flex items-center gap-3 text-lg"
            >
              <Eye className="w-5 h-5" />
              Explore Platform
            </Link>
          </div>
        </div>

        {/* Image Slider */}
        <div className="mb-16">
          <ImageSlider images={sliderImages} autoPlay={true} interval={5000} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {[
            { value: '16', label: 'Integrated Services', icon: Layers },
            { value: '94%', label: 'Threat Block Rate', icon: Shield },
            { value: '14m', label: 'Mean Time to Detect', icon: Target },
            { value: '2.4h', label: 'Mean Time to Respond', icon: Zap },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-cyan-500/30 transition-all group">
              <stat.icon className="w-6 h-6 text-cyan-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-xs text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
