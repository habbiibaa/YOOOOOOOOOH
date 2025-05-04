import Footer from "@/components/footer";
import Hero from "@/components/hero";
import Navbar from "@/components/navbar";
import {
  ArrowUpRight,
  CheckCircle2,
  Shield,
  Users,
  Zap,
  Video,
  Calendar,
  LineChart,
  BookOpen,
} from "lucide-react";
import { createClient } from "../utils/supabase/server";
import Image from "next/image";
import { Client3DSection } from "@/components/Client3DSection";
import Link from "next/link";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // No automatic redirects, let user navigate where they want

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/90 to-gray-900">
      <Navbar />
      <Hero />
      
      {/* Dashboard Quick Access for logged-in users */}
      {user && (
        <section className="py-8 bg-black/50 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="text-white text-center sm:text-left">
                <h3 className="text-xl font-semibold">Welcome back!</h3>
                <p className="text-white/80">Continue your squash journey</p>
              </div>
              <Link 
                href="/dashboard" 
                className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-xl hover:shadow-lg transition-all"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </section>
      )}
      
      {/* Ramy Ashour Feature Section */}
      <section className="py-16 bg-gray-900 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <div className="relative w-full aspect-square max-w-md mx-auto overflow-hidden rounded-2xl shadow-2xl">
                <Image
                  src="https://images.dailynewsegypt.com/2018/09/6-3.jpg"
                  alt="Ramy Ashour"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
            <div className="md:w-1/2">
              <span className="inline-block px-4 py-1 bg-primary/80 text-white rounded-full text-sm font-medium mb-4">
                WORLD CHAMPION
              </span>
              <h2 className="text-4xl font-bold mb-6 text-white">
                Train with Ramy Ashour
              </h2>
              <p className="text-lg text-white mb-6">
                Ramy Ashour is widely regarded as one of the most talented
                squash players of all time. A three-time World Champion and
                former World #1, Ramy's unique playing style and technical
                brilliance have revolutionized the game.
              </p>
              <p className="text-lg text-white mb-6">
                Now, through this exclusive academy, players of all levels can
                access Ramy's training methodology, technical insights, and
                strategic approach to the game.
              </p>
              <a
                href="/about"
                className="inline-flex items-center px-6 py-3 text-white bg-gradient-to-r from-primary to-black rounded-xl hover:shadow-lg hover:translate-y-[-2px] transition-all duration-300 font-medium"
              >
                Learn more about Ramy
                <ArrowUpRight className="ml-2 w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section
        id="features"
        className="py-24 bg-gray-800 relative overflow-hidden"
      >
        {/* Background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium mb-4">
              FEATURES
            </span>
            <h2 className="text-4xl font-bold mb-4 text-white">
              World-Class Squash Training
            </h2>
            <p className="text-white max-w-2xl mx-auto">
              Train with Ramy Ashour's methodology and take your game to the
              next level with our comprehensive platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Video className="w-6 h-6" />,
                title: "AI Video Analysis",
                description:
                  "Get detailed feedback on your technique from our AI system",
              },
              {
                icon: <Calendar className="w-6 h-6" />,
                title: "Session Booking",
                description: "Schedule training with professional coaches",
              },
              {
                icon: <LineChart className="w-6 h-6" />,
                title: "Progress Tracking",
                description: "Monitor your improvement with detailed metrics",
              },
              {
                icon: <BookOpen className="w-6 h-6" />,
                title: "Training Library",
                description: "Access exclusive content from Ramy Ashour",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-5px] border border-gray-100 backdrop-blur-sm"
              >
                <div className="bg-red-100 w-14 h-14 rounded-xl flex items-center justify-center text-red-600 mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-700">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* About Ramy Section and How It Works Section moved to Client3DSection */}
      <Client3DSection />
      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-red-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544979590-37e9b47eb705?w=1200&q=30')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-red-600 opacity-80"></div>

        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/20 animate-float"
              style={{
                width: `${Math.random() * 10 + 5}px`,
                height: `${Math.random() * 10 + 5}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDuration: `${Math.random() * 10 + 10}s`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            ></div>
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 bg-red-100/20 text-white rounded-full text-sm font-medium mb-4">
              OUR IMPACT
            </span>
            <h2 className="text-4xl font-bold mb-4">
              Transforming Squash Players Worldwide
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20 hover:transform hover:scale-105 transition-all duration-300 group">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-6 group-hover:bg-white/30 transition-all duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <div className="text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-red-100">
                10,000+
              </div>
              <div className="text-red-100 text-lg">Active Players</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20 hover:transform hover:scale-105 transition-all duration-300 group">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-6 group-hover:bg-white/30 transition-all duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div className="text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-red-100">
                50+
              </div>
              <div className="text-red-100 text-lg">Professional Coaches</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20 hover:transform hover:scale-105 transition-all duration-300 group">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-6 group-hover:bg-white/30 transition-all duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <div className="text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-red-100">
                95%
              </div>
              <div className="text-red-100 text-lg">Improvement Rate</div>
            </div>
          </div>
        </div>
      </section>
      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="py-24 bg-white relative overflow-hidden"
      >
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium mb-4">
              TESTIMONIALS
            </span>
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              What Our Players Say
            </h2>
            <p className="text-gray-700 max-w-2xl mx-auto">
              Hear from players who have transformed their game with our
              platform.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Amateur Player",
                image:
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
                quote:
                  "The AI analysis helped me identify flaws in my technique that I never noticed before. My game has improved dramatically in just a few months.",
              },
              {
                name: "Michael Chen",
                role: "College Player",
                image:
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
                quote:
                  "Having access to Ramy's training methodology has been a game-changer. The personalized feedback from coaches is invaluable.",
              },
              {
                name: "Emma Rodriguez",
                role: "Junior Champion",
                image:
                  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
                quote:
                  "I've tried many training programs, but nothing compares to this platform. The progress tracking helps me stay motivated and focused.",
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:translate-y-[-5px]"
              >
                <div className="flex items-center mb-6">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden mr-4 border-2 border-red-100 shadow-md">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-red-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic bg-gray-50 p-4 rounded-xl border border-gray-100">
                  "{testimonial.quote}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544979590-37e9b47eb705?w=1200&q=10')] bg-cover bg-center opacity-5"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto bg-white p-12 rounded-3xl shadow-xl border border-gray-100">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              Ready to Transform Your Game?
            </h2>
            <p className="text-gray-700 mb-8 max-w-2xl mx-auto">
              Join thousands of players who are taking their squash skills to
              the next level with Ramy Ashour's training platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/sign-up"
                className="inline-flex items-center px-8 py-4 text-white bg-gradient-to-r from-red-600 to-red-800 rounded-xl hover:shadow-lg hover:translate-y-[-2px] transition-all duration-300 text-lg font-medium"
              >
                Sign Up Now
                <ArrowUpRight className="ml-2 w-4 h-4" />
              </a>
              <a
                href="/dashboard"
                className="inline-flex items-center px-8 py-4 text-gray-700 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:translate-y-[-2px] transition-all duration-300 text-lg font-medium"
              >
                View Demo
              </a>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
