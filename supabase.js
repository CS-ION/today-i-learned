import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://mpcybyfutweqklzbseno.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wY3lieWZ1dHdlcWtsemJzZW5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTMyNzkyNDQsImV4cCI6MjAwODg1NTI0NH0.dDLyURRuSKncWXChV7A9SVBL5Ka_C1VzgflLLMu8i_M";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
