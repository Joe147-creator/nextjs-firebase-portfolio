import React from "react";
import { Code, Server, Bug, Globe } from "lucide-react";

export default function Pricing() {
  const plans = [
    { icon: <Code className="w-5 h-5 text-orange-400" />, title: "Frontend Development", price: "$10 – $30", items: ["HTML, CSS, JavaScript UI", "Responsive design", "Landing pages", "Portfolio websites"], btn: "Hire for Frontend" },
    { icon: <Server className="w-5 h-5 text-orange-400" />, title: "Backend Development", price: "$20 – $60", items: ["APIs (Node.js basics)", "Database connection", "Server logic", "Form handling"], btn: "Hire for Backend" },
    { icon: <Bug className="w-5 h-5 text-orange-400" />, title: "Bug Fixing", price: "$5 – $20", items: ["HTML/CSS fixes", "JavaScript errors", "Layout issues", "Small improvements"], btn: "Fix My Website" },
    { icon: <Globe className="w-5 h-5 text-orange-400" />, title: "Full Website", price: "$30 – $100", items: ["Complete website build", "Frontend + basic backend", "Mobile friendly design", "Deployment ready"], btn: "Build My Website" },
  ];

  return (
    <section id="pricing" className="py-24 px-6 max-w-6xl mx-auto border-t border-white/10">
      <p className="font-mono text-xs text-orange-400 tracking-widest mb-3">// pricing</p>
      <h2 className="text-3xl sm:text-4xl font-bold font-serif text-white mb-4">My Pricing</h2>
      <p className="text-neutral-400 mb-12">Simple and affordable pricing based on the type of work.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((p, i) => (
          <div key={i} className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                {p.icon}
                <h3 className="font-bold text-white text-sm">{p.title}</h3>
              </div>
              <div className="text-3xl font-bold text-white mb-6">{p.price}</div>
              <ul className="space-y-2.5 mb-8 text-neutral-300 text-sm">
                {p.items.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-orange-400">✔</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <a href="#contact" className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium text-center text-sm transition-colors">
              {p.btn}
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}