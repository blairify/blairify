"use client";

import {
  SiAirbnb,
  SiAmazon,
  SiApple,
  SiGoogle,
  SiMeta,
  SiNetflix,
  SiSpotify,
  SiTesla,
  SiUber,
} from "react-icons/si";
import LogoLoop from "../organisms/logo-loop";

export default function CompanyLogos() {
  const companyLogos = [
    {
      node: <SiGoogle className="text-4xl" />,
      title: "Google",
      href: "https://google.com",
    },
    {
      node: <SiMeta className="text-4xl" />,
      title: "Meta",
      href: "https://meta.com",
    },
    {
      node: <SiApple className="text-4xl" />,
      title: "Apple",
      href: "https://apple.com",
    },
    {
      node: <SiAmazon className="text-4xl" />,
      title: "Amazon",
      href: "https://amazon.com",
    },
    {
      node: <SiNetflix className="text-4xl" />,
      title: "Netflix",
      href: "https://netflix.com",
    },
    {
      node: <SiTesla className="text-4xl" />,
      title: "Tesla",
      href: "https://tesla.com",
    },
    {
      node: <SiSpotify className="text-4xl" />,
      title: "Spotify",
      href: "https://spotify.com",
    },
    {
      node: <SiUber className="text-4xl" />,
      title: "Uber",
      href: "https://uber.com",
    },
    {
      node: <SiAirbnb className="text-4xl" />,
      title: "Airbnb",
      href: "https://airbnb.com",
    },
  ];

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Practice for Top Companies</h2>
        <p className="text-lg text-muted-foreground">
          Prepare for interviews at leading tech companies
        </p>
      </div>

      <div className="relative">
        <LogoLoop
          logos={companyLogos}
          speed={120}
          direction="left"
          logoHeight={48}
          gap={80}
          pauseOnHover
          scaleOnHover
          fadeOut
          fadeOutColor="hsl(var(--background))"
          ariaLabel="Company logos carousel"
          className="py-8"
        />
      </div>
    </section>
  );
}
