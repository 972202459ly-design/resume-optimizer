import { NextRequest } from "next/server";

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY!;
const CLAUDE_MODEL = "claude-sonnet-4-20250514";

// In-memory store — resets on each cold start. Sufficient for MVP.
const resultStore = new Map<string, {
  original: string;
  targetJob: string | null;
  suggestions: string;
  optimizedResume: string;
  comparisonHtml: string;
  createdAt: number;
}>();

export async function POST(request: NextRequest) {
  try {
    const { resume, targetJob } = await request.json();

    if (!resume || typeof resume !== "string" || resume.trim().length === 0) {
      return Response.json({ error: "Resume text is required." }, { status: 400 });
    }

    if (resume.length > 10000) {
      return Response.json({ error: "Resume is too long. Please limit to 10,000 characters." }, { status: 400 });
    }

    const systemPrompt = `You are an expert resume reviewer and career coach. Your task is to analyze the provided resume and give actionable suggestions to improve it.

Return your analysis as valid JSON with these fields:
{
  "suggestions": "A detailed markdown analysis of the resume — what's working, what's not, specific improvements. Break into sections: Summary, Formatting, Content, Keywords, Achievements.",
  "optimizedResume": "A rewritten, improved version of the full resume. Improve bullet points, add impact metrics where plausible, fix formatting, and tailor language.",
  "comparisonHtml": "HTML table comparing the original vs optimized resume side by side. Use <table class=\"w-full text-sm\"><thead><tr><th class=\"text-left p-2\">Original</th><th class=\"text-left p-2\">Optimized</th></tr></thead><tbody>... with each section as a row."
}

Be honest and critical — don't just praise. The user wants to actually improve.`;

    const userPrompt = `Please analyze and optimize this resume${targetJob ? ` for a ${targetJob} position` : ""}:\n\n${resume}`;

    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!claudeRes.ok) {
      const errText = await claudeRes.text().catch(() => "Unknown error");
      console.error("Claude API error:", claudeRes.status, errText);
      return Response.json({ error: "AI analysis failed. Please try again." }, { status: 502 });
    }

    const claudeData = await claudeRes.json();
    const content = claudeData.content?.[0]?.text;
    if (!content) {
      return Response.json({ error: "AI returned empty response. Please try again." }, { status: 502 });
    }

    // Parse JSON from Claude's response
    let parsed;
    try {
      // Try direct parse first
      parsed = JSON.parse(content);
    } catch {
      // Fallback: extract JSON from markdown code block
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1]);
      } else {
        console.error("Failed to parse Claude response as JSON:", content.slice(0, 200));
        return Response.json({ error: "Failed to parse AI response. Please try again." }, { status: 502 });
      }
    }

    const id = crypto.randomUUID();
    resultStore.set(id, {
      original: resume,
      targetJob: targetJob || null,
      suggestions: parsed.suggestions || "",
      optimizedResume: parsed.optimizedResume || "",
      comparisonHtml: parsed.comparisonHtml || "",
      createdAt: Date.now(),
    });

    return Response.json({ id });
  } catch (err) {
    console.error("Optimize error:", err);
    return Response.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id || !resultStore.has(id)) {
    return Response.json({ error: "Result not found." }, { status: 404 });
  }
  return Response.json(resultStore.get(id));
}
