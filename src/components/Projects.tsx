"use client";

import React, { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db, PROJECTS_COLLECTION } from "@/lib/firebase";

interface ProjectItem {
  id: string;
  title?: string;
  description?: string;
  techStack?: string;
  liveDemo?: string;
  link?: string;
  githubLink?: string;
  github?: string;
  githubUrl?: string;
  images?: string[];
  imageUrl?: string;
}

function normalizeUrl(url?: string): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (!trimmed || trimmed === "#") return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return "https://" + trimmed;
}

export default function Projects() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "empty" | "error">("loading");

  useEffect(() => {
    const q = query(collection(db, PROJECTS_COLLECTION), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          setProjects([]);
          setStatus("empty");
          return;
        }
        const items: ProjectItem[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<ProjectItem, "id">),
        }));
        setProjects(items);
        setStatus("ready");
      },
      (error) => {
        console.error("Failed to load projects:", error);
        setStatus("error");
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <section id="projects" className="section">
      <p className="eyebrow">// projects</p>
      <h2>My Projects</h2>

      <div className="project-grid" id="projectsContainer">
        {status === "loading" && <p className="loading-state">Loading projects...</p>}
        {status === "empty" && (
          <p className="loading-state">No projects published yet. Check back soon!</p>
        )}
        {status === "error" && (
          <p className="loading-state">⚠️ Couldn&apos;t load projects right now. Please refresh.</p>
        )}
        {status === "ready" &&
          projects.map((project) => {
            const images =
              Array.isArray(project.images) && project.images.length > 0
                ? project.images
                : project.imageUrl
                ? [project.imageUrl]
                : [];
            const liveLink = normalizeUrl(project.liveDemo || project.link);
            const githubLink = normalizeUrl(
              project.githubLink || project.github || project.githubUrl
            );

            return (
              <div key={project.id} className="project-card dynamic-project-card">
                {images.map((src, idx) => (
                  <img
                    key={idx}
                    src={src}
                    alt={project.title || "Project preview"}
                    loading="lazy"
                  />
                ))}
                <h3>{project.title || "Untitled Project"}</h3>
                <p>{project.description || ""}</p>
                {project.techStack && (
                  <p>
                    <strong>Tech:</strong> {project.techStack}
                  </p>
                )}
                <div className="project-links">
                  {liveLink && (
                    <a href={liveLink} target="_blank" rel="noopener noreferrer">
                      🌐 Live Demo
                    </a>
                  )}
                  {githubLink && (
                    <a href={githubLink} target="_blank" rel="noopener noreferrer">
                      💻 GitHub
                    </a>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </section>
  );
}