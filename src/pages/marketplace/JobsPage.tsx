import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { TopBannerAd } from '@/components/TopBannerAd';
import { BottomBannerAd } from '@/components/BottomBannerAd';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { MarketplaceListing } from '@/types/marketplace';
import { Search, MapPin, Briefcase, Clock, DollarSign } from 'lucide-react';

export const JobsPage = () => {
  const navigate = useNavigate();
  
  const [jobs, setJobs] = useState<MarketplaceListing[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data: categoryData } = await supabase
        .from('marketplace_categories')
        .select('id')
        .eq('slug', 'jobs')
        .single();

      if (categoryData) {
        const { data: jobsData } = await supabase
          .from('marketplace_listings')
          .select(`
            *,
            marketplace_listing_attributes(attribute_key, attribute_value)
          `)
          .eq('category_id', categoryData.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(20);

        const transformed = (jobsData || []).map((listing: any) => ({
          ...listing,
          attributes: (listing.marketplace_listing_attributes || []).reduce(
            (acc: any, attr: any) => {
              acc[attr.attribute_key] = attr.attribute_value;
              return acc;
            },
            {}
          ),
        }));

        setJobs(transformed);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Job categories with counts
  const jobCategories = [
    { name: 'Sales / Business Development', count: '210+ Jobs', image: '/jobs/sales.jpg' },
    { name: 'Driver / Delivery', count: '123+ Jobs', image: '/jobs/driver.jpg' },
    { name: 'Accounting / Finance', count: '109+ Jobs', image: '/jobs/accounting.jpg' },
    { name: 'Real Estate', count: '91+ Jobs', image: '/jobs/realestate.jpg' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <TopBannerAd />

      <main className="flex-1">
        {/* Hero Section */}
        <section 
          className="relative h-64 flex items-center justify-center bg-gradient-to-r from-red-600 to-red-700"
        >
          <div className="relative z-10 text-center max-w-2xl mx-auto px-4">
            <h1 className="text-4xl font-bold text-white mb-4 font-comfortaa">
              Job hunting made easy with BARA
            </h1>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search for jobs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 bg-white font-roboto"
                />
              </div>
              <Button className="h-12 px-8 bg-black text-white hover:bg-gray-800 font-roboto">
                Search
              </Button>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="absolute top-4 right-4 bg-white text-black hover:bg-gray-100 font-roboto"
          >
            I am a Recruiter
          </Button>
        </section>

        {/* Popular Jobs */}
        <section className="py-8 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-black mb-6 font-comfortaa">Popular Jobs</h2>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </div>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 font-roboto">No jobs available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {jobs.slice(0, 4).map((job) => (
                  <div
                    key={job.id}
                    onClick={() => navigate(`/marketplace/listing/${job.id}`)}
                    className="border border-gray-200 rounded-lg p-4 hover:border-black transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Briefcase className="w-8 h-8 text-gray-400" />
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-roboto">
                        Confidential
                      </span>
                    </div>
                    <h3 className="font-bold text-black mb-1 font-roboto">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-1 font-roboto">
                      <Clock className="w-4 h-4" />
                      {job.attributes?.employment_type || 'Full Time'}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-1 font-roboto">
                      <DollarSign className="w-4 h-4" />
                      {job.price > 0 ? `${job.currency} ${job.price.toLocaleString()}` : 'Negotiable'}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600 font-roboto">
                      <MapPin className="w-4 h-4" />
                      {job.location_details?.split(',')[0] || 'Location'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Jobs By Category */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-black mb-6 font-comfortaa">Jobs By Category</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {jobCategories.map((category) => (
                <div
                  key={category.name}
                  className="relative h-48 rounded-lg overflow-hidden cursor-pointer group"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="font-bold text-lg mb-1 font-comfortaa">{category.name}</h3>
                    <p className="text-sm font-roboto">{category.count}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-6">
              <Button variant="link" className="text-blue-600 font-roboto">
                View More Categories ›
              </Button>
            </div>
          </div>
        </section>
      </main>

      <BottomBannerAd />
      <Footer />
    </div>
  );
};

export default JobsPage;
