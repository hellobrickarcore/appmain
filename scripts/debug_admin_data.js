
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tlcqiixlpmpguixzbbxj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsY3FpaXhscG1wZ3VpeHpiYnhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NDg5NzAsImV4cCI6MjA4ODAyNDk3MH0.FhRJqwNQ9FXkqkfPvcGL6bOtzzNHJvRVo5tauv0LiAI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  console.log('--- DB DIAGNOSTICS ---');
  console.log('Target Start Date:', sevenDaysAgo.toISOString());

  const { count: totalScans } = await supabase.from('scans').select('*', { count: 'exact', head: true });
  const { data: recentScans, error: scanError } = await supabase.from('scans').select('id, timestamp').gte('timestamp', sevenDaysAgo.toISOString());
  
  if (scanError) console.error('Scan Error:', scanError);

  const { count: totalProfiles } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
  const { count: totalIdeas } = await supabase.from('ideas').select('*', { count: 'exact', head: true });

  console.log('Total Profiles:', totalProfiles);
  console.log('Total Scans (All Time):', totalScans);
  console.log('Total Ideas (All Time):', totalIdeas);
  console.log('Scans in Last 7 Days:', recentScans?.length || 0);

  if (recentScans && recentScans.length > 0) {
    console.log('Sample Scan Timestamp:', recentScans[0].timestamp);
    console.log('Type of Timestamp:', typeof recentScans[0].timestamp);
  }
}

checkData();
