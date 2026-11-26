import React from "react";
import { Code, Server, Briefcase } from "lucide-react";

export default function Roadmap() {
  const steps = [
    { icon: <Code className="w-6 h-6 text-orange-400" />, title: "Frontend Development", points: ["HTML, CSS, JavaScript", "Responsive Websites", "UI Design Skills"], status: "Improving" },
    { icon: <Server className="w-6 h-6 text-orange-400" />, title: "Backend Development", points: ["APIs", "Node.js Fundamentals", "Database"], status: "Improving" },
    { icon: <Briefcase className="w-6 h-6 text-orange-400" />, title: "Freelancing", points: ["Portfolio Building", "Client Communication", "Real Projects Practice"], status: "Starting" },
  ];

  return (
    <section id="roadmap" className="py-24 px-6 max-w-5xl mx-auto border-t border-white/10">
      <p className="font-mono text-xs text-orange-400 tracking-widest mb-3">// roadmap</p>
      <h2 className="text-3xl sm:text-4xl font-bold font-serif text-white mb-4">My Developer Roadmap</h2>
      <p className="text-neutral-400 mb-12">My learning journey as a Software Developer — what I&apos;ve done and what I&apos;m improving next.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((s, i) => (
          <div key={i} className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              {s.icon}
              <h3 className="font-bold text-white text-lg">{s.title}</h3>
            </div>
            <ul className="space-y-2 text-neutral-300 text-sm">
              {s.points.map((pt, idx) => (
                <li key={idx}>✔ {pt}</li>
              ))}
            </ul>
            <div className="pt-2 border-t border-white/10 text-xs font-mono text-neutral-400">
              <strong>Status:</strong> {s.status}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}