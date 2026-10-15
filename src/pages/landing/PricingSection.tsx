import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const plans = [
    {
      tier: 'SME',
      monthlyPrice: 499,
      desc: 'For small teams starting their security journey',
      features: ['Threat Intelligence', 'Compliance Mapper', 'Vulnerability Scanning', 'Patch Management', 'Endpoint Protection', 'Email Security', 'DNS Filtering', 'VPN Gateway'],
      popular: false
    },
    {
      tier: 'Mid-Market',
      monthlyPrice: 2999,
      desc: 'For growing organizations with advanced needs',
      features: ['Everything in SME', 'Incident Response', 'Backup & DR', 'Network Monitoring', 'Security Analytics', 'Priority Support', 'Custom Playbooks', 'API Access'],
      popular: true
    },
    {
      tier: 'Enterprise',
      monthlyPrice: null, // Custom pricing
      desc: 'For large organizations with complex requirements',
      features: ['Everything in Mid-Market', 'SOAR Automation', 'Cloud Security (CSPM)', 'Firewall Management', 'SD-WAN', 'Dedicated CSM', 'Custom Integrations', 'SLA Guarantee'],
      popular: false
    },
  ];

  const calculateAnnualPrice = (monthlyPrice: number | null) => {
    if (monthlyPrice === null) return null;
    const annualPrice = monthlyPrice * 12 * 0.8; // 20% discount
    return Math.round(annualPrice);
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return 'Custom';
    return `$${price.toLocaleString()}`;
  };

  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm text-cyan-400 font-semibold uppercase tracking-widest mb-3">Pricing</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Simple, Transparent Pricing</h2>
          <p className="text-lg text-slate-400 max-w-3xl mx-auto mb-8">
            Choose the tier that fits your organization. No hidden fees, no lock-in.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 bg-slate-800/50 rounded-full p-1 border border-slate-700/50">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingCycle === 'annual'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Annual <span className="text-xs text-cyber-green ml-1">Save 20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => {
            const displayPrice = billingCycle === 'monthly' 
              ? formatPrice(plan.monthlyPrice)
              : formatPrice(calculateAnnualPrice(plan.monthlyPrice));
            
            const priceLabel = billingCycle === 'monthly' ? '/month' : '/year';

            return (
              <div key={i} className={`relative bg-slate-800/50 border-2 rounded-3xl p-8 transition-all hover:scale-105 ${
                plan.popular ? 'border-cyan-500/50 shadow-2xl shadow-cyan-500/20' : 'border-slate-700/50'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold">
                    MOST POPULAR
                  </div>
                )}
                <h3 className="text-2xl font-bold text-white mb-2">{plan.tier}</h3>
                <div className="mb-2">
                  <span className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    {displayPrice}
                  </span>
                  {plan.monthlyPrice !== null && (
                    <span className="text-sm text-slate-400 ml-2">{priceLabel}</span>
                  )}
                </div>
                {billingCycle === 'annual' && plan.monthlyPrice !== null && (
                  <p className="text-xs text-cyber-green mb-4">
                    Save ${(plan.monthlyPrice * 12 * 0.2).toLocaleString()}/year
                  </p>
                )}
                <p className="text-sm text-slate-400 mb-6">{plan.desc}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className={`w-full px-4 py-3 rounded-xl font-semibold transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/30'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                }`}>
                  {plan.monthlyPrice === null ? 'Contact Sales' : 'Get Started'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
