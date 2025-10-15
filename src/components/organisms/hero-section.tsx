"use client";

import { ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="container mx-auto px-4 py-20">
      <div className="text-center space-y-8">
        <Badge variant="secondary" className="text-sm px-4 py-2">
          <Zap className="h-4 w-4 mr-2" />
          AI-Powered Interview Preparation
        </Badge>

        <h1 className="text-5xl md:text-7xl font-bold text-balance">
          <span className="block">Master Your Next</span>
          <span className="text-primary block">Interview</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
          Practice with AI-generated questions, get instant feedback, and track
          your progress with our futuristic interview preparation platform.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8"
            >
              Start Practicing Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
