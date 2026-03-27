import { openai, anthropic } from "@/lib/ai-clients";

// Platform profiles with guidelines and limits
export const PLATFORM_PROFILES = {
  linkedin: {
    name: "LinkedIn",
    icon: "linkedin",
    maxCharacters: 3000,
    tone: "professional, formal",
    hashtags: 5,
    bestPostingTimes: ["Tuesday-Thursday", "9-11 AM UTC"],
    characterLimit: "Post body: 3000 chars max",
    guidelines: [
      "Use professional language",
      "Include specific role details",
      "Mention company culture",
      "Add industry keywords",
      "Include salary range if available",
    ],
  },
  reddit: {
    name: "Reddit (r/jobs, r/devjobs, etc.)",
    icon: "reddit",
    maxCharacters: 8000,
    tone: "casual, direct, friendly",
    hashtags: 0,
    bestPostingTimes: ["Wednesday-Friday", "2-5 PM UTC"],
    characterLimit: "8000 chars max",
    guidelines: [
      "Be casual and conversational",
      "Use clear formatting with line breaks",
      "Include link to full job posting",
      "Mention key perks (remote, flexible, etc.)",
      "Be honest about the role",
    ],
  },
  indeed: {
    name: "Indeed",
    icon: "briefcase",
    maxCharacters: 5000,
    tone: "clear, concise, professional",
    hashtags: 0,
    bestPostingTimes: ["Monday-Wednesday", "8-10 AM UTC"],
    characterLimit: "Job title: 64 chars, Description: 5000 chars",
    guidelines: [
      "Use standard job description format",
      "Include required qualifications",
      "List benefits clearly",
      "Add salary range",
      "Use simple formatting",
    ],
  },
  hackerNews: {
    name: "HackerNews (Who is hiring thread)",
    icon: "code",
    maxCharacters: 1000,
    tone: "technical, specific, to-the-point",
    hashtags: 0,
    bestPostingTimes: ["First Monday", "1st of month"],
    characterLimit: "Limit to ~1000 chars per post",
    guidelines: [
      "Highlight tech stack upfront",
      "Be specific about requirements",
      "Mention salary range",
      "Include application contact",
      "No marketing fluff",
    ],
  },
  dribbble: {
    name: "Dribbble",
    icon: "palette",
    maxCharacters: 2000,
    tone: "creative, showcasing culture",
    hashtags: 10,
    bestPostingTimes: ["Tuesday-Thursday", "10-12 AM UTC"],
    characterLimit: "2000 chars max",
    guidelines: [
      "Emphasize design challenges",
      "Show design culture of company",
      "Mention portfolio/work samples",
      "Be creative and engaging",
      "Use relevant design hashtags",
    ],
  },
  behance: {
    name: "Behance",
    icon: "palette",
    maxCharacters: 2000,
    tone: "creative, artistic, engaging",
    hashtags: 10,
    bestPostingTimes: ["Wednesday-Friday", "11-1 PM UTC"],
    characterLimit: "2000 chars max",
    guidelines: [
      "Showcase creative work culture",
      "Mention design challenges",
      "Include links to portfolio",
      "Be inspiring and artistic",
      "Use creative hashtags",
    ],
  },
  twitter: {
    name: "Twitter/X",
    icon: "twitter",
    maxCharacters: 280,
    tone: "punchy, engaging, conversational",
    hashtags: 3,
    bestPostingTimes: ["Tuesday-Thursday", "9 AM UTC"],
    characterLimit: "280 chars with media",
    guidelines: [
      "Use hook first",
      "Keep it punchy",
      "Include relevant hashtags",
      "Add call-to-action",
      "Link to full posting",
    ],
  },
  angelList: {
    name: "AngelList",
    icon: "target",
    maxCharacters: 3000,
    tone: "startup-focused, engaging",
    hashtags: 5,
    bestPostingTimes: ["Tuesday-Thursday", "10-12 AM UTC"],
    characterLimit: "3000 chars max",
    guidelines: [
      "Highlight startup culture",
      "Mention funding stage",
      "Include equity details",
      "Show growth potential",
      "Use relevant startup hashtags",
    ],
  },
};

