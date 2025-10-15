"use client";

import {
  Brain,
  MessageSquare,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Logo from "../atoms/logo-the-mockr";

export default function FeaturesGrid() {
  const features = [
    {
      icon: Brain,
      title: "AI-Generated Questions",
      description:
        "Questions that adapt to your experience level and target position.",
    },
    {
      icon: Target,
      title: "Instant Feedback",
      description:
        "Get detailed analysis of your answers with actionable suggestions for improvement.",
    },
    {
      icon: TrendingUp,
      title: "Progress Analytics",
      description:
        "Track your improvement over time with detailed performance metrics and insights.",
    },
    {
      icon: Users,
      title: "Role-Specific Practice",
      description:
        "Tailored questions for Frontend, Backend, DevOps, and other engineering roles.",
    },
    {
      icon: Zap,
      title: "Multiple Formats",
      description:
        "Practice with text, voice recording, and whiteboard coding challenges.",
    },
    {
      icon: MessageSquare,
      title: "Smart Follow-ups",
      description:
        "AI maintains context and asks intelligent follow-up questions based on your responses.",
    },
  ];

  return (
    <section className="py-24 ">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            Why Use <Logo />
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Advanced AI technology meets personalized learning to transform your
            interview preparation experience
          </p>
        </div>

        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className="group relative border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              <CardHeader className="">
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
