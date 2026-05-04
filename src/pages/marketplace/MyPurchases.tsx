import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useUser } from '@clerk/clerk-react';
import { ShoppingBag, Eye, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending_seller: { label: 'Awaiting Seller', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelled_buyer: { label: 'Cancelled by You', color: 'bg-gray-100 text-gray-600', icon: XCircle },
  cancelled_seller: { label: 'Declined by Seller', color: 'bg-red-100 text-red-700', icon: XCircle },
  expired: { label: 'Expired', color: 'bg-gray-100 text-gray-500', icon: Clock },
};

export const MyPurchases = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchPurchases();
  }, [user?.id]);

  const fetchPurchases = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('marketplace_transactions')
      .select(`
        *,
        listing:marketplace_listings(id, title, price, currency, marketplace_listing_images(image_url, is_primary)),
        variant:marketplace_listing_variants(id, label)
      `)
      .eq('buyer_user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching purchases:', error);
    setTransactions(data || []);
    setLoading(false);
  };

  const cancelPurchase = async (txId: string) => {
    const { error } = await supabase
      .from('marketplace_transactions')
      .update({ status: 'cancelled_buyer', updated_at: new Date().toISOString() })
      .eq('id', txId)
      .eq('buyer_user_id', user?.id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to cancel', variant: 'destructive' });
    } else {
      toast({ title: 'Purchase cancelled' });
      fetchPurchases();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
            <Button onClick={() => navigate(`/user/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`)}>Sign In</Button>
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
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-black font-comfortaa mb-2">My Purchases</h1>
          <p className="text-gray-600 font-roboto mb-8">Track your purchase requests and transactions</p>

          {loading ? (
            <div className="text-center py-16">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-gray-200 rounded-lg">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-4">No purchases yet</p>
              <Button onClick={() => navigate('/marketplace')} variant="outline">
                Browse Marketplace
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx) => {
                const img = tx.listing?.marketplace_listing_images?.find((i: any) => i.is_primary)?.image_url
                  || tx.listing?.marketplace_listing_images?.[0]?.image_url
                  || '/placeholder.jpg';
                const statusCfg = STATUS_CONFIG[tx.status] || STATUS_CONFIG.pending_seller;
                const StatusIcon = statusCfg.icon;

                return (
                  <div key={tx.id} className="border border-gray-200 rounded-lg p-4 flex gap-4">
                    <img
                      loading="lazy" src={img}
                      alt={tx.listing?.title || 'Item'}
                      className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 truncate">
                            {tx.listing?.title || 'Listing'}
                          </h3>
                          {tx.variant?.label && (
                            <p className="text-xs text-gray-500">{tx.variant.label}</p>
                          )}
                        </div>
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${statusCfg.color}`}>
                          <StatusIcon className="w-3 h-3" /> {statusCfg.label}
                        </span>
                      </div>
                      <div className="text-blue-600 font-bold mt-1">
                        {tx.currency} {parseFloat(tx.amount).toLocaleString()}
                        {tx.quantity > 1 && <span className="text-sm font-normal text-gray-500"> × {tx.quantity}</span>}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/marketplace/ad/${tx.listing_id}`)}
                        >
                          <Eye className="w-3 h-3 mr-1" /> View Ad
                        </Button>
                        {tx.status === 'pending_seller' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => cancelPurchase(tx.id)}
                          >
                            <XCircle className="w-3 h-3 mr-1" /> Cancel
                          </Button>
                        )}
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

export default MyPurchases;
