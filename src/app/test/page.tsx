import { createTestUser } from "../actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function TestPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Database Testing Page</h1>
      
      <div className="space-y-6">
        <div className="p-6 bg-gray-100 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">User Creation Test</h2>
          <p className="mb-4">
            This button will create a test user with all required fields in the users table.
            Check your Supabase database after clicking to see if the user was created.
          </p>
          
          <form action={async () => {
            try {
              await createTestUser();
            } catch (error) {
              console.error('Error creating test user:', error);
            }
          }}>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
              Create Test User
            </Button>
          </form>
        </div>
        
        <div className="p-6 bg-gray-100 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Migration Instructions</h2>
          <p className="mb-4">
            To apply the database migrations, follow these steps:
          </p>
          
          <ol className="list-decimal list-inside space-y-2 mb-4">
            <li>Make sure Supabase CLI is installed: <code className="bg-gray-200 px-2 py-1 rounded">npm install -g supabase</code></li>
            <li>Start your local Supabase instance: <code className="bg-gray-200 px-2 py-1 rounded">supabase start</code></li>
            <li>
              Run migrations using one of these methods:
              <ul className="list-disc list-inside ml-6 mt-2">
                <li>On Windows: <code className="bg-gray-200 px-2 py-1 rounded">.\scripts\run-migrations.ps1</code></li>
                <li>On Linux/Mac: <code className="bg-gray-200 px-2 py-1 rounded">./scripts/run-migrations.sh</code></li>
              </ul>
            </li>
          </ol>
          
          <p className="text-sm text-gray-600">
            Note: The migrations will create all necessary tables and relationships in your database.
          </p>
        </div>
        
        <div className="p-6 bg-gray-100 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Database Structure</h2>
          <p className="mb-4">
            The database schema includes the following main tables:
          </p>
          
          <ul className="list-disc list-inside space-y-1 mb-4">
            <li><strong>users</strong> - Core user accounts</li>
            <li><strong>players</strong> - Player-specific information</li>
            <li><strong>coaches</strong> - Coach-specific information</li>
            <li><strong>branches</strong> - Physical locations</li>
            <li><strong>coach_sessions</strong> - Available and booked sessions</li>
            <li><strong>subscriptions</strong> - User subscription plans</li>
            <li><strong>training_levels</strong> - Different training level offerings</li>
          </ul>
          
          <p className="text-sm text-gray-600">
            See the full schema in <code className="bg-gray-200 px-2 py-1 rounded">supabase/migrations/20240620000000_initial_schema.sql</code>
          </p>
        </div>
        
        <div className="mt-8">
          <Link href="/" className="text-blue-600 hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
} 