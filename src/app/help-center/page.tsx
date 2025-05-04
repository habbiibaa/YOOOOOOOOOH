import Footer from "@/components/footer";
import Navbar from "@/components/navbar";

export default function HelpCenterPage() {
  const faqs = [
    {
      question: "How do I book a training session?",
      answer:
        "To book a training session, log in to your account, navigate to the 'Book a Session' page, select your preferred coach, date, and time, and complete the booking process. You'll receive a confirmation email with all the details.",
    },
    {
      question: "How does the video analysis feature work?",
      answer:
        "Our video analysis feature uses AI technology to analyze your technique. Simply upload a video of your practice or match, and our system will provide detailed feedback on your form, movement, and strategy. A coach will then review the AI analysis and add personalized recommendations.",
    },
    {
      question: "What equipment do I need for the training sessions?",
      answer:
        "For in-person sessions, you'll need your squash racket, non-marking court shoes, and comfortable sportswear. For online sessions, you'll need a device with a camera and internet connection, plus enough space to demonstrate techniques.",
    },
    {
      question: "Can I cancel or reschedule my booking?",
      answer:
        "Yes, you can cancel or reschedule your booking up to 24 hours before the scheduled session without any penalty. For changes within 24 hours, please contact us directly as cancellation fees may apply.",
    },
    {
      question: "How do I track my progress?",
      answer:
        "Your progress is automatically tracked in your dashboard. You can view metrics on your technique, fitness, strategy, and overall performance. After each session or video analysis, new data points are added to help you visualize your improvement over time.",
    },
    {
      question: "Is there a mobile app available?",
      answer:
        "Yes, we have mobile apps available for both iOS and Android devices. You can download them from the App Store or Google Play Store. The app allows you to book sessions, upload videos, view feedback, and track your progress on the go.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
            SUPPORT
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Help Center
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions and learn how to get the most out
            of the Ramy Ashour Squash Academy platform.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Contact Support</h2>
            <p className="text-gray-600 mb-6">
              Can't find what you're looking for? Our support team is here to
              help.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold mb-2">Email Support</h3>
                <p className="text-gray-600 mb-4">
                  Send us an email and we'll get back to you within 24 hours.
                </p>
                <a
                  href="mailto:support@ramyashour.com"
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  support@ramyashour.com
                </a>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold mb-2">Phone Support</h3>
                <p className="text-gray-600 mb-4">
                  Available Monday to Friday, 9am to 5pm (GMT+2).
                </p>
                <a
                  href="tel:+20123456789"
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  +20 123 456 789
                </a>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <details className="group">
                  <summary className="flex justify-between items-center p-6 cursor-pointer">
                    <h3 className="font-semibold text-lg">{faq.question}</h3>
                    <span className="transition-transform duration-300 group-open:rotate-180">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </span>
                  </summary>
                  <div className="px-6 pb-6 pt-0">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                </details>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
