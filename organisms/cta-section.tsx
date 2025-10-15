import { ArrowRight } from "lucide-react";
import Link from "next/link";
import PixelCard from "@/components/molecules/PixelCard";
import { Button } from "@/components/ui/button";
import Logo from "../atoms/logo-the-mockr";
import { Card } from "../ui/card";

export default function CTASection() {
  return (
    <div className="flex flex-col items-center justify-center p-4 my-20">
      <Card className="p-6 bg-white shadow-none dark:bg-transparent">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center flex-1">
          <Logo variant="stacked" />

          <PixelCard
            variant="default"
            colors="#8209ae,#7309a4,#480a87"
            className=" border-border bg-card w-full"
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
              <h1 className="text-3xl font-bold mb-4 text-foreground">
                Ready to Ace Your Interview?
              </h1>

              <p className="text-base text-muted-foreground mb-6 max-w-sm">
                Join thousands of developers who have improved their interview
                skills with Themockr.
              </p>

              <Link href="/auth">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-6"
                >
                  Get Started Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </PixelCard>
        </div>
      </Card>
    </div>
  );
}
