import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ShieldCheck, Star, Clock, Store } from 'lucide-react';

/**
 * Shared seller/partner identity + trust badges block.
 * Extracted from ListingDetailPage.tsx so the 11 category detail pages can
 * show the same verification/rating/response-time UI without each one
 * re-implementing it (and silently drifting).
 */
export interface SellerTrustCardProps {
  /** Row from marketplace_partners, or null if the seller has no partner profile yet. */
  partner: any | null;
  /** The listing itself — used as a fallback for seller_name / seller_type when partner is null. */
  listing: any;
  /** Visual density. "compact" drops member-since and minor spacing. */
  variant?: 'default' | 'compact';
}

const VERIFICATION_LABELS: Record<string, string> = {
  email_verified: 'Email Verified',
  phone_verified: 'Phone Verified',
  id_verified: 'ID Verified',
  business_verified: 'Business Verified',
};

export const SellerTrustCard: React.FC<SellerTrustCardProps> = ({
  partner,
  listing,
  variant = 'default',
}) => {
  const navigate = useNavigate();
  const displayName = partner?.display_name || listing?.seller_name || 'Seller';
  const businessType = partner?.business_type || listing?.seller_type;
  const hasVerification = partner?.verification_level && partner.verification_level !== 'unverified';

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-3">
        {partner?.logo_url ? (
          <img
            loading="lazy" src={partner.logo_url}
            alt={displayName}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-gray-600" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          {partner?.slug ? (
            <button
              onClick={() => navigate(`/marketplace/store/${partner.slug}`)}
              className="font-medium text-gray-900 hover:underline truncate block text-left"
            >
              {displayName}
            </button>
          ) : (
            <div className="font-medium text-gray-900 truncate">{displayName}</div>
          )}
          {businessType && (
            <div className="text-xs text-gray-600 capitalize">{businessType}</div>
          )}
        </div>
      </div>

      {/* Trust badges */}
      <div className="flex flex-wrap gap-2 mb-2">
        {hasVerification && (
          <span className="inline-flex items-center gap-1 text-xs font-medium bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded-full">
            <ShieldCheck className="w-3 h-3" />
            {VERIFICATION_LABELS[partner.verification_level] || 'Verified'}
          </span>
        )}
        {partner?.rating_count > 0 && (
          <span className="inline-flex items-center gap-1 text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded-full">
            <Star className="w-3 h-3 fill-current" />
            {Number(partner.avg_rating).toFixed(1)} ({partner.rating_count})
          </span>
        )}
        {partner?.response_time_hours != null && (
          <span className="inline-flex items-center gap-1 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded-full">
            <Clock className="w-3 h-3" />
            Replies in ~{partner.response_time_hours}h
          </span>
        )}
      </div>

      {variant === 'default' && partner?.member_since && (
        <div className="text-xs text-gray-500 mb-2">
          Member since{' '}
          {new Date(partner.member_since).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
          })}
        </div>
      )}

      {partner?.slug && (
        <button
          onClick={() => navigate(`/marketplace/store/${partner.slug}`)}
          className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          <Store className="w-4 h-4" />
          Visit Store
        </button>
      )}
    </div>
  );
};
