// Test file to verify Supabase connection
import { supabase } from './supabase';

export async function testSupabaseConnection() {
  try {
    
    // Test basic connection
    const { data, error } = await supabase
      .from('popup_ads')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Supabase connection test error:', error);
    return false;
  }
}

// Test the connection on import
testSupabaseConnection();

