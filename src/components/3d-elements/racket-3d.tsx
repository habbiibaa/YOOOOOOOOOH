"use client";

export default function Racket3D() {
  return (
    <div className="relative w-full h-full min-h-[300px] bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl overflow-hidden flex items-center justify-center">
      {/* Background elements */}
      <div className="absolute top-10 left-10 w-16 h-16 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
      <div className="absolute bottom-10 right-10 w-24 h-24 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
      <div className="absolute top-1/3 right-1/4 w-20 h-20 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>

      {/* Static Racket SVG */}
      <div className="w-48 h-64 relative z-10">
        <svg
          viewBox="0 0 100 160"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-2xl"
        >
          {/* Racket handle */}
          <rect x="45" y="90" width="10" height="60" rx="2" fill="#374151" />

          {/* Racket head */}
          <ellipse
            cx="50"
            cy="50"
            rx="40"
            ry="50"
            fill="#3b82f6"
            stroke="#2563eb"
            strokeWidth="1"
          />

          {/* Racket strings - Vertical */}
          <line
            x1="30"
            y1="10"
            x2="30"
            y2="90"
            stroke="#e5e7eb"
            strokeWidth="0.5"
          />
          <line
            x1="35"
            y1="10"
            x2="35"
            y2="90"
            stroke="#e5e7eb"
            strokeWidth="0.5"
          />
          <line
            x1="40"
            y1="10"
            x2="40"
            y2="90"
            stroke="#e5e7eb"
            strokeWidth="0.5"
          />
          <line
            x1="45"
            y1="10"
            x2="45"
            y2="90"
            stroke="#e5e7eb"
            strokeWidth="0.5"
          />
          <line
            x1="50"
            y1="10"
            x2="50"
            y2="90"
            stroke="#e5e7eb"
            strokeWidth="0.5"
          />
          <line
            x1="55"
            y1="10"
            x2="55"
            y2="90"
            stroke="#e5e7eb"
            strokeWidth="0.5"
          />
          <line
            x1="60"
            y1="10"
            x2="60"
            y2="90"
            stroke="#e5e7eb"
            strokeWidth="0.5"
          />
          <line
            x1="65"
            y1="10"
            x2="65"
            y2="90"
            stroke="#e5e7eb"
            strokeWidth="0.5"
          />
          <line
            x1="70"
            y1="10"
            x2="70"
            y2="90"
            stroke="#e5e7eb"
            strokeWidth="0.5"
          />

          {/* Racket strings - Horizontal */}
          <line
            x1="20"
            y1="15"
            x2="80"
            y2="15"
            stroke="#e5e7eb"
            strokeWidth="0.5"
          />
          <line
            x1="20"
            y1="22"
            x2="80"
            y2="22"
            stroke="#e5e7eb"
            strokeWidth="0.5"
          />
          <line
            x1="20"
            y1="29"
            x2="80"
            y2="29"
            stroke="#e5e7eb"
            strokeWidth="0.5"
          />
          <line
            x1="20"
            y1="36"
            x2="80"
            y2="36"
            stroke="#e5e7eb"
            strokeWidth="0.5"
          />
          <line
            x1="20"
            y1="43"
            x2="80"
            y2="43"
            stroke="#e5e7eb"
            strokeWidth="0.5"
          />
          <line
            x1="20"
            y1="50"
            x2="80"
            y2="50"
            stroke="#e5e7eb"
            strokeWidth="0.5"
          />
          <line
            x1="20"
            y1="57"
            x2="80"
            y2="57"
            stroke="#e5e7eb"
            strokeWidth="0.5"
          />
          <line
            x1="20"
            y1="64"
            x2="80"
            y2="64"
            stroke="#e5e7eb"
            strokeWidth="0.5"
          />
          <line
            x1="20"
            y1="71"
            x2="80"
            y2="71"
            stroke="#e5e7eb"
            strokeWidth="0.5"
          />
          <line
            x1="20"
            y1="78"
            x2="80"
            y2="78"
            stroke="#e5e7eb"
            strokeWidth="0.5"
          />
          <line
            x1="20"
            y1="85"
            x2="80"
            y2="85"
            stroke="#e5e7eb"
            strokeWidth="0.5"
          />

          {/* Grip wrap */}
          <rect
            x="45"
            y="95"
            width="10"
            height="3"
            rx="1"
            fill="#4b5563"
            opacity="0.7"
          />
          <rect
            x="45"
            y="100"
            width="10"
            height="3"
            rx="1"
            fill="#4b5563"
            opacity="0.7"
          />
          <rect
            x="45"
            y="105"
            width="10"
            height="3"
            rx="1"
            fill="#4b5563"
            opacity="0.7"
          />
          <rect
            x="45"
            y="110"
            width="10"
            height="3"
            rx="1"
            fill="#4b5563"
            opacity="0.7"
          />
          <rect
            x="45"
            y="115"
            width="10"
            height="3"
            rx="1"
            fill="#4b5563"
            opacity="0.7"
          />
          <rect
            x="45"
            y="120"
            width="10"
            height="3"
            rx="1"
            fill="#4b5563"
            opacity="0.7"
          />
          <rect
            x="45"
            y="125"
            width="10"
            height="3"
            rx="1"
            fill="#4b5563"
            opacity="0.7"
          />
          <rect
            x="45"
            y="130"
            width="10"
            height="3"
            rx="1"
            fill="#4b5563"
            opacity="0.7"
          />
          <rect
            x="45"
            y="135"
            width="10"
            height="3"
            rx="1"
            fill="#4b5563"
            opacity="0.7"
          />
          <rect
            x="45"
            y="140"
            width="10"
            height="3"
            rx="1"
            fill="#4b5563"
            opacity="0.7"
          />

          {/* Shine effect */}
          <ellipse cx="35" cy="30" rx="15" ry="20" fill="white" opacity="0.1" />
        </svg>

        {/* Decorative glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-30"></div>
      </div>
    </div>
  );
}
