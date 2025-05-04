import DashboardNavbar from "@/components/dashboard-navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "../../../../../utils/supabase/server";
import { redirect } from "next/navigation";
import { ArrowLeft, Plus, Edit, Trash2 } from "lucide-react";
import Link from "next/link";

export default async function ContentCategoriesPage() {
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

  // Mock categories data
  const categories = [
    {
      id: 1,
      name: "Technique",
      slug: "technique",
      description: "Videos focusing on proper squash techniques and form",
      contentCount: 45,
    },
    {
      id: 2,
      name: "Strategy",
      slug: "strategy",
      description: "Content about match strategy and game planning",
      contentCount: 32,
    },
    {
      id: 3,
      name: "Fitness",
      slug: "fitness",
      description: "Workouts and fitness routines for squash players",
      contentCount: 28,
    },
    {
      id: 4,
      name: "Mental Game",
      slug: "mental-game",
      description: "Psychological aspects of squash and mental preparation",
      contentCount: 15,
    },
    {
      id: 5,
      name: "Beginner Lessons",
      slug: "beginner-lessons",
      description: "Introductory content for new squash players",
      contentCount: 22,
    },
    {
      id: 6,
      name: "Advanced Tactics",
      slug: "advanced-tactics",
      description: "Complex tactics and strategies for experienced players",
      contentCount: 18,
    },
    {
      id: 7,
      name: "Match Analysis",
      slug: "match-analysis",
      description: "Breakdowns of professional matches and key moments",
      contentCount: 24,
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
              <h1 className="text-2xl font-bold">Content Categories</h1>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Category
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Input
                  type="text"
                  placeholder="Search categories..."
                  className="pl-10"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <div className="flex gap-2">
                <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Sort by Name</option>
                  <option>Sort by Content Count</option>
                  <option>Sort by Date Created</option>
                </select>
                <Button variant="outline">Filter</Button>
              </div>
            </div>
          </div>

          {/* Categories List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      Name
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      Slug
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      Description
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      Content Count
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr
                      key={category.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 font-medium">{category.name}</td>
                      <td className="py-3 px-4 text-gray-600">
                        {category.slug}
                      </td>
                      <td className="py-3 px-4 text-gray-600 max-w-xs truncate">
                        {category.description}
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          {category.contentCount} items
                        </span>
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
                            <Trash2 className="w-3 h-3" /> Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Category Form */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
            <h2 className="text-xl font-semibold mb-4">Add New Category</h2>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor="category_name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Category Name
                  </label>
                  <Input
                    id="category_name"
                    name="category_name"
                    placeholder="e.g., Advanced Techniques"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="category_slug"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Slug
                  </label>
                  <Input
                    id="category_slug"
                    name="category_slug"
                    placeholder="e.g., advanced-techniques"
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Used in URLs. Use lowercase letters, numbers, and hyphens
                    only.
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="category_description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <textarea
                  id="category_description"
                  name="category_description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of this category"
                ></textarea>
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Category
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
