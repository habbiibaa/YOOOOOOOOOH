"use client"; // Add this line at the top to mark as a Client Component
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import the 3D component with no SSR
const Hero3D = dynamic(() => import("./3d-elements/hero-3d"), { ssr: false });

export default function Hero() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-red-50 to-white">
      {/* Background blur elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-red-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-red-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="relative pt-24 pb-32 sm:pt-32 sm:pb-40">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2 text-center md:text-left z-10">
              <div className="relative">
                <div className="absolute -top-10 -left-10 w-20 h-20 bg-red-200 rounded-full opacity-50 blur-xl"></div>
                <h1 className="text-5xl sm:text-7xl font-bold text-gray-900 mb-8 tracking-tight">
                  Train Like a
                  <span className="text-red-600 block mt-2">
                    World Champion
                  </span>
                </h1>
              </div>

              <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto md:mx-0 leading-relaxed">
                Elevate your squash game with Ramy Ashour's exclusive training
                platform. AI-powered analysis, professional coaching, and
                personalized feedback.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start items-center">
                <Link
                  href="/sign-up"
                  className="inline-flex items-center px-8 py-4 text-white bg-red-600 hover:bg-red-700 rounded-xl hover:shadow-xl hover:translate-y-[-2px] transition-all duration-300 text-lg font-medium group"
                >
                  Join Now
                  <ArrowUpRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="#how-it-works"
                  className="inline-flex items-center px-8 py-4 text-gray-700 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl hover:shadow-md hover:translate-y-[-2px] transition-all duration-300 text-lg font-medium"
                >
                  Learn More
                </Link>
              </div>

              <div className="mt-12 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2 glass px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="bg-red-100 p-1 rounded-full">
                    <Check className="w-4 h-4 text-red-600" />
                  </div>
                  <span className="text-red-600 font-medium">
                    AI Video Analysis
                  </span>
                </div>
                <div className="flex items-center gap-2 glass px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="bg-red-100 p-1 rounded-full">
                    <Check className="w-4 h-4 text-red-600" />
                  </div>
                  <span className="text-red-600 font-medium">
                    Pro Coach Feedback
                  </span>
                </div>
                <div className="flex items-center gap-2 glass px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="bg-red-100 p-1 rounded-full">
                    <Check className="w-4 h-4 text-red-600" />
                  </div>
                  <span className="text-red-600 font-medium">
                    Exclusive Content
                  </span>
                </div>
              </div>
            </div>

            <div className="md:w-1/2 mt-12 md:mt-0">
              <div className="relative w-full aspect-square max-w-lg mx-auto rounded-2xl overflow-hidden shadow-2xl glass border border-white/20 hover:shadow-red-100/20 hover:border-white/30 transition-all duration-500">
                <Hero3D />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-6">
                  <div className="text-white">
                    <p className="font-semibold text-lg">
                      Ramy Ashour Squash Academy
                    </p>
                    <p className="text-sm opacity-80">
                      Professional training for all levels
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
