import { createClient } from "@supabase/supabase-js";

/**
 * Supabase Configuration Example
 *
 * Copy this file to supabase.js and fill in your credentials:
 * cp config/supabase.example.js config/supabase.js
 *
 * To get your Supabase credentials:
 * 1. Go to https://supabase.com
 * 2. Select your project (or create a new one)
 * 3. Go to Project Settings > API
 * 4. Copy the "Project URL" and "anon/public" key
 */

const SUPABASE_URL = "https://yeijpbyhqcgfpgadxabk.supabase.co"; // e.g., 'https://xxxxxxxxxxxxx.supabase.co'
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllaWpwYnlocWNnZnBnYWR4YWJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NDI2MDcsImV4cCI6MjA3NzQxODYwN30.JB8MmQ193hkRDIHldnnKXP-TvSPVI1wHG8N9Jwk-Uyc"; // e.g., 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
