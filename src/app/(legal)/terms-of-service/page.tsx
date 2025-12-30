import type { Metadata } from "next";
import { Typography } from "@/components/common/atoms/typography";
import Footer from "@/components/common/organisms/footer";
import Navbar from "@/components/landing-page/organisms/landing-page-navbar";

export const metadata: Metadata = {
  title: "Terms of Service | Blairify - Platform Usage Agreement",
  description:
    "Read Blairify's terms of service to understand your rights and responsibilities when using our job search and interview preparation platform.",
  keywords: [
    "terms of service",
    "user agreement",
    "platform terms",
    "usage policy",
    "legal terms",
    "service conditions",
  ],
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsOfServicePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-6 py-12 max-w-4xl">
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <Typography.Heading1 className="mb-4">
              Terms of Service
            </Typography.Heading1>
            <p className="text-muted-foreground mb-8">
              Last Updated: October 24, 2025
            </p>

            <section className="mb-8">
              <Typography.Heading2 className="mb-4">
                Acceptance of Terms
              </Typography.Heading2>
              <p className="mb-4">
                By accessing or using Blairify, you agree to be bound by these
                Terms of Service and all applicable laws and regulations. If you
                do not agree with any part of these terms, please do not use our
                services. Your continued use of Blairify constitutes your
                acceptance of these terms and any future modifications.
              </p>
            </section>

            <section className="mb-8">
              <Typography.Heading2 className="mb-4">
                Description of Service
              </Typography.Heading2>
              <p className="mb-4">
                Blairify is a free AI-powered interview preparation platform
                that allows users to practice interview questions with AI
                feedback, record and review practice sessions through text-based
                responses, track progress over time, and receive personalized
                recommendations for improvement. Our service uses advanced
                artificial intelligence to analyze your responses and provide
                constructive feedback to help you prepare for real interviews.
              </p>
              <p className="mb-4">
                <strong>Beta Service Notice:</strong> Blairify is currently in
                beta development. The service is provided on an "as-is" basis
                and may contain bugs, limitations, or incomplete features. We
                are continuously working to improve the platform, and features
                may change without notice.
              </p>
            </section>

            <section className="mb-8">
              <Typography.Heading2 className="mb-4">
                Eligibility
              </Typography.Heading2>
              <p className="mb-4">
                To use Blairify, you must be at least 16 years old and capable
                of forming a binding contract under applicable law. You must not
                be barred from using the service under any applicable laws or
                regulations. By creating an account, you represent and warrant
                that you meet these eligibility requirements.
              </p>
            </section>

            <section className="mb-8">
              <Typography.Heading2 className="mb-4">
                User Accounts
              </Typography.Heading2>

              <h3 className="text-xl font-semibold mb-3">Account Creation</h3>
              <p className="mb-4">
                When creating an account, you must provide accurate, current,
                and complete information. You are responsible for maintaining
                the confidentiality of your account credentials and for all
                activities that occur under your account. You may not share your
                account credentials with others or allow others to access your
                account. Each person may maintain only one account on Blairify.
              </p>

              <h3 className="text-xl font-semibold mb-3">
                Account Termination
              </h3>
              <p className="mb-4">
                You may delete your account at any time through your account
                settings. Upon deletion, your data will be permanently removed
                in accordance with our Privacy Policy. We reserve the right to
                suspend or terminate accounts that violate these Terms of
                Service, engage in abusive behavior, or pose security risks to
                our platform or other users. Upon termination for any reason,
                your right to use Blairify immediately ceases.
              </p>
            </section>

            <section className="mb-8">
              <Typography.Heading2 className="mb-4">
                Acceptable Use
              </Typography.Heading2>

              <h3 className="text-xl font-semibold mb-3">Permitted Uses</h3>
              <p className="mb-4">
                You may use Blairify for personal interview preparation and
                skill development. You are welcome to create practice sessions,
                receive AI feedback, track your progress over time, and export
                your own data for personal use. Our platform is designed to help
                you improve your interview skills in a safe, supportive
                environment.
              </p>

              <h3 className="text-xl font-semibold mb-3">Prohibited Uses</h3>
              <p className="mb-4">
                You may not use Blairify to share copyrighted content without
                proper authorization, use the service for any illegal purposes,
                attempt to hack, abuse, disrupt, or compromise the security of
                our service, create multiple accounts to circumvent any
                limitations, use automated tools, bots, or scripts to scrape or
                access the service, impersonate others or provide false
                information, upload malicious content, viruses, or harmful code,
                or violate any applicable laws or regulations. Violation of
                these prohibited uses may result in immediate account
                termination and potential legal action.
              </p>
            </section>

            <section className="mb-8">
              <Typography.Heading2 className="mb-4">
                User Content
              </Typography.Heading2>

              <h3 className="text-xl font-semibold mb-3">
                Your Content Ownership
              </h3>
              <p className="mb-4">
                You retain full ownership of all content you create, submit, or
                generate while using Blairify. This includes your interview
                responses, custom questions, notes, and any other materials you
                provide. By using our service, you grant us a limited,
                non-exclusive license to process, store, and analyze your
                content solely for the purpose of providing our services to you.
                This license terminates when you delete your content or close
                your account.
              </p>

              <h3 className="text-xl font-semibold mb-3">
                Content Responsibility
              </h3>
              <p className="mb-4">
                You are solely responsible for ensuring that your content is
                legal, appropriate, and does not infringe on the rights of
                others. You represent that you have all necessary rights to
                submit your content and that it does not violate any laws,
                regulations, or third-party rights.
              </p>

              <h3 className="text-xl font-semibold mb-3">
                Our Right to Remove Content
              </h3>
              <p className="mb-4">
                We reserve the right to remove content that violates these Terms
                of Service, infringes on intellectual property rights, poses
                security risks, or is required to be removed by law. We may also
                remove content that we determine, in our sole discretion, is
                harmful to our platform or other users.
              </p>
            </section>

            <section className="mb-8">
              <Typography.Heading2 className="mb-4">
                Intellectual Property
              </Typography.Heading2>

              <h3 className="text-xl font-semibold mb-3">
                Our Intellectual Property
              </h3>
              <p className="mb-4">
                The Blairify platform, including all software, code, design
                elements, algorithms, AI models, and related technology, is the
                property of Blairify and is protected by copyright, trademark,
                and other intellectual property laws. The Blairify name and logo
                are trademarks owned by us. You may not copy, modify,
                distribute, sell, or create derivative works based on our
                intellectual property without explicit written permission.
              </p>

              <h3 className="text-xl font-semibold mb-3">
                Feedback and Suggestions
              </h3>
              <p className="mb-4">
                If you provide us with feedback, suggestions, or ideas about
                Blairify, you grant us the right to use, modify, and incorporate
                such feedback without any obligation or compensation to you.
                This helps us continuously improve our service for all users.
              </p>
            </section>

            <section className="mb-8">
              <Typography.Heading2 className="mb-4">
                Contact
              </Typography.Heading2>
              <p className="mb-4">
                If you have any questions about these Terms of Service or need
                clarification on any provision, please contact us at
                team@blairify.com. We are committed to addressing your concerns
                and helping you understand your rights and obligations under
                these terms.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
