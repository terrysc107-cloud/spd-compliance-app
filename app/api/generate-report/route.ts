import { generateText } from 'ai'

export async function POST(req: Request) {
  const { checklistData } = await req.json()
  const { profile, sectionScores, gaps, gapCount } = checklistData

  const prompt = `You are an expert sterile processing quality consultant reviewing a compliance self-assessment for a healthcare facility.

Facility context: ${profile}
Section scores: ${sectionScores}

Findings (${gapCount} total non-compliant items):
${gaps}

Generate a concise, actionable quality improvement report with:
1. Executive Summary (2-3 sentences on overall risk posture)
2. Top 3 Critical Priorities (high-severity items requiring immediate action within 7 days)
3. Section-by-Section Analysis (brief finding + recommended action per section that had findings)
4. 30/60/90 Day Action Framework (categorize all findings into timeframes)
5. Regulatory Risk Note (which standards are most at risk: AAMI, CMS, OSHA, Joint Commission)

Be direct, specific, and clinical. No filler. Format with clear headers using ##.`

  const result = await generateText({
    model: 'anthropic/claude-sonnet-4-20250514',
    prompt,
    maxOutputTokens: 2000,
  })

  return Response.json({ report: result.text })
}
