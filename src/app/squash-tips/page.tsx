import Footer from "@/components/footer";
import Navbar from "@/components/navbar";

export default function SquashTipsPage() {
  const tips = [
    {
      title: "Mastering the Forehand Drive",
      content:
        "The forehand drive is a fundamental shot in squash. Keep your racket face open, maintain a firm grip, and follow through with your swing. Practice hitting the ball consistently to the back corners of the court.",
      author: "Ramy Ashour",
      category: "Technique",
    },
    {
      title: "Improving Your Court Movement",
      content:
        "Efficient movement is crucial in squash. Always return to the T position after each shot, stay on your toes, and use small adjustment steps to position yourself correctly for each shot. Practice ghosting drills to improve your movement patterns.",
      author: "Coach Sarah",
      category: "Fitness",
    },
    {
      title: "Developing a Strategic Game Plan",
      content:
        "Analyze your opponent's weaknesses and adapt your strategy accordingly. Mix up your shots, vary the pace, and use the height of the front wall effectively. Remember that squash is as much a mental game as it is physical.",
      author: "Coach Mike",
      category: "Strategy",
    },
    {
      title: "The Perfect Backhand Technique",
      content:
        "For a solid backhand, position your body sideways to the front wall, keep your elbow up, and maintain a relaxed grip. Focus on making clean contact with the ball and follow through with your swing toward the target.",
      author: "Ramy Ashour",
      category: "Technique",
    },
    {
      title: "Effective Conditioning for Squash",
      content:
        "Squash demands excellent cardiovascular fitness and muscular endurance. Incorporate high-intensity interval training, plyometrics, and core strengthening exercises into your routine. Don't forget to include flexibility work to prevent injuries.",
      author: "Coach David",
      category: "Fitness",
    },
    {
      title: "Mastering the Volley",
      content:
        "Volleying allows you to take time away from your opponent. Position yourself early, keep your racket up and ready, and focus on timing rather than power. Practice intercepting the ball at different heights and angles.",
      author: "Ramy Ashour",
      category: "Technique",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
            RESOURCES
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Squash Tips & Advice
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Improve your game with expert tips and advice from Ramy Ashour and
            our professional coaching team.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tips.map((tip, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {tip.category}
                  </span>
                  <span className="text-sm text-gray-500">{tip.author}</span>
                </div>
                <h3 className="text-xl font-bold mb-3">{tip.title}</h3>
                <p className="text-gray-600">{tip.content}</p>
                <button className="mt-4 text-blue-600 font-medium hover:text-blue-800 transition-colors flex items-center gap-1">
                  Read more
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
