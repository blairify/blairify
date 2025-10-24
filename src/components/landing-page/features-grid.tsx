"use client";

import {
  Activity,
  BarChart2,
  Clock,
  Cpu,
  FileText,
  Repeat,
  Shield,
  UserCheck,
} from "lucide-react";

const features = [
  {
    title: "AI-Generated Questions",
    description:
      "Adaptive, real-life interview questions tailored to your experience and target role.",
    icon: Cpu,
  },
  {
    title: "Smart Follow-Ups",
    description:
      "AI maintains context and asks intelligent follow-up questions.",
    icon: Repeat,
  },
  {
    title: "Instant Feedback",
    description: "Receive detailed analysis with actionable suggestions.",
    icon: Activity,
  },
  {
    title: "Progress Analytics",
    description: "Track your improvement over time with detailed metrics.",
    icon: BarChart2,
  },
  {
    title: "Role-Specific Practice",
    description: "Tailored questions for Frontend, Backend, DevOps, and more.",
    icon: UserCheck,
  },
  {
    title: "Multiple Formats",
    description:
      "Practice via text, voice recording, or whiteboard challenges.",
    icon: FileText,
  },
  {
    title: "24/7 Availability",
    description:
      "Practice anytime, anywhere with our always-available AI interviewer.",
    icon: Clock,
  },
  {
    title: "Secure & Private",
    description:
      "Your practice sessions and data are protected with enterprise-grade security.",
    icon: Shield,
  },
];

export default function FeaturesGrid() {
  return (
    <section className="bg-[color:var(--background)] text-[color:var(--foreground)] py-16 sm:py-20 lg:py-24 transition-colors duration-300">
      {/* 
        RESPONSIVE CONTAINER:
        - Responsive padding: px-4 (mobile) → px-6 (tablet) → px-8 (desktop)
        - Max-width constraint with centering
        - Responsive vertical spacing
      */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl text-center space-y-8 sm:space-y-12">
        {/* 
          RESPONSIVE HEADING SECTION:
          - Typography scales: text-2xl → text-3xl → text-4xl
          - Responsive spacing between heading and description
        */}
        <div className="space-y-4 sm:space-y-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
            Everything You Need to{" "}
            <span className="text-[color:var(--primary)]">Succeed</span>
          </h2>
          <p className="text-base sm:text-lg text-[color:var(--muted-foreground)] max-w-2xl mx-auto leading-relaxed">
            Train smarter with AI that understands your skill level and adapts
            to your learning goals.
          </p>
        </div>

        {/* 
          RESPONSIVE FEATURES GRID:
          - Mobile: 1 column (grid-cols-1)
          - Tablet: 2 columns (sm:grid-cols-2)
          - Desktop: 4 columns (lg:grid-cols-4)
          - Responsive gap: gap-4 → gap-6 → gap-8
          - Cards adapt to available space
        */}
        <div className="grid gap-4 sm:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mt-8 sm:mt-12">
          {features.map((f, index) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="group p-4 sm:p-6 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* 
                  RESPONSIVE ICON:
                  - Size adapts: w-10 h-10 → w-12 h-12
                  - Consistent spacing with responsive margins
                */}
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[color:var(--primary)] text-white mb-3 sm:mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <Icon size={20} className="sm:w-6 sm:h-6" />
                </div>

                {/* 
                  RESPONSIVE TYPOGRAPHY:
                  - Title: text-base → text-lg
                  - Description: text-sm → text-base
                  - Responsive spacing between elements
                */}
                <h3 className="text-base sm:text-lg font-semibold text-[color:var(--foreground)] mb-2 sm:mb-3">
                  {f.title}
                </h3>
                <p className="text-sm sm:text-base text-[color:var(--muted-foreground)] leading-relaxed">
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
