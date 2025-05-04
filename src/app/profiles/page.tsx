import { createClient } from "../../utils/supabase/server";
import { redirect } from "next/navigation";
import ClientNavbar from "@/components/client-navbar";
import ProfileSelector from "@/components/profile-selector";
import { Suspense } from "react";

export default async function ProfilesPage() {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return redirect("/sign-in");
    }
  
    return (
      <div className="min-h-screen bg-background">
        <ClientNavbar />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-8 text-foreground text-center">
              Select Player Profile
            </h1>
            <Suspense fallback={<div className="flex items-center justify-center min-h-[200px]">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>}>
              <ProfileSelector />
            </Suspense>
          </div>
        </main>
      </div>
    );
  } catch (error) {
    console.error("Error in profiles page:", error);
    return redirect("/sign-in?message=Session%20error.%20Please%20sign%20in%20again.");
  }
}
