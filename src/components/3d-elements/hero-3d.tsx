"use client";

import Image from "next/image";

export default function Hero3D() {
  return (
    <div className="relative w-full h-full min-h-[400px] bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl overflow-hidden flex items-center justify-center">
      {/* Background elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>

      {/* Main content */}
      <div className="relative z-10 text-center p-6">
        <div className="mb-6 bg-white/30 backdrop-blur-sm p-4 rounded-xl border border-white/20 shadow-lg">
          <Image
            src="https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&q=80"
            alt="Squash player in action"
            width={500}
            height={300}
            className="rounded-lg object-cover"
            unoptimized
          />
        </div>
        <h3 className="text-xl font-semibold text-gray-800">
          Ramy Ashour Squash Academy
        </h3>
        <p className="text-gray-600">Train with the world champion</p>
      </div>
    </div>
  );
}
