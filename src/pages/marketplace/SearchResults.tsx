import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { Search } from 'lucide-react';

export const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(query);

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select(`
          *,
          marketplace_categories(name, slug),
          countries(name),
          marketplace_listing_images(image_url, is_primary)
        `)
        .eq('status', 'active')
        .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,location_details.ilike.%${searchQuery}%`);

      if (error) throw error;

      const transformed = (data || []).map((listing: any) => ({
        ...listing,
        category: listing.marketplace_categories,
        country: listing.countries,
        images: listing.marketplace_listing_images || [],
      }));

      setResults(transformed);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/marketplace/search?q=${encodeURIComponent(searchInput)}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex gap-2">
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search marketplace..."
                className="flex-1 font-roboto"
              />
              <Button type="submit" className="bg-black hover:bg-gray-800">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </form>

          {/* Results */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-black font-comfortaa">
              {loading ? 'Searching...' : `${results.length} results for "${query}"`}
            </h1>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-16 border border-gray-200 rounded-lg">
              <p className="text-gray-500 text-lg font-roboto">No results found for "{query}"</p>
              <p className="text-gray-400 text-sm font-roboto mt-2">Try different keywords</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {results.map((listing) => {
                const primaryImage = listing.images?.find((img: any) => img.is_primary)?.image_url ||
                                   listing.images?.[0]?.image_url ||
                                   '/placeholder.jpg';

                return (
                  <div
                    key={listing.id}
                    onClick={() => navigate(`/marketplace/listing/${listing.id}`)}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:border-black transition-colors cursor-pointer"
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative w-full sm:w-48 h-48 bg-gray-100 flex-shrink-0">
                        <img
                          src={primaryImage}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 p-4">
                        <div className="text-2xl font-bold text-black mb-2 font-comfortaa">
                          {listing.currency} {listing.price?.toLocaleString()}
                        </div>

                        <h3 className="font-medium text-black mb-2 font-roboto">
                          {listing.title}
                        </h3>

                        <p className="text-gray-700 text-sm mb-2 line-clamp-2 font-roboto">
                          {listing.description}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-gray-600 font-roboto">
                          <span>{listing.category?.name}</span>
                          <span>•</span>
                          <span>{listing.country?.name}</span>
                          <span>•</span>
                          <span>{new Date(listing.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SearchResults;
