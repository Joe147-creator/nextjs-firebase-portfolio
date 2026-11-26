"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db, ALLOWED_ADMIN_EMAIL, PROJECTS_COLLECTION } from "@/lib/firebase";
import { LogOut, Home, Trash2, Edit } from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string;
  techStack?: string;
  liveDemo?: string;
  githubLink?: string;
  images?: string[];
  imageUrl?: string;
}

const MAX_BRANDING_IMAGE_MB = 0.7;
const MAX_RESUME_MB = 0.7;

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsDataURL(file);
  });
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Projects State
  const [projects, setProjects] = useState<Project[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [techStack, setTechStack] = useState("");
  const [liveDemo, setLiveDemo] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Branding State
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [resumeUploading, setResumeUploading] = useState(false);

  // Admin Guard
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser || currentUser.email !== ALLOWED_ADMIN_EMAIL) {
        if (currentUser) {
          await signOut(auth);
        }
        setUser(null);
        setLoadingUser(false);
        router.push("/admin-login");
      } else {
        setUser(currentUser);
        setLoadingUser(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Fetch Projects
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, PROJECTS_COLLECTION), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Project[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Project, "id">),
      }));
      setProjects(list);
    });
    return () => unsubscribe();
  }, [user]);

  // Sync Branding Previews from Firestore
  useEffect(() => {
    if (!user) return;

    const unsubLogo = onSnapshot(doc(db, "settings", "logo"), (snap) => {
      setLogoPreview(snap.exists() && snap.data().image ? snap.data().image : null);
    });

    const unsubProfile = onSnapshot(doc(db, "settings", "profile"), (snap) => {
      setProfilePreview(snap.exists() && snap.data().image ? snap.data().image : null);
    });

    const unsubResume = onSnapshot(doc(db, "settings", "resume"), (snap) => {
      setResumeFileName(snap.exists() && snap.data().fileName ? snap.data().fileName : null);
    });

    return () => {
      unsubLogo();
      unsubProfile();
      unsubResume();
    };
  }, [user]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files).slice(0, 3);
    const tooLarge = fileList.find((f) => f.size > 2 * 1024 * 1024);
    if (tooLarge) {
      alert(`"${tooLarge.name}" is too large. Please use images under 2MB.`);
      e.target.value = "";
      return;
    }

    try {
      const base64Images = await Promise.all(fileList.map(readFileAsBase64));
      setImages(base64Images);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not read images.";
      alert(msg);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setTechStack("");
    setLiveDemo("");
    setGithubLink("");
    setImages([]);
  };

  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert("Title and description are required.");
      return;
    }
    if (!editingId && images.length === 0) {
      alert("Please select at least one project image.");
      return;
    }

    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim(),
        techStack: techStack.trim(),
        liveDemo: liveDemo.trim(),
        githubLink: githubLink.trim(),
      };
      if (images.length > 0) {
        payload.images = images;
      }

      if (editingId) {
        await updateDoc(doc(db, PROJECTS_COLLECTION, editingId), payload);
        alert("Project updated successfully!");
      } else {
        payload.createdAt = serverTimestamp();
        await addDoc(collection(db, PROJECTS_COLLECTION), payload);
        alert("New project published to the live portfolio!");
      }

      resetForm();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      alert(`Publish failed: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (proj: Project) => {
    setEditingId(proj.id);
    setTitle(proj.title || "");
    setDescription(proj.description || "");
    setTechStack(proj.techStack || "");
    setLiveDemo(proj.liveDemo || "");
    setGithubLink(proj.githubLink || "");
    setImages([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this project permanently?")) {
      try {
        await deleteDoc(doc(db, PROJECTS_COLLECTION, id));
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Delete failed";
        alert(msg);
      }
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/admin-login");
  };

  // Branding Handlers
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_BRANDING_IMAGE_MB * 1024 * 1024) {
      alert(`Logo is too large. Please use an image under ${MAX_BRANDING_IMAGE_MB}MB.`);
      e.target.value = "";
      return;
    }
    try {
      const base64 = await readFileAsBase64(file);
      await setDoc(doc(db, "settings", "logo"), {
        image: base64,
        updatedAt: serverTimestamp(),
      });
      e.target.value = "";
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Logo upload failed";
      alert(msg);
    }
  };

  const handleRemoveLogo = async () => {
    if (!confirm("Remove your logo and revert to the default?")) return;
    await deleteDoc(doc(db, "settings", "logo"));
  };

  const handleProfileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_BRANDING_IMAGE_MB * 1024 * 1024) {
      alert(`Profile picture is too large. Please use an image under ${MAX_BRANDING_IMAGE_MB}MB.`);
      e.target.value = "";
      return;
    }
    try {
      const base64 = await readFileAsBase64(file);
      await setDoc(doc(db, "settings", "profile"), {
        image: base64,
        updatedAt: serverTimestamp(),
      });
      e.target.value = "";
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Profile upload failed";
      alert(msg);
    }
  };

  const handleRemoveProfile = async () => {
    if (!confirm("Remove your profile picture and revert to the default?")) return;
    await deleteDoc(doc(db, "settings", "profile"));
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file for your resume.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_RESUME_MB * 1024 * 1024) {
      alert(`Resume PDF is too large. Please use a file under ${MAX_RESUME_MB}MB.`);
      e.target.value = "";
      return;
    }
    try {
      setResumeUploading(true);
      const base64 = await readFileAsBase64(file);
      await setDoc(doc(db, "settings", "resume"), {
        fileBase64: base64,
        fileName: file.name,
        updatedAt: serverTimestamp(),
      });
      e.target.value = "";
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Resume upload failed";
      alert(msg);
    } finally {
      setResumeUploading(false);
    }
  };

  const handleRemoveResume = async () => {
    if (!confirm("Remove your resume? The download button will disappear from your site.")) return;
    await deleteDoc(doc(db, "settings", "resume"));
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-[#0b0b0d] flex items-center justify-center text-white font-mono">
        Checking authentication...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-white">
      <nav className="flex items-center justify-between px-8 py-4 bg-white/[0.02] border-b border-white/10">
        <div className="font-bold text-lg text-orange-400">Admin Portal</div>
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-300 hover:text-white transition-colors"
          >
            <Home className="w-4 h-4" />
            Home Return
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 font-semibold text-xs hover:bg-red-500 hover:text-white transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold font-serif text-center mb-10">
          Portfolio Management Hub
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white/[0.03] border border-white/10 rounded-2xl p-8 mb-12">
          <div>
            <h3 className="text-lg font-bold text-white mb-6 pb-2 border-b border-white/10">
              {editingId ? "Edit Existing Project" : "Add New Project"}
            </h3>
            <form onSubmit={handleSubmitProject} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Student Management System"
                  required
                  className="w-full bg-[#171717] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description of the project..."
                  required
                  rows={3}
                  className="w-full bg-[#171717] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 resize-vertical"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">Tech Stack</label>
                <input
                  type="text"
                  value={techStack}
                  onChange={(e) => setTechStack(e.target.value)}
                  placeholder="e.g., HTML, CSS, JavaScript, Firebase"
                  className="w-full bg-[#171717] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">
                  Live Demo URL
                </label>
                <input
                  type="text"
                  value={liveDemo}
                  onChange={(e) => setLiveDemo(e.target.value)}
                  placeholder="e.g., myproject.netlify.app"
                  className="w-full bg-[#171717] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">
                  GitHub Repository URL
                </label>
                <input
                  type="text"
                  value={githubLink}
                  onChange={(e) => setGithubLink(e.target.value)}
                  placeholder="e.g., github.com/username/repo"
                  className="w-full bg-[#171717] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">
                  Project Images (up to 3)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="w-full text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-500 file:text-white hover:file:bg-orange-600"
                />
                {images.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt="Preview"
                        className="w-14 h-14 object-cover rounded-lg border border-white/10"
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold text-sm transition-colors shadow-lg shadow-orange-500/20"
                >
                  {submitting
                    ? "Publishing project..."
                    : editingId
                    ? "Save Changes"
                    : "Publish Project to Cloud Portfolio"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-neutral-300"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-6 pb-2 border-b border-white/10">Tips</h3>
            <div className="space-y-4 text-sm text-neutral-400 leading-relaxed">
              <p>
                &bull; Images are stored directly in your database as compact previews — no separate
                file storage setup needed.
              </p>
              <p>&bull; Keep each image under 2MB for the fastest publishing.</p>
              <p>
                &bull; When editing a project, leave the image field empty to keep the existing
                images.
              </p>
              <p>
                &bull; Changes appear on your live portfolio instantly, and persist across refreshes.
              </p>
            </div>
          </div>
        </div>

        {/* Project Management List */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 mb-12">
          <h2 className="text-xl font-bold font-serif mb-6">Project Management &amp; Quick Review</h2>
          {projects.length === 0 ? (
            <p className="text-sm text-neutral-400">No existing database projects found.</p>
          ) : (
            <div className="space-y-4">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-5 rounded-xl bg-[#171717] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div>
                    <h4 className="font-bold text-white text-base mb-1">{proj.title}</h4>
                    <p className="text-xs text-neutral-400">{proj.techStack || ""}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleEdit(proj)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-400 text-slate-950 font-semibold text-xs hover:brightness-110 transition"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(proj.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500 text-white font-semibold text-xs hover:brightness-110 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Site Branding */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8">
          <h2 className="text-xl font-bold font-serif mb-2">Site Branding</h2>
          <p className="text-xs text-neutral-400 mb-6">
            Update your logo, profile picture, and resume — changes go live on your portfolio
            instantly, no separate save step needed.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Logo */}
            <div className="p-5 rounded-xl bg-[#171717] border border-white/10 text-center">
              <h4 className="font-semibold text-sm mb-3">Site Logo</h4>
              {logoPreview && (
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="w-[70px] h-[70px] rounded-full object-cover mx-auto mb-3 border border-white/15"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="w-full text-xs text-neutral-400"
              />
              {logoPreview && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="mt-3 px-3 py-1.5 rounded-lg border border-red-500 text-red-400 text-xs font-semibold hover:bg-red-500 hover:text-white transition"
                >
                  Remove Logo
                </button>
              )}
            </div>

            {/* Profile Picture */}
            <div className="p-5 rounded-xl bg-[#171717] border border-white/10 text-center">
              <h4 className="font-semibold text-sm mb-3">Profile Picture</h4>
              {profilePreview && (
                <img
                  src={profilePreview}
                  alt="Profile picture preview"
                  className="w-[100px] h-[100px] rounded-full object-cover mx-auto mb-3 border border-white/15"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleProfileUpload}
                className="w-full text-xs text-neutral-400"
              />
              {profilePreview && (
                <button
                  type="button"
                  onClick={handleRemoveProfile}
                  className="mt-3 px-3 py-1.5 rounded-lg border border-red-500 text-red-400 text-xs font-semibold hover:bg-red-500 hover:text-white transition"
                >
                  Remove Photo
                </button>
              )}
            </div>

            {/* Resume PDF */}
            <div className="p-5 rounded-xl bg-[#171717] border border-white/10 text-center">
              <h4 className="font-semibold text-sm mb-3">Resume (PDF)</h4>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleResumeUpload}
                className="w-full text-xs text-neutral-400"
              />
              <p className="text-xs font-mono text-orange-400 mt-3">
                {resumeUploading
                  ? "Uploading..."
                  : resumeFileName
                  ? `Current file: ${resumeFileName}`
                  : "No resume uploaded yet."}
              </p>
              {resumeFileName && (
                <button
                  type="button"
                  onClick={handleRemoveResume}
                  className="mt-3 px-3 py-1.5 rounded-lg border border-red-500 text-red-400 text-xs font-semibold hover:bg-red-500 hover:text-white transition"
                >
                  Remove Resume
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}