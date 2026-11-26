import React from "react";

export default function Services() {
  const services = [
    { title: "🌐 Website Development", desc: "I build responsive and modern websites for businesses and personal use." },
    { title: "🎨 Landing Pages", desc: "High-converting landing pages for products, businesses, and services." },
    { title: "🐞 Bug Fixing", desc: "I fix HTML, CSS, and JavaScript issues in existing websites." },
    { title: "📱 Responsive Design", desc: "Making websites work perfectly on mobile, tablet, and desktop." },
  ];

  return (
    <section id="services" className="py-24 px-6 max-w-5xl mx-auto border-t border-white/10">
      <p className="font-mono text-xs text-orange-400 tracking-widest mb-3">// services</p>
      <h2 className="text-3xl sm:text-4xl font-bold font-serif text-white mb-12">What I Offer</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {services.map((s, i) => (
          <div key={i} className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
            <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
            <p className="text-neutral-400 text-sm leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}