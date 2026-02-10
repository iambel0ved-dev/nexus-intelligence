require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Checking connection to Supabase...");
  const { data, error } = await supabase.from('companies').select('*');
  
  if (error) {
    console.error("❌ Connection failed:", error.message);
  } else {
    console.log("✅ Connection successful!");
    console.log("Data from DB:", data);
  }
}

test();