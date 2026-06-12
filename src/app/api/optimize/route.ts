import { NextRequest } from "next/server";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import { saveResult, getResult } from "@/lib/db";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY!;
const DEEPSEEK_MODEL = "deepseek-chat";

function sanitizeHtml(html: string): string {
  const window = new JSDOM("").window;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const purify = DOMPurify(window as any);
  return purify.sanitize(html, {
    ALLOWED_TAGS: ["table", "thead", "tbody", "tr", "th", "td", "p", "br", "b", "strong", "i", "em", "ul", "ol", "li", "span", "div"],
    ALLOWED_ATTR: ["class"],
  });
}

export async function POST(request: NextRequest) {
  try {
    const { resume, targetJob } = await request.json();

    if (!resume || typeof resume !== "string" || resume.trim().length === 0) {
      return Response.json({ error: "Resume text is required." }, { status: 400 });
    }
    if (resume.length > 10000) {
      return Response.json({ error: "Resume is too long. Please limit to 10,000 characters." }, { status: 400 });
    }

    const systemPrompt = `You are an expert resume reviewer and career coach. Analyze the provided resume and give actionable suggestions to improve it.

Return your analysis as valid JSON with these fields:
{
  "suggestions": "A detailed markdown analysis — what's working, what's not, specific improvements. Use ## headings for each section: Summary, Experience, Formatting, Keywords, Achievements. Be honest and critical.",
  "optimizedResume": "A rewritten, improved version of the full resume. Improve bullet points, add impact metrics where plausible, fix formatting, and tailor language.",
  "comparisonHtml": "HTML table comparing original vs optimized resume side by side. Use <table class=\\"w-full text-sm\\"><thead><tr><th class=\\"text-left p-2\\">Original</th><th class=\\"text-left p-2\\">Optimized</th></tr></thead><tbody>... with each section as a row."
}`;

    const userPrompt = `Analyze and optimize this resume${targetJob ? ` for a ${targetJob} position` : ""}:\n\n${resume}`;

    const deepseekRes = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        max_tokens: 4096,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!deepseekRes.ok) {
      const errText = await deepseekRes.text().catch(() => "Unknown error");
      console.error("DeepSeek API error:", deepseekRes.status, errText);
      return Response.json({ error: "AI analysis failed. Please try again." }, { status: 502 });
    }

    const deepseekData = await deepseekRes.json();
    const content = deepseekData.choices?.[0]?.message?.content;
    if (!content) {
      return Response.json({ error: "AI returned empty response. Please try again." }, { status: 502 });
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1]);
      } else {
        console.error("Failed to parse DeepSeek response:", content.slice(0, 200));
        return Response.json({ error: "Failed to parse AI response. Please try again." }, { status: 502 });
      }
    }

    const id = crypto.randomUUID();
    const result = {
      id,
      original: resume,
      targetJob: targetJob || null,
      suggestions: parsed.suggestions || "",
      optimizedResume: parsed.optimizedResume || "",
      comparisonHtml: sanitizeHtml(parsed.comparisonHtml || ""),
    };

    await saveResult(result);

    return Response.json({ ...result, createdAt: Date.now() });
  } catch (err) {
    console.error("Optimize error:", err);
    return Response.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return Response.json({ error: "Missing id." }, { status: 400 });
  }
  const result = await getResult(id).catch(() => null);
  if (!result) {
    return Response.json({ error: "Result not found." }, { status: 404 });
  }
  return Response.json(result);
}
