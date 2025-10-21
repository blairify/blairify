import Footer from "@/components/common/organisms/footer";
import CompanyLogos from "@/components/interview/company-logos";
import FeaturesGrid from "@/components/landing-page/features-grid";
import HeroSection from "@/components/landing-page/hero-section";
import Navbar from "@/components/landing-page/landing-page-navbar";

export default function HomePage() {
  const scrollThreshold = 500;
  return (
    <>
      <div className="mb-20">
        <div className="min-h-screen bg-transparent relative z-10">
          <Navbar scrollThreshold={scrollThreshold} />
          <main className="bg-[color:var(--background)] text-[color:var(--foreground)]">
            <HeroSection />
            <FeaturesGrid />
            <div className="container mx-auto px-6">
              <CompanyLogos />
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
}
