"use client";

import React, { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_PROMPTS = [
  "What services do you offer?",
  "Show me your recent projects",
  "Why should I hire you?",
  "How can I start a project?",
];

export default function PortfolioAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm John Erick's AI assistant. Ask me about services, tech stack, live projects, or how to get started on your website or app.",
    },
  ]);

  const listEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      listEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || loading) return;

    const nextMessages: Message[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Request failed");
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply || "No response received." },
      ]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not reach assistant.";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `${msg} You can also reach out directly through the Contact section below.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "32px",
        right: "24px",
        zIndex: 99990,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
      }}
    >
      {isOpen && (
        <div
          role="dialog"
          aria-label="Portfolio AI Assistant"
          style={{
            width: "min(370px, calc(100vw - 32px))",
            maxHeight: "480px",
            marginBottom: "12px",
            borderRadius: "16px",
            background: "var(--bg-primary, var(--bg))",
            color: "var(--text-main)",
            border: "1px solid var(--border-color)",
            boxShadow: "0 18px 44px rgba(0, 0, 0, 0.35)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid var(--border-color)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "var(--bg-card)",
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-main)" }}>
                JE Tech · AI Assistant
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                Online · Client Q&amp;A
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <a
                href="#contact"
                onClick={() => setIsOpen(false)}
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  padding: "4px 10px",
                  borderRadius: "999px",
                  background: "var(--accent-soft, rgba(16, 185, 129, 0.15))",
                  color: "var(--accent)",
                  textDecoration: "none",
                }}
              >
                Hire Me
              </a>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat assistant"
                style={{
                  background: "transparent",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-main)",
                  borderRadius: "8px",
                  width: "28px",
                  height: "28px",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                ×
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            style={{
              padding: "14px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              flex: 1,
            }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                  padding: "10px 12px",
                  borderRadius: "12px",
                  fontSize: "13px",
                  lineHeight: 1.5,
                  background: msg.role === "user" ? "var(--accent)" : "var(--bg-card)",
                  color:
                    msg.role === "user"
                      ? "var(--accent-contrast, #ffffff)"
                      : "var(--text-main)",
                  border: msg.role === "user" ? "none" : "1px solid var(--border-color)",
                  whiteSpace: "pre-wrap",
                }}
              >
                {msg.content}
              </div>
            ))}

            {loading && (
              <div
                style={{
                  alignSelf: "flex-start",
                  padding: "8px 12px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-color)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                Typing...
              </div>
            )}

            <div ref={listEndRef} />
          </div>

          {/* Quick Prompts */}
          <div
            style={{
              padding: "0 14px 10px",
              display: "flex",
              gap: "6px",
              flexWrap: "wrap",
            }}
          >
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => sendMessage(prompt)}
                disabled={loading}
                style={{
                  fontSize: "11px",
                  padding: "5px 9px",
                  borderRadius: "999px",
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-card)",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                }}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              gap: "8px",
              padding: "10px 12px",
              borderTop: "1px solid var(--border-color)",
              background: "var(--bg-card)",
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about services, projects, pricing..."
              disabled={loading}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: "10px",
                border: "1px solid var(--border-color)",
                background: "var(--bg)",
                color: "var(--text-main)",
                fontSize: "13px",
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                padding: "8px 14px",
                borderRadius: "10px",
                border: "none",
                background: "var(--accent)",
                color: "var(--accent-contrast, #ffffff)",
                fontWeight: 700,
                fontSize: "13px",
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                opacity: loading || !input.trim() ? 0.65 : 1,
              }}
            >
              Send
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Toggle AI portfolio assistant"
        style={{
          height: "45px",
          padding: "0 16px",
          borderRadius: "999px",
          border: "1px solid var(--border-color)",
          background: "var(--accent)",
          color: "var(--accent-contrast, #ffffff)",
          fontWeight: 700,
          fontSize: "13px",
          cursor: "pointer",
          boxShadow: "0 6px 18px rgba(0, 0, 0, 0.3)",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <span>{isOpen ? "Close AI" : "Ask AI"}</span>
      </button>
    </div>
  );
}