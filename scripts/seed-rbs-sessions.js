const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const RBS_BRANCH_ID = 'fbd9510e-14ab-4a6a-a129-e0430683ecaf';

const testSessions = [{
        day_of_week: 'Sunday',
        start_time: '16:30',
        end_time: '17:15',
        coach_id: 'test-coach-1',
        coach_name: 'C. Ahmed Fakhry',
        court: 'Court 1',
        type: 'individual',
        status: 'available',
        branch_id: RBS_BRANCH_ID,
    },
    {
        day_of_week: 'Sunday',
        start_time: '17:15',
        end_time: '18:00',
        coach_id: 'test-coach-2',
        coach_name: 'C. Ahmed Maher',
        court: 'Court 2',
        type: 'individual',
        status: 'available',
        branch_id: RBS_BRANCH_ID,
    },
    {
        day_of_week: 'Monday',
        start_time: '16:30',
        end_time: '17:15',
        coach_id: 'test-coach-1',
        coach_name: 'C. Ahmed Fakhry',
        court: 'Court 1',
        type: 'group',
        status: 'available',
        branch_id: RBS_BRANCH_ID,
    },
];

async function seedRBSSessions() {
    for (const session of testSessions) {
        await supabase.from('coach_sessions').insert([{...session }]);
    }
    console.log('Test RBS sessions inserted!');
}

seedRBSSessions();