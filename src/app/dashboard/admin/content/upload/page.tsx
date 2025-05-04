import DashboardNavbar from "@/components/dashboard-navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "../../../../../utils/supabase/server";
import { redirect } from "next/navigation";
import { ArrowLeft, Upload, File, X } from "lucide-react";
import Link from "next/link";

export default async function UploadTrainingVideosPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Get user data including role
  let { data: userData, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (userError || (userData?.role !== "admin" && userData?.role !== "coach")) {
    return redirect("/dashboard");
  }

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-2 mb-6">
            <Link
              href="/dashboard/admin"
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold">Upload Training Videos</h1>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-3xl mx-auto">
            <form>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Video Details</h2>

                  <div className="space-y-2">
                    <Label htmlFor="title">Video Title</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="Backhand Technique Fundamentals"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Learn the proper technique for executing a powerful backhand..."
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <select
                        id="category"
                        name="category"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select a category</option>
                        <option value="technique">Technique</option>
                        <option value="strategy">Strategy</option>
                        <option value="fitness">Fitness</option>
                        <option value="mental">Mental Game</option>
                        <option value="match-analysis">Match Analysis</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="skill_level">Skill Level</Label>
                      <select
                        id="skill_level"
                        name="skill_level"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select a skill level</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="professional">Professional</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input
                      id="tags"
                      name="tags"
                      placeholder="backhand, technique, fundamentals"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Upload Video</h2>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <Upload className="w-12 h-12 text-gray-400" />
                      <div>
                        <p className="text-lg font-medium">
                          Drag and drop your video file here
                        </p>
                        <p className="text-sm text-gray-500">
                          or click to browse files
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">
                        MP4, MOV or AVI up to 500MB
                      </p>
                      <input
                        type="file"
                        className="hidden"
                        id="video_file"
                        accept="video/*"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          document.getElementById("video_file")?.click()
                        }
                      >
                        Select File
                      </Button>
                    </div>
                  </div>

                  {/* This would show when a file is selected */}
                  <div className="hidden bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <File className="w-8 h-8 text-blue-600" />
                      <div>
                        <p className="font-medium">training-video.mp4</p>
                        <p className="text-xs text-gray-500">45.2 MB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Link href="/dashboard/admin">
                    <Button variant="outline" type="button">
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Upload Video
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
