import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: 'website' | 'article' | 'business.business' | 'music.song' | 'music.album' | 'video.episode' | 'event';
    keywords?: string[];
    schemaData?: object;
}

export const SEO: React.FC<SEOProps> = ({
    title,
    description,
    image,
    url,
    type = 'website',
    keywords = [],
    schemaData,
}) => {
    const siteName = 'Bara Afrika';
    const fullTitle = title ? `${title} | ${siteName}` : siteName;
    const defaultDescription = 'Discover African businesses, music, sports, and events. Your gateway to the Bara Afrika community.';
    const pageDescription = description || defaultDescription;
    const siteUrl = window.location.origin;
    const pageUrl = url ? `${siteUrl}${url}` : window.location.href;
    const pageImage = image || `${siteUrl}/og-image.jpg`; // Placeholder for default OG image

    const metaKeywords = [
        'African community',
        'Bara Afrika',
        'African marketplace',
        'African music',
        'African sports',
        ...keywords
    ].join(', ');

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={pageDescription} />
            <meta name="keywords" content={metaKeywords} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={pageUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={pageDescription} />
            <meta property="og:image" content={pageImage} />
            <meta property="og:site_name" content={siteName} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={pageUrl} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={pageDescription} />
            <meta name="twitter:image" content={pageImage} />

            {/* Structured Data (JSON-LD) */}
            {schemaData && (
                <script type="application/ld+json">
                    {JSON.stringify(schemaData)}
                </script>
            )}
        </Helmet>
    );
};
