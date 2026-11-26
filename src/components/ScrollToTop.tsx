"use client";

import React, { useEffect, useState } from "react";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 300);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll to top"
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "45px",
        height: "45px",
        borderRadius: "999px",
        border: "1px solid var(--border-color)",
        background: "var(--bg-card)",
        color: "var(--text-main)",
        fontWeight: 700,
        fontSize: "16px",
        cursor: "pointer",
        boxShadow: "0 5px 15px rgba(0, 0, 0, 0.25)",
        zIndex: 99989,
      }}
    >
      ↑
    </button>
  );
}