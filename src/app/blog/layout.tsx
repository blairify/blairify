import type { ReactNode } from "react";
import Footer from "@/components/common/organisms/footer";
import Navbar from "@/components/landing-page/organisms/landing-page-navbar";

const SCROLL_THRESHOLD = 50;

interface BlogLayoutProps {
  children: ReactNode;
}

export default function BlogLayout({ children }: BlogLayoutProps) {
  return (
    <div className="relative min-h-screen bg-background">
      <Navbar scrollThreshold={SCROLL_THRESHOLD} />
      <div className="pt-20">
        <main className="flex-1">{children}</main>
      </div>
      <Footer />
    </div>
  );
}
