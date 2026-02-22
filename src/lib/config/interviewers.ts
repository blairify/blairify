export interface InterviewerProfile {
  id: string;
  name: string;
  title: string;
  experience: string;
  specialties: string[];
  personality: string;
  avatarConfig: {
    sex: "man" | "woman";
    faceColor: string;
    earSize: "small" | "big";
    eyeStyle: "circle" | "oval" | "smile";
    noseStyle: "short" | "long" | "round";
    mouthStyle: "laugh" | "smile" | "peace";
    shirtStyle: "hoody" | "short" | "polo";
    glassesStyle?: "round" | "square" | "none";
    hairColor: string;
    hairStyle: "normal" | "thick" | "mohawk" | "womanLong" | "womanShort";
    hatStyle?: "beanie" | "turban" | "none";
    shirtColor: string;
    bgColor: string;
  };
}

export const INTERVIEWERS: InterviewerProfile[] = [
  {
    id: "sarah",
    name: "Sarah",
    title: "Senior Technical Interviewer",
    experience: "10+ years conducting interviews at top tech companies",
    specialties: [
      "Frontend Development",
      "System Design",
      "Technical Leadership",
    ],
    personality: "Professional, encouraging, and detail-oriented",
    avatarConfig: {
      sex: "woman",
      faceColor: "#F9C9B6",
      earSize: "small",
      eyeStyle: "smile",
      noseStyle: "short",
      mouthStyle: "smile",
      shirtStyle: "polo",
      glassesStyle: "round",
      hairColor: "#4A312C",
      hairStyle: "normal",
      hatStyle: "none", // Explicitly set no hat
      shirtColor: "#6C5CE7",
      bgColor: "#DFE6E9",
    },
  },
  {
    id: "marcus",
    name: "Marcus",
    title: "Principal Engineer & Interviewer",
    experience: "15+ years in backend systems and distributed computing",
    specialties: [
      "Backend Development",
      "Distributed Systems",
      "Database Design",
    ],
    personality: "Analytical, thorough, and pragmatic",
    avatarConfig: {
      sex: "man",
      faceColor: "#AC6651",
      earSize: "small",
      eyeStyle: "oval",
      noseStyle: "round",
      mouthStyle: "peace",
      shirtStyle: "short",
      glassesStyle: "square",
      hairColor: "#2C3E50",
      hairStyle: "thick",
      hatStyle: "none", // Explicitly set no hat
      shirtColor: "#00B894",
      bgColor: "#DFE6E9",
    },
  },
  {
    id: "priya",
    name: "Priya",
    title: "Data Science Lead & Interviewer",
    experience: "12+ years in data science and machine learning",
    specialties: ["Data Analysis", "Machine Learning", "Statistical Modeling"],
    personality: "Curious, methodical, and supportive",
    avatarConfig: {
      sex: "woman",
      faceColor: "#D4A574",
      earSize: "small",
      eyeStyle: "circle",
      noseStyle: "short",
      mouthStyle: "smile",
      shirtStyle: "polo",
      glassesStyle: "round",
      hairColor: "#1A1A1A",
      hairStyle: "womanLong",
      hatStyle: "none", // Explicitly set no hat
      shirtColor: "#FD79A8",
      bgColor: "#DFE6E9",
    },
  },
  {
    id: "alex",
    name: "Alex",
    title: "Full-Stack Architect & Interviewer",
    experience: "13+ years building scalable web applications",
    specialties: ["Full-Stack Development", "Cloud Architecture", "DevOps"],
    personality: "Friendly, practical, and solution-focused",
    avatarConfig: {
      sex: "man",
      faceColor: "#F9C9B6",
      earSize: "small",
      eyeStyle: "smile",
      noseStyle: "long",
      mouthStyle: "laugh",
      shirtStyle: "hoody",
      glassesStyle: "none",
      hairColor: "#C68642",
      hairStyle: "mohawk",
      hatStyle: "none", // Explicitly set no hat
      shirtColor: "#0984E3",
      bgColor: "#DFE6E9",
    },
  },
  {
    id: "jordan",
    name: "Jordan",
    title: "Mobile Engineering Lead",
    experience: "11+ years in iOS and Android development",
    specialties: ["Mobile Development", "Cross-Platform", "UI/UX"],
    personality: "Creative, user-focused, and collaborative",
    avatarConfig: {
      sex: "man",
      faceColor: "#E0AC69",
      earSize: "small",
      eyeStyle: "oval",
      noseStyle: "short",
      mouthStyle: "smile",
      shirtStyle: "short",
      glassesStyle: "round",
      hairColor: "#77574D",
      hairStyle: "normal",
      hatStyle: "none",
      shirtColor: "#FDCB6E",
      bgColor: "#DFE6E9",
    },
  },
  {
    id: "mary",
    name: "Mary",
    title: "Data Engineer Lead & Interviewer",
    experience: "8+ years in data science and machine learning",
    specialties: ["Data Analysis", "Machine Learning", "Statistical Modeling"],
    personality: "Curious, methodical, and supportive, great leader",
    avatarConfig: {
      sex: "woman",
      faceColor: "#f1c27d",
      earSize: "small",
      eyeStyle: "oval",
      noseStyle: "short",
      mouthStyle: "laugh",
      shirtStyle: "polo",
      glassesStyle: "round",
      hairColor: "#3d251e",
      hairStyle: "womanLong",
      hatStyle: "none", // Explicitly set no hat
      shirtColor: "#FF7F00",
      bgColor: "#DFE6E9",
    },
  },
];

