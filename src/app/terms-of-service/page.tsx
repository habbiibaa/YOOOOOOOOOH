import Footer from "@/components/footer";
import Navbar from "@/components/navbar";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Terms of Service
          </h1>

          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <p className="text-gray-600 mb-6">Last Updated: July 1, 2023</p>

            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-3">
                  1. Acceptance of Terms
                </h2>
                <p className="text-gray-600">
                  By accessing or using the Ramy Ashour Squash Academy platform,
                  you agree to be bound by these Terms of Service. If you do not
                  agree to all the terms and conditions, then you may not access
                  the platform or use any services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">
                  2. Description of Service
                </h2>
                <p className="text-gray-600">
                  Ramy Ashour Squash Academy provides an online platform for
                  squash training, including but not limited to video analysis,
                  coaching sessions, progress tracking, and educational content.
                  The platform is accessible via our website and mobile
                  applications.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">
                  3. User Accounts
                </h2>
                <p className="text-gray-600 mb-3">
                  To access certain features of the platform, you must register
                  for an account. You agree to provide accurate, current, and
                  complete information during the registration process and to
                  update such information to keep it accurate, current, and
                  complete.
                </p>
                <p className="text-gray-600">
                  You are responsible for safeguarding the password that you use
                  to access the platform and for any activities or actions under
                  your password. We encourage you to use a strong password and
                  to log out from your account at the end of each session.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">
                  4. Booking and Cancellation
                </h2>
                <p className="text-gray-600 mb-3">
                  When booking a coaching session, you agree to the following
                  terms:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Payment is required at the time of booking.</li>
                  <li>
                    Cancellations made more than 24 hours before the scheduled
                    session will receive a full refund.
                  </li>
                  <li>
                    Cancellations made within 24 hours of the scheduled session
                    will incur a 50% cancellation fee.
                  </li>
                  <li>No-shows will not be refunded.</li>
                  <li>
                    Rescheduling is subject to coach availability and must be
                    requested at least 24 hours in advance.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">
                  5. Content and Conduct
                </h2>
                <p className="text-gray-600 mb-3">
                  You retain ownership of any content you submit to the
                  platform, including videos, comments, and feedback. By
                  submitting content, you grant us a worldwide, non-exclusive,
                  royalty-free license to use, reproduce, modify, adapt,
                  publish, translate, and distribute your content in any
                  existing or future media.
                </p>
                <p className="text-gray-600">
                  You agree not to engage in any activity that interferes with
                  or disrupts the platform or the servers and networks connected
                  to the platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">
                  6. Limitation of Liability
                </h2>
                <p className="text-gray-600">
                  To the maximum extent permitted by law, Ramy Ashour Squash
                  Academy shall not be liable for any indirect, incidental,
                  special, consequential, or punitive damages, or any loss of
                  profits or revenues, whether incurred directly or indirectly,
                  or any loss of data, use, goodwill, or other intangible
                  losses, resulting from your access to or use of or inability
                  to access or use the platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">
                  7. Changes to Terms
                </h2>
                <p className="text-gray-600">
                  We reserve the right, at our sole discretion, to modify or
                  replace these Terms at any time. If a revision is material, we
                  will provide at least 30 days' notice prior to any new terms
                  taking effect. What constitutes a material change will be
                  determined at our sole discretion.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">8. Contact Us</h2>
                <p className="text-gray-600">
                  If you have any questions about these Terms, please contact us
                  at terms@ramyashour.com.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
