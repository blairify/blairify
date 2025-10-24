import type { Metadata } from "next";
import Footer from "@/components/common/organisms/footer";
import Navbar from "@/components/landing-page/landing-page-navbar";

export const metadata: Metadata = {
  title: "Privacy Policy | Blairify - How We Protect Your Data",
  description:
    "Learn how Blairify collects, uses, and protects your personal information. Our comprehensive privacy policy explains your rights and our data handling practices.",
  keywords: [
    "privacy policy",
    "data protection",
    "user privacy",
    "GDPR compliance",
    "data handling",
    "personal information",
  ],
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-6 py-12 max-w-4xl">
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground mb-8">
              Last Updated: October 24, 2025
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
              <p className="mb-4">
                Blairify operates as a free AI-powered interview preparation
                platform. We are committed to protecting your privacy and
                handling your data transparently and securely. This Privacy
                Policy explains how we collect, use, store, and protect your
                personal information when you use our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Who We Are</h2>
              <p className="mb-4">
                Blairify is operated by a team of developers. We are not a
                registered company but a project operated by individuals who are
                passionate about helping people succeed in their interviews.
              </p>
              <p className="mb-4">
                <strong>Data Protection Contact:</strong>{" "}
                blairify.team@gmail.com
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Information We Collect
              </h2>

              <h3 className="text-xl font-semibold mb-3">
                Account Information
              </h3>
              <p className="mb-4">
                When you create an account, we collect your email address, name
                (if provided), and securely hashed account credentials. This
                information helps us maintain your account and communicate with
                you about the service.
              </p>

              <h3 className="text-xl font-semibold mb-3">
                Interview Practice Data
              </h3>
              <p className="mb-4">
                We collect and store your written responses to interview
                questions, transcripts of your practice sessions, AI-generated
                feedback and scores, and your practice session history and
                statistics. This data is essential for providing you with
                personalized feedback and tracking your progress over time.
              </p>

              <h3 className="text-xl font-semibold mb-3">
                Technical Information
              </h3>
              <p className="mb-4">
                Like most online services, we automatically collect certain
                technical information when you use Blairify. This includes your
                IP address, browser type and version, device information, usage
                data and analytics, and cookies and similar technologies. This
                information helps us maintain security, improve performance, and
                understand how our service is being used.
              </p>

              <h3 className="text-xl font-semibold mb-3">
                User-Generated Content
              </h3>
              <p className="mb-4">
                We store any custom questions you create, notes and preferences
                you set, and your profile settings. This content remains under
                your control and can be modified or deleted at any time through
                your account settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                How We Use Your Information
              </h2>
              <p className="mb-4">
                We use your data to provide and improve our AI interview
                preparation services, generate personalized feedback and
                recommendations, and analyze your performance over time. Your
                information helps us maintain and secure your account,
                communicate important updates about the service, and improve our
                AI models and platform features. We also use this data to
                prevent fraud and abuse, ensuring a safe environment for all
                users.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
              <p className="mb-4">
                You have comprehensive rights regarding your personal data. You
                can request access to a copy of your personal data at any time.
                You have the right to rectify any inaccurate information and to
                have your account and all associated data erased. You can
                restrict how we process your data and request that your data be
                provided in a portable, machine-readable format. You may object
                to certain processing activities and withdraw your consent at
                any time.
              </p>
              <p className="mb-4">
                To exercise any of these rights, please contact us at
                blairify.team@gmail.com. We will respond to your request within
                30 days as required by GDPR and other applicable regulations.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Data Sharing and Disclosure
              </h2>
              <p className="mb-4">
                We want to be absolutely clear: we do not sell your data under
                any circumstances. We may share your data only in specific,
                limited situations. We work with service providers for cloud
                hosting and AI processing, and these providers are bound by
                strict data protection agreements. We may disclose data when
                required by law or when necessary to protect rights and safety.
                Any other sharing of your data requires your explicit consent.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
              <p className="mb-4">
                For any questions about this Privacy Policy or to exercise your
                data protection rights, please contact us at
                blairify.team@gmail.com. We are committed to responding to all
                inquiries within 30 days and working with you to address any
                concerns you may have about your privacy.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
