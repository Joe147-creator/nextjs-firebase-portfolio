import React from "react";

export default function About() {
  return (
    <section id="about" className="py-24 px-6 max-w-4xl mx-auto border-t border-white/10">
      <p className="font-mono text-xs text-orange-400 tracking-widest mb-3">// about</p>
      <h2 className="text-3xl sm:text-4xl font-bold font-serif text-white mb-8">About Me</h2>
      <div className="space-y-5 text-neutral-400 text-base sm:text-lg leading-relaxed">
        <p>Hi, I&apos;m John Erick, a Frontend Web Developer from Tanzania.</p>
        <p>
          I build modern, responsive, and user-friendly websites using HTML, CSS, and JavaScript. I focus on creating clean and professional user interfaces that work smoothly on all devices, including mobile and desktop.
        </p>
        <p>
          I develop websites such as portfolios, landing pages, and business websites with attention to detail, good design, and smooth user experience. I enjoy turning ideas into real, working web pages that are both functional and visually appealing.
        </p>
        <p>I work on personal projects and continuously improve my skills through real-world practice and frontend development.</p>
        <p className="text-white font-medium pt-2">Let&apos;s build something great together!</p>
      </div>
    </section>
  );
}