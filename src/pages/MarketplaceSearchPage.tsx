import React, { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { TopBannerAd } from "@/components/TopBannerAd";
import { BottomBannerAd } from "@/components/BottomBannerAd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Grid3x3, List, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";

type MarketplaceListing = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  currency_code: string;
  condition: string;
  country_name: string;
  status: string;
  is_featured: boolean;
  created_at: string;
  views_count: number;
  favorites_count: number;
  category_id: string | null;
  listing_images?: {
    image_url: string;
    sort_order: number | null;
  }[];
};

type MarketplaceCategory = {
  id: string;
  slug: string;
  name: string;
};

const MarketplaceSearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initialQuery = searchParams.get("query") ?? "";
  const initialCategorySlug = searchParams.get("category") ?? "all";
  const initialCountry = searchParams.get("country") ?? "all";
  const initialMinPrice = searchParams.get("minPrice") ?? "";
  const initialMaxPrice = searchParams.get("maxPrice") ?? "";
  const initialSort =
    (searchParams.get("sort") as "newest" | "price_asc" | "price_desc" | null) ??
    "newest";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>(
    initialCategorySlug
  );
  const [selectedCountry, setSelectedCountry] = useState<string>(initialCountry);
  const [minPrice, setMinPrice] = useState<string>(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState<string>(initialMaxPrice);
  const [sortBy, setSortBy] = useState<"newest" | "price_asc" | "price_desc">(
    initialSort
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [catRes, listingsRes] = await Promise.all([
          supabase
            .from("marketplace_categories")
            .select("id, slug, name")
            .eq("is_active", true)
            .order("sort_order", { ascending: true }),
          supabase
            .from("marketplace_listings")
            .select(
              `id, title, description, price, currency_code, condition, country_name, status, is_featured, created_at, views_count, favorites_count, category_id,
               listing_images: marketplace_listing_images (image_url, sort_order)`
            )
            .eq("status", "active")
            .order("created_at", { ascending: false }),
        ]);

        if (catRes.error) throw catRes.error;
        if (listingsRes.error) throw listingsRes.error;

        setCategories(catRes.data ?? []);
        setListings(listingsRes.data ?? []);
      } catch (err: any) {
        console.error("Error loading marketplace listings", err);
        setError(err.message ?? "Failed to load marketplace listings.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Keep local filter state in sync with URL query params when they change,
  // so that navigation from /marketplace or browser back/forward reflects correctly.
  useEffect(() => {
    const query = searchParams.get("query") ?? "";
    const category = searchParams.get("category") ?? "all";
    const country = searchParams.get("country") ?? "all";
    const min = searchParams.get("minPrice") ?? "";
    const max = searchParams.get("maxPrice") ?? "";
    const sortParam = (searchParams.get("sort") as
      | "newest"
      | "price_asc"
      | "price_desc"
      | null) ?? "newest";

    setSearchQuery(query);
    setSelectedCategorySlug(category);
    setSelectedCountry(country);
    setMinPrice(min);
    setMaxPrice(max);
    setSortBy(sortParam);
  }, [searchParams]);

  const categoryById = useMemo(() => {
    const map: Record<string, MarketplaceCategory> = {};
    categories.forEach((cat) => {
      map[cat.id] = cat;
    });
    return map;
  }, [categories]);

  const countryOptions = useMemo(() => {
    const names = Array.from(
      new Set(listings.map((l) => l.country_name).filter(Boolean))
    ).sort();
    return names;
  }, [listings]);

  const filteredListings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const min = minPrice ? parseFloat(minPrice) : undefined;
    const max = maxPrice ? parseFloat(maxPrice) : undefined;

    let result = listings.filter((listing) => {
      if (selectedCategorySlug !== "all") {
        if (!listing.category_id) return false;
        const cat = categoryById[listing.category_id];
        if (!cat || cat.slug !== selectedCategorySlug) return false;
      }

      if (selectedCountry !== "all" && listing.country_name !== selectedCountry) {
        return false;
      }

      if (q) {
        const inTitle = listing.title.toLowerCase().includes(q);
        const inDescription = (listing.description ?? "").toLowerCase().includes(q);
        if (!inTitle && !inDescription) return false;
      }

      if (min !== undefined && listing.price < min) return false;
      if (max !== undefined && listing.price > max) return false;

      return true;
    });

    result = result.sort((a, b) => {
      switch (sortBy) {
        case "price_asc":
          return a.price - b.price;
        case "price_desc":
          return b.price - a.price;
        case "newest":
        default:
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
      }
    });

    return result;
  }, [
    listings,
    categoryById,
    searchQuery,
    selectedCategorySlug,
    selectedCountry,
    minPrice,
    maxPrice,
    sortBy,
  ]);

  const handleApplyFilters = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("query", searchQuery.trim());
    if (selectedCategorySlug !== "all") params.set("category", selectedCategorySlug);
    if (selectedCountry !== "all") params.set("country", selectedCountry);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (sortBy !== "newest") params.set("sort", sortBy);
    setSearchParams(params);
  };

  const handleClearAll = () => {
    setSearchQuery("");
    setSelectedCategorySlug("all");
    setSelectedCountry("all");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("newest");
    setSearchParams(new URLSearchParams());
  };

  const ListingCard: React.FC<{ listing: MarketplaceListing; onClick: () => void }> = ({ listing, onClick }) => {
    const category = listing.category_id
      ? categoryById[listing.category_id]
      : undefined;

    const heroImage = listing.listing_images?.[0]?.image_url;

    return (
      <motion.div
        key={listing.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="group bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all p-4 flex flex-col cursor-pointer"
        onClick={onClick}
      >
        <div className="aspect-video w-full rounded-md mb-4 overflow-hidden bg-gray-100">
          {heroImage ? (
            <img
              src={heroImage}
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full" />
          )}
        </div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-semibold text-base line-clamp-2 text-black">
            {listing.title}
          </h3>
          {listing.is_featured && (
            <Badge className="bg-black text-white text-xs rounded-full px-2 py-0.5">
              Featured
            </Badge>
          )}
        </div>
        <div className="text-lg font-bold text-black mb-1">
          {listing.currency_code} {listing.price.toLocaleString()}
        </div>
        <div className="text-xs text-gray-500 mb-2">
          {category ? category.name : "Other"} · {listing.country_name}
        </div>
        <div className="mt-auto flex items-center justify-between text-xs text-gray-400">
          <span>{listing.condition === "new" ? "New" : "Used"}</span>
          <span>
            {new Date(listing.created_at).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="relative min-h-screen bg-white font-roboto">
      <div className="relative z-20">
        <Header />
      </div>

      <div className="relative z-10">
        <TopBannerAd />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-comfortaa font-bold text-black">
            Marketplace search
          </h1>
          <p className="text-sm text-gray-600">
            Results powered by Supabase. Use the filters to narrow down listings by
            category, country, price, and more.
          </p>
        </section>

        <section className="space-y-3">
          <form
            onSubmit={handleApplyFilters}
            className="flex flex-col gap-3 md:grid md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(0,1.1fr)] md:items-stretch"
          >
            <div className="md:col-span-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search listings..."
                  className="pl-9 h-10 text-sm border-gray-300 focus:border-black focus:ring-black rounded-md"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Select
                value={selectedCategorySlug}
                onValueChange={(value) => setSelectedCategorySlug(value)}
              >
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.slug}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select
                value={selectedCountry}
                onValueChange={(value) => setSelectedCountry(value)}
              >
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue placeholder="All countries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All countries</SelectItem>
                  {countryOptions.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Input
                type="number"
                inputMode="decimal"
                placeholder="Min price"
                className="h-10 text-sm"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <Input
                type="number"
                inputMode="decimal"
                placeholder="Max price"
                className="h-10 text-sm"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 md:col-span-4 justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span>Sort by</span>
                <Select
                  value={sortBy}
                  onValueChange={(value) =>
                    setSortBy(value as "newest" | "price_asc" | "price_desc")
                  }
                >
                  <SelectTrigger className="h-8 text-xs w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest first</SelectItem>
                    <SelectItem value="price_asc">Price: Low to High</SelectItem>
                    <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleClearAll}
                  >
                    Clear all
                  </Button>
                  <Button type="submit" size="sm">
                    Apply filters
                  </Button>
                </div>
              </div>
            </div>
          </form>

          <div className="flex flex-wrap gap-2 text-xs">
            {selectedCategorySlug !== "all" && (
              <button
                onClick={() => setSelectedCategorySlug("all")}
                className="px-3 py-1 rounded-full border border-gray-300 hover:bg-gray-100"
              >
                Category ×
              </button>
            )}
            {selectedCountry !== "all" && (
              <button
                onClick={() => setSelectedCountry("all")}
                className="px-3 py-1 rounded-full border border-gray-300 hover:bg-gray-100"
              >
                {selectedCountry} ×
              </button>
            )}
            {minPrice && (
              <button
                onClick={() => setMinPrice("")}
                className="px-3 py-1 rounded-full border border-gray-300 hover:bg-gray-100"
              >
                Min {minPrice} ×
              </button>
            )}
            {maxPrice && (
              <button
                onClick={() => setMaxPrice("")}
                className="px-3 py-1 rounded-full border border-gray-300 hover:bg-gray-100"
              >
                Max {maxPrice} ×
              </button>
            )}
            {(selectedCategorySlug !== "all" ||
              selectedCountry !== "all" ||
              minPrice ||
              maxPrice) && (
              <button
                onClick={handleClearAll}
                className="px-3 py-1 rounded-full border border-gray-400 hover:bg-gray-100"
              >
                Clear all
              </button>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {filteredListings.length} listing
              {filteredListings.length === 1 ? "" : "s"} found
            </span>
          </div>

          {error && (
            <div className="border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2 rounded">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="animate-pulse bg-white border border-gray-200 rounded-lg p-4 space-y-3"
                >
                  <div className="h-32 bg-gray-100 rounded" />
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : filteredListings.length === 0 ? (
            <p className="text-sm text-gray-600">
              No listings match your current filters. Try broadening your search.
            </p>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
                  : "space-y-3"
              }
            >
              {filteredListings.map((listing) =>
                viewMode === "grid" ? (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    onClick={() => navigate(`/marketplace/listing/${listing.id}`)}
                  />
                ) : (
                  <div
                    key={listing.id}
                    className="border border-gray-200 rounded-lg p-4 bg-white"
                  >
                    <ListingCard
                      listing={listing}
                      onClick={() => navigate(`/marketplace/listing/${listing.id}`)}
                    />
                  </div>
                )
              )}
            </div>
          )}
        </section>
      </main>

      <div className="relative z-10">
        <BottomBannerAd />
      </div>

      <Footer />
    </div>
  );
};

export default MarketplaceSearchPage;
