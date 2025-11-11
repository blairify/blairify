import type { Metadata } from "next";
import { BugReportButton } from "@/components/common/atoms/bug-report-button";
import Footer from "@/components/common/organisms/footer";
import { DashboardPromo } from "@/components/landing-page/organisms/dashboard-promo";
import FeaturesGrid from "@/components/landing-page/organisms/features-grid";
import HeroSection from "@/components/landing-page/organisms/hero-section";
import { JobListingsPromo } from "@/components/landing-page/organisms/job-listings-promo";
import Navbar from "@/components/landing-page/organisms/landing-page-navbar";
import { NewsletterSignup } from "@/components/landing-page/organisms/newsletter-signup";
import { PracticeLibraryPromo } from "@/components/landing-page/organisms/practice-library-promo";
import {
  getFeaturedJobs,
  getFeaturedPracticeQuestions,
} from "@/lib/services/landing-page-data";

export const metadata: Metadata = {
  title: "Blairify - AI-Powered Career Acceleration Platform ",
  description:
    "Blairify is the new standard in job search. Curated jobs meet AI-powered interview prep. Browse opportunities, and land your dream role faster. Start today!",
  keywords: [
    "job search platform",
    "tech jobs",
    "software engineer jobs",
    "interview preparation",
    "job listings",
    "career opportunities",
    "job application tracking",
    "interview practice",
    "tech career",
    "remote jobs",
    "job search",
    "job search platform",
    "job search engine",
    "job search website",
    "job search app",
    "job search tools",
  ],
  authors: [{ name: "Blairify" }],
  creator: "Blairify",
  publisher: "Blairify",
  metadataBase: new URL("https://blairify.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://blairify.com/",
    siteName: "Blairify",
    title: "Blairify - AI-Powered Career Acceleration Platform",
    description:
      "Blairify is the new standard in job search. Curated jobs meet AI-powered interview prep. Browse opportunities, practice 1000+ questions, and land your dream role faster.",
    images: [
      {
        url: "https://blairify.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Blairify - AI powered Career Acceleration Platform",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blairify - AI-powered Career Acceleration Platform",
    description:
      "Blairify is the new standard in job search. Curated jobs meet AI-powered interview prep. Land your dream role tomorrow.",
    images: ["https://blairify.com/og-image.png"],
    creator: "@blairify",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "Business",
  other: {
    "fb:app_id": "your-facebook-app-id", // TODO replace
    "og:image:secure_url": "https://blairify.com/og-image.png",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://blairify.com/#website",
      url: "https://blairify.com",
      name: "Blairify",
      description:
        "Job search platform with interview preparation tools for tech professionals",
      publisher: {
        "@id": "https://blairify.com/#organization",
      },
      potentialAction: {
        "@type": "SearchAction",
        target: "https://blairify.com/search?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": "https://blairify.com/#organization",
      name: "Blairify",
      url: "https://blairify.com",
      logo: {
        "@type": "ImageObject",
        url: "https://blairify.com/300.png",
      },
      sameAs: ["https://www.linkedin.com/company/blairify"],
    },
    {
      "@type": "WebPage",
      "@id": "https://blairify.com/#webpage",
      url: "https://blairify.com",
      name: "Blairify - Job Search & Interview Prep",
      description:
        "Find tech jobs and prepare for interviews with curated listings and practice questions",
      isPartOf: {
        "@id": "https://blairify.com/#website",
      },
      about: {
        "@id": "https://blairify.com/#organization",
      },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: "https://blairify.com/og-image.png",
      },
    },
    {
      "@type": "Service",
      serviceType: "Job Search and Interview Preparation Platform",
      provider: {
        "@id": "https://blairify.com/#organization",
      },
      areaServed: "Worldwide",
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Job Search and Interview Preparation Services",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Practice Interview Questions",
              description: "Access to 1000+ curated interview questions",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Personalized Dashboard",
              description: "Track your progress and interview preparation",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Job Listings",
              description: "Browse and apply to relevant job opportunities",
            },
          },
        ],
      },
    },
  ],
};

export default async function HomePage() {
  const scrollThreshold = 150;

  const [featuredJobs, practiceQuestions] = await Promise.all([
    getFeaturedJobs(4),
    getFeaturedPracticeQuestions(4),
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex-1">
        <div className="min-h-screen bg-transparent relative z-10">
          <Navbar scrollThreshold={scrollThreshold} />
          <main
            id="main-content"
            className="bg-[color:var(--background)] text-[color:var(--foreground)]"
            aria-label="Main content"
          >
            <HeroSection />
            <JobListingsPromo jobs={featuredJobs} />
            <DashboardPromo />
            <PracticeLibraryPromo questions={practiceQuestions} />
            <FeaturesGrid />
            <NewsletterSignup />
          </main>
        </div>
      </div>
      <Footer />
      <BugReportButton variant="floating" />
    </>
  );
}
