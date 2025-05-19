// Usage:
// In PowerShell, set your environment variables before running this script:
// $env:SUPABASE_URL="your_supabase_url"
// $env:SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
// node scripts/seed-sessions.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables must be set.');
    console.error('In PowerShell, use:');
    console.error('$env:SUPABASE_URL="your_supabase_url"');
    console.error('$env:SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function seedSessions() {
    const sessions = JSON.parse(fs.readFileSync('data/sessions.json', 'utf8'));
    for (const session of sessions) {
        await supabase.from('sessions').insert([{...session }]);
    }
    console.log('Sessions imported successfully!');
}

seedSessions();