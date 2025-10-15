import CompanyLogos from "@/components/atoms/company-logos";
import FeaturesGrid from "@/components/molecules/features-grid";
import Footer from "@/components/organisms/footer";
import HeroSection from "@/components/organisms/hero-section";
import Navbar from "@/components/organisms/landing-page-navbar";

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
