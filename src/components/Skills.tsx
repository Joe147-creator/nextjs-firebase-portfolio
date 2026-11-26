import React from "react";

export default function Skills() {
  const skillList = [
    { name: "HTML", icon: "fa-brands fa-html5" },
    { name: "CSS", icon: "fa-brands fa-css3-alt" },
    { name: "JavaScript", icon: "fa-brands fa-js" },
    { name: "Git", icon: "fa-brands fa-git-alt" },
    { name: "GitHub", icon: "fa-brands fa-github" },
    { name: "Responsive Design", icon: "fa-solid fa-mobile-screen" },
    { name: "APIs", icon: "fa-solid fa-plug", status: "Improving" },
    { name: "React", icon: "fa-brands fa-react", status: "Improving" },
    { name: "Next.js", icon: "fa-solid fa-forward", status: "Improving" },
    { name: "MySQL", icon: "fa-solid fa-database" },
    { name: "PostgreSQL", icon: "fa-solid fa-database", status: "Improving" },
    { name: "Node.js + Express", icon: "fa-brands fa-node-js", status: "Improving" },
  ];

  return (
    <section id="skills" className="py-24 px-6 max-w-5xl mx-auto border-t border-white/10">
      <p className="font-mono text-xs text-orange-400 tracking-widest mb-3">// skills</p>
      <h2 className="text-3xl sm:text-4xl font-bold font-serif text-white mb-12">Skills</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {skillList.map((skill, i) => (
          <div key={i} className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-orange-500/40 transition-colors flex flex-col items-center text-center gap-3">
            <i className={`${skill.icon} text-3xl text-orange-400`} />
            <span className="font-semibold text-white text-sm">{skill.name}</span>
            {skill.status && (
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/5 text-neutral-400">
                Status: {skill.status}
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}