import Link from "next/link";
import { createClient } from '@/utils/supabase/server';
import { Button } from "./ui/button";
import { Menu } from "lucide-react";
import { UserNav } from "./user-nav";

export default async function Navbar() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className="w-full border-b border-red-900/30 py-4 sticky top-0 z-50 bg-black backdrop-blur-md">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" prefetch className="flex items-center gap-3 group">
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-red-400">
            RAMY ASHOUR
          </span>
        </Link>

        <div className="hidden md:flex gap-8 items-center">
          {[
            { href: "/#features", label: "Features" },
            { href: "/#how-it-works", label: "How It Works" },
            { href: "/#testimonials", label: "Testimonials" },
            { href: "/pricing", label: "Pricing" },
          ].map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="text-sm font-medium text-white hover:text-red-400 relative group transition-colors duration-300"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
          ))}
        </div>

        <div className="flex gap-4 items-center">
          {user ? (
            <>
              <Link href="/dashboard" className="hidden sm:block">
                <Button className="bg-red-600 hover:bg-red-700 hover:shadow-lg transition-all duration-300 rounded-xl">
                  Dashboard
                </Button>
              </Link>
              <UserNav user={user} />
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="px-4 py-2 text-sm font-medium text-white hover:text-red-400 hidden sm:block transition-colors duration-300 relative group"
              >
                Sign In
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link
                href="/sign-up"
                className="px-5 py-2 text-sm font-medium text-black bg-red-600 hover:bg-red-700 rounded-xl hover:shadow-lg transition-all duration-300"
              >
                Sign Up
              </Link>
            </>
          )}
          <button className="md:hidden text-white hover:text-red-400 transition-colors duration-300 p-2 rounded-full hover:bg-red-900/20">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
  );
}
