import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface AIInsightsRequestBody {
  topTitles?: string[];
  channelTopic?: string;
}

function getFallbackInsights(topTitles: string[], channelTopic?: string) {
  const sampleTitle = topTitles[0] ?? "How I Built an AI App in 30 Days";
  return {
    success: true,
    isFallback: true,
    hookAnalysis: `These titles dominate by leveraging high-stakes curiosity gaps and counter-intuitive framing, compelling viewers to resolve cognitive dissonance. By combining specific timeframes with bold outcome claims, they trigger immediate psychological urgency without sounding like generic clickbait.`,
    titleIdeas: [
      `I Tested ${channelTopic ?? "This Outlier Formula"} for 30 Days (Here's What Happened)`,
      `Why 99% of Creators Fail at ${channelTopic ?? "YouTube Packaging"} (The Brutal Truth)`,
      `The Secret of ${sampleTitle.slice(0, 28)}... Nobody Talks About`,
    ],
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as AIInsightsRequestBody;
    const topTitles = (body.topTitles ?? []).filter(Boolean);
    const channelTopic = body.channelTopic ?? "YouTube Content Strategy";

    const titlesForPrompt =
      topTitles.length > 0
        ? topTitles.slice(0, 6)
        : [
            "Why AI Coding is Terrifyingly Good",
            "I Tested 10 AI Video Models for 30 Days",
            "What Happens When You Automate Your Entire SaaS",
          ];

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(getFallbackInsights(titlesForPrompt, channelTopic));
    }

    const systemPrompt = `You are a world-class YouTube algorithmic packaging and viral title strategist.
Analyze these top outlier video titles from an overperforming channel in the "${channelTopic}" niche:
${titlesForPrompt.map((t, i) => `${i + 1}. "${t}"`).join("\n")}

Respond strictly with a JSON object conforming to this exact schema:
{
  "psychologicalHook": "A 2-sentence breakdown explaining the psychological trigger (e.g. Curiosity Gap, FOMO, High Stakes, Counter-Intuitive Truth) that caused these titles to overperform.",
  "titleIdeas": [
    "Optimized viral title variation 1 (45-65 characters ideal, high CTR)",
    "Optimized viral title variation 2 (45-65 characters ideal, high CTR)",
    "Optimized viral title variation 3 (45-65 characters ideal, high CTR)"
  ]
}`;

interface GeminiCandidatePart {
  text?: string;
}

interface GeminiCandidate {
  content?: {
    parts?: GeminiCandidatePart[];
  };
}

interface GeminiGenerateResponse {
  candidates?: GeminiCandidate[];
}

    // Try models in order of capability / availability
    const candidateModels = ["gemini-1.5-flash", "gemini-3.6-flash", "gemini-flash-latest"];
    let geminiJson: GeminiGenerateResponse | null = null;

    for (const modelName of candidateModels) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

      try {
        const geminiRes = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: systemPrompt }],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.7,
            },
          }),
        });

        if (geminiRes.ok) {
          geminiJson = await geminiRes.json();
          break;
        }
      } catch {
        // Continue to next model if network fails
      }
    }

    const rawText = geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return NextResponse.json(getFallbackInsights(titlesForPrompt, channelTopic));
    }

    // Clean and parse JSON response
    const cleanJsonText = rawText.replace(/```(?:json)?/g, "").trim();
    const parsed = JSON.parse(cleanJsonText);

    return NextResponse.json({
      success: true,
      isFallback: false,
      hookAnalysis:
        parsed.psychologicalHook ||
        parsed.hookAnalysis ||
        getFallbackInsights(titlesForPrompt, channelTopic).hookAnalysis,
      titleIdeas:
        Array.isArray(parsed.titleIdeas) && parsed.titleIdeas.length > 0
          ? parsed.titleIdeas
          : getFallbackInsights(titlesForPrompt, channelTopic).titleIdeas,
    });
  } catch (error) {
    console.error("[AI Insights Route] Exception:", error);
    return NextResponse.json(
      getFallbackInsights(["Why AI Coding is Terrifyingly Good"], "Tech"),
    );
  }
}
