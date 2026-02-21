require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Using the SECRET KEY to ensure full read access to all tables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing SUPABASE_URL or SUPABASE_SECRET_KEY.");
    console.error("Please create a .env file in the root directory with these values.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeDatabaseState() {
    console.log("🚀 Starting Supabase Database Health Check...");
    console.log("---");

    // 1. Check last snapshot timestamp
    try {
        const { data: snapshot, error: snapshotError } = await supabase
            .from('price_snapshots')
            .select('detected_at')
            .order('detected_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (snapshotError) throw snapshotError;
        if (snapshot) {
            console.log(`✅ [price_snapshots]: Last entry detected at: ${new Date(snapshot.detected_at).toUTCString()}`);
        } else {
            console.log("🟡 [price_snapshots]: Table is empty or no entries found.");
        }
    } catch (e) {
        console.error(`❌ [price_snapshots]: Error fetching data - ${e.message}`);
    }

    console.log("---");

    // 2. Check last price history event
    try {
        const { data: history, error: historyError } = await supabase
            .from('price_history')
            .select('detected_at')
            .order('detected_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (historyError) throw historyError;
        if (history) {
            console.log(`✅ [price_history]: Last event detected at: ${new Date(history.detected_at).toUTCString()}`);
        } else {
            console.log("🟡 [price_history]: Table is empty or no events found.");
        }
    } catch (e) {
        console.error(`❌ [price_history]: Error fetching data - ${e.message}`);
    }

    console.log("---");
    
    // 3. Check last intelligence report
    try {
        const { data: report, error: reportError } = await supabase
            .from('intelligence_reports')
            .select('created_at')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
            
        if (reportError) throw reportError;
        if (report) {
            console.log(`✅ [intelligence_reports]: Last report created at: ${new Date(report.created_at).toUTCString()}`);
        } else {
            console.log("🟡 [intelligence_reports]: Table is empty or no reports found.");
        }
    } catch (e) {
        console.error(`❌ [intelligence_reports]: Error fetching data - ${e.message}`);
    }
    
    console.log("\n🏁 Health check complete.");
}

analyzeDatabaseState();
