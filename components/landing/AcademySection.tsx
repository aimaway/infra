import React from 'react';
import { BookOpen, Award, Users } from 'lucide-react';

export default function AcademySection() {
  const items = [
    { icon: BookOpen, title: 'Training Courses', desc: 'Self-paced and instructor-led training' },
    { icon: Award, title: 'Certifications', desc: 'Validate your expertise with certifications' },
    { icon: Users, title: 'Community', desc: 'Connect with other security professionals' },
  ];

  return (
    <section id="academy" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 to-slate-800/50">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-sm text-cyan-400 font-semibold uppercase tracking-widest mb-3">Education</p>
        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Infracentra Academy</h2>
        <p className="text-lg text-slate-400 max-w-3xl mx-auto mb-12">
          Master the platform with comprehensive training, certifications, and resources.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item, i) => (
            <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 hover:border-cyan-500/30 transition-all">
              <item.icon className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
              <p className="text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
