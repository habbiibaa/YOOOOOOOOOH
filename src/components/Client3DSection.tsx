// Client3DSection.tsx
"use client";
import dynamic from "next/dynamic";

const Racket3D = dynamic(() => import("@/components/3d-elements/racket-3d"), { ssr: false });
const Ball3D = dynamic(() => import("@/components/3d-elements/ball-3d"), { ssr: false });

export function Client3DSection() {
  return (
    <>
      {/* About Ramy Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <div className="relative w-full aspect-square max-w-md mx-auto overflow-hidden rounded-2xl shadow-2xl bg-white/30 backdrop-blur-sm border border-white/20">
                <Racket3D />
              </div>
            </div>
            <div className="md:w-1/2">
              <span className="inline-block px-4 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium mb-4">
                ABOUT
              </span>
              <h2 className="text-4xl font-bold mb-6 text-gray-900">
                Learn from the Best
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                Ramy Ashour is widely regarded as one of the most talented
                squash players of all time. A three-time World Champion and
                former World #1, Ramy's unique playing style and technical
                brilliance have revolutionized the game.
              </p>
              <p className="text-lg text-gray-700 mb-6">
                Now, through this exclusive platform, players of all levels can
                access Ramy's training methodology, technical insights, and
                strategic approach to the game.
              </p>
              <a
                href="/about"
                className="inline-flex items-center px-6 py-3 text-white bg-gradient-to-r from-red-600 to-red-800 rounded-xl hover:shadow-lg hover:translate-y-[-2px] transition-all duration-300 font-medium"
              >
                Learn more about Ramy
                {/* ArrowUpRight icon can be added here if needed */}
              </a>
            </div>
          </div>
        </div>
      </section>
      {/* How It Works Section (with Ball3D) */}
      <section
        id="how-it-works"
        className="py-24 bg-white relative overflow-hidden"
      >
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium mb-4">
              PROCESS
            </span>
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              How It Works
            </h2>
            <p className="text-gray-700 max-w-2xl mx-auto">
              Our platform combines AI technology with professional coaching to
              deliver a comprehensive training experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:translate-y-[-5px] relative">
              <div className="absolute -top-5 -right-5 w-24 h-24">
                <Ball3D />
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3">Upload Your Videos</h3>
              <p className="text-gray-700">
                Record your practice sessions or matches and upload them to our
                platform for analysis.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:translate-y-[-5px] mt-8 md:mt-0">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center text-white font-bold text-xl mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3">AI Analysis</h3>
              <p className="text-gray-700">
                Our AI system analyzes your technique, movement, and strategy,
                providing detailed feedback.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:translate-y-[-5px] mt-8 md:mt-16">
              <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center text-white font-bold text-xl mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3">Coach Verification</h3>
              <p className="text-gray-700">
                Professional coaches review the AI assessment and provide
                additional insights and recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
