import CompanyLogos from "@/components/atoms/company-logos";
import LightRays from "@/components/atoms/light-rays";
import FeaturesGrid from "@/components/molecules/features-grid";
import CTASection from "@/components/organisms/cta-section";
import Footer from "@/components/organisms/footer";
import HeroSection from "@/components/organisms/hero-section";
import Navbar from "@/components/organisms/landing-page-navbar";

export default function HomePage() {
  const scrollThreshold = 500;
  return (
    <>
      <div className="mb-20">
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1]">
          <LightRays
            raysOrigin="top-center"
            raysColor="#8209ae"
            raysSpeed={1.5}
            lightSpread={1.8}
            rayLength={1.9}
            followMouse={true}
            mouseInfluence={0.1}
            noiseAmount={0.1}
            distortion={0.05}
            className="w-full h-full"
          />
        </div>

        <div className="min-h-screen bg-transparent relative z-10">
          <Navbar scrollThreshold={scrollThreshold} />
          <div className="pt-24">
            <HeroSection />
            <CompanyLogos />
            <CTASection />
            <FeaturesGrid />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
