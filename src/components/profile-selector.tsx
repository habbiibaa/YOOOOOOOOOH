"use client";

import { useState, useEffect } from "react";
import { createClient } from "../utils/supabase/client";
import { User, UserPlus, Pencil } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import Image from "next/image";
import { useRouter } from "next/navigation";

type Profile = {
  id: string;
  name: string;
  type: "primary" | "child" | "parent";
  avatar_url: string | null;
};

export default function ProfileSelector() {
  const supabase = createClient();
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [showAddProfile, setShowAddProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [newProfileType, setNewProfileType] = useState<"child" | "parent">(
    "child",
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    // Clear any previous errors
    setError(null);
    console.log("Fetching profiles...");
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/sign-in");
        return;
      }

      // Check if user has any profiles
      const { data: existingProfiles, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching profiles:", error);
        throw error;
      }

      // If no profiles exist, create a primary profile
      console.log("Existing profiles:", existingProfiles);
      if (!existingProfiles || existingProfiles.length === 0) {
        // Default values for user data
        let userName = user.email?.split("@")[0] || "Primary Profile";
        let userAvatar = null;

        // First check if the users table exists and has the columns we need
        try {
          // First check if the users table exists by using a safer approach
          try {
            // Use a simple query to check if the table exists and has the user
            const { data: tableCheck, error: tableError } = await supabase
              .from("users")
              .select("count(*)")
              .limit(1);

            if (tableError) {
              console.log("Users table might not exist, using default values");
              // Continue with default values
            } else {
              // Table exists, now safely check if the user exists
              const { data: userExists, error: checkError } = await supabase
                .from("users")
                .select("id")
                .eq("id", user.id)
                .limit(1);

              if (checkError || !userExists || userExists.length === 0) {
                console.log(
                  "User not found in users table, using default values",
                );
                // Continue with default values
              } else {
                // User exists, try to get their data
                try {
                  const { data: userData, error: userDataError } =
                    await supabase
                      .from("users")
                      .select("full_name, avatar_url")
                      .eq("id", user.id)
                      .limit(1);

                  if (userDataError || !userData || userData.length === 0) {
                    console.log("No user data found, using default values");
                    // Continue with default values
                  } else {
                    // Only use userData if it exists and there's no error
                    userName = userData[0].full_name || userName;
                    userAvatar = userData[0].avatar_url || null;
                  }
                } catch (innerError) {
                  console.log(
                    "Exception in user data fetch, using default values:",
                    innerError,
                  );
                  // Continue with default values
                }
              }
            }
          } catch (tableCheckError) {
            console.error("Error checking users table:", tableCheckError);
            // Continue with default values
          }
        } catch (userFetchError) {
          console.error("Exception fetching user data:", userFetchError);
          // Continue with default values
        }

        try {
          // First check if a profile already exists to avoid duplicates
          const { data: existingProfile } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", user.id)
            .eq("type", "primary")
            .maybeSingle();

          // Only create if no profile exists
          if (!existingProfile) {
            const { data: newProfile, error: createError } = await supabase
              .from("profiles")
              .insert({
                user_id: user.id,
                name: userName,
                type: "primary",
                avatar_url: userAvatar,
              })
              .select()
              .maybeSingle();

            if (createError) {
              console.error("Error creating profile:", createError);
              throw createError;
            }

            if (newProfile) {
              setProfiles([newProfile as Profile]);
              setSelectedProfile(newProfile.id);
            }
          } else {
            // Use the existing profile
            setProfiles([existingProfile as Profile]);
            setSelectedProfile(existingProfile.id);
          }
        } catch (profileCreateError) {
          console.error("Exception creating profile:", profileCreateError);
          setError("Failed to create profile. Please try again.");
        }
      } else {
        setProfiles(existingProfiles as Profile[]);
        // Select the primary profile by default
        const primaryProfile = existingProfiles.find(
          (p) => p.type === "primary",
        );
        if (primaryProfile) {
          setSelectedProfile(primaryProfile.id);
        } else {
          setSelectedProfile(existingProfiles[0].id);
        }
      }
    } catch (err) {
      console.error("Error fetching profiles:", err);
      setError("Failed to load profiles");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSelect = async (profileId: string) => {
    setSelectedProfile(profileId);
    // Store the selected profile in session storage
    sessionStorage.setItem("selectedProfileId", profileId);
    
    try {
      // Get user role to redirect to the appropriate dashboard
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/sign-in");
        return;
      }

      // Get user role from the users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      console.log("User data for redirection:", userData);

      if (userError) {
        console.error("Error fetching user role:", userError);
        // Default to player dashboard if role can't be determined
        router.push("/dashboard/player");
        return;
      }

      // Redirect based on role
      if (userData.role === "admin") {
        console.log("Redirecting to admin dashboard");
        router.push("/dashboard/admin");
      } else if (userData.role === "coach") {
        console.log("Redirecting to coach dashboard");
        router.push("/dashboard/coach");
      } else {
        console.log("Redirecting to player dashboard");
        router.push("/dashboard/player");
      }
    } catch (error) {
      console.error("Error redirecting to dashboard:", error);
      // Default fallback
      router.push("/dashboard");
    }
  };

  const handleAddProfile = async () => {
    if (!newProfileName.trim()) {
      setError("Profile name is required");
      return;
    }

    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/sign-in");
        return;
      }

      // Check if user already has 5 profiles
      if (profiles.length >= 5) {
        setError("Maximum of 5 profiles allowed per account");
        return;
      }

      try {
        // Check if a profile with this name already exists for this user
        const { data: existingNameProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .eq("name", newProfileName.trim())
          .maybeSingle();

        if (existingNameProfile) {
          setError("A profile with this name already exists");
          return;
        }

        // Insert profile using .maybeSingle() to handle cases with no rows
        const { data: newProfile, error: createError } = await supabase
          .from("profiles")
          .insert({
            user_id: user.id,
            name: newProfileName.trim(),
            type: newProfileType,
            avatar_url: null,
          })
          .select()
          .maybeSingle();

        if (createError) {
          console.error("Error creating profile:", createError);
          throw createError;
        }

        if (newProfile) {
          setProfiles([...profiles, newProfile as Profile]);
          setNewProfileName("");
          setShowAddProfile(false);
          setError(null);

          // Refresh profiles list
          fetchProfiles();
        }
      } catch (profileCreateError) {
        console.error("Exception creating profile:", profileCreateError);
        throw profileCreateError;
      }
    } catch (err) {
      console.error("Error adding profile:", err);
      setError("Failed to add profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Clear error when rendering profiles
    if (profiles.length > 0 && error === "Failed to load profiles") {
      setError(null);
    }
  }, [profiles, error]);

  if (loading && profiles.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-card p-6 rounded-xl border border-border shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-foreground">
        Player Profiles
      </h2>

      {error && (
        <div className="bg-destructive/30 border border-destructive text-destructive-foreground p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-6">
        {profiles.map((profile) => (
          <div
            key={profile.id}
            className={`cursor-pointer transition-all duration-300 ${selectedProfile === profile.id ? "scale-105 ring-2 ring-primary" : "hover:scale-105"}`}
            onClick={() => handleProfileSelect(profile.id)}
          >
            <div className="bg-card rounded-lg overflow-hidden p-4 flex flex-col items-center">
              <div className="relative w-16 h-16 rounded-full overflow-hidden bg-muted mb-2">
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-foreground font-bold text-xl">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <span className="text-foreground text-sm font-medium truncate w-full text-center">
                {profile.name}
              </span>
              <span className="text-muted-foreground text-xs">
                {profile.type.charAt(0).toUpperCase() + profile.type.slice(1)}
              </span>
            </div>
          </div>
        ))}

        {profiles.length < 5 && (
          <Dialog open={showAddProfile} onOpenChange={setShowAddProfile}>
            <DialogTrigger asChild>
              <div className="cursor-pointer transition-all duration-300 hover:scale-105">
                <div className="bg-card rounded-lg overflow-hidden p-4 flex flex-col items-center justify-center h-full border border-dashed border-muted hover:border-primary">
                  <UserPlus className="w-10 h-10 text-muted-foreground mb-2" />
                  <span className="text-foreground text-sm font-medium">
                    Add Player
                  </span>
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="bg-background border border-border text-foreground">
              <DialogHeader>
                <DialogTitle className="text-foreground">
                  Add New Player
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">
                    Player Name
                  </Label>
                  <Input
                    id="name"
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                    placeholder="Enter profile name"
                    className="bg-card border-border text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-foreground">
                    Player Type
                  </Label>
                  <Select
                    value={newProfileType}
                    onValueChange={(value: "child" | "parent") =>
                      setNewProfileType(value)
                    }
                  >
                    <SelectTrigger className="bg-card border-border text-foreground">
                      <SelectValue placeholder="Select player type" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border text-foreground">
                      <SelectItem value="child">Child</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowAddProfile(false)}
                  className="border-border text-foreground hover:bg-accent"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddProfile}
                  disabled={loading}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {loading ? "Adding..." : "Add Profile"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {selectedProfile && (
        <div className="flex justify-end">
          <Button
            onClick={() => router.push("/dashboard")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Continue to Dashboard
          </Button>
        </div>
      )}
    </div>
  );
}
