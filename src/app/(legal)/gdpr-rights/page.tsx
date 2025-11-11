import Footer from "@/components/common/organisms/footer";
import Navbar from "@/components/landing-page/organisms/landing-page-navbar";

export default function GDPRRightsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-6 py-12 max-w-4xl">
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <h1 className="text-4xl font-bold mb-4">GDPR & RODO Rights</h1>
            <p className="text-muted-foreground mb-8">
              Last Updated: October 24, 2025
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Your Rights Under GDPR and RODO
              </h2>
              <p className="mb-4">
                If you are located in the European Union, European Economic
                Area, United Kingdom, or any country with similar data
                protection laws including Poland's RODO (Rozporządzenie o
                Ochronie Danych Osobowych), you have specific rights regarding
                your personal data. These rights are designed to give you
                control over your information and ensure transparency in how
                organizations process your data. At Blairify, we are committed
                to respecting and facilitating these rights.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Right to Access</h2>
              <p className="mb-4">
                Under Article 15 of the GDPR, you have the right to obtain
                confirmation as to whether we are processing your personal data
                and, if so, to request access to that data. This means you can
                request a copy of all personal information we hold about you.
                When you exercise this right, we will provide you with your
                complete account information, all practice session data and
                written responses, AI-generated feedback and assessments, usage
                logs and activity history, and any other personal data we have
                collected about you.
              </p>
              <p className="mb-4">
                To request access to your data, send an email to
                blairify.team@gmail.com with the subject line "Data Access
                Request." We will respond within 30 days and provide your data
                in a clear, structured format that is easy to understand.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Right to Rectification
              </h2>
              <p className="mb-4">
                Under Article 16 of the GDPR, you have the right to have
                inaccurate personal data corrected and to have incomplete
                personal data completed. If you discover that any information we
                hold about you is incorrect or outdated, you can request that we
                update it. For most information, you can make corrections
                directly through your account settings on Blairify. This
                includes updating your name, email address, profile information,
                and preferences.
              </p>
              <p className="mb-4">
                For data that you cannot change yourself through the platform,
                please email us at blairify.team@gmail.com with the details of
                what needs to be corrected. We will make the necessary changes
                promptly and confirm the updates with you.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Right to Erasure (Right to be Forgotten)
              </h2>
              <p className="mb-4">
                Under Article 17 of the GDPR, you have the right to request the
                deletion of your personal data in certain circumstances. This is
                sometimes called the "right to be forgotten." At Blairify, you
                can exercise this right at any time by deleting your account
                through your account settings. When you delete your account, all
                your personal data, practice sessions, responses, and associated
                information are permanently removed from our systems.
              </p>
              <p className="mb-4">
                Alternatively, you can email us at blairify.team@gmail.com to
                request account deletion, and we will process your request
                promptly. After deletion, we will send you a confirmation email
                verifying that your data has been permanently erased. Please
                note that we may retain certain data if required by law or for
                legitimate legal purposes, such as complying with legal
                obligations, resolving disputes, or enforcing our agreements.
                However, any retained data will be minimal and kept only for as
                long as legally required.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Right to Restriction of Processing
              </h2>
              <p className="mb-4">
                Under Article 18 of the GDPR, you have the right to request that
                we restrict how we process your personal data in certain
                situations. This means we can store your data but not actively
                use it. You might want to restrict processing if you contest the
                accuracy of your data and want us to verify it, if the
                processing is unlawful but you prefer restriction over deletion,
                if we no longer need the data but you need it for legal claims,
                or if you have objected to processing and are waiting for
                verification of whether our legitimate grounds override your
                interests.
              </p>
              <p className="mb-4">
                To request restriction of processing, email us at
                blairify.team@gmail.com with details of your request and the
                reason for restriction. We will implement the restriction and
                notify you before lifting it.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Right to Data Portability
              </h2>
              <p className="mb-4">
                Under Article 20 of the GDPR, you have the right to receive your
                personal data in a structured, commonly used, and
                machine-readable format. You also have the right to transmit
                this data to another service provider without hindrance from us.
                This right applies to data you have provided to us and that we
                process based on your consent or for the performance of a
                contract.
              </p>
              <p className="mb-4">
                When you exercise this right, we will provide you with a
                comprehensive data export in JSON format containing all your
                account information, practice session data, transcripts and
                responses, AI feedback and assessments, settings and
                preferences, and usage history. You can use the "Export Data"
                feature in your account settings to download this information at
                any time, or email us at blairify.team@gmail.com to request a
                data export. The exported data can be easily imported into other
                services or stored for your own records.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Right to Object</h2>
              <p className="mb-4">
                Under Article 21 of the GDPR, you have the right to object to
                the processing of your personal data in certain circumstances.
                This right applies particularly when we process your data based
                on legitimate interests or for direct marketing purposes. If you
                object to processing, we must stop processing your data unless
                we can demonstrate compelling legitimate grounds for the
                processing that override your interests, rights, and freedoms,
                or if the processing is necessary for the establishment,
                exercise, or defense of legal claims.
              </p>
              <p className="mb-4">
                To exercise your right to object, email us at
                blairify.team@gmail.com with a clear explanation of your
                objection and the specific processing activities you wish to
                object to. We will carefully consider your objection and respond
                within 30 days.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Right to Withdraw Consent
              </h2>
              <p className="mb-4">
                Under Article 7(3) of the GDPR, where we process your personal
                data based on your consent, you have the right to withdraw that
                consent at any time. Withdrawing consent does not affect the
                lawfulness of processing that occurred before the withdrawal.
                However, withdrawing consent may limit your ability to use
                certain features of Blairify that depend on that processing.
              </p>
              <p className="mb-4">
                You can withdraw consent for specific processing activities
                through your account settings or by emailing us at
                blairify.team@gmail.com. For example, you can withdraw consent
                for analytics cookies through our cookie settings page. We will
                honor your withdrawal immediately and update our processing
                accordingly.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Right to Lodge a Complaint
              </h2>
              <p className="mb-4">
                You have the right to lodge a complaint with a supervisory
                authority if you believe we have not handled your personal data
                appropriately or if you are unsatisfied with how we have
                responded to your requests. You can file a complaint with the
                data protection authority in your country of residence, place of
                work, or place where an alleged infringement occurred.
              </p>
              <p className="mb-4">
                To find your data protection authority in the European Union,
                visit the European Data Protection Board website at
                edpb.europa.eu. For users in Poland, you can contact UODO (Urząd
                Ochrony Danych Osobowych) at uodo.gov.pl. For users in the
                United Kingdom, you can contact the Information Commissioner's
                Office at ico.org.uk. Each EU member state has its own
                supervisory authority that handles data protection complaints
                and enforces GDPR compliance.
              </p>
              <p className="mb-4">
                Before lodging a formal complaint with a supervisory authority,
                we encourage you to contact us first at blairify.team@gmail.com
                so we can try to resolve your concerns directly. We take all
                privacy concerns seriously and are committed to addressing them
                promptly and thoroughly.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Rights Related to Automated Decision-Making and Profiling
              </h2>
              <p className="mb-4">
                Under Article 22 of the GDPR, you have rights related to
                automated decision-making, including profiling. At Blairify, we
                use artificial intelligence to assess your interview responses
                and provide feedback. While this is automated processing, it is
                designed solely to help you practice and improve your interview
                skills, not to make decisions that have legal or similarly
                significant effects on you.
              </p>
              <p className="mb-4">
                You have the right to request human review of any AI-generated
                assessment, to obtain an explanation of how the AI reached its
                conclusions, and to challenge automated decisions that you
                believe are incorrect or unfair. If you would like a human
                review of any AI feedback you have received, or if you have
                questions about how our AI processes your responses, please
                email us at blairify.team@gmail.com. We will provide a thorough
                explanation and, where appropriate, have a team member review
                the AI's assessment.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Response Times and Procedures
              </h2>
              <p className="mb-4">
                We are committed to responding to all requests to exercise your
                data protection rights in a timely and thorough manner. For
                standard requests, such as access, rectification, or deletion,
                we will respond within 30 days of receiving your request. For
                more complex requests that require additional time to process,
                we may extend this period by an additional 60 days. If we need
                more time, we will inform you within the first 30 days and
                explain the reason for the delay.
              </p>
              <p className="mb-4">
                All responses will be provided free of charge. However, if your
                requests are manifestly unfounded, excessive, or repetitive, we
                may charge a reasonable fee based on administrative costs or
                refuse to act on the request. Before charging any fee or
                refusing a request, we will explain our reasoning and give you
                an opportunity to withdraw or modify your request.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Verification of Identity
              </h2>
              <p className="mb-4">
                To protect your privacy and security, we may need to verify your
                identity before fulfilling certain requests, particularly those
                involving access to or deletion of personal data. This
                verification process helps ensure that personal data is not
                disclosed to unauthorized individuals or deleted by someone
                other than the account holder.
              </p>
              <p className="mb-4">
                We may ask you to provide additional information to confirm your
                identity, such as answering security questions about your
                account, providing a copy of identification (with sensitive
                information redacted), or confirming details about your account
                activity. We will only request the minimum information necessary
                to verify your identity and will handle any verification
                documents securely and confidentially.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                How to Exercise Your Rights
              </h2>
              <p className="mb-4">
                Exercising your data protection rights is straightforward. For
                most rights, you can simply email us at blairify.team@gmail.com
                with your request. Please include your full name and the email
                address associated with your Blairify account, a clear
                description of which right you wish to exercise, any specific
                details or information relevant to your request, and your
                preferred method of receiving our response.
              </p>
              <p className="mb-4">
                Some rights can also be exercised directly through your Blairify
                account settings. For example, you can update your personal
                information, download your data, delete your account, and manage
                cookie preferences all from within your account dashboard. We
                have designed these features to make it as easy as possible for
                you to control your personal data.
              </p>
              <p className="mb-4">
                We are here to help you exercise your rights and answer any
                questions you may have about data protection. Please do not
                hesitate to reach out to us at blairify.team@gmail.com. We are
                committed to transparency, respecting your privacy, and ensuring
                you have full control over your personal information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Contact Information
              </h2>
              <p className="mb-4">
                <strong>Data Protection Contact:</strong>{" "}
                blairify.team@gmail.com
              </p>
              <p className="mb-4">
                We respond to all inquiries within 30 days and are committed to
                helping you understand and exercise your data protection rights
                under GDPR and RODO regulations.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
