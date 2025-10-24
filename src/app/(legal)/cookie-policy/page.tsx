import Footer from "@/components/common/organisms/footer";
import Navbar from "@/components/landing-page/landing-page-navbar";

export default function CookiePolicyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-6 py-12 max-w-4xl">
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <h1 className="text-4xl font-bold mb-4">Cookie Policy</h1>
            <p className="text-muted-foreground mb-8">
              Last Updated: October 24, 2025
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">What Are Cookies?</h2>
              <p className="mb-4">
                Cookies are small text files that are stored on your device
                (computer, tablet, or mobile phone) when you visit websites.
                They help websites remember information about your visit, making
                your next visit easier and the site more useful to you. Cookies
                play an important role in providing many online services and can
                improve your browsing experience by remembering your preferences
                and settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                How We Use Cookies
              </h2>
              <p className="mb-4">
                Blairify uses cookies to provide essential functionality and to
                improve your experience on our platform. We are transparent
                about our cookie usage and give you control over non-essential
                cookies. We believe in collecting only the data necessary to
                provide you with a great interview preparation experience.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Types of Cookies We Use
              </h2>

              <h3 className="text-xl font-semibold mb-3">Essential Cookies</h3>
              <p className="mb-4">
                Essential cookies are necessary for Blairify to function
                properly. These cookies enable core functionality such as user
                authentication, security, and accessibility features. Without
                these cookies, services you have requested cannot be provided.
                Essential cookies include authentication tokens that keep you
                logged in securely, session identifiers that maintain your
                active session while you use the platform, security cookies that
                protect against fraud and unauthorized access, and preference
                cookies that remember your settings and customization choices.
                These cookies are strictly necessary for the operation of our
                service and cannot be disabled in our systems.
              </p>

              <h3 className="text-xl font-semibold mb-3">Analytics Cookies</h3>
              <p className="mb-4">
                Analytics cookies are optional and help us understand how
                visitors interact with Blairify. These cookies collect
                information anonymously, allowing us to improve our service
                based on usage patterns. Analytics cookies help us see which
                features are most popular, identify technical issues, understand
                how users navigate through the platform, and measure the
                effectiveness of new features. You can choose to disable
                analytics cookies without affecting your ability to use
                Blairify.
              </p>

              <h3 className="text-xl font-semibold mb-3">What We Don't Use</h3>
              <p className="mb-4">
                We want to be clear about what we do not use. Blairify does not
                use advertising cookies to track you across websites, social
                media tracking cookies that monitor your activity, third-party
                marketing cookies that build profiles for targeted advertising,
                or any cookies that share your data with advertisers. Your
                privacy is important to us, and we limit our cookie usage to
                what is necessary for providing and improving our service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Detailed Cookie Information
              </h2>
              <p className="mb-4">
                The following table provides specific information about the
                cookies used on Blairify, including their names, purposes,
                durations, and types.
              </p>

              <div className="overflow-x-auto mb-4">
                <table className="min-w-full border-collapse border border-border">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border border-border px-4 py-2 text-left">
                        Cookie Name
                      </th>
                      <th className="border border-border px-4 py-2 text-left">
                        Purpose
                      </th>
                      <th className="border border-border px-4 py-2 text-left">
                        Duration
                      </th>
                      <th className="border border-border px-4 py-2 text-left">
                        Type
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-border px-4 py-2">
                        auth_token
                      </td>
                      <td className="border border-border px-4 py-2">
                        Keeps you securely logged in
                      </td>
                      <td className="border border-border px-4 py-2">
                        30 days
                      </td>
                      <td className="border border-border px-4 py-2">
                        Essential
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-border px-4 py-2">
                        session_id
                      </td>
                      <td className="border border-border px-4 py-2">
                        Manages your active session
                      </td>
                      <td className="border border-border px-4 py-2">
                        Session
                      </td>
                      <td className="border border-border px-4 py-2">
                        Essential
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-border px-4 py-2">
                        preferences
                      </td>
                      <td className="border border-border px-4 py-2">
                        Remembers your settings
                      </td>
                      <td className="border border-border px-4 py-2">1 year</td>
                      <td className="border border-border px-4 py-2">
                        Essential
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-border px-4 py-2">
                        analytics_id
                      </td>
                      <td className="border border-border px-4 py-2">
                        Anonymous usage statistics
                      </td>
                      <td className="border border-border px-4 py-2">
                        2 years
                      </td>
                      <td className="border border-border px-4 py-2">
                        Analytics
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Managing Your Cookie Preferences
              </h2>

              <h3 className="text-xl font-semibold mb-3">Through Blairify</h3>
              <p className="mb-4">
                You can manage your cookie preferences directly through our
                platform. Visit our cookie settings page to enable or disable
                analytics cookies at any time. Your preferences will be saved
                and respected during all future visits. Please note that
                essential cookies cannot be disabled as they are necessary for
                the platform to function properly. Disabling essential cookies
                would prevent you from logging in, saving your preferences, and
                using core features of Blairify.
              </p>

              <h3 className="text-xl font-semibold mb-3">
                Through Your Browser
              </h3>
              <p className="mb-4">
                Most web browsers allow you to control cookies through their
                settings. You can set your browser to block all cookies, accept
                only certain cookies, or notify you when a cookie is being set.
                However, blocking essential cookies will prevent you from using
                Blairify as they are required for authentication and security.
                Each browser has different instructions for managing cookies:
              </p>
              <ul className="mb-4 list-disc pl-6">
                <li>
                  <strong>Chrome:</strong> Go to Settings, then Privacy and
                  Security, then Cookies and other site data
                </li>
                <li>
                  <strong>Firefox:</strong> Go to Settings, then Privacy and
                  Security, then Cookies and Site Data
                </li>
                <li>
                  <strong>Safari:</strong> Go to Preferences, then Privacy, then
                  Manage Website Data
                </li>
                <li>
                  <strong>Edge:</strong> Go to Settings, then Cookies and site
                  permissions, then Manage and delete cookies and site data
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Third-Party Cookies
              </h2>
              <p className="mb-4">
                Blairify uses minimal third-party services to provide our
                platform. Our cloud hosting provider may set cookies necessary
                for delivering the service securely and reliably. Our analytics
                provider may set cookies to help us understand how users
                interact with our platform, but only if you have consented to
                analytics cookies. These third-party services are bound by their
                own privacy policies and cookie policies. We carefully select
                our service providers and ensure they meet high standards for
                data protection and privacy. We do not allow third parties to
                use cookies for advertising or tracking purposes on Blairify.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Do Not Track Signals
              </h2>
              <p className="mb-4">
                Some web browsers include a "Do Not Track" (DNT) feature that
                signals to websites that you do not want to be tracked. We
                respect Do Not Track signals for analytics cookies. When we
                detect a DNT signal from your browser, we will not set analytics
                cookies or collect analytics data from your visit. However,
                essential cookies must still be used for the platform to
                function properly, as they are necessary for authentication,
                security, and basic functionality. These essential cookies do
                not track you across websites and are used only to provide the
                Blairify service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Cookie Consent</h2>
              <p className="mb-4">
                When you first visit Blairify, you will see a cookie consent
                banner that explains our use of cookies. You can choose to
                accept all cookies, accept only essential cookies, or customize
                your preferences. Essential cookies are automatically enabled as
                they are necessary for the service to work. Analytics cookies
                require your explicit consent before being activated. You can
                change your cookie preferences at any time by visiting our
                cookie settings page. Your consent choices are stored in a
                cookie so that we remember your preferences on future visits.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Updates to This Policy
              </h2>
              <p className="mb-4">
                We may update this Cookie Policy from time to time to reflect
                changes in our cookie practices, technology, or legal
                requirements. When we make significant changes, we will notify
                you through our platform or via email. We encourage you to
                review this policy periodically to stay informed about how we
                use cookies. The "Last Updated" date at the top of this policy
                indicates when it was most recently revised.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
              <p className="mb-4">
                If you have questions about our use of cookies or this Cookie
                Policy, please contact us at blairify.team@gmail.com. We are
                happy to provide additional information about our cookie
                practices and help you understand your choices regarding cookies
                on Blairify.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
