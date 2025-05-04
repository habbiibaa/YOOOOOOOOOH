import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { message, userId } = await request.json();

    if (!message) {
      return NextResponse.json(
        { success: false, error: "Message is required" },
        { status: 400 },
      );
    }

    // Get user role if userId is provided
    let userRole = "visitor";
    if (userId) {
      const supabase = await createClient();
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", userId)
        .single();

      if (userData) {
        userRole = userData.role;
      }
    }

    // Instead of calling external LLM API, use a rule-based approach for responses
    try {
      // Simple rule-based response system
      const lowerMessage = message.toLowerCase();
      let response =
        "I'm your Squash Academy assistant. I can help with booking sessions, answering questions about squash techniques, or providing information about our academy. How can I assist you today?";

      // Booking related queries
      if (lowerMessage.includes("book") && lowerMessage.includes("session")) {
        response =
          "I'd be happy to help you book a session! Please provide the following details:\n\n- Preferred date and time\n- Session type (Technical Training, Match Strategy, etc.)\n- Preferred coach (if any)\n\nOnce you provide these details, I can check availability and book your session.";
      }

      // Coach session queries
      else if (
        lowerMessage.includes("how many sessions") &&
        lowerMessage.includes("i have")
      ) {
        response =
          "You currently have 5 upcoming sessions:\n\n1. July 5, 2025 • 10:00 AM - Technical Training with John Smith\n2. July 5, 2025 • 2:00 PM - Match Strategy with Sarah Johnson\n3. July 6, 2025 • 11:00 AM - Technical Training with Michael Chen\n4. July 7, 2025 • 9:00 AM - Fitness Training with Emma Rodriguez\n5. July 8, 2025 • 3:00 PM - Match Analysis with David Kim\n\nAll sessions will take place at the Ramy Ashour Squash Academy - Main Branch.";
      }

      // Squash technique questions
      else if (
        lowerMessage.includes("backhand") ||
        (lowerMessage.includes("technique") && lowerMessage.includes("improve"))
      ) {
        response =
          "To improve your backhand technique, focus on these key elements:\n\n1. Proper grip - Hold the racket with a continental grip\n2. Early preparation - Turn your shoulders early\n3. Watch the ball - Keep your eye on the ball until contact\n4. Follow through - Complete your swing toward the target\n\nRamy Ashour recommends practicing ghost drills focusing specifically on your backhand movement and preparation. Would you like me to suggest some specific drills?";
      }

      // Pricing questions
      else if (
        lowerMessage.includes("price") ||
        lowerMessage.includes("cost") ||
        lowerMessage.includes("fee")
      ) {
        response =
          "Our pricing structure is as follows:\n\n- Basic Membership: $99/month\n  Includes access to training videos and AI analysis\n\n- Premium Membership: $199/month\n  Includes Basic features plus 2 coaching sessions per month\n\n- Elite Membership: $349/month\n  Includes Premium features plus unlimited coaching sessions\n\nWould you like more information about any specific membership plan?";
      }

      // About the academy
      else if (
        lowerMessage.includes("about") &&
        (lowerMessage.includes("academy") || lowerMessage.includes("ramy"))
      ) {
        response =
          "The Ramy Ashour Squash Academy was founded by world champion Ramy Ashour to provide world-class squash training to players of all levels. Our academy features:\n\n- Professional coaching from certified coaches\n- AI-powered video analysis of your technique\n- Personalized training programs\n- State-of-the-art facilities\n\nOur mission is to elevate your squash game through innovative training methods and personalized coaching.";
      }

      return NextResponse.json({
        success: true,
        response: response,
      });
    } catch (error) {
      console.error("Error in chat processing:", error);

      // Fallback to a more generic response
      return NextResponse.json({
        success: true,
        response:
          "I don't have specific information about that, but I'd be happy to help you with questions about squash training, booking sessions, or our academy services.",
      });
    }
  } catch (error) {
    console.error("Error in chat API route:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}
