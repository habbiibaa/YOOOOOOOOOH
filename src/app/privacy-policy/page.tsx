import Footer from "@/components/footer";
import Navbar from "@/components/navbar";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Privacy Policy
          </h1>

          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <p className="text-gray-600 mb-6">Last Updated: July 1, 2023</p>

            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
                <p className="text-gray-600">
                  At Ramy Ashour Squash Academy, we respect your privacy and are
                  committed to protecting your personal data. This privacy
                  policy will inform you about how we look after your personal
                  data when you visit our website and tell you about your
                  privacy rights and how the law protects you.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">
                  2. The Data We Collect
                </h2>
                <p className="text-gray-600 mb-3">
                  We may collect, use, store and transfer different kinds of
                  personal data about you which we have grouped together as
                  follows:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>
                    <strong>Identity Data</strong> includes first name, last
                    name, username or similar identifier.
                  </li>
                  <li>
                    <strong>Contact Data</strong> includes email address and
                    telephone numbers.
                  </li>
                  <li>
                    <strong>Technical Data</strong> includes internet protocol
                    (IP) address, browser type and version, time zone setting
                    and location, browser plug-in types and versions, operating
                    system and platform, and other technology on the devices you
                    use to access this website.
                  </li>
                  <li>
                    <strong>Profile Data</strong> includes your username and
                    password, your interests, preferences, feedback, and survey
                    responses.
                  </li>
                  <li>
                    <strong>Usage Data</strong> includes information about how
                    you use our website, products, and services.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">
                  3. How We Use Your Data
                </h2>
                <p className="text-gray-600 mb-3">
                  We will only use your personal data when the law allows us to.
                  Most commonly, we will use your personal data in the following
                  circumstances:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>
                    Where we need to perform the contract we are about to enter
                    into or have entered into with you.
                  </li>
                  <li>
                    Where it is necessary for our legitimate interests (or those
                    of a third party) and your interests and fundamental rights
                    do not override those interests.
                  </li>
                  <li>Where we need to comply with a legal obligation.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">
                  4. Data Security
                </h2>
                <p className="text-gray-600">
                  We have put in place appropriate security measures to prevent
                  your personal data from being accidentally lost, used, or
                  accessed in an unauthorized way, altered, or disclosed. In
                  addition, we limit access to your personal data to those
                  employees, agents, contractors, and other third parties who
                  have a business need to know. They will only process your
                  personal data on our instructions, and they are subject to a
                  duty of confidentiality.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">
                  5. Your Legal Rights
                </h2>
                <p className="text-gray-600 mb-3">
                  Under certain circumstances, you have rights under data
                  protection laws in relation to your personal data, including
                  the right to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Request access to your personal data.</li>
                  <li>Request correction of your personal data.</li>
                  <li>Request erasure of your personal data.</li>
                  <li>Object to processing of your personal data.</li>
                  <li>Request restriction of processing your personal data.</li>
                  <li>Request transfer of your personal data.</li>
                  <li>Right to withdraw consent.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">6. Contact Us</h2>
                <p className="text-gray-600">
                  If you have any questions about this privacy policy or our
                  privacy practices, please contact us at
                  privacy@ramyashour.com.
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
