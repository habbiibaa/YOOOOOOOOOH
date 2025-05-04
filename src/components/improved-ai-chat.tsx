"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, X, Calendar, Video, Info } from "lucide-react";
import { createClient } from "../utils/supabase/client";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ImprovedAIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

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
      // First try to use the server API endpoint
      const {
        data: { user },
      } = await supabase.auth.getUser();

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: input,
            userId: user?.id,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.response) {
            // Add AI response from server
            setMessages((prev) => [
              ...prev,
              { role: "assistant", content: data.response },
            ]);
            setIsLoading(false);
            return;
          }
        }
        // If server API fails, fall back to client-side processing
        throw new Error("Server API failed");
      } catch (serverError) {
        console.log("Falling back to client-side processing:", serverError);
        // Process the message with client-side logic
        const response = await processMessage(input);

        // Add AI response
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: response },
        ]);
      }
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

  // Quick action buttons
  const quickActions = [
    {
      icon: <Calendar className="w-4 h-4" />,
      label: "Book Session",
      action: () => {
        setInput("I'd like to book a training session");
        handleQuickAction("I'd like to book a training session");
      },
    },
    {
      icon: <Video className="w-4 h-4" />,
      label: "Video Analysis",
      action: () => {
        setInput("How does video analysis work?");
        handleQuickAction("How does video analysis work?");
      },
    },
    {
      icon: <Info className="w-4 h-4" />,
      label: "About Academy",
      action: () => {
        setInput("Tell me about Ramy Ashour Academy");
        handleQuickAction("Tell me about Ramy Ashour Academy");
      },
    },
  ];

  const handleQuickAction = async (message: string) => {
    // Add user message
    const userMessage = { role: "user" as const, content: message };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Process the message with AI
      const response = await processMessage(message);

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
      setInput("");
    }
  };

  // Process message with a knowledge base and fallback to external LLM API
  const processMessage = async (message: string): Promise<string> => {
    const lowerMessage = message.toLowerCase();

    // Check user role for permission-based responses
    const {
      data: { user },
    } = await supabase.auth.getUser();
    let userRole = "visitor";

    if (user) {
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (userData) {
        userRole = userData.role;
      }
    }

    // Handle general "what can you help with" questions
    if (
      lowerMessage.includes("what else") ||
      lowerMessage.includes("what can you help") ||
      lowerMessage.includes("how can you help") ||
      lowerMessage.includes("what do you do")
    ) {
      return "I can help you with a variety of squash-related topics, including:\n\n• Booking training sessions with our coaches\n• Information about our membership plans and pricing\n• Tips to improve your squash technique and strategy\n• Details about our AI video analysis service\n• Information about Ramy Ashour and our academy\n• Scheduling and rescheduling sessions\n• Accessing our training content library\n\nIs there something specific from this list you'd like to know more about?";
    }

    // Try to match with predefined responses first

    // Booking related queries
    if (lowerMessage.includes("book") && lowerMessage.includes("session")) {
      if (userRole === "visitor") {
        return "To book a session, you'll need to sign up or sign in first. Would you like me to guide you through the registration process?";
      } else if (userRole === "player") {
        return "You can book a session by following these steps:\n\n1. Go to your dashboard\n2. Click on 'Book Session' in the quick actions\n3. Select your preferred coach from the available list\n4. Choose a date and time from the coach's availability\n5. Confirm your booking\n\nWould you like me to help you with anything specific about the booking process?";
      } else if (userRole === "coach" || userRole === "admin") {
        return "As a coach, you can manage your availability for bookings in your dashboard. Players will be able to book sessions during your available time slots. Would you like to know how to set your availability?";
      }
    }

    // Scheduling/rescheduling permissions
    if (
      lowerMessage.includes("reschedule") ||
      (lowerMessage.includes("change") && lowerMessage.includes("session"))
    ) {
      if (userRole === "visitor") {
        return "You need to be signed in to reschedule sessions. Please sign up or sign in first.";
      } else if (userRole === "player") {
        return "As a player, you can reschedule your booked sessions up to 24 hours before the scheduled time without any penalty. To reschedule:\n\n1. Go to your dashboard\n2. Find the session under 'Upcoming Sessions'\n3. Click on 'Reschedule'\n4. Select a new date and time\n5. Confirm the changes\n\nPlease note that rescheduling within 24 hours of the session may incur a fee.";
      } else if (userRole === "coach") {
        return "As a coach, you can reschedule sessions with your players when necessary. To do so:\n\n1. Go to your dashboard\n2. View your upcoming sessions\n3. Select the session you need to reschedule\n4. Click 'Reschedule'\n5. Choose a new time slot\n6. The player will be notified of the change\n\nPlease try to reschedule with adequate notice to maintain a good relationship with your players.";
      } else if (userRole === "admin") {
        return "As an administrator, you have full permissions to reschedule any session in the system. You can do this from the admin dashboard under 'Session Management'. Please ensure to notify both the coach and player when making changes to their schedule.";
      }
    }

    // Video analysis questions
    if (
      lowerMessage.includes("video") &&
      (lowerMessage.includes("analysis") || lowerMessage.includes("analyze"))
    ) {
      return "Our AI video analysis feature works in 3 simple steps:\n\n1. Upload your practice or match video through your dashboard\n2. Our AI system analyzes your technique, movement, and strategy\n3. You receive detailed feedback with specific improvement recommendations\n\nA coach will then review the AI analysis and add personalized feedback. This combination of AI precision and human expertise provides the most comprehensive assessment of your game.\n\nWould you like to know how to upload a video for analysis?";
    }

    // Academy information
    if (
      lowerMessage.includes("about") &&
      (lowerMessage.includes("academy") || lowerMessage.includes("ramy"))
    ) {
      return "The Ramy Ashour Squash Academy was founded by world champion Ramy Ashour to provide world-class squash training to players of all levels. Our academy features:\n\n- Professional coaching from certified coaches\n- AI-powered video analysis of your technique\n- Personalized training programs\n- State-of-the-art facilities\n\nRamy Ashour is a three-time World Champion and one of the most innovative players in squash history. His academy combines his unique approach to the game with cutting-edge technology to help players reach their full potential.";
    }

    // Pricing questions
    if (
      lowerMessage.includes("price") ||
      lowerMessage.includes("cost") ||
      lowerMessage.includes("fee")
    ) {
      return "We offer several membership levels to suit different training needs:\n\n- Level 1: 2500 EGP/month - 2 individual sessions per week\n- Level 2: 2800 EGP/month - 2 individual sessions per week\n- Level 3: 4200 EGP/month - 3 individual sessions per week (Most Popular)\n- Level 4: 5600 EGP/month - 4 individual sessions per week\n- Level 5: 6400 EGP/month - 4 individual sessions per week\n\nAll plans include access to our video analysis tools and training content library. Would you like more details about a specific plan?";
    }

    // Squash technique questions
    if (
      lowerMessage.includes("technique") ||
      lowerMessage.includes("improve") ||
      lowerMessage.includes("tips")
    ) {
      return "Here are some key tips to improve your squash technique:\n\n1. Proper racket grip - Hold the racket with a continental grip for most shots\n2. Good ready position - Stay on the T with knees bent and racket up\n3. Early preparation - Turn your shoulders and prepare your racket early\n4. Watch the ball - Keep your eye on the ball until contact\n5. Follow through - Complete your swing toward the target\n\nFor more specific advice, I recommend booking a session with one of our coaches or uploading a video of your play for analysis.";
    }

    // Use Google Generative AI for website and squash-related questions
    try {
      // Using Google's free AI model
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key":
              process.env.GOOGLE_API_KEY ||
              "AIzaSyD54xzPlbps0j7zwtCbJH46H-NlNeTfLJs",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are a helpful assistant for the Ramy Ashour Squash Academy. You ONLY answer questions related to the website functionality or squash-related topics. If the question is not about the website or squash, politely decline to answer and suggest asking about the academy's services, squash techniques, or website features instead. Be conversational, friendly, and vary your responses - don't use the same phrases repeatedly. Provide specific, detailed information when possible. The user is asking: ${message}`,
                  },
                ],
              },
            ],
            generationConfig: {
              maxOutputTokens: 500,
              temperature: 0.7,
              topP: 0.95,
            },
          }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        if (
          data &&
          data.candidates &&
          data.candidates[0] &&
          data.candidates[0].content
        ) {
          return data.candidates[0].content.parts[0].text;
        }
      }

      throw new Error("Google AI API attempt failed");
    } catch (error) {
      console.error("Error calling LLM APIs:", error);
      // Improved fallback response that's more conversational
      return "I'd be happy to help you with that! At the Ramy Ashour Squash Academy, we offer professional coaching, video analysis, training programs, and more. Could you please specify what aspect of squash or our academy services you're interested in learning about?";
    }
  };

  return (
    <>
      {/* Chat button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg bg-red-600 hover:bg-red-700 z-50"
      >
        <Bot className="h-6 w-6" />
      </Button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 h-[500px] bg-white rounded-xl shadow-xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-red-600" />
              <h3 className="font-semibold">Squash Academy Assistant</h3>
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
                <Bot className="h-12 w-12 mx-auto mb-2 text-red-600" />
                <p>Hi! I'm your Squash Academy assistant.</p>
                <p className="text-sm">How can I help you today?</p>

                {/* Quick action buttons */}
                <div className="mt-6 flex flex-col gap-2">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={action.action}
                      className="flex items-center justify-center gap-2 py-2 px-4 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      {action.icon}
                      <span>{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${msg.role === "user" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-800"}`}
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
