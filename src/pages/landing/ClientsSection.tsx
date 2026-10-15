import React from 'react';
import { Star, Quote } from 'lucide-react';

export default function ClientsSection() {
  const clients = [
    { name: 'Aegis Corp', logo: '🏦', industry: 'Financial Services' },
    { name: 'TechStart', logo: '💻', industry: 'Technology' },
    { name: 'MedSecure', logo: '🏥', industry: 'Healthcare' },
    { name: 'Global Finance', logo: '💰', industry: 'Banking' },
    { name: 'DataVault', logo: '☁️', industry: 'Cloud Services' },
    { name: 'RetailMax', logo: '🛒', industry: 'Retail' },
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'CISO',
      company: 'Aegis Corp International',
      rating: 5,
      text: 'Infracentra transformed our security operations. The unified platform reduced our MTTR by 70% and gave us complete visibility across all 16 services.',
      date: '2 weeks ago',
      verified: true
    },
    {
      name: 'Jordan Kim',
      role: 'IT Director',
      company: 'TechStart Solutions',
      rating: 5,
      text: 'As an SME, we needed something simple yet powerful. Infracentra delivered exactly that. The compliance mapper alone saved us months of work.',
      date: '1 month ago',
      verified: true
    },
    {
      name: 'Dr. Lisa Wong',
      role: 'Security Director',
      company: 'MedSecure Health',
      rating: 5,
      text: 'The healthcare compliance features are outstanding. We achieved HIPAA compliance in record time with automated evidence collection.',
      date: '3 weeks ago',
      verified: true
    },
    {
      name: 'Michael Torres',
      role: 'VP of Security',
      company: 'Global Finance Group',
      rating: 5,
      text: 'The predictive AI capabilities are game-changing. We detected and prevented 3 potential breaches before they happened.',
      date: '1 week ago',
      verified: true
    },
  ];

  const trustpilotStats = {
    rating: 4.9,
    totalReviews: 847,
    trustScore: 'Excellent'
  };

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-800/50 to-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm text-cyan-400 font-semibold uppercase tracking-widest mb-3">Trusted By Industry Leaders</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Our Clients</h2>
          <p className="text-lg text-slate-400 max-w-3xl mx-auto">
            Join hundreds of organizations that trust Infracentra to protect their infrastructure
          </p>
        </div>

        {/* Client Logos */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-16">
          {clients.map((client, i) => (
            <div key={i} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 hover:border-cyan-500/30 transition-all group text-center">
              <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">{client.logo}</div>
              <p className="text-sm font-semibold text-white mb-1">{client.name}</p>
              <p className="text-xs text-slate-500">{client.industry}</p>
            </div>
          ))}
        </div>

        {/* Trustpilot Rating */}
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-8 mb-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="text-6xl">⭐</div>
              <div>
                <p className="text-3xl font-bold text-white">{trustpilotStats.rating}/5</p>
                <p className="text-sm text-slate-400">Based on {trustpilotStats.totalReviews} reviews</p>
                <p className="text-xs text-green-400 font-semibold mt-1">{trustpilotStats.trustScore} on Trustpilot</p>
              </div>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-8 h-8 text-green-400 fill-green-400" />
              ))}
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, i) => (
            <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 hover:border-cyan-500/30 transition-all">
              <div className="flex items-start gap-4 mb-4">
                <Quote className="w-8 h-8 text-cyan-400 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex gap-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 text-green-400 fill-green-400" />
                    ))}
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed mb-4">{testimonial.text}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">{testimonial.name}</p>
                      <p className="text-xs text-slate-500">{testimonial.role} at {testimonial.company}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">{testimonial.date}</p>
                      {testimonial.verified && (
                        <p className="text-xs text-green-400 font-semibold">✓ Verified</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <a href="https://www.trustpilot.com/review/infracentra.io" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 font-semibold hover:bg-green-500/20 transition-all">
            Read All Reviews on Trustpilot →
          </a>
        </div>
      </div>
    </section>
  );
}
