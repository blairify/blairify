"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[color:var(--background)] text-[color:var(--muted-foreground)] border-t border-[color:var(--border)] transition-colors duration-300">
      <div className="container mx-auto px-6 py-12 max-w-7xl flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm">
          © {new Date().getFullYear()} AI Interview Prep. Built with ❤️ by
          Blairify Team.
        </p>

        <div className="flex gap-6 text-sm">
          <Link
            href="/privacy"
            className="hover:text-[color:var(--foreground)] transition"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="hover:text-[color:var(--foreground)] transition"
          >
            Terms
          </Link>
          <Link
            href="/contact"
            className="hover:text-[color:var(--foreground)] transition"
          >
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
