import Logo from "@/components/atoms/logo-the-mockr";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
          <Logo />
          <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-right">
            © 2025 Themockr. Built with AI for the future of interview
            preparation.
          </p>
        </div>
      </div>
    </footer>
  );
}
