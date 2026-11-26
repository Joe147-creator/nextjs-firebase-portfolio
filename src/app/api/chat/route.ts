import { NextRequest, NextResponse } from "next/server";
import {
  collection,
  getDocs,
  orderBy,
  query,
  type DocumentData,
  type QuerySnapshot,
} from "firebase/firestore";
import { db, PROJECTS_COLLECTION } from "@/lib/firebase";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function formatProjectDocs(snapshot: QuerySnapshot<DocumentData>): string {
  if (snapshot.empty) {
    return "- Live projects are currently being updated in the Projects section.";
  }

  return snapshot.docs
    .map((docSnap) => {
      const data = docSnap.data();
      const title = data.title || "Untitled Project";
      const desc = data.description || "";
      const tech = Array.isArray(data.techStack)
        ? ` | Tech: ${data.techStack.join(", ")}`
        : data.techStack
          ? ` | Tech: ${data.techStack}`
          : "";
      const demo = data.liveDemo ? ` | Live Demo: ${data.liveDemo}` : "";
      const repo = data.githubLink ? ` | GitHub: ${data.githubLink}` : "";
      return `- ${title}: ${desc}${tech}${demo}${repo}`;
    })
    .join("\n");
}

async function getLiveProjectsSummary(): Promise<string> {
  if (!db) {
    return "- Visitors can browse featured projects directly in the #projects section on this page.";
  }

  const colName = PROJECTS_COLLECTION || "projects";

  const fetchSnapshot = async (): Promise<QuerySnapshot<DocumentData> | null> => {
    try {
      const q = query(collection(db, colName), orderBy("createdAt", "desc"));
      return await getDocs(q);
    } catch {
      try {
        return await getDocs(collection(db, colName));
      } catch {
        return null;
      }
    }
  };

  try {
    const snapshot = await Promise.race([
      fetchSnapshot(),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000)),
    ]);

    if (!snapshot) {
      return "- Visitors can browse featured projects directly in the #projects section on this page.";
    }

    return formatProjectDocs(snapshot);
  } catch (error) {
    console.error("Failed to load live projects for AI context:", error);
    return "- Visitors can browse featured projects directly in the #projects section on this page.";
  }
}

