import type { UserSubscription } from "@/types/firestore";

type SubscriptionDefaults = Pick<
  UserSubscription,
  "plan" | "status" | "features" | "limits"
>;

export const PRO_SUBSCRIPTION: SubscriptionDefaults = {
  plan: "pro",
  status: "active",
  features: ["unlimited_interviews", "advanced_analytics", "skill_roadmaps"],
  limits: {
    sessionsPerMonth: 9999,
    skillsTracking: 9999,
    analyticsRetention: 365,
  },
};

export const FREE_SUBSCRIPTION: SubscriptionDefaults = {
  plan: "free",
  status: "active",
  features: ["basic-interviews", "progress-tracking"],
  limits: {
    sessionsPerMonth: 10,
    skillsTracking: 5,
    analyticsRetention: 30,
  },
};