/**
 * Get a random interviewer profile
 */
export function getRandomInterviewer(): InterviewerProfile {
  const randomIndex = Math.floor(Math.random() * INTERVIEWERS.length);
  return INTERVIEWERS[randomIndex];
}

/**
 * Get interviewer by ID
 */
export function getInterviewerById(id: string): InterviewerProfile | undefined {
  return INTERVIEWERS.find((interviewer) => interviewer.id === id);
}

/**
 * Get interviewer best suited for a specific role/specialty
 */
export function getInterviewerForRole(role: string): InterviewerProfile {
  const roleLower = role.toLowerCase();

  // Match interviewer based on role keywords
  if (
    roleLower.includes("frontend") ||
    roleLower.includes("react") ||
    roleLower.includes("ui")
  ) {
    return INTERVIEWERS[0]; // Sarah
  }
  if (
    roleLower.includes("backend") ||
    roleLower.includes("api") ||
    roleLower.includes("database")
  ) {
    return INTERVIEWERS[1]; // Marcus
  }
  if (
    roleLower.includes("data") ||
    roleLower.includes("analyst") ||
    roleLower.includes("ml")
  ) {
    return INTERVIEWERS[2]; // Priya
  }
  if (
    roleLower.includes("full") ||
    roleLower.includes("fullstack") ||
    roleLower.includes("devops")
  ) {
    return INTERVIEWERS[3]; // Alex
  }
  if (
    roleLower.includes("mobile") ||
    roleLower.includes("ios") ||
    roleLower.includes("android")
  ) {
    return INTERVIEWERS[4]; // Jordan
  }

  // Default to consistent interviewer (Sarah) instead of random
  return INTERVIEWERS[0]; // Sarah - consistent fallback
}

/**
 * Get interviewer based on company and role combination
 * Company selection takes precedence over role for more personalized experience
 */
export function getInterviewerForCompanyAndRole(
  company: string,
  role: string,
): InterviewerProfile {
  const companyLower = company.toLowerCase();

  // Company-specific interviewer assignments
  // Tech giants get senior technical interviewers
  if (
    companyLower.includes("google") ||
    companyLower.includes("meta") ||
    companyLower.includes("apple")
  ) {
    return INTERVIEWERS[1]; // Marcus - Principal Engineer for top tech companies
  }

  // Data-focused companies get data specialist
  if (
    companyLower.includes("databricks") ||
    companyLower.includes("snowflake") ||
    companyLower.includes("palantir") ||
    companyLower.includes("openai") ||
    companyLower.includes("anthropic")
  ) {
    return INTERVIEWERS[2]; // Priya - Data Science Lead
  }

  // Developer tools and cloud companies get full-stack expert
  if (
    companyLower.includes("github") ||
    companyLower.includes("cloudflare") ||
    companyLower.includes("stripe") ||
    companyLower.includes("atlassian")
  ) {
    return INTERVIEWERS[3]; // Alex - Full-Stack Architect
  }

  // Mobile-first companies get mobile specialist
  if (
    companyLower.includes("uber") ||
    companyLower.includes("airbnb") ||
    companyLower.includes("spotify")
  ) {
    return INTERVIEWERS[4]; // Jordan - Mobile Engineering Lead
  }

  // Design-focused companies get frontend specialist
  if (
    companyLower.includes("figma") ||
    companyLower.includes("canva") ||
    companyLower.includes("notion")
  ) {
    return INTERVIEWERS[0]; // Sarah - Frontend specialist
  }

  // Fallback to role-based selection if no company match
  return getInterviewerForRole(role);
}
