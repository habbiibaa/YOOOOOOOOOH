import Link from "next/link";
import { Instagram, Facebook, Youtube } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-black to-gray-900 border-t border-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row justify-between mb-12">
          <div className="mb-8 md:mb-0">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-red-400">
                RAMY ASHOUR
              </span>
            </Link>
            <p className="text-white max-w-md mb-6">
              Elevate your squash game with professional coaching, AI-powered
              analysis, and exclusive training content from world champion Ramy
              Ashour.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.instagram.com/ramyashourr/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-red-500 transition-colors duration-300 bg-gray-800 p-2 rounded-full shadow-sm"
              >
                <span className="sr-only">Instagram</span>
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.facebook.com/TeamRamyAshour/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-red-500 transition-colors duration-300 bg-gray-800 p-2 rounded-full shadow-sm"
              >
                <span className="sr-only">Facebook</span>
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://www.youtube.com/@RamyAshourr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-red-500 transition-colors duration-300 bg-gray-800 p-2 rounded-full shadow-sm"
              >
                <span className="sr-only">YouTube</span>
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 lg:gap-16">
            {/* Platform Column */}
            <div>
              <h3 className="font-semibold text-red-500 mb-4 text-lg">
                Platform
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/features"
                    className="text-white hover:text-red-400 transition-colors duration-300"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="text-white hover:text-red-400 transition-colors duration-300"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="text-white hover:text-red-400 transition-colors duration-300"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-white hover:text-red-400 transition-colors duration-300"
                  >
                    Video Analysis
                  </Link>
                </li>
              </ul>
            </div>

            {/* Training Column */}
            <div>
              <h3 className="font-semibold text-red-500 mb-4 text-lg">
                Training
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="#"
                    className="text-white hover:text-red-400 transition-colors duration-300"
                  >
                    Book a Session
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-white hover:text-red-400 transition-colors duration-300"
                  >
                    Meet Our Coaches
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-white hover:text-red-400 transition-colors duration-300"
                  >
                    Training Library
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-white hover:text-red-400 transition-colors duration-300"
                  >
                    Progress Tracking
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources & Legal Column */}
            <div>
              <h3 className="font-semibold text-red-500 mb-4 text-lg">
                Resources
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/squash-tips"
                    className="text-white hover:text-red-400 transition-colors duration-300"
                  >
                    Squash Tips
                  </Link>
                </li>
                <li>
                  <Link
                    href="/help-center"
                    className="text-white hover:text-red-400 transition-colors duration-300"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-white hover:text-red-400 transition-colors duration-300"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-of-service"
                    className="text-white hover:text-red-400 transition-colors duration-300"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 text-center md:text-left text-white">
          © {currentYear} Ramy Ashour Squash Academy. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
