/**
 * Job-related constants for the jobs listing page
 */

import { Building2, Database, Link2 } from "lucide-react";
import { FaGoogle, FaMicrosoft } from "react-icons/fa";
import {
  SiAdyen,
  SiAirbnb,
  SiAllegro,
  SiAmazon,
  SiAnthropic,
  SiApple,
  SiAtlassian,
  SiCanva,
  SiCloudflare,
  SiDassaultsystemes,
  SiDatabricks,
  SiDeepl,
  SiElasticsearch,
  SiFigma,
  SiGithub,
  SiKlarna,
  SiMeta,
  SiNetflix,
  SiNokia,
  SiNotion,
  SiNvidia,
  SiOpenai,
  SiPalantir,
  SiQualcomm,
  SiRevolut,
  SiSap,
  SiShopify,
  SiSnowflake,
  SiSpotify,
  SiStripe,
  SiTesla,
  SiTwilio,
  SiUber,
  SiWise,
  SiZapier,
} from "react-icons/si";

export const JOB_FUNCTIONS = [
  "Engineering",
  "Design",
  "Product",
  "Marketing",
  "Sales",
  "Operations",
  "Finance",
  "Human Resources",
  "Customer Service",
  "Education",
  "Healthcare",
  "Other",
];

export const COMPANY_SIZES = [
  { value: "1-50", label: "Small (1-50)" },
  { value: "51-500", label: "Medium (51-500)" },
  { value: "501-1000", label: "Large (501-1000)" },
  { value: "1001+", label: "Enterprise (1001+)" },
];

export const DATE_POSTED_OPTIONS = [
  { value: "1", label: "Last 24 hours" },
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 3 months" },
];

export const JOB_LEVELS = [
  "Internship",
  "Entry Level",
  "Associate",
  "Mid-Senior Level",
  "Director",
  "Executive",
  "Not Applicable",
];

export const CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "CAD",
  "AUD",
  "INR",
  "JPY",
  "CNY",
];

