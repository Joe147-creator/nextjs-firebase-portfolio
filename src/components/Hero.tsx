"use client";

import React, { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

const WORDS = ["JE Tech", "Web Developer", "Software Engineer", "Freelancer"];

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(",");
  const mimeMatch = header.match(/data:(.*?);base64/);
  const mime = mimeMatch ? mimeMatch[1] : "application/pdf";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

export default function Hero() {
  const [typedText, setTypedText] = useState("JE Tech");
  const [profileSrc, setProfileSrc] = useState("/images/Joe.jpg");
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [resumeFileName, setResumeFileName] = useState("resume.pdf");

  // Typewriter effect
  useEffect(() => {
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    function typeEffect() {
      const currentWord = WORDS[wordIndex];
      charIndex = isDeleting ? charIndex - 1 : charIndex + 1;
      setTypedText(currentWord.substring(0, charIndex));

      if (!isDeleting && charIndex === currentWord.length) {
        isDeleting = true;
        timeoutId = setTimeout(typeEffect, 1000);
        return;
      }

      if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % WORDS.length;
      }

      timeoutId = setTimeout(typeEffect, isDeleting ? 60 : 120);
    }

    typeEffect();
    return () => clearTimeout(timeoutId);
  }, []);

  // Sync profile picture from Firestore settings/profile (falls back to /images/Joe.jpg)
  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "settings", "profile"),
      (snap) => {
        if (snap.exists() && snap.data().image) {
          setProfileSrc(snap.data().image);
        } else {
          setProfileSrc("/images/Joe.jpg");
        }
      },
      (err) => console.error("Profile image load error:", err)
    );
    return () => unsub();
  }, []);

  // Sync resume PDF from Firestore settings/resume
  useEffect(() => {
    let activeBlobUrl: string | null = null;

    const unsub = onSnapshot(
      doc(db, "settings", "resume"),
      (snap) => {
        if (activeBlobUrl) {
          URL.revokeObjectURL(activeBlobUrl);
          activeBlobUrl = null;
        }

        if (snap.exists() && snap.data().fileBase64) {
          const blob = dataUrlToBlob(snap.data().fileBase64);
          activeBlobUrl = URL.createObjectURL(blob);
          setResumeUrl(activeBlobUrl);
          setResumeFileName(snap.data().fileName || "resume.pdf");
        } else {
          setResumeUrl(null);
        }
      },
      (err) => console.error("Resume load error:", err)
    );

    return () => {
      unsub();
      if (activeBlobUrl) {
        URL.revokeObjectURL(activeBlobUrl);
      }
    };
  }, []);

  return (
    <section id="home" className="hero">
      <div className="hero-decor" aria-hidden="true">
        <div className="hero-glow" />
        <div className="hero-rays" />
        <svg
          className="hero-illustration"
          viewBox="0 0 480 420"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="70"
            y="60"
            width="300"
            height="200"
            rx="10"
            stroke="currentColor"
            strokeWidth="2"
            opacity="0.55"
          />
          <rect
            x="70"
            y="60"
            width="300"
            height="34"
            rx="10"
            stroke="currentColor"
            strokeWidth="2"
            opacity="0.55"
          />
          <circle cx="88" cy="77" r="4" fill="currentColor" opacity="0.55" />
          <circle cx="102" cy="77" r="4" fill="currentColor" opacity="0.4" />
          <circle cx="116" cy="77" r="4" fill="currentColor" opacity="0.25" />
          <path
            d="M100 120h120M100 140h180M100 160h90M100 180h150M100 200h60"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.35"
          />
          <path d="M40 300h400" stroke="currentColor" strokeWidth="2" opacity="0.3" />
          <path d="M120 300v40M360 300v40" stroke="currentColor" strokeWidth="2" opacity="0.3" />
          <path d="M60 340h360l-20 40H80z" stroke="currentColor" strokeWidth="2" opacity="0.3" />
          <path
            d="M230 90l6 14 14 6-14 6-6 14-6-14-14-6 14-6z"
            fill="currentColor"
            opacity="0.5"
          />
        </svg>
      </div>

      <div className="hero-inner">
        <img
          id="profilePic"
          src={profileSrc}
          alt="Profile picture of John Erick"
          className="profile-pic"
        />

        <p className="eyebrow">// portfolio — 2026</p>

        <h1 className="hero-title">
          Building interfaces
          <br />
          <em>that feel inevitable.</em>
        </h1>

        <p className="hero-role">
          <span className="hero-role-name">John Erick</span> — <span id="text">{typedText}</span>
          <span className="cursor">|</span>
        </p>

        <p className="intro">
          I design and build fast, responsive, user-friendly websites and web applications — from
          landing pages to full front-end systems.
        </p>

        <div className="hero-actions">
          <a href="#contact" className="btn">
            Hire me <span aria-hidden="true">→</span>
          </a>
          <a href="#projects" className="btn btn-outline">
            View projects
          </a>
          {resumeUrl && (
            <a
              id="resumeDownloadLink"
              href={resumeUrl}
              download={resumeFileName}
              className="btn btn-ghost"
            >
              Résumé ↓
            </a>
          )}
        </div>

        <p className="availability-badge">
          <span className="dot" /> Open for freelance work · limited slots
        </p>
      </div>
    </section>
  );
}