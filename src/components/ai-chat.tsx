"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, X } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage = { role: "user" as const, content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Process the message with AI
      const response = await processMessage(input);

      // Add AI response
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response },
      ]);
    } catch (error) {
      console.error("Error processing message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Process message with a simple rule-based system
  const processMessage = async (message: string): Promise<string> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const lowerMessage = message.toLowerCase();

    // Booking related queries
    if (lowerMessage.includes("book") && lowerMessage.includes("session")) {
      return "I'd be happy to help you book a session! Please provide the following details:\n\n- Preferred date and time\n- Session type (Technical Training, Match Strategy, etc.)\n- Preferred coach (if any)\n\nOnce you provide these details, I can check availability and book your session.";
    }

    // Coach session queries
    if (
      lowerMessage.includes("how many sessions") &&
      lowerMessage.includes("i have")
    ) {
      return "You currently have 5 upcoming sessions:\n\n1. July 5, 2025 • 10:00 AM - Technical Training with John Smith\n2. July 5, 2025 • 2:00 PM - Match Strategy with Sarah Johnson\n3. July 6, 2025 • 11:00 AM - Technical Training with Michael Chen\n4. July 7, 2025 • 9:00 AM - Fitness Training with Emma Rodriguez\n5. July 8, 2025 • 3:00 PM - Match Analysis with David Kim\n\nAll sessions will take place at the Ramy Ashour Squash Academy - Main Branch.";
    }

    // Squash technique questions
    if (
      lowerMessage.includes("backhand") ||
      (lowerMessage.includes("technique") && lowerMessage.includes("improve"))
    ) {
      return "To improve your backhand technique, focus on these key elements:\n\n1. Proper grip - Hold the racket with a continental grip\n2. Early preparation - Turn your shoulders early\n3. Watch the ball - Keep your eye on the ball until contact\n4. Follow through - Complete your swing toward the target\n\nRamy Ashour recommends practicing ghost drills focusing specifically on your backhand movement and preparation. Would you like me to suggest some specific drills?";
    }

    // Pricing questions
    if (
      lowerMessage.includes("price") ||
      lowerMessage.includes("cost") ||
      lowerMessage.includes("fee")
    ) {
      return "Our pricing structure is as follows:\n\n- Basic Membership: $99/month\n  Includes access to training videos and AI analysis\n\n- Premium Membership: $199/month\n  Includes Basic features plus 2 coaching sessions per month\n\n- Elite Membership: $349/month\n  Includes Premium features plus unlimited coaching sessions\n\nWould you like more information about any specific membership plan?";
    }

    // About the academy
    if (
      lowerMessage.includes("about") &&
      (lowerMessage.includes("academy") || lowerMessage.includes("ramy"))
    ) {
      return "The Ramy Ashour Squash Academy was founded by world champion Ramy Ashour to provide world-class squash training to players of all levels. Our academy features:\n\n- Professional coaching from certified coaches\n- AI-powered video analysis of your technique\n- Personalized training programs\n- State-of-the-art facilities\n\nOur mission is to elevate your squash game through innovative training methods and personalized coaching.";
    }

    // Default response
    return "I'm your Squash Academy assistant. I can help with booking sessions, answering questions about squash techniques, or providing information about our academy. How can I assist you today?";
  };

  return (
    <>
      {/* Chat button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg bg-blue-600 hover:bg-blue-700 z-50"
      >
        <Bot className="h-6 w-6" />
      </Button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 h-[500px] bg-white rounded-xl shadow-xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold">Squash Assistant</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <Bot className="h-12 w-12 mx-auto mb-2 text-blue-600" />
                <p>Hi! I'm your Squash Academy assistant.</p>
                <p className="text-sm">How can I help you today?</p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${msg.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"}`}
                  >
                    <p className="whitespace-pre-line">{msg.content}</p>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg p-3 bg-gray-100">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                    <div
                      className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
