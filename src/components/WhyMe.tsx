import React from "react";

export default function WhyMe() {
  const reasons = [
    { title: "⚡ Fast Delivery", desc: "I complete projects quickly without compromising quality." },
    { title: "📱 Mobile-Friendly", desc: "All websites I build work perfectly on phones, tablets, and desktops." },
    { title: "🧼 Clean Code", desc: "I write simple, organized, and easy-to-maintain code." },
    { title: "🤝 Good Communication", desc: "I keep clients updated and understand project requirements clearly." },
    { title: "💰 Affordable Pricing", desc: "As a beginner freelancer, I offer budget-friendly services." },
  ];

  return (
    <section id="why-me" className="py-24 px-6 max-w-5xl mx-auto border-t border-white/10">
      <p className="font-mono text-xs text-orange-400 tracking-widest mb-3">// why me</p>
      <h2 className="text-3xl sm:text-4xl font-bold font-serif text-white mb-12">Why Hire Me</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {reasons.map((r, i) => (
          <div key={i} className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
            <h3 className="text-lg font-bold text-white mb-2">{r.title}</h3>
            <p className="text-neutral-400 text-sm leading-relaxed">{r.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}