export const SPECIFIC_COMPANIES = [
  // FAANG & Big Tech
  {
    value: "google",
    label: "Google",
    description: "Algorithm focus, system design",
    icon: FaGoogle,
    color: "text-orange-500",
  },
  {
    value: "apple",
    label: "Apple",
    description: "Hardware-software integration, performance",
    icon: SiApple,
    color: "text-gray-800",
  },
  {
    value: "amazon",
    label: "Amazon",
    description: "Scalability, leadership principles",
    icon: SiAmazon,
    color: "text-orange-600",
  },
  {
    value: "meta",
    label: "Meta",
    description: "Social systems, large-scale engineering",
    icon: SiMeta,
    color: "text-gray-700",
  },
  {
    value: "netflix",
    label: "Netflix",
    description: "Recommendation systems, infrastructure",
    icon: SiNetflix,
    color: "text-red-600",
  },
  {
    value: "microsoft",
    label: "Microsoft",
    description: "Collaboration, technical depth",
    icon: FaMicrosoft,
    color: "text-gray-700",
  },

  // Fintech & Payments
  {
    value: "stripe",
    label: "Stripe",
    description: "Fintech infrastructure & developer tools",
    icon: SiStripe,
    color: "text-purple-600",
  },
  {
    value: "revolut",
    label: "Revolut (UK)",
    description: "Fintech, banking as a service",
    icon: SiRevolut,
    color: "text-gray-700",
  },
  {
    value: "wise",
    label: "Wise (UK)",
    description: "Money transfers & global payments",
    icon: SiWise,
    color: "text-green-600",
  },
  {
    value: "klarna",
    label: "Klarna (Sweden)",
    description: "Buy-now-pay-later platform",
    icon: SiKlarna,
    color: "text-pink-500",
  },
  {
    value: "adyen",
    label: "Adyen (Netherlands)",
    description: "Payment infrastructure",
    icon: SiAdyen,
    color: "text-green-500",
  },
  {
    value: "plaid",
    label: "Plaid",
    description: "Fintech integrations & banking APIs",
    icon: Link2,
    color: "text-gray-700",
  },
  {
    value: "mambu",
    label: "Mambu (Germany)",
    description: "Cloud banking platform",
    icon: Building2,
    color: "text-orange-500",
  },

  // Data & AI
  {
    value: "databricks",
    label: "Databricks",
    description: "Data engineering & AI platform",
    icon: SiDatabricks,
    color: "text-red-500",
  },
  {
    value: "snowflake",
    label: "Snowflake",
    description: "Cloud data platform",
    icon: SiSnowflake,
    color: "text-slate-500",
  },
  {
    value: "palantir",
    label: "Palantir",
    description: "Data analytics for enterprise & government",
    icon: SiPalantir,
    color: "text-gray-700",
  },
  {
    value: "nvidia",
    label: "Nvidia",
    description: "AI hardware & CUDA software ecosystem",
    icon: SiNvidia,
    color: "text-green-600",
  },
  {
    value: "openai",
    label: "OpenAI",
    description: "Applied AI research & developer APIs",
    icon: SiOpenai,
    color: "text-gray-800",
  },
  {
    value: "anthropic",
    label: "Anthropic",
    description: "AI safety & LLM research",
    icon: SiAnthropic,
    color: "text-orange-600",
  },
  {
    value: "celonis",
    label: "Celonis (Germany)",
    description: "Process mining & data analytics",
    icon: Database,
    color: "text-gray-700",
  },
  {
    value: "elastic",
    label: "Elastic (Elasticsearch)",
    description: "Search & observability tools",
    icon: SiElasticsearch,
    color: "text-yellow-500",
  },

  // Developer Tools & Platforms
  {
    value: "github",
    label: "GitHub",
    description: "Developer collaboration & Copilot",
    icon: SiGithub,
    color: "text-gray-800",
  },
  {
    value: "cloudflare",
    label: "Cloudflare",
    description: "Edge computing & security platform",
    icon: SiCloudflare,
    color: "text-orange-500",
  },
  {
    value: "atlassian",
    label: "Atlassian",
    description: "Jira, Confluence, Bitbucket ecosystem",
    icon: SiAtlassian,
    color: "text-gray-700",
  },
  {
    value: "twilio",
    label: "Twilio",
    description: "Communications APIs & CPaaS",
    icon: SiTwilio,
    color: "text-red-500",
  },
  {
    value: "zapier",
    label: "Zapier",
    description: "Workflow automation & integrations",
    icon: SiZapier,
    color: "text-orange-600",
  },

  // Design & Productivity
  {
    value: "figma",
    label: "Figma",
    description: "Collaborative design & prototyping",
    icon: SiFigma,
    color: "text-purple-500",
  },
  {
    value: "canva",
    label: "Canva",
    description: "Design platform & visual communication",
    icon: SiCanva,
    color: "text-gray-700",
  },
  {
    value: "notion",
    label: "Notion",
    description: "Productivity & knowledge management",
    icon: SiNotion,
    color: "text-gray-800",
  },

  // E-commerce & Marketplaces
  {
    value: "shopify",
    label: "Shopify",
    description: "E-commerce platform & merchant solutions",
    icon: SiShopify,
    color: "text-green-600",
  },
  {
    value: "allegro",
    label: "Allegro (Poland)",
    description: "E-commerce marketplace platform",
    icon: SiAllegro,
    color: "text-orange-600",
  },

  // Mobility & Logistics
  {
    value: "uber",
    label: "Uber",
    description: "Mobility & logistics platform",
    icon: SiUber,
    color: "text-gray-800",
  },
  {
    value: "airbnb",
    label: "Airbnb",
    description: "Travel & hospitality platform",
    icon: SiAirbnb,
    color: "text-red-500",
  },
  {
    value: "blablacar",
    label: "BlaBlaCar (France)",
    description: "Carpooling & bus travel platform",
    icon: Building2,
    color: "text-gray-700",
  },

  // Entertainment & Media
  {
    value: "spotify",
    label: "Spotify",
    description: "Music streaming & audio platform",
    icon: SiSpotify,
    color: "text-green-500",
  },
  {
    value: "supercell",
    label: "Supercell (Finland)",
    description: "Mobile game development",
    icon: Building2,
    color: "text-gray-700",
  },

  // Hardware & Semiconductors
  {
    value: "tesla",
    label: "Tesla",
    description: "Electric vehicles & energy solutions",
    icon: SiTesla,
    color: "text-red-600",
  },
  {
    value: "qualcomm",
    label: "Qualcomm",
    description: "Semiconductor & wireless technology",
    icon: SiQualcomm,
    color: "text-gray-700",
  },
  {
    value: "nokia",
    label: "Nokia (Finland)",
    description: "Telecommunications & network infrastructure",
    icon: SiNokia,
    color: "text-gray-700",
  },

  // Enterprise Software
  {
    value: "sap",
    label: "SAP (Germany)",
    description: "Enterprise software & cloud solutions",
    icon: SiSap,
    color: "text-gray-700",
  },
  {
    value: "dassault",
    label: "Dassault Systèmes (France)",
    description: "3D design & engineering software",
    icon: SiDassaultsystemes,
    color: "text-red-600",
  },
  {
    value: "hexagon",
    label: "Hexagon (Sweden)",
    description: "Digital reality & industrial technology",
    icon: Building2,
    color: "text-gray-700",
  },
  {
    value: "infineon",
    label: "Infineon (Germany)",
    description: "Semiconductor solutions",
    icon: Building2,
    color: "text-red-600",
  },

  // Software Houses & Services
  {
    value: "netguru",
    label: "Netguru (Poland)",
    description: "Software development & consultancy",
    icon: Building2,
    color: "text-green-600",
  },
  {
    value: "docplanner",
    label: "Docplanner (Poland/Spain)",
    description: "Healthcare technology platform",
    icon: Building2,
    color: "text-gray-700",
  },

  // AI & Translation
  {
    value: "deepl",
    label: "DeepL (Germany)",
    description: "AI-powered translation services",
    icon: SiDeepl,
    color: "text-gray-700",
  },

  // Semiconductors
  {
    value: "asml",
    label: "ASML (Netherlands)",
    description: "Semiconductor manufacturing equipment",
    icon: Building2,
    color: "text-gray-700",
  },
];
