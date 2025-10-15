'use client';

import {
  Cpu,
  Repeat,
  Activity,
  BarChart2,
  UserCheck,
  FileText,
} from 'lucide-react';

const features = [
  {
    title: "AI-Generated Questions",
    description: "Adaptive, real-life interview questions tailored to your experience and target role.",
    icon: Cpu,
  },
  {
    title: "Smart Follow-Ups",
    description: "AI maintains context and asks intelligent follow-up questions.",
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
    description: "Practice via text, voice recording, or whiteboard challenges.",
    icon: FileText,
  },
];

export default function FeaturesGrid() {
  return (
    <section className="bg-[color:var(--background)] text-[color:var(--foreground)] py-24 transition-colors duration-300">
      <div className="container mx-auto px-6 max-w-7xl text-center space-y-12">
        <h2 className="text-4xl font-bold">
          Everything You Need to{" "}
          <span className="text-[color:var(--primary)]">Succeed</span>
        </h2>
        <p className="text-lg text-[color:var(--muted-foreground)] max-w-2xl mx-auto">
          Train smarter with AI that understands your skill level and adapts to your learning goals.
        </p>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 mt-12">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="p-8 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[color:var(--primary)] text-white mb-5 mx-auto">
                  <Icon size={28} />
                </div>
                <h3 className="text-xl font-semibold text-[color:var(--foreground)] mb-3">
                  {f.title}
                </h3>
                <p className="text-[color:var(--muted-foreground)]">{f.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