// Platform recommendations based on job type
const JOB_TYPE_PLATFORM_MAP: Record<string, string[]> = {
  "backend-engineer": ["linkedin", "hackerNews", "reddit", "indeed"],
  "frontend-engineer": ["linkedin", "hackerNews", "reddit", "dribbble"],
  "fullstack-engineer": ["linkedin", "hackerNews", "reddit", "indeed"],
  "data-scientist": ["linkedin", "hackerNews", "reddit", "indeed"],
  "product-manager": ["linkedin", "indeed", "reddit"],
  designer: ["dribbble", "behance", "linkedin", "reddit"],
  "ux-designer": ["dribbble", "behance", "linkedin", "reddit"],
  "product-designer": ["dribbble", "behance", "linkedin"],
  marketer: ["linkedin", "indeed", "reddit"],
  "sales-executive": ["linkedin", "indeed"],
  "devops-engineer": ["hackerNews", "linkedin", "reddit"],
  "ml-engineer": ["hackerNews", "linkedin", "reddit"],
  default: ["linkedin", "indeed", "reddit"],
};

interface JobAnalysis {
  type: string;
  seniority: string;
  domain: string;
}

interface PlatformRecommendation {
  platform: string;
  score: number;
  reasoning: string;
  priority: "high" | "medium" | "low";
}

interface PlatformContentInput {
  jobTitle: string;
  jobDescription: string;
  companyName: string;
  companyWebsite?: string;
  salary?: string;
  location?: string;
  remote?: string;
  benefits?: string;
}

/**
 * Analyzes a job posting to determine best platforms for outreach
 */
export async function analyzeJobForPlatforms(
  jobDescription: string,
  jobTitle: string,
  jobLevel: string,
  jobType: string
): Promise<PlatformRecommendation[]> {
  try {
    const prompt = `Analyze this job posting and recommend the top platforms to post it on for maximum reach and quality applicants.

Job Title: ${jobTitle}
Level: ${jobLevel}
Type: ${jobType}

Job Description:
${jobDescription}

Consider:
1. Target audience for this role
2. Where similar candidates look for jobs
3. Platform culture fit
4. Posting frequency/timing effectiveness
5. Expected application quality

Respond with a JSON array of platforms with this structure:
[
  {
    "platform": "linkedin|reddit|indeed|hackerNews|dribbble|behance|twitter|angelList",
    "score": 85,
    "reasoning": "Why this platform is recommended",
    "priority": "high|medium|low"
  }
]

Rank by priority and score (highest first).`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are an expert recruitment strategist who knows where to find the best candidates across different platforms. Analyze job postings and recommend optimal platforms for outreach.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message.content;
    if (!content) throw new Error("No response from OpenAI");

    // Extract JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("Could not parse platform recommendations");

    const recommendations = JSON.parse(jsonMatch[0]) as PlatformRecommendation[];
    return recommendations.sort((a, b) => b.score - a.score);
  } catch (error) {
    console.error("Error analyzing job for platforms:", error);
    // Fallback to default recommendations
    return getDefaultPlatformRecommendations(jobTitle);
  }
}

/**
 * Fallback function to get default platform recommendations
 */
function getDefaultPlatformRecommendations(jobTitle: string): PlatformRecommendation[] {
  const lowerTitle = jobTitle.toLowerCase();
  let platforms: string[] = JOB_TYPE_PLATFORM_MAP.default;

  // Match job title to predefined types
  for (const [jobType, platformList] of Object.entries(JOB_TYPE_PLATFORM_MAP)) {
    if (jobType !== "default" && lowerTitle.includes(jobType.replace(/-/g, " "))) {
      platforms = platformList;
      break;
    }
  }

  return platforms.map((platform, index) => ({
    platform,
    score: 80 - index * 10,
    reasoning: `${PLATFORM_PROFILES[platform as keyof typeof PLATFORM_PROFILES]?.name || platform} is recommended for this role type`,
    priority: index === 0 ? "high" : index === 1 ? "medium" : "low",
  }));
}

