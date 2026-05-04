import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useUser } from '@clerk/clerk-react';
import { Plus, Edit, Trash2, Eye, CheckCircle, Store, ShoppingBag, Clock, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getSoldLabel, getMarkAsSoldLabel } from '@/config/categoryFieldConfigs';

export const MyAds = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { toast } = useToast();
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [storeSlug, setStoreSlug] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ads' | 'transactions'>('ads');
  const [sellerTransactions, setSellerTransactions] = useState<any[]>([]);
  const [txLoading, setTxLoading] = useState(false);

  useEffect(() => {
    if (user) {
      supabase
        .from('marketplace_partners')
        .select('slug')
        .eq('owner_user_id', user.id)
        .maybeSingle()
        .then(({ data }) => { if (data?.slug) setStoreSlug(data.slug); });
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      fetchMyAds();
    }
  }, [user, filter]);

  const fetchMyAds = async () => {
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

      const transformedAds = (data || []).map((ad: any) => ({
        ...ad,
        category: ad.marketplace_categories,
        country: ad.countries,
        images: ad.marketplace_listing_images || [],
      }));

      setAds(transformedAds);
    } catch (error) {
      console.error('Error fetching ads:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteAd = async (adId: string) => {
    if (!confirm('Are you sure you want to delete this ad?')) return;

    try {
      const { error } = await supabase
        .from('marketplace_listings')
        .delete()
        .eq('id', adId);

      if (error) throw error;

      toast({ title: "Success", description: "Ad deleted successfully" });
      fetchMyAds();
    } catch (error) {
      console.error('Error deleting ad:', error);
      toast({ title: "Error", description: "Error deleting ad", variant: "destructive" });
    }
  };

  const fetchSellerTransactions = async () => {
    if (!user) return;
    setTxLoading(true);
    const { data } = await supabase
      .from('marketplace_transactions')
      .select(`
        *,
        listing:marketplace_listings(id, title, marketplace_listing_images(image_url, is_primary)),
        variant:marketplace_listing_variants(id, label)
      `)
      .eq('seller_user_id', user.id)
      .order('created_at', { ascending: false });
    setSellerTransactions(data || []);
    setTxLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'transactions' && user) fetchSellerTransactions();
  }, [activeTab, user?.id]);

  const updateTransaction = async (txId: string, status: string) => {
    const updates: any = { status, updated_at: new Date().toISOString() };
    if (status === 'confirmed') updates.confirmed_at = new Date().toISOString();
    if (status === 'completed') updates.completed_at = new Date().toISOString();

    const { error } = await supabase
      .from('marketplace_transactions')
      .update(updates)
      .eq('id', txId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Transaction updated' });
      fetchSellerTransactions();
    }
  };

  const markAsSold = async (adId: string) => {
    try {
      const { error } = await supabase
        .from('marketplace_listings')
        .update({ status: 'sold' })
        .eq('id', adId);

      if (error) throw error;

      toast({ title: "Success", description: "Ad marked as sold" });
      fetchMyAds();
    } catch (error) {
      console.error('Error updating ad:', error);
      toast({ title: "Error", description: "Error updating ad", variant: "destructive" });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-black mb-4 font-comfortaa">Sign In Required</h2>
            <p className="text-gray-600 mb-6 font-roboto">Please sign in to view your ads</p>
            <Button onClick={() => navigate(`/user/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`)} className="bg-black hover:bg-gray-800">
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
              <h1 className="text-3xl font-bold text-black font-comfortaa">My Ads</h1>
              <p className="text-gray-600 font-roboto mt-2">Manage your marketplace ads</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => navigate('/marketplace/storefront/edit')}
                className="font-roboto"
              >
                <Store className="w-4 h-4 mr-2" />
                {storeSlug ? 'Edit Storefront' : 'Create Storefront'}
              </Button>
              {storeSlug && (
                <Button
                  variant="outline"
                  onClick={() => navigate(`/marketplace/store/${storeSlug}`)}
                  className="font-roboto"
                >
                  View Storefront
                </Button>
              )}
              <Button
                onClick={() => navigate('/marketplace/post')}
                className="bg-black hover:bg-gray-800 font-roboto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Post New Ad
              </Button>
            </div>
          </div>

          {/* Top-level Tabs: Ads vs Transactions */}
          <div className="flex gap-4 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('ads')}
              className={`px-4 py-2 font-roboto text-sm border-b-2 transition-colors font-medium ${
                activeTab === 'ads' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-black'
              }`}
            >
              My Ads
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-4 py-2 font-roboto text-sm border-b-2 transition-colors font-medium flex items-center gap-2 ${
                activeTab === 'transactions' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-black'
              }`}
            >
              <ShoppingBag className="w-4 h-4" /> Transactions
            </button>
          </div>

          {activeTab === 'ads' && (
          <>
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
                className={`px-4 py-2 font-roboto text-sm border-b-2 transition-colors ${filter === tab.value
                  ? 'border-black text-black font-medium'
                  : 'border-transparent text-gray-600 hover:text-black'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Ads */}
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
              <p className="mt-4 text-gray-600 font-roboto">Loading your ads...</p>
            </div>
          ) : ads.length === 0 ? (
            <div className="text-center py-16 border border-gray-200 rounded-lg">
              <p className="text-gray-500 text-lg font-roboto mb-4">No ads found</p>
              <Button
                onClick={() => navigate('/marketplace/post')}
                className="bg-black hover:bg-gray-800 font-roboto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Post Your First Ad
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {ads.map((ad) => {
                const primaryImage = ad.images?.find((img: any) => img.is_primary)?.image_url ||
                  ad.images?.[0]?.image_url ||
                  '/placeholder.jpg';

                return (
                  <div
                    key={ad.id}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:border-black transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Image */}
                      <div className="relative w-full sm:w-48 h-48 bg-gray-100 flex-shrink-0">
                        <img
                          loading="lazy" src={primaryImage}
                          alt={ad.title}
                          className="w-full h-full object-cover"
                        />
                        <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold ${ad.status === 'active' ? 'bg-green-500 text-white' :
                          ad.status === 'pending' ? 'bg-yellow-500 text-black' :
                            ad.status === 'sold' ? 'bg-gray-500 text-white' :
                              'bg-red-500 text-white'
                          }`}>
                          {ad.status === 'sold' ? getSoldLabel(ad.category?.slug || '') : ad.status.toUpperCase()}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-bold text-black font-comfortaa">
                              {ad.title}
                            </h3>
                            <p className="text-sm text-gray-600 font-roboto">
                              {ad.category?.name} • {ad.country?.name}
                            </p>
                          </div>
                          <div className="text-xl font-bold text-black font-comfortaa">
                            {ad.currency} {ad.price?.toLocaleString()}
                          </div>
                        </div>

                        <p className="text-gray-700 text-sm mb-4 line-clamp-2 font-roboto">
                          {ad.description}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-gray-600 font-roboto mb-4">
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {ad.views_count || 0} views
                          </span>
                          <span>
                            Posted: {new Date(ad.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/marketplace/ad/${ad.id}`)}
                            className="font-roboto"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/marketplace/edit/${ad.id}`)}
                            className="font-roboto"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>

                          {ad.status === 'active' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => markAsSold(ad.id)}
                              className="font-roboto"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              {getMarkAsSoldLabel(ad.category?.slug || '')}
                            </Button>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteAd(ad.id)}
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
          </>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div>
              {txLoading ? (
                <div className="text-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto" />
                </div>
              ) : sellerTransactions.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-gray-200 rounded-lg">
                  <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No purchase requests yet</p>
                  <p className="text-gray-400 text-sm mt-1">When buyers click "Buy Now" on your ads, they'll appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sellerTransactions.map((tx) => {
                    const img = tx.listing?.marketplace_listing_images?.find((i: any) => i.is_primary)?.image_url
                      || tx.listing?.marketplace_listing_images?.[0]?.image_url
                      || '/placeholder.jpg';
                    const statusColors: Record<string, string> = {
                      pending_seller: 'bg-yellow-100 text-yellow-800',
                      confirmed: 'bg-blue-100 text-blue-800',
                      completed: 'bg-green-100 text-green-800',
                      cancelled_buyer: 'bg-gray-100 text-gray-600',
                      cancelled_seller: 'bg-red-100 text-red-700',
                      expired: 'bg-gray-100 text-gray-500',
                    };
                    const statusLabels: Record<string, string> = {
                      pending_seller: 'Awaiting Your Response',
                      confirmed: 'Confirmed',
                      completed: 'Completed',
                      cancelled_buyer: 'Buyer Cancelled',
                      cancelled_seller: 'You Declined',
                      expired: 'Expired',
                    };

                    return (
                      <div key={tx.id} className="border border-gray-200 rounded-lg p-4 flex gap-4">
                        <img loading="lazy" src={img} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-gray-900 truncate text-sm">{tx.listing?.title}</h3>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${statusColors[tx.status] || ''}`}>
                              {statusLabels[tx.status] || tx.status}
                            </span>
                          </div>
                          {tx.variant?.label && <p className="text-xs text-gray-500">{tx.variant.label}</p>}
                          <div className="text-blue-600 font-bold text-sm mt-1">
                            {tx.currency} {parseFloat(tx.amount).toLocaleString()}
                            {tx.quantity > 1 && <span className="text-gray-500 font-normal"> × {tx.quantity}</span>}
                          </div>
                          {tx.buyer_message && (
                            <p className="text-xs text-gray-600 mt-1 bg-gray-50 rounded p-2">"{tx.buyer_message}"</p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">{new Date(tx.created_at).toLocaleDateString()}</p>

                          {/* Seller action buttons */}
                          <div className="flex gap-2 mt-3">
                            {tx.status === 'pending_seller' && (
                              <>
                                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => updateTransaction(tx.id, 'confirmed')}>
                                  <CheckCircle className="w-3 h-3 mr-1" /> Confirm
                                </Button>
                                <Button size="sm" variant="outline" className="text-red-600" onClick={() => updateTransaction(tx.id, 'cancelled_seller')}>
                                  <XCircle className="w-3 h-3 mr-1" /> Decline
                                </Button>
                              </>
                            )}
                            {tx.status === 'confirmed' && (
                              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => updateTransaction(tx.id, 'completed')}>
                                <CheckCircle className="w-3 h-3 mr-1" /> Mark Complete
                              </Button>
                            )}
                            <Button size="sm" variant="outline" onClick={() => navigate(`/marketplace/ad/${tx.listing_id}`)}>
                              <Eye className="w-3 h-3 mr-1" /> View Ad
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyAds;
