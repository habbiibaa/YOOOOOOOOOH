import { createClient } from "@/utils/supabase/server";
import PendingApprovals from "./pending-approvals";

export default async function PendingApprovalsWrapper() {
  // Server-side data fetching
  const supabase = await createClient();
  
  try {
    // Fetch all coaches with role=coach
    const { data, error } = await supabase
      .from("users")
      .select("id, full_name, email, created_at, role")
      .eq("role", "coach")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Server-side error fetching coaches:", error.message);
      return <PendingApprovals initialData={[]} serverError={error.message} />;
    }
    
    return <PendingApprovals initialData={data || []} />;
  } catch (error) {
    console.error("Server-side exception:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown server error";
    return <PendingApprovals initialData={[]} serverError={errorMessage} />;
  }
} 