/**
 * Generates platform-specific content for a job posting
 */
export async function generatePlatformContent(
  platform: string,
  input: PlatformContentInput
): Promise<string> {
  const profile = PLATFORM_PROFILES[platform as keyof typeof PLATFORM_PROFILES];
  if (!profile) throw new Error(`Unknown platform: ${platform}`);

  const prompt = `Create a compelling ${platform} job posting with the following guidelines:

Tone: ${profile.tone}
Max characters: ${profile.maxCharacters}
Best posting time: ${profile.bestPostingTimes.join(", ")}
Guidelines: ${profile.guidelines.join(", ")}

Job Information:
- Title: ${input.jobTitle}
- Company: ${input.companyName}
${input.companyWebsite ? `- Website: ${input.companyWebsite}` : ""}
${input.salary ? `- Salary: ${input.salary}` : ""}
${input.location ? `- Location: ${input.location}` : ""}
${input.remote ? `- Remote: ${input.remote}` : ""}
${input.benefits ? `- Benefits: ${input.benefits}` : ""}

Job Description:
${input.jobDescription}

Create engaging, platform-optimized content that:
1. Captures attention immediately
2. Highlights key benefits
3. Includes clear call-to-action
4. Fits platform norms and culture
5. Stays within character limits

Respond with ONLY the post content, no additional text.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an expert recruiter and copywriter who creates compelling, platform-specific job posts. You understand the culture and norms of each platform and write content that resonates with that audience.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: profile.maxCharacters + 200,
    });

    const content = response.choices[0]?.message.content || "";
    return content.trim();
}

/**
 * Suggests best posting times for a platform
 */
export async function suggestPostingTimes(platform: string): Promise<{
  times: string[];
  reasoning: string;
}> {
  const profile = PLATFORM_PROFILES[platform as keyof typeof PLATFORM_PROFILES];
  if (!profile) throw new Error(`Unknown platform: ${platform}`);

  return {
    times: profile.bestPostingTimes,
    reasoning: `These are optimal times for ${profile.name} based on peak user activity and engagement rates in the recruitment space.`,
  };
}

/**
 * Generates hashtags for a platform based on job details
 */
export async function generateHashtags(
  platform: string,
  jobTitle: string,
  jobDescription: string
): Promise<string[]> {
  const profile = PLATFORM_PROFILES[platform as keyof typeof PLATFORM_PROFILES];
  if (!profile || profile.hashtags === 0) return [];

  const prompt = `Generate ${profile.hashtags} relevant hashtags for a ${jobTitle} job posting on ${platform}.

Job Description:
${jobDescription}

Return ONLY the hashtags as a comma-separated list, starting with #. Example: #hiring,#engineering,#jobs`;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are an expert in social media and recruitment. Generate relevant, trending hashtags.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 100,
  });

  const content = response.choices[0]?.message.content || "";
  return content
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.startsWith("#"))
    .slice(0, profile.hashtags);
}

/**
 * Validates content for a platform
 */
export function validateContent(platform: string, content: string): {
  valid: boolean;
  errors: string[];
  characterCount: number;
} {
  const profile = PLATFORM_PROFILES[platform as keyof typeof PLATFORM_PROFILES];
  if (!profile)
    return {
      valid: false,
      errors: [`Unknown platform: ${platform}`],
      characterCount: 0,
    };

  const errors: string[] = [];
  const characterCount = content.length;

  if (characterCount > profile.maxCharacters) {
    errors.push(
      `Content exceeds ${platform} limit of ${profile.maxCharacters} characters (current: ${characterCount})`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    characterCount,
  };
}

/**
 * Get all available platforms
 */
export function getAvailablePlatforms() {
  return Object.entries(PLATFORM_PROFILES).map(([key, profile]) => ({
    id: key,
    name: profile.name,
    icon: profile.icon,
    maxCharacters: profile.maxCharacters,
    tone: profile.tone,
  }));
}
