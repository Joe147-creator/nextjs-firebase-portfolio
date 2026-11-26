"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, ArrowLeft, Globe } from "lucide-react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut,
  User,
} from "firebase/auth";
import { auth, ALLOWED_ADMIN_EMAIL } from "@/lib/firebase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ text: "", isError: false });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email === ALLOWED_ADMIN_EMAIL) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg({ text: "", isError: false });

    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      if (credential.user.email !== ALLOWED_ADMIN_EMAIL) {
        await signOut(auth);
        setStatusMsg({ text: "Access denied: unauthorized account.", isError: true });
        return;
      }
      setStatusMsg({ text: "Access granted! Redirecting...", isError: false });
      router.push("/admin-dashboard");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to sign in.";
      setStatusMsg({ text: `Login failed: ${message}`, isError: true });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setStatusMsg({ text: "", isError: false });
    const provider = new GoogleAuthProvider();

    try {
      const credential = await signInWithPopup(auth, provider);
      if (credential.user.email !== ALLOWED_ADMIN_EMAIL) {
        await signOut(auth);
        setStatusMsg({ text: "Access denied: unauthorized Google account.", isError: true });
        return;
      }
      setStatusMsg({ text: "Google sign-in successful! Redirecting...", isError: false });
      router.push("/admin-dashboard");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Google sign-in failed.";
      setStatusMsg({ text: message, isError: true });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setStatusMsg({ text: "Please enter your email address for password reset.", isError: true });
      return;
    }

    try {
      await sendPasswordResetEmail(auth, resetEmail.trim());
      setStatusMsg({ text: "Password reset email sent! Check your inbox.", isError: false });
      setShowResetModal(false);
      setResetEmail("");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to send reset email.";
      setStatusMsg({ text: message, isError: true });
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setStatusMsg({ text: "Signed out. Enter your credentials to log back in.", isError: false });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0b0b0d] text-white">
      <div className="w-full max-w-md p-8 rounded-2xl bg-white/[0.03] border border-white/10 shadow-2xl relative">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold font-serif text-orange-400 mb-2">Admin Security Gate</h2>
          <p className="text-sm text-neutral-400">
            Please sign in with the administrator account to manage the portfolio.
          </p>
        </div>

        {currentUser && (
          <div className="mb-6 p-4 rounded-xl bg-orange-500/10 border border-orange-500/30 text-center">
            <p className="text-sm text-white mb-3">
              You&apos;re already signed in as{" "}
              <span className="font-mono text-orange-400">{currentUser.email}</span>.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.push("/admin-dashboard")}
                className="flex-1 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs transition-colors"
              >
                Go to Dashboard
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 text-xs transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-neutral-400 mb-1.5">
              Admin Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                autoComplete="username"
                className="w-full bg-[#171717] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono text-neutral-400">Password</label>
              <button
                type="button"
                onClick={() => setShowResetModal(true)}
                className="text-xs text-orange-400 hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full bg-[#171717] border border-white/10 rounded-xl py-3 pl-10 pr-11 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold text-sm transition-colors shadow-lg shadow-orange-500/20 mt-2"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-white/10" />
          <span className="flex-shrink mx-4 text-xs font-mono text-neutral-500">OR</span>
          <div className="flex-grow border-t border-white/10" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2.5"
        >
          <Globe className="w-4 h-4 text-orange-400" />
          Sign in with Google
        </button>

        {statusMsg.text && (
          <p
            className={`mt-4 text-xs text-center font-mono ${
              statusMsg.isError ? "text-red-400" : "text-emerald-400"
            }`}
          >
            {statusMsg.text}
          </p>
        )}

        <div className="mt-8 text-center border-t border-white/10 pt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Cancel &amp; Return to Home Portfolio
          </Link>
        </div>
      </div>

      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm p-6 rounded-2xl bg-[#121212] border border-white/10 space-y-4">
            <h3 className="text-lg font-bold text-white">Reset Password</h3>
            <p className="text-xs text-neutral-400">
              Enter your admin email address and we&apos;ll send you a password reset link.
            </p>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full bg-[#171717] border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-orange-500"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-xs font-semibold text-white"
                >
                  Send Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}