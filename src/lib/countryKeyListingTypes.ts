export type CountryKeyListingType =
    | 'government_ministry'
    | 'regulator'
    | 'agency'
    | 'sports_federation'
    | 'charity'
    | 'ngo';

export const COUNTRY_KEY_LISTING_TYPES: CountryKeyListingType[] = [
    'government_ministry',
    'regulator',
    'agency',
    'sports_federation',
    'charity',
    'ngo',
];

export const COUNTRY_KEY_LISTING_TYPE_LABELS: Record<CountryKeyListingType, string> = {
    government_ministry: 'Government Ministry',
    regulator: 'Regulator',
    agency: 'Agency',
    sports_federation: 'Sports Federation',
    charity: 'Charity',
    ngo: 'NGO',
};

export const COUNTRY_KEY_LISTING_TYPE_PLURALS: Record<CountryKeyListingType, string> = {
    government_ministry: 'Government Ministries',
    regulator: 'Regulators',
    agency: 'Agencies',
    sports_federation: 'Sports Federations',
    charity: 'Charities',
    ngo: 'NGOs',
};

/** Counts words in a string. Used to enforce the 100-word description cap. */
export const countWords = (text: string): number => {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
};

export const KEY_LISTING_DESCRIPTION_MAX_WORDS = 100;
/** Logo upload ceiling — matches the country-key-listing-logos storage bucket. */
export const KEY_LISTING_LOGO_MAX_BYTES = 5 * 1024 * 1024;
