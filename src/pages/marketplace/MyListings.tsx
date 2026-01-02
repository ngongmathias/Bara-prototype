import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useUser } from '@clerk/clerk-react';
import { Plus, Edit, Trash2, Eye, CheckCircle } from 'lucide-react';

export const MyListings = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (user) {
      fetchMyListings();
    }
  }, [user, filter]);

  const fetchMyListings = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase
        .from('marketplace_listings')
        .select(`
          *,
          marketplace_categories(name, slug),
          countries(name),
          marketplace_listing_images(image_url, is_primary)
        `)
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;

      const transformedListings = (data || []).map((listing: any) => ({
        ...listing,
        category: listing.marketplace_categories,
        country: listing.countries,
        images: listing.marketplace_listing_images || [],
      }));

      setListings(transformedListings);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteListing = async (listingId: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;

    try {
      const { error } = await supabase
        .from('marketplace_listings')
        .delete()
        .eq('id', listingId);

      if (error) throw error;

      alert('Listing deleted successfully');
      fetchMyListings();
    } catch (error) {
      console.error('Error deleting listing:', error);
      alert('Error deleting listing');
    }
  };

  const markAsSold = async (listingId: string) => {
    try {
      const { error } = await supabase
        .from('marketplace_listings')
        .update({ status: 'sold' })
        .eq('id', listingId);

      if (error) throw error;

      alert('Listing marked as sold');
      fetchMyListings();
    } catch (error) {
      console.error('Error updating listing:', error);
      alert('Error updating listing');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-black mb-4 font-comfortaa">Sign In Required</h2>
            <p className="text-gray-600 mb-6 font-roboto">Please sign in to view your listings</p>
            <Button onClick={() => navigate('/sign-in')} className="bg-black hover:bg-gray-800">
              Sign In
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-black font-comfortaa">My Listings</h1>
              <p className="text-gray-600 font-roboto mt-2">Manage your marketplace listings</p>
            </div>
            <Button
              onClick={() => navigate('/marketplace/post')}
              className="bg-black hover:bg-gray-800 font-roboto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Post New Listing
            </Button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            {[
              { value: 'all', label: 'All' },
              { value: 'active', label: 'Active' },
              { value: 'pending', label: 'Pending' },
              { value: 'sold', label: 'Sold' },
              { value: 'expired', label: 'Expired' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`px-4 py-2 font-roboto text-sm border-b-2 transition-colors ${
                  filter === tab.value
                    ? 'border-black text-black font-medium'
                    : 'border-transparent text-gray-600 hover:text-black'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Listings */}
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
              <p className="mt-4 text-gray-600 font-roboto">Loading your listings...</p>
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-16 border border-gray-200 rounded-lg">
              <p className="text-gray-500 text-lg font-roboto mb-4">No listings found</p>
              <Button
                onClick={() => navigate('/marketplace/post')}
                className="bg-black hover:bg-gray-800 font-roboto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Post Your First Listing
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {listings.map((listing) => {
                const primaryImage = listing.images?.find((img: any) => img.is_primary)?.image_url ||
                                   listing.images?.[0]?.image_url ||
                                   '/placeholder.jpg';

                return (
                  <div
                    key={listing.id}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:border-black transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Image */}
                      <div className="relative w-full sm:w-48 h-48 bg-gray-100 flex-shrink-0">
                        <img
                          src={primaryImage}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                        <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold ${
                          listing.status === 'active' ? 'bg-green-500 text-white' :
                          listing.status === 'pending' ? 'bg-yellow-500 text-black' :
                          listing.status === 'sold' ? 'bg-gray-500 text-white' :
                          'bg-red-500 text-white'
                        }`}>
                          {listing.status.toUpperCase()}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-bold text-black font-comfortaa">
                              {listing.title}
                            </h3>
                            <p className="text-sm text-gray-600 font-roboto">
                              {listing.category?.name} • {listing.country?.name}
                            </p>
                          </div>
                          <div className="text-xl font-bold text-black font-comfortaa">
                            {listing.currency} {listing.price?.toLocaleString()}
                          </div>
                        </div>

                        <p className="text-gray-700 text-sm mb-4 line-clamp-2 font-roboto">
                          {listing.description}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-gray-600 font-roboto mb-4">
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {listing.views_count || 0} views
                          </span>
                          <span>
                            Posted: {new Date(listing.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/marketplace/listing/${listing.id}`)}
                            className="font-roboto"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/marketplace/edit/${listing.id}`)}
                            className="font-roboto"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          
                          {listing.status === 'active' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => markAsSold(listing.id)}
                              className="font-roboto"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Mark as Sold
                            </Button>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteListing(listing.id)}
                            className="text-red-600 hover:text-red-700 hover:border-red-600 font-roboto"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
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

export default MyListings;