function buildSystemPrompt(liveProjectsText: string): string {
  return `
You are the official AI Portfolio Assistant for John Erick (Erick / JE Tech), a Full-Stack & Frontend Software Engineer based in Tanzania.
Your job is to warmly, concisely, and accurately answer prospective clients and visitors browsing his portfolio website.

=== PORTFOLIO OVERVIEW ===
- Brand & Identity: John Erick (JE Tech) — "Building interfaces that feel inevitable."
- Availability: Currently open for freelance work and select engineering roles (limited slots).
- Core Value Proposition ("Why Hire Me"):
  1. Fast Delivery — completes projects quickly without compromising quality.
  2. Mobile-Friendly — every website works seamlessly across phones, tablets, and desktops.
  3. Clean Code — simple, organized, maintainable architecture.
  4. Good Communication — keeps clients updated and clarifies project requirements clearly.
  5. Affordable Pricing — budget-friendly rates tailored for startups, businesses, and individuals.

=== TECHNICAL SKILLS & STACK ===
- Frontend: HTML5, CSS3, JavaScript, TypeScript, React, Next.js, Tailwind CSS, responsive UI/UX design.
- Backend & Databases: Node.js, Express, Java, Firebase (Auth & Firestore), Supabase, MySQL, SQLite.
- Mobile & Tools: Android development (Java/XML), Git, GitHub, Vercel, Netlify.

=== SERVICES OFFERED ===
- Custom landing pages and business/portfolio websites.
- Full-stack web applications with authentication, dashboards, and cloud databases.
- Interactive AI chatbot integrations and custom web tools.
- Website redesigns, responsiveness upgrades, and bug fixes.

=== LIVE PORTFOLIO PROJECTS (SYNCED FROM DATABASE) ===
${liveProjectsText}

=== WEBSITE NAVIGATION & HOW TO HIRE ===
- Sections on this site: Home (#home), About (#about), Skills (#skills), Services (#services), Why Me (#why-me), Pricing (#pricing), Projects (#projects), Roadmap (#roadmap), and Contact (#contact).
- Visitors can also download John Erick's résumé directly from the Hero section ("Résumé ↓") when available.
- To hire or request a quote: direct clients to the #contact section on this page or invite them to share their project goals, timeline, and budget range here so they are ready to connect.

=== RESPONSE GUIDELINES ===
- Keep replies clear, friendly, and concise (2–4 short sentences or crisp bullet points).
- Never invent specific dollar prices, phone numbers, or guarantees that are not listed above—if asked for an exact quote, refer them to the #pricing section and encourage them to send their requirements via #contact.
- Guide interested clients naturally toward taking the next step (viewing #projects, checking #pricing, or reaching out via #contact).
`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: ChatMessage[] = Array.isArray(body.messages) ? body.messages : [];
    const latestUserMessage = messages[messages.length - 1]?.content?.trim();

    if (!latestUserMessage) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
      return NextResponse.json(
        {
          reply:
            "Hi! I'm John Erick's portfolio assistant. You can explore his services, tech stack, pricing tiers, and live projects right on this page—or head down to the Contact section to start a project. (Tip: Add GEMINI_API_KEY in .env.local to activate full live AI responses.)",
        },
        { status: 200 }
      );
    }

    const liveProjectsText = await getLiveProjectsSummary();
    const systemPrompt = buildSystemPrompt(liveProjectsText);

    const contents = [
      {
        role: "user",
        parts: [{ text: systemPrompt }],
      },
      {
        role: "model",
        parts: [
          {
            text: "Understood. I am ready to help portfolio visitors and prospective clients with clear, accurate, and helpful answers.",
          },
        ],
      },
      ...messages.slice(-8).map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
    ];

    const modelsToTry = [
      "gemini-3.8-flash",
      "gemini-2.5-flash",
      "gemini-2.0-flash",
    ];

    let replyText = "";
    let timedOutOrOverloaded = false;

    for (const model of modelsToTry) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
        const requestInit: RequestInit = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.6,
              maxOutputTokens: 350,
            },
          }),
          signal: AbortSignal.timeout(12000),
        };

        let response = await fetch(endpoint, requestInit);
        if (response.status === 503 || response.status === 429) {
          timedOutOrOverloaded = true;
          await new Promise((resolve) => setTimeout(resolve, 600));
          response = await fetch(endpoint, requestInit);
        }

        if (!response.ok) {
          const errText = await response.text();
          console.error(`Gemini API error (${model}):`, response.status, errText);
          if (
            response.status === 503 ||
            response.status === 429 ||
            response.status === 404
          ) {
            timedOutOrOverloaded = true;
            continue;
          }
          return NextResponse.json(
            {
              error: `Gemini API returned ${response.status}. Verify GEMINI_API_KEY in .env.local and restart the dev server.`,
            },
            { status: 502 }
          );
        }

        const data = await response.json();
        const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (candidateText) {
          replyText = candidateText;
          break;
        }
      } catch (err) {
        const isTimeout =
          err instanceof Error &&
          (err.name === "TimeoutError" || err.name === "AbortError");
        if (isTimeout) {
          timedOutOrOverloaded = true;
          console.warn(
            `Gemini request timed out for ${model}, trying fallback if available...`
          );
        } else {
          console.error(`Gemini fetch failed for ${model}:`, err);
        }
      }
    }

    if (!replyText) {
      const fallbackReply = timedOutOrOverloaded
        ? "The AI assistant is taking a bit longer than usual due to high demand or connection speed. You can explore John Erick's services, skills, and live projects right on this page, or reach out directly via the #contact section."
        : "I'm here to help! Feel free to ask about John Erick's services, projects, or head to the #contact section to get started.";

      return NextResponse.json({ reply: fallbackReply }, { status: 200 });
    }

    return NextResponse.json({ reply: replyText });
  } catch (error) {
    console.error("Chat route error:", error);
    return NextResponse.json(
      { error: "Something went wrong handling your message." },
      { status: 500 }
    );
  }
}