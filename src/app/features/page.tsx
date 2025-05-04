import Footer from "@/components/footer";
import Navbar from "@/components/navbar";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
            FEATURES
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Platform Features
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover the powerful tools and capabilities that make Ramy Ashour
            Squash Academy the ultimate training platform for squash players of
            all levels.
          </p>
        </div>

        <div className="space-y-16">
          {/* Feature 1 */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">AI Video Analysis</h2>
              <p className="text-gray-600 mb-6">
                Upload your practice videos and receive detailed AI-powered
                analysis of your technique, movement, and strategy. Our advanced
                computer vision algorithms identify areas for improvement and
                provide actionable feedback.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <div className="bg-green-100 p-1 rounded-full mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span>Frame-by-frame analysis of your technique</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="bg-green-100 p-1 rounded-full mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span>Comparison with professional player techniques</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="bg-green-100 p-1 rounded-full mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span>Personalized improvement recommendations</span>
                </li>
              </ul>
            </div>
            <div className="bg-gray-100 rounded-xl p-8 h-80 flex items-center justify-center">
              <div className="text-center text-gray-500">
                Video Analysis Illustration
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="grid md:grid-cols-2 gap-8 items-center md:order-1">
            <div className="bg-gray-100 rounded-xl p-8 h-80 flex items-center justify-center md:order-2">
              <div className="text-center text-gray-500">
                Coaching Session Illustration
              </div>
            </div>
            <div className="md:order-1">
              <h2 className="text-3xl font-bold mb-4">Professional Coaching</h2>
              <p className="text-gray-600 mb-6">
                Book one-on-one sessions with Ramy Ashour and other professional
                coaches. Get personalized training tailored to your skill level
                and goals, with flexible scheduling options.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <div className="bg-green-100 p-1 rounded-full mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span>Sessions with world-class coaches</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="bg-green-100 p-1 rounded-full mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span>Flexible scheduling to fit your availability</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="bg-green-100 p-1 rounded-full mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span>Customized training plans for your goals</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Progress Tracking</h2>
              <p className="text-gray-600 mb-6">
                Monitor your improvement over time with detailed metrics and
                visualizations. Set goals, track your achievements, and see your
                development in all aspects of your game.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <div className="bg-green-100 p-1 rounded-full mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span>Visual progress charts and metrics</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="bg-green-100 p-1 rounded-full mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span>Skill assessment in multiple areas</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="bg-green-100 p-1 rounded-full mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span>Goal setting and achievement tracking</span>
                </li>
              </ul>
            </div>
            <div className="bg-gray-100 rounded-xl p-8 h-80 flex items-center justify-center">
              <div className="text-center text-gray-500">
                Progress Tracking Illustration
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
