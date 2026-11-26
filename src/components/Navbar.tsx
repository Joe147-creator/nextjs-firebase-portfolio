"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [logoSrc, setLogoSrc] = useState("/images/logo.png");

  // Sync site logo from Firestore settings/logo
  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "settings", "logo"),
      (snap) => {
        if (snap.exists() && snap.data().image) {
          setLogoSrc(snap.data().image);
        } else {
          setLogoSrc("/images/logo.png");
        }
      },
      (err) => console.error("Logo load error:", err)
    );
    return () => unsub();
  }, []);

  // Live clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setDateStr(now.toLocaleDateString());
      setTimeStr(now.toLocaleTimeString());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Initial theme from localStorage / documentElement
  useEffect(() => {
    const saved =
      (document.documentElement.getAttribute("data-theme") as "dark" | "light" | null) ||
      (localStorage.getItem("portfolio-theme") as "dark" | "light" | null) ||
      "dark";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  const handleToggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("portfolio-theme", next);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <Link href="#home" className="brand" onClick={closeMenu}>
        <span className="brand-badge">
          <img id="siteLogo" src={logoSrc} alt="John Erick logo" />
        </span>
        <span className="brand-name">John Erick</span>
      </Link>

      <div className="nav-controls">
        <div className="time-box">
          <span id="liveDate">{dateStr}</span>
          <span id="liveTime">{timeStr}</span>
        </div>

        <button
          id="themeToggle"
          className="theme-toggle-btn"
          type="button"
          onClick={handleToggleTheme}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? (
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M17 11.3A7.3 7.3 0 1 1 8.7 3a5.8 5.8 0 0 0 8.3 8.3z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <circle cx="10" cy="10" r="4" stroke="currentColor" strokeWidth="1.6" />
              <path
                d="M10 1.5v2M10 16.5v2M18.5 10h-2M3.5 10h-2M15.6 4.4l-1.4 1.4M5.8 14.2l-1.4 1.4M15.6 15.6l-1.4-1.4M5.8 5.8L4.4 4.4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>

        <div
          className="menu-toggle"
          id="menuToggle"
          role="button"
          tabIndex={0}
          aria-label="Toggle navigation menu"
          onClick={() => setMenuOpen((prev) => !prev)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setMenuOpen((prev) => !prev);
            }
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M2.5 5h15M2.5 10h15M2.5 15h15"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      <ul className={`nav-links ${menuOpen ? "show" : ""}`} id="navLinks">
        <li>
          <Link href="#home" onClick={closeMenu}>
            Home
          </Link>
        </li>
        <li>
          <Link href="#about" onClick={closeMenu}>
            About
          </Link>
        </li>
        <li>
          <Link href="#skills" onClick={closeMenu}>
            Skills
          </Link>
        </li>
        <li>
          <Link href="#projects" onClick={closeMenu}>
            Projects
          </Link>
        </li>
        <li>
          <Link href="#contact" onClick={closeMenu}>
            Contact
          </Link>
        </li>
        <li>
          <Link href="#roadmap" onClick={closeMenu}>
            Roadmap
          </Link>
        </li>
        <li>
          <Link href="/admin-login" onClick={closeMenu}>
            Admin Login
          </Link>
        </li>
      </ul>
    </nav>
  );
}