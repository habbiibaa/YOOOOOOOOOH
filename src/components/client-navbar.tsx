"use client";
import Link from "next/link";
import { Button } from "./ui/button";
import { UserCircle, Menu, ChevronDown } from "lucide-react";
import UserProfile from "./user-profile";
import { useState, useEffect } from "react";
import { createClient } from '@/utils/supabase/client';
import { usePathname, useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";

export default function ClientNavbar() {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Initialize Supabase client
    const supabase = createClient();
    
    // Fetch the current user on initial load
    async function fetchUser() {
      try {
        const { data } = await supabase.auth.getUser();
        setUser(data.user);
        
        // Get user role from database if user exists
        if (data.user) {
          const { data: userData, error } = await supabase
            .from('users')
            .select('role')
            .eq('id', data.user.id)
            .single();
            
          if (!error && userData) {
            setUserRole(userData.role);
          }
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUser();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        
        // Update the user state based on the session
        setUser(session?.user || null);
        
        // Reset role when signing out
        if (!session?.user) {
          setUserRole(null);
        } else {
          // Get user role
          const { data: userData, error } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single();
            
          if (!error && userData) {
            setUserRole(userData.role);
          }
        }
        
        // Handle sign in and sign out events
        if (event === 'SIGNED_IN' && session) {
          // Force a router refresh to update any server components
          router.refresh();
        } else if (event === 'SIGNED_OUT') {
          // Redirect to home page on sign out if on a protected page
          if (pathname.startsWith('/dashboard') || pathname === '/profiles') {
            router.push('/');
          }
          router.refresh();
        }
      }
    );
    
    // Clean up the subscription when the component unmounts
    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, router]);

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
          {!loading && user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-white hover:text-red-400 hidden sm:flex items-center gap-1">
                    Dashboard
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Main Dashboard</Link>
                  </DropdownMenuItem>
                  
                  {userRole === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/admin">Admin Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  
                  {userRole === 'coach' && (
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/coach">Coach Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  
                  {userRole === 'player' && (
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/player">Player Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/edit-profile">Profile Settings</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <UserProfile />
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