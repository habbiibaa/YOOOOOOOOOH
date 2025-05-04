import DashboardNavbar from "@/components/dashboard-navbar";
import { Button } from "@/components/ui/button";
import { createClient } from "../../../../../utils/supabase/server";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  ArrowUp,
  ArrowDown,
  Edit,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default async function FeaturedContentPage() {
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

  if (userError || userData?.role !== "admin") {
    return redirect("/dashboard");
  }

  // Mock featured content data
  const featuredContent = [
    {
      id: 1,
      title: "Mastering the Backhand",
      description: "Learn the perfect backhand technique with Ramy Ashour",
      thumbnail:
        "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=500&q=80",
      category: "Technique",
      featured_position: 1,
      views: 1245,
      created_at: "2023-06-15",
    },
    {
      id: 2,
      title: "Advanced Court Movement",
      description: "Improve your footwork and court coverage",
      thumbnail:
        "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=500&q=80",
      category: "Fitness",
      featured_position: 2,
      views: 987,
      created_at: "2023-06-20",
    },
    {
      id: 3,
      title: "Match Strategy Essentials",
      description: "Develop winning strategies for your squash matches",
      thumbnail:
        "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=500&q=80",
      category: "Strategy",
      featured_position: 3,
      views: 856,
      created_at: "2023-06-25",
    },
    {
      id: 4,
      title: "Volley Techniques",
      description: "Master the art of volleying with professional tips",
      thumbnail:
        "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=500&q=80",
      category: "Technique",
      featured_position: 4,
      views: 723,
      created_at: "2023-07-01",
    },
    {
      id: 5,
      title: "Mental Game Mastery",
      description: "Psychological strategies for winning under pressure",
      thumbnail:
        "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=500&q=80",
      category: "Mental Game",
      featured_position: 5,
      views: 689,
      created_at: "2023-07-05",
    },
  ];

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/admin"
                className="text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-2xl font-bold">Featured Content</h1>
            </div>
            <Link href="/dashboard/admin/content/upload">
              <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add New Content
              </Button>
            </Link>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
            <h2 className="text-lg font-semibold mb-4">
              Manage Featured Content
            </h2>
            <p className="text-gray-600 mb-4">
              Featured content appears on the homepage and in prominent
              positions throughout the platform. Drag and drop to reorder or use
              the arrow buttons.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 w-16">
                      Position
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      Content
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      Category
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      Views
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      Date Added
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {featuredContent.map((content) => (
                    <tr
                      key={content.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <div className="flex flex-col items-center">
                          <span className="font-medium mb-2">
                            {content.featured_position}
                          </span>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              disabled={content.featured_position === 1}
                            >
                              <ArrowUp className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              disabled={
                                content.featured_position ===
                                featuredContent.length
                              }
                            >
                              <ArrowDown className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded overflow-hidden">
                            <Image
                              src={content.thumbnail}
                              alt={content.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="font-medium">{content.title}</h3>
                            <p className="text-sm text-gray-500 truncate max-w-xs">
                              {content.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {content.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {content.views}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {content.created_at}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <Edit className="w-3 h-3" /> Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" /> Remove
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
