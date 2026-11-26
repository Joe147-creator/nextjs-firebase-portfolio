import React from "react";
import { Mail, Phone, MessageSquare, Code2 } from "lucide-react";

export default function Contact() {
  return (
    <section id="contact" className="py-24 px-6 max-w-4xl mx-auto border-t border-white/10 text-center">
      <p className="font-mono text-xs text-orange-400 tracking-widest mb-3">// contact</p>
      <h2 className="text-3xl sm:text-4xl font-bold font-serif text-white mb-4">Get In Touch</h2>
      <p className="text-neutral-400 mb-12">Have a project idea or need a website? Click any option below to contact me directly.</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 text-left">
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-4">
          <Mail className="w-6 h-6 text-orange-400 flex-shrink-0" />
          <div>
            <div className="text-xs text-neutral-400 font-mono">Email</div>
            <a href="mailto:batholomeo022@gmail.com" className="text-white hover:text-orange-400 text-sm font-medium transition-colors">batholomeo022@gmail.com</a>
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-4">
          <Phone className="w-6 h-6 text-orange-400 flex-shrink-0" />
          <div>
            <div className="text-xs text-neutral-400 font-mono">Phone</div>
            <a href="tel:+255767125118" className="text-white hover:text-orange-400 text-sm font-medium transition-colors">+255 767125118</a>
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-4">
          <MessageSquare className="w-6 h-6 text-orange-400 flex-shrink-0" />
          <div>
            <div className="text-xs text-neutral-400 font-mono">WhatsApp</div>
            <a href="https://wa.me/255767125118" target="_blank" rel="noopener noreferrer" className="text-white hover:text-orange-400 text-sm font-medium transition-colors">Chat on WhatsApp</a>
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-4">
          <Code2 className="w-6 h-6 text-orange-400 flex-shrink-0" />
          <div>
            <div className="text-xs text-neutral-400 font-mono">GitHub</div>
            <a href="https://github.com/Joe147-creator" target="_blank" rel="noopener noreferrer" className="text-white hover:text-orange-400 text-sm font-medium transition-colors">github.com/Joe147-creator</a>
          </div>
        </div>
      </div>

      <a href="mailto:batholomeo022@gmail.com" className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition-colors shadow-lg shadow-orange-500/20">
        Send Email
      </a>
    </section>
  );
}