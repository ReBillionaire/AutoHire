import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

// Initialize OpenAI client
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Anthropic client
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Helper function to analyze resume with OpenAI
export async function analyzeResumeWithOpenAI(resumeText: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are an expert HR analyst. Analyze the following resume and provide:
1. A brief summary of the candidate's background
2. Key skills and experience
3. Overall assessment score (0-100)
4. Relevant tags/categories

Respond in JSON format with keys: summary, skills, score, tags`,
      },
      {
        role: "user",
        content: resumeText,
      },
    ],
  });

  return response.choices[0]?.message.content;
}

// Helper function to analyze resume with Claude
export async function analyzeResumeWithClaude(resumeText: string) {
  const message = await anthropic.messages.create({
    model: "claude-3-sonnet-20240229",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Analyze this resume and provide:
1. A brief summary of the candidate's background
2. Key skills and experience
3. Overall assessment score (0-100)
4. Relevant tags/categories

Resume:
${resumeText}

Respond in JSON format with keys: summary, skills, score, tags`,
      },
    ],
  });

  return message.content[0].type === "text" ? message.content[0].text : null;
}

// Helper function to generate interview questions
export async function generateInterviewQuestions(
  jobTitle: string,
  jobDescription: string,
  questionCount: number = 5
) {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are an expert interviewer. Generate thoughtful, behavioral and technical interview questions.
Respond with a JSON array of question objects with keys: question, type (behavioral|technical|situational), difficulty (easy|medium|hard)`,
      },
      {
        role: "user",
        content: `Generate ${questionCount} interview questions for a ${jobTitle} position.

Job Description:
${jobDescription}

Respond only with the JSON array.`,
      },
    ],
  });

  return response.choices[0]?.message.content;
}

// Helper function to evaluate interview answer
export async function evaluateInterviewAnswer(
  question: string,
  answer: string,
  jobContext: string
) {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are an expert interviewer evaluating candidate responses.
Respond with JSON containing: score (0-100), strengths (array), weaknesses (array), feedback (string)`,
      },
      {
        role: "user",
        content: `Evaluate this interview answer.

Job Context: ${jobContext}
Question: ${question}
Answer: ${answer}

Respond only with JSON.`,
      },
    ],
  });

  return response.choices[0]?.message.content;
}

// Helper function to match candidate with job
export async function matchCandidateToJob(
  candidateProfile: string,
  jobDescription: string
) {
  const message = await anthropic.messages.create({
    model: "claude-3-sonnet-20240229",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Rate how well this candidate matches the job posting on a scale of 0-100.

Candidate Profile:
${candidateProfile}

Job Description:
${jobDescription}

Respond with JSON: {matchScore: number, reasoning: string, keyMatches: string[], gaps: string[]}`,
      },
    ],
  });

  return message.content[0].type === "text" ? message.content[0].text : null;
}