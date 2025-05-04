'use client'
import { UserCircle, Settings, LogOut, User } from 'lucide-react'
import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu'
import { createClient } from '../utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function UserProfile() {
    const supabase = createClient()
    const router = useRouter()
    const [userDetails, setUserDetails] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function getUserDetails() {
            try {
                // Get the authenticated user
                const { data: { user } } = await supabase.auth.getUser()
                
                if (user) {
                    // Try to get more user details from the users table
                    const { data: userData } = await supabase
                        .from('users')
                        .select('name, full_name, avatar_url, role')
                        .eq('id', user.id)
                        .single()
                    
                    // Combine auth user with database user data
                    setUserDetails({
                        ...user,
                        name: userData?.name || userData?.full_name || user.email?.split('@')[0] || 'User',
                        avatar_url: userData?.avatar_url || null,
                        role: userData?.role || 'player'
                    })
                }
            } catch (error) {
                console.error('Error getting user details:', error)
            } finally {
                setLoading(false)
            }
        }
        
        getUserDetails()
    }, [])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    if (loading) {
        return (
            <Button variant="ghost" size="icon">
                <UserCircle className="h-6 w-6 animate-pulse" />
            </Button>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full overflow-hidden">
                    {userDetails?.avatar_url ? (
                        <div className="h-8 w-8 relative rounded-full overflow-hidden">
                            <Image 
                                src={userDetails.avatar_url} 
                                alt="Profile" 
                                fill 
                                className="object-cover"
                            />
                        </div>
                    ) : (
                        <UserCircle className="h-6 w-6" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{userDetails?.name}</p>
                        <p className="text-xs text-muted-foreground">{userDetails?.email}</p>
                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full w-fit capitalize">
                            {userDetails?.role}
                        </span>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/profiles">
                    <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        <span>Switch Profile</span>
                    </DropdownMenuItem>
                </Link>
                <Link href="/dashboard/edit-profile">
                    <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Account Settings</span>
                    </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}