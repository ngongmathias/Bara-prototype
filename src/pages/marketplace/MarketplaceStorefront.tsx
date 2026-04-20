import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import { getSoldLabel } from '@/config/categoryFieldConfigs';
import { ShieldCheck, Star, Clock, MapPin, Mail, Phone, Globe, Edit, Share2 } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { useUser } from '@clerk/clerk-react';
import { useShare } from '@/context/ShareContext';
import { FollowStoreButton } from '@/components/marketplace/FollowStoreButton';
import { StoreReviews } from '@/components/marketplace/StoreReviews';

export const MarketplaceStorefront = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const { openShare } = useShare();
  const [partner, setPartner] = useState<any>(null);
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'price_asc' | 'price_desc'>('recent');

  const isOwner = !!user && !!partner && user.id === partner.owner_user_id;

  const categoryOptions = useMemo(() => {
    const map = new Map<string, { slug: string; name: string; count: number }>();
    ads.forEach((ad) => {
      const slug = ad.category?.slug;
      const name = ad.category?.name;
      if (!slug || !name) return;
      const existing = map.get(slug);
      if (existing) existing.count += 1;
      else map.set(slug, { slug, name, count: 1 });
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [ads]);

  const filteredAds = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const filtered = ads.filter((ad) => {
      if (selectedCategorySlug !== 'all' && ad.category?.slug !== selectedCategorySlug) return false;
      if (term && !ad.title?.toLowerCase().includes(term)) return false;
      return true;
    });
    if (sortBy === 'price_asc') {
      return [...filtered].sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));
    }
    if (sortBy === 'price_desc') {
      return [...filtered].sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
    }
    return filtered;
  }, [ads, searchTerm, selectedCategorySlug, sortBy]);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      setLoading(true);
      try {
        const { data: partnerData, error: pErr } = await supabase
          .from('marketplace_partners')
          .select('*, countries(name, flag_url)')
          .eq('slug', slug)
          .maybeSingle();
        if (pErr) throw pErr;
        if (!partnerData) { setLoading(false); return; }
        setPartner(partnerData);

        const { data: adData } = await supabase
          .from('marketplace_listings')
          .select(`
            id, title, price, currency, status, created_at,
            category:marketplace_categories(id, name, slug),
            marketplace_listing_images(image_url, is_primary)
          `)
          .eq('created_by', partnerData.owner_user_id)
          .in('status', ['active', 'sold'])
          .order('created_at', { ascending: false })
          .limit(60);
        setAds(adData || []);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Storefront not found</h2>
            <button onClick={() => navigate('/marketplace')} className="text-blue-600 hover:underline">
              Back to marketplace
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const verificationLabel = {
    unverified: null,
    email_verified: 'Email Verified',
    phone_verified: 'Phone Verified',
    id_verified: 'ID Verified',
    business_verified: 'Business Verified',
  }[partner.verification_level as string] as string | null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Cover + profile */}
      <div className="relative">
        <div
          className="h-48 md:h-64 bg-gradient-to-r from-blue-600 to-indigo-600 relative"
          style={partner.cover_url ? { backgroundImage: `url(${partner.cover_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        >
          {(partner.banner_headline || partner.banner_cta_text) && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="text-center max-w-2xl px-4">
                {partner.banner_headline && (
                  <h2 className="text-xl md:text-3xl font-black text-white drop-shadow-lg mb-3">
                    {partner.banner_headline}
                  </h2>
                )}
                {partner.banner_cta_text && partner.banner_cta_url && (
                  <a
                    href={partner.banner_cta_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block bg-white text-gray-900 hover:bg-gray-100 font-bold px-6 py-2.5 rounded-full shadow-lg"
                  >
                    {partner.banner_cta_text}
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="max-w-6xl mx-auto px-4">
          <div className="relative -mt-16 flex items-end gap-4 pb-4">
            {partner.logo_url ? (
              <img loading="lazy" src={partner.logo_url} alt={partner.display_name} className="w-28 h-28 rounded-full object-cover bg-white border-4 border-white shadow-lg" />
            ) : (
              <div className="w-28 h-28 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center text-3xl font-bold text-gray-400">
                {partner.display_name?.charAt(0) || '?'}
              </div>
            )}
            <div className="flex-1 pb-2">
              <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg inline-block">
                <h1 className="text-2xl md:text-3xl font-bold text-white font-comfortaa">{partner.display_name}</h1>
                <div className="text-sm text-white/90 capitalize font-roboto">{partner.business_type}</div>
              </div>
            </div>
            <div className="flex gap-2 pb-2">
              {!isOwner && (
                <FollowStoreButton partnerId={partner.id} />
              )}
              <button
                onClick={() => openShare({
                  title: `${partner.display_name} — Bara Marketplace Store`,
                  description: partner.description || `Check out ${partner.display_name}'s store on Bara Marketplace`,
                  url: window.location.href,
                  imageUrl: partner.logo_url || undefined,
                })}
                className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-lg"
              >
                <Share2 className="w-4 h-4" /> Share Store
              </button>
              {isOwner && (
                <button
                  onClick={() => navigate(`/marketplace/storefront/edit`)}
                  className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-100 text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-lg"
                >
                  <Edit className="w-4 h-4" /> Edit Store
                </button>
              )}
              {isOwner && (
                <button
                  onClick={() => navigate(`/marketplace/storefront/analytics`)}
                  className="inline-flex items-center gap-1.5 bg-white/90 hover:bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-lg"
                >
                  Analytics
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-6xl mx-auto px-4 py-6 w-full">
        {/* Trust row */}
        <div className="flex flex-wrap gap-2 mb-4">
          {verificationLabel && (
            <span className="inline-flex items-center gap-1 text-sm font-medium bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full">
              <ShieldCheck className="w-4 h-4" /> {verificationLabel}
            </span>
          )}
          {partner.rating_count > 0 && (
            <span className="inline-flex items-center gap-1 text-sm font-medium bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full">
              <Star className="w-4 h-4 fill-current" /> {Number(partner.avg_rating).toFixed(1)} ({partner.rating_count} reviews)
            </span>
          )}
          {partner.response_time_hours != null && (
            <span className="inline-flex items-center gap-1 text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full">
              <Clock className="w-4 h-4" /> Replies in ~{partner.response_time_hours}h
            </span>
          )}
          {partner.countries?.name && (
            <span className="inline-flex items-center gap-1 text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1 rounded-full">
              <MapPin className="w-4 h-4" /> {partner.city ? `${partner.city}, ` : ''}{partner.countries.name}
            </span>
          )}
        </div>

        {partner.description && (
          <p className="text-gray-700 mb-6 max-w-3xl">{partner.description}</p>
        )}

        {/* Contact row */}
        <div className="flex flex-wrap gap-2 mb-8">
          {partner.contact_whatsapp && (
            <a href={`https://wa.me/${partner.contact_whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
              <FaWhatsapp className="w-4 h-4" /> WhatsApp
            </a>
          )}
          {partner.contact_phone && (
            <a href={`tel:${partner.contact_phone}`} className="inline-flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium">
              <Phone className="w-4 h-4" /> Call
            </a>
          )}
          {partner.contact_email && (
            <a href={`mailto:${partner.contact_email}`} className="inline-flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium">
              <Mail className="w-4 h-4" /> Email
            </a>
          )}
          {partner.website && (
            <a href={partner.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium">
              <Globe className="w-4 h-4" /> Website
            </a>
          )}
        </div>

        {/* Ads grid */}
        <h2 className="text-xl font-bold text-gray-900 mb-4">Ads ({filteredAds.length})</h2>

        {ads.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-4 items-center">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search this store..."
              className="flex-1 min-w-[200px] h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={selectedCategorySlug}
              onChange={(e) => setSelectedCategorySlug(e.target.value)}
              className="h-10 px-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All categories ({ads.length})</option>
              {categoryOptions.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name} ({c.count})
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="h-10 px-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="recent">Most recent</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
            </select>
          </div>
        )}

        {ads.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-gray-200 rounded-lg text-gray-500">
            This seller has no active ads yet.
          </div>
        ) : filteredAds.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-gray-200 rounded-lg text-gray-500">
            No ads match your filters.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredAds.map((ad) => {
              const img = ad.marketplace_listing_images?.find((i: any) => i.is_primary)?.image_url
                || ad.marketplace_listing_images?.[0]?.image_url
                || '/placeholder.jpg';
              return (
                <button
                  key={ad.id}
                  onClick={() => navigate(`/marketplace/ad/${ad.id}`)}
                  className="text-left bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-square bg-gray-100 relative">
                    <img loading="lazy" src={img} alt={ad.title} className="w-full h-full object-cover" />
                    {ad.status === 'sold' && (
                      <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                        <div className="bg-red-600 text-white text-xl font-bold px-5 py-2 rounded-lg transform -rotate-12">
                          {getSoldLabel(ad.category?.slug || '')}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="text-blue-600 font-bold">{ad.currency} {parseFloat(ad.price).toLocaleString()}</div>
                    <div className="text-sm text-gray-900 line-clamp-2">{ad.title}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-12 border-t pt-8">
          <StoreReviews partnerId={partner.id} ownerUserId={partner.owner_user_id} />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MarketplaceStorefront;
