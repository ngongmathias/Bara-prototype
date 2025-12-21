import { useState, useEffect } from 'react';
import { db } from '@/lib/supabase';

interface CountryInfo {
  id: string;
  country_id: string;
  description: string | null;
  capital: string | null;
  currency: string | null;
  language: string | null;
  population: number | null;
  area_sq_km: number | null;
  president_name: string | null;
  government_type: string | null;
  formation_date: string | null;
  gdp_usd: number | null;
  gdp_per_capita: number | null;
  currency_code: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  calling_code: string | null;
  average_age: number | null;
  largest_city: string | null;
  largest_city_population: number | null;
  capital_population: number | null;
  hdi_score: number | null;
  literacy_rate: number | null;
  life_expectancy: number | null;
  ethnic_groups: any[] | null;
  religions: any[] | null;
  national_holidays: any[] | null;
  flag_url: string | null;
  coat_of_arms_url: string | null;
  leader_image_url: string | null;
  monument_image_url: string | null;
  national_anthem_url: string | null;
  climate: string | null;
  natural_resources: string | null;
  main_industries: string | null;
  tourism_attractions: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Country Page Advertisement fields
  ad_image_url?: string | null;
  ad_company_name?: string | null;
  ad_company_website?: string | null;
  ad_tagline?: string | null;
  ad_is_active?: boolean;
  ad_click_count?: number;
  ad_view_count?: number;
}

export const useCountryInfo = (countryId: string | null) => {
  const [countryInfo, setCountryInfo] = useState<CountryInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!countryId) {
      setCountryInfo(null);
      return;
    }

    const fetchCountryInfo = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const { data, error } = await (db as any).country_info()
          .select('*')
          .eq('country_id', countryId)
          .eq('is_active', true)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // No rows found
            setCountryInfo(null);
          } else {
            throw error;
          }
        } else {
          console.log('Country info fetched successfully:', data);
          console.log('Coat of arms URL:', data.coat_of_arms_url);
          setCountryInfo(data);
        }
      } catch (err) {
        console.error('Error fetching country info:', err);
        setError('Failed to fetch country information');
        setCountryInfo(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCountryInfo();
  }, [countryId]);

  return { countryInfo, loading, error };
};
