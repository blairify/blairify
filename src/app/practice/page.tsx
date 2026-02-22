import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Practice Library - Coming Soon | Blairify",
  description:
    "The Practice Library is being reworked and will return soon. In the meantime, continue preparing with AI interviews and real job offers.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PracticePage() {
  redirect("/dashboard");
}
