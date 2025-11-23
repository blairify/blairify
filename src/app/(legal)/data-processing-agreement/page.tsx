import { Typography } from "@/components/common/atoms/typography";
import Footer from "@/components/common/organisms/footer";
import Navbar from "@/components/landing-page/organisms/landing-page-navbar";

export default function DataProcessingAgreementPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-6 py-12 max-w-4xl">
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <Typography.Heading1 className="mb-4">
              Data Processing Agreement
            </Typography.Heading1>
            <p className="text-muted-foreground mb-8">
              Last Updated: October 24, 2025
            </p>

            <section className="mb-8">
              <Typography.Heading2 className="mb-4">
                Introduction
              </Typography.Heading2>
              <p className="mb-4">
                This Data Processing Agreement establishes the terms under which
                Blairify processes personal data on behalf of our users. This
                agreement is designed to comply with the General Data Protection
                Regulation (GDPR), Poland's RODO, and other applicable data
                protection laws. It defines the rights and obligations of both
                parties regarding the processing of personal data through our
                AI-powered interview preparation platform.
              </p>
            </section>

            <section className="mb-8">
              <Typography.Heading2 className="mb-4">
                Contact Information
              </Typography.Heading2>
              <p className="mb-4">
                For any questions, concerns, or requests related to this Data
                Processing Agreement or our data processing activities, please
                contact us at blairify.team@gmail.com. We are committed to
                addressing all inquiries promptly and working with you to ensure
                compliance with all applicable data protection laws and
                regulations.
              </p>
              <p className="mb-4">
                <strong>Data Protection Contact:</strong>{" "}
                blairify.team@gmail.com
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
