import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import { ShieldCheck, Star, Clock, MapPin, Mail, Phone, Globe } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

export const MarketplaceStorefront = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [partner, setPartner] = useState<any>(null);
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
            marketplace_listing_images(image_url, is_primary)
          `)
          .eq('created_by', partnerData.owner_user_id)
          .eq('status', 'active')
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
          className="h-48 md:h-64 bg-gradient-to-r from-blue-600 to-indigo-600"
          style={partner.cover_url ? { backgroundImage: `url(${partner.cover_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        />
        <div className="max-w-6xl mx-auto px-4">
          <div className="relative -mt-16 flex items-end gap-4 pb-4">
            {partner.logo_url ? (
              <img src={partner.logo_url} alt={partner.display_name} className="w-28 h-28 rounded-full object-cover bg-white border-4 border-white shadow-lg" />
            ) : (
              <div className="w-28 h-28 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center text-3xl font-bold text-gray-400">
                {partner.display_name?.charAt(0) || '?'}
              </div>
            )}
            <div className="flex-1 pb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow">{partner.display_name}</h1>
              <div className="text-sm text-white/90 capitalize">{partner.business_type}</div>
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
        <h2 className="text-xl font-bold text-gray-900 mb-4">Ads ({ads.length})</h2>
        {ads.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-gray-200 rounded-lg text-gray-500">
            This seller has no active ads yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {ads.map((ad) => {
              const img = ad.marketplace_listing_images?.find((i: any) => i.is_primary)?.image_url
                || ad.marketplace_listing_images?.[0]?.image_url
                || '/placeholder.jpg';
              return (
                <button
                  key={ad.id}
                  onClick={() => navigate(`/marketplace/ad/${ad.id}`)}
                  className="text-left bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-square bg-gray-100">
                    <img src={img} alt={ad.title} className="w-full h-full object-cover" />
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
      </main>

      <Footer />
    </div>
  );
};

export default MarketplaceStorefront;
