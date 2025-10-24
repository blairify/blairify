import Footer from "@/components/common/organisms/footer";
import { DashboardPromo } from "@/components/landing-page/dashboard-promo";
import FeaturesGrid from "@/components/landing-page/features-grid";
import HeroSection from "@/components/landing-page/hero-section";
import { JobListingsPromo } from "@/components/landing-page/job-listings-promo";
import Navbar from "@/components/landing-page/landing-page-navbar";
import { NewsletterSignup } from "@/components/landing-page/newsletter-signup";
import { PracticeLibraryPromo } from "@/components/landing-page/practice-library-promo";
import {
  getFeaturedJobs,
  getFeaturedPracticeQuestions,
} from "@/lib/services/landing-page-data";

export default async function HomePage() {
  const scrollThreshold = 150;

  // Fetch data for promo sections
  const [featuredJobs, practiceQuestions] = await Promise.all([
    getFeaturedJobs(4), // Get 4 jobs for the 2x2 grid display
    getFeaturedPracticeQuestions(4),
  ]);

  return (
    <>
      {/* 
        RESPONSIVE PAGE STRUCTURE:
        - Mobile-first approach with progressive enhancement
        - Flexible spacing that adapts to screen size
        - Optimized for touch interactions on mobile devices
      */}
      <div className="flex-1">
        {/* 
          HERO VIEWPORT SECTION:
          - min-h-screen ensures hero takes full viewport on all devices
          - Relative positioning for layered content
          - z-index for proper stacking context
        */}
        <div className="min-h-screen bg-transparent relative z-10">
          <Navbar scrollThreshold={scrollThreshold} />

          {/* 
            MAIN CONTENT AREA:
            - Semantic main element for accessibility
            - CSS custom properties for theme consistency
            - Responsive sections with proper spacing
          */}
          <main className="bg-[color:var(--background)] text-[color:var(--foreground)]">
            {/* 
              SECTION SPACING STRATEGY:
              - Each section has responsive padding (py-16 to py-24)
              - Container classes provide consistent max-width and centering
              - Gap utilities create consistent spacing between elements
            */}
            <HeroSection />
            <JobListingsPromo jobs={featuredJobs} />
            <DashboardPromo />
            <PracticeLibraryPromo questions={practiceQuestions} />
            <FeaturesGrid />
            <NewsletterSignup />
          </main>
        </div>
      </div>

      {/* 
        FOOTER SECTION:
        - Positioned at bottom of flex container
        - Responsive layout adapts to content
        - Consistent with overall design system
      */}
      <Footer />
    </>
  );
}
