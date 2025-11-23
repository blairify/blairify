import { Typography } from "@/components/common/atoms/typography";
import Footer from "@/components/common/organisms/footer";
import Navbar from "@/components/landing-page/organisms/landing-page-navbar";

export default function LegalNoticePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-6 py-12 max-w-4xl">
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <Typography.Heading1 className="mb-4">
              Legal Notice
            </Typography.Heading1>
            <p className="text-muted-foreground mb-8">
              Last Updated: October 24, 2025
            </p>

            <section className="mb-8">
              <Typography.Heading2 className="mb-4">
                Service Provider Information
              </Typography.Heading2>
              <p className="mb-4">
                Blairify is an AI-powered interview preparation platform
                provided as a free service to help individuals practice and
                improve their interview skills. The platform allows users to
                practice interview questions, receive AI-generated feedback,
                track their progress over time, and develop confidence for real
                interviews.
              </p>
              <div className="mb-4">
                <p>
                  <strong>Service Name:</strong> Blairify
                </p>
                <p>
                  <strong>Service Type:</strong> Free AI-powered interview
                  preparation platform
                </p>
                <p>
                  <strong>Contact Email:</strong> blairify.team@gmail.com
                </p>
              </div>
            </section>

            <section className="mb-8">
              <Typography.Heading2 className="mb-4">
                Legal Status
              </Typography.Heading2>
              <p className="mb-4">
                Blairify is currently operated as a project by a team of
                developers who are passionate about helping people succeed in
                their career journeys. We are not currently a registered company
                or formal business entity. We operate this platform as a
                collaborative effort to provide valuable tools and resources to
                job seekers and professionals preparing for interviews.
              </p>
              <p className="mb-4">
                As we grow and expand our services, we are working towards
                establishing a formal business structure. We are committed to
                maintaining transparency about our legal status and will update
                this notice when our organizational structure changes. Despite
                not being a registered company, we take our responsibilities
                regarding data protection, user privacy, and service quality
                very seriously.
              </p>
            </section>

            <section className="mb-8">
              <Typography.Heading2 className="mb-4">
                Data Protection Officer
              </Typography.Heading2>
              <p className="mb-4">
                We have designated a data protection contact responsible for
                overseeing our data protection practices and ensuring compliance
                with applicable privacy laws, including GDPR, RODO, and other
                international data protection regulations. Our data protection
                contact handles all privacy-related inquiries, data subject
                rights requests, security concerns, and compliance matters.
              </p>
              <p className="mb-4">
                <strong>Data Protection Contact Email:</strong>{" "}
                blairify.team@gmail.com
              </p>
              <p className="mb-4">
                If you have questions about how we handle your personal data,
                wish to exercise your data protection rights, have concerns
                about our privacy practices, or need to report a security issue,
                please contact us at the email address above. We are committed
                to responding to all inquiries within 30 days as required by
                applicable data protection regulations.
              </p>
            </section>

            <section className="mb-8">
              <Typography.Heading2 className="mb-4">
                Supervisory Authority
              </Typography.Heading2>

              <h3 className="text-xl font-semibold mb-3">
                For European Union and EEA Users
              </h3>
              <p className="mb-4">
                If you are located in the European Union or European Economic
                Area, you have the right to lodge a complaint with your local
                data protection supervisory authority if you believe we have not
                adequately addressed your privacy concerns or if you believe we
                have violated your data protection rights. Each EU member state
                has its own supervisory authority responsible for enforcing GDPR
                and investigating complaints.
              </p>
              <p className="mb-4">
                You can find contact information for all EU data protection
                authorities on the European Data Protection Board website at
                edpb.europa.eu. Your complaint should be filed with the
                authority in your country of residence, your place of work, or
                the place where you believe a violation of data protection law
                occurred.
              </p>

              <h3 className="text-xl font-semibold mb-3">For Polish Users</h3>
              <p className="mb-4">
                Users in Poland can contact UODO (Urząd Ochrony Danych
                Osobowych), which is Poland's data protection supervisory
                authority responsible for enforcing RODO regulations. UODO
                investigates complaints related to personal data processing and
                ensures compliance with data protection laws in Poland.
              </p>
              <p className="mb-4">
                <strong>UODO Website:</strong> uodo.gov.pl
              </p>

              <h3 className="text-xl font-semibold mb-3">
                For Users in Other Jurisdictions
              </h3>
              <p className="mb-4">
                Users in other countries should contact their local data
                protection or privacy authority. In the United Kingdom, this is
                the Information Commissioner's Office (ico.org.uk). In
                Australia, this is the Office of the Australian Information
                Commissioner (oaic.gov.au). In the United States, various
                federal and state authorities handle privacy matters depending
                on the specific issue and jurisdiction.
              </p>
            </section>

            <section className="mb-8">
              <Typography.Heading2 className="mb-4">
                Dispute Resolution
              </Typography.Heading2>

              <h3 className="text-xl font-semibold mb-3">
                Informal Resolution
              </h3>
              <p className="mb-4">
                If you have any concerns, complaints, or disputes related to
                Blairify or our services, we strongly encourage you to contact
                us first at blairify.team@gmail.com. We are committed to
                resolving issues fairly and promptly through direct
                communication. Most concerns can be addressed quickly through
                informal discussion, and we value the opportunity to resolve
                problems before they escalate to formal proceedings.
              </p>
              <p className="mb-4">
                When you contact us with a concern, we will acknowledge receipt
                of your message within 48 hours and work diligently to address
                your issue. We aim to resolve most disputes within 30 days
                through open dialogue and mutual understanding.
              </p>

              <h3 className="text-xl font-semibold mb-3">
                Online Dispute Resolution for EU Users
              </h3>
              <p className="mb-4">
                Users in the European Union have access to the Online Dispute
                Resolution (ODR) platform provided by the European Commission.
                This platform is designed to help consumers and traders resolve
                disputes related to online purchases and services without going
                to court.
              </p>
              <p className="mb-4">
                <strong>ODR Platform:</strong> ec.europa.eu/consumers/odr
              </p>
              <p className="mb-4">
                While we are not obligated to participate in alternative dispute
                resolution procedures, we are committed to working with you to
                resolve any concerns through this platform if you choose to use
                it.
              </p>

              <h3 className="text-xl font-semibold mb-3">
                Alternative Dispute Resolution
              </h3>
              <p className="mb-4">
                In addition to informal resolution and the ODR platform,
                disputes may be resolved through mediation or other alternative
                dispute resolution methods as agreed upon by both parties. We
                believe that collaborative problem-solving often leads to better
                outcomes than adversarial legal proceedings.
              </p>
            </section>

            <section className="mb-8">
              <Typography.Heading2 className="mb-4">
                Intellectual Property
              </Typography.Heading2>

              <h3 className="text-xl font-semibold mb-3">Copyright</h3>
              <p className="mb-4">
                All content, software, code, design elements, graphics, user
                interface, and other materials that make up the Blairify
                platform are protected by copyright law. The copyright for these
                materials is owned by the Blairify team. Unauthorized
                reproduction, modification, distribution, or commercial use of
                our copyrighted materials is prohibited without explicit written
                permission.
              </p>
              <p className="mb-4">
                <strong>Copyright Notice:</strong> © 2025 Blairify. All rights
                reserved.
              </p>

              <h3 className="text-xl font-semibold mb-3">Trademarks</h3>
              <p className="mb-4">
                The Blairify name, logo, and any other marks or branding
                elements used in connection with our services are trademarks
                owned by the Blairify team. You may not use these trademarks
                without our prior written permission. Unauthorized use of our
                trademarks may constitute trademark infringement and unfair
                competition in violation of applicable laws.
              </p>

              <h3 className="text-xl font-semibold mb-3">
                Open Source Software
              </h3>
              <p className="mb-4">
                Blairify may incorporate open-source software components in our
                platform. These components are used in accordance with their
                respective open-source licenses. If you would like information
                about the open-source components we use and their licenses,
                please contact us at blairify.team@gmail.com, and we will
                provide you with the relevant information.
              </p>

              <h3 className="text-xl font-semibold mb-3">User Content</h3>
              <p className="mb-4">
                You retain all intellectual property rights to the content you
                create and submit through Blairify, including your interview
                responses, custom questions, and notes. By using our service,
                you grant us only the limited license necessary to provide our
                services to you, as described in our Terms of Service. We do not
                claim ownership of your content.
              </p>
            </section>

            <section className="mb-8">
              <Typography.Heading2 className="mb-4">
                Liability Disclaimer
              </Typography.Heading2>

              <h3 className="text-xl font-semibold mb-3">
                Service Provided As-Is
              </h3>
              <p className="mb-4">
                Blairify is provided as a free service on an "as-is" and "as
                available" basis. While we strive to provide accurate, helpful,
                and reliable AI-generated feedback, we cannot guarantee the
                accuracy, completeness, or usefulness of the information
                provided by our platform. AI technology has inherent
                limitations, and automated feedback may contain errors or may
                not be suitable for all situations.
              </p>
              <p className="mb-4">
                Our AI-generated assessments and recommendations are designed
                for practice purposes only and should not be relied upon as the
                sole basis for important career decisions. We strongly recommend
                that you seek professional career counseling and use multiple
                resources when making significant career choices.
              </p>

              <h3 className="text-xl font-semibold mb-3">
                No Guarantee of Service Availability
              </h3>
              <p className="mb-4">
                We do not guarantee that Blairify will be available at all times
                or that it will be free from errors, bugs, or interruptions. The
                service may be temporarily unavailable due to maintenance,
                technical issues, updates, or circumstances beyond our control.
                We reserve the right to modify, suspend, or discontinue any
                aspect of the service at any time without prior notice.
              </p>

              <h3 className="text-xl font-semibold mb-3">
                Third-Party Service Failures
              </h3>
              <p className="mb-4">
                Blairify relies on third-party services for hosting, AI
                processing, and other infrastructure needs. We are not liable
                for any failures, interruptions, or issues caused by these
                third-party services. While we carefully select our service
                providers and maintain appropriate agreements with them, we
                cannot control their operations or guarantee their performance.
              </p>

              <h3 className="text-xl font-semibold mb-3">
                Limitation of Liability
              </h3>
              <p className="mb-4">
                To the maximum extent permitted by applicable law, our total
                liability for any claims arising from your use of Blairify is
                limited to one hundred euros (€100) or the equivalent in your
                local currency. We are not liable for any indirect, incidental,
                special, consequential, or punitive damages, including but not
                limited to loss of profits, data, opportunities, or goodwill.
              </p>
              <p className="mb-4">
                <strong>Important Exception:</strong> Nothing in this disclaimer
                limits our liability for death or personal injury caused by our
                negligence, fraud or fraudulent misrepresentation, or any other
                liability that cannot be excluded or limited under applicable
                law. Your statutory rights as a consumer are not affected by
                these limitations.
              </p>
            </section>

            <section className="mb-8">
              <Typography.Heading2 className="mb-4">
                Third-Party Links and Content
              </Typography.Heading2>
              <p className="mb-4">
                Our platform may contain links to external websites, resources,
                or services that are not owned or controlled by Blairify. These
                links are provided for your convenience and information only. We
                do not endorse, monitor, or assume responsibility for the
                content, privacy policies, or practices of any third-party
                websites or services.
              </p>
              <p className="mb-4">
                When you access third-party websites through links on our
                platform, you do so at your own risk. We strongly advise you to
                read the terms and conditions and privacy policies of any
                third-party websites or services that you visit. We are not
                responsible for any loss or damage that may result from your
                interaction with third-party websites or services.
              </p>
            </section>

            <section className="mb-8">
              <Typography.Heading2 className="mb-4">
                Professional Advice Disclaimer
              </Typography.Heading2>
              <p className="mb-4">
                Blairify provides tools and resources for interview practice and
                preparation. The feedback and suggestions provided by our AI are
                for educational and practice purposes only. They do not
                constitute professional career counseling, legal advice, or any
                other form of professional advice.
              </p>
              <p className="mb-4">
                For specific guidance about your career path, job search
                strategy, legal rights, or other professional matters, we
                recommend consulting with qualified professionals such as career
                counselors, human resources professionals, or legal advisors.
                Every individual's situation is unique, and professional
                advisors can provide personalized guidance based on your
                specific circumstances.
              </p>
            </section>

            <section className="mb-8">
              <Typography.Heading2 className="mb-4">
                Changes to This Legal Notice
              </Typography.Heading2>
              <p className="mb-4">
                We may update this Legal Notice from time to time to reflect
                changes in our operations, legal requirements, or organizational
                structure. When we make significant changes, we will update the
                "Last Updated" date at the top of this page and may notify you
                through our platform or via email.
              </p>
              <p className="mb-4">
                We encourage you to review this Legal Notice periodically to
                stay informed about our legal status, contact information, and
                other important legal matters. Your continued use of Blairify
                after any changes to this notice constitutes your acceptance of
                the updated information.
              </p>
            </section>

            <section className="mb-8">
              <Typography.Heading2 className="mb-4">
                Contact Information
              </Typography.Heading2>
              <p className="mb-4">
                For any questions, concerns, or inquiries related to this Legal
                Notice or any legal matters concerning Blairify, please contact
                us using the information below.
              </p>
              <div className="mb-4">
                <p>
                  <strong>General Inquiries:</strong> blairify.team@gmail.com
                </p>
                <p>
                  <strong>Data Protection and Privacy:</strong>{" "}
                  blairify.team@gmail.com
                </p>
                <p>
                  <strong>Security Issues:</strong> blairify.team@gmail.com
                </p>
                <p>
                  <strong>Legal Matters:</strong> blairify.team@gmail.com
                </p>
              </div>
              <p className="mb-4">
                We are committed to responding to all inquiries promptly and
                professionally. For data protection requests, we aim to respond
                within 30 days as required by applicable regulations. For other
                inquiries, we typically respond within a few business days.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
