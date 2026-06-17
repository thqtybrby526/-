import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Ensure environment variables are loaded
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || "https://wufymhbyxwheihtxadnb.supabase.co";
// Support both standard SUPABASE_KEY and SUPABASE_SERVICE_ROLE_KEY
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseKey) {
  console.warn("⚠️ Warning: SUPABASE_KEY environment variable is not defined. Please add it to your environment variables inside the Secrets panel.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
