/**
 * Prompt Generation Constants
 * Shared constants used across prompt generation
 */

import type {
  InterviewMode,
  InterviewType,
  SeniorityLevel,
} from "@/types/interview";

export const DIFFICULTY_MAP: Record<SeniorityLevel, string> = {
  entry: "entry-level (basic concepts, fundamental understanding)",
  junior: "junior (practical experience, core knowledge)",
  mid: "mid-level (architectural decisions, complex scenarios)",
  senior: "senior (leadership, optimization, advanced patterns)",
};

export const CATEGORY_DESCRIPTION: Record<InterviewType, string> = {
  technical: "technical skills and implementation",
  "system-design": "system architecture and design principles",
  coding: "programming and coding challenges",
  bullet: "behavioral and soft skills",
};

export const PASSING_THRESHOLDS: Record<
  SeniorityLevel,
  { score: number; description: string }
> = {
  entry: {
    score: 55,
    description:
      "Entry-level candidates must demonstrate basic understanding of fundamental concepts and eagerness to learn.",
  },
  junior: {
    score: 60,
    description:
      "Junior candidates must demonstrate basic understanding of core concepts and show learning potential.",
  },
  mid: {
    score: 70,
    description:
      "Mid-level candidates must show solid technical knowledge and independent problem-solving ability.",
  },
  senior: {
    score: 80,
    description:
      "Senior candidates must demonstrate deep expertise, architectural thinking, and leadership capability.",
  },
};

export const MODE_SPECIFIC_PROMPTS: Partial<
  Record<InterviewMode, (seniority: SeniorityLevel) => string>
> = {
  regular: (seniority) => `
## REGULAR MODE (8 Questions)
- Conduct a standard interview appropriate for ${seniority} level
- Balance depth and breadth of questions
- Allow natural conversation flow
- Standard interview pace and difficulty`,

  practice: (seniority) => `
## PRACTICE MODE (5 Questions - Untimed)
- Focus on skill development for ${seniority} level
- NOT timed - candidates can take time to think or check resources
- Learning-focused with less pressure
- Provide constructive, encouraging feedback
- Help candidates learn through mistakes
- Create a supportive, educational environment`,

  flash: () => `
## FLASH INTERVIEW (EXACTLY 3 Questions Only)
- This is a RAPID ASSESSMENT with only 3 questions total
- Ask focused, concise questions that quickly evaluate core competencies
- Move through questions efficiently - no follow-ups or deep dives
- Cover the most important aspects of the role in 3 questions
- End the interview after exactly 3 questions - do not continue
- Keep questions brief and direct for quick evaluation
- Focus on essential skills and experience indicators`,

  play: () => `
## PLAY MODE (Unlimited Questions)
- Interactive, gamified experience
- Present ABCD multiple choice questions
- Make it engaging and fun like a quiz game
- Include programming history, flash cards, puzzles
- Continue as long as the user wants - no automatic end
- User controls when to stop
- Keep energy high and interactive`,

  competitive: (seniority) => `
## COMPETITIVE INTERVIEW (10 Questions)
- For most wanted/competitive positions
- HARDEST difficulty level for ${seniority}
- Rigorous, demanding assessment
- High standards and expectations
- Challenge the candidate with complex scenarios
- Expect exceptional depth and breadth of knowledge`,

  teacher: () => `
## TEACHER MODE (Unlimited Questions - Not Scored)
- Purely educational, no scoring or pressure
- Continue as long as the user wants - no automatic end
- User controls when to stop
- Focus on teaching and explaining concepts
- Be patient, thorough, and encouraging
- Prepare to explain your answers when "Show Answer" is clicked
- Create a safe learning environment`,
};

export const TYPE_SPECIFIC_PROMPTS: Record<
  InterviewType,
  (seniority: SeniorityLevel) => string
> = {
  technical: (seniority) => `
- Cover fundamental concepts for ${seniority} level
- Ask about frameworks and tools they should know
- Include practical scenarios they might face`,

  bullet: (seniority) => `
- Ask 3 essential questions for ${seniority} level
- Focus on core competencies and quick assessment
- Keep questions concise and direct`,

  coding: (seniority) => `
- Present problems appropriate for ${seniority} level
- Focus on clean, working solutions over optimization
- Ask about their thought process`,

  "system-design": (seniority) => `
- Start with basic architecture for ${seniority} level
- Focus on fundamental design principles
- Keep complexity appropriate to their experience`,
};
