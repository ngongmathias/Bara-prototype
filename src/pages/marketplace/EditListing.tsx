import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { useAuthedSupabase } from '@/hooks/useAuthedSupabase';
import { uploadImage } from '@/lib/storage';
import { useUser } from '@clerk/clerk-react';
import { ChevronLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CategoryAttributeFields } from '@/components/marketplace/CategoryAttributeFields';
import {
  ListingImageManager,
  type EditableImage,
} from '@/components/marketplace/ListingImageManager';
import { getSoldLabel } from '@/config/categoryFieldConfigs';

/** Listing states a seller can set themselves. */
const SELLABLE_STATUSES = ['active', 'pending', 'sold'] as const;

export const EditListing = () => {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const { getClient } = useAuthedSupabase();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [listing, setListing] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);

  // Photos, existing and newly-added, in display order. Index 0 is primary.
  const [images, setImages] = useState<EditableImage[]>([]);
  // Ids of stored photos the seller removed — deleted from the table on save.
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({});
  // Order and primary flag as loaded, so save can skip rows that never moved.
  const originalImageOrder = useRef<Record<string, { display_order: number; is_primary: boolean }>>({});

  // Category-specific values (mileage, bedrooms, size...). Previously this
  // form did not send `attributes` at all, so the values survived an edit but
  // could never be corrected without deleting and re-posting the listing.
  const [attributes, setAttributes] = useState<Record<string, any>>({});

  const [formData, setFormData] = useState({
    category_id: '',
    subcategory_id: '',
    country_id: '',
    title: '',
    description: '',
    condition: '',
    status: 'active',
    price: '',
    currency: 'USD',
    price_type: 'fixed',
    seller_name: '',
    seller_email: '',
    seller_phone: '',
    seller_whatsapp: '',
    seller_type: 'individual',
    location_details: '',
    accepts_coins: false,
    coin_price: '',
  });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId]);

  useEffect(() => {
    if (formData.category_id) {
      fetchSubcategories(formData.category_id);
    }
  }, [formData.category_id]);

  // Object URLs for newly-picked photos are only valid for this page's
  // lifetime; without this they leak until a full reload.
  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img.kind === 'new') URL.revokeObjectURL(img.url);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedCategorySlug =
    categories.find((c) => c.id === formData.category_id)?.slug || '';

  const fetchData = async () => {
    try {
      const { data: listingData, error: listingError } = await supabase
        .from('marketplace_listings')
        .select('*')
        .eq('id', listingId)
        .single();

      if (listingError) throw listingError;

      // Ensure user owns the listing or is an admin.
      //
      // `marketplace_listings` has no `user_id` column — ownership is
      // `created_by` (TEXT, holding the Clerk id). Comparing the missing
      // column meant `undefined !== "user_2..."` was always true, so EVERY
      // non-admin edit was denied and the seller was bounced to /marketplace
      // with "You do not have permission". MyAds.tsx has always used
      // `created_by` correctly, so its Edit button led straight into this.
      if (listingData.created_by !== user?.id && user?.publicMetadata?.role !== 'admin') {
        toast({ title: "Error", description: "You do not have permission to edit this listing.", variant: "destructive" });
        navigate('/marketplace');
        return;
      }

      setListing(listingData);
      setAttributes(listingData.attributes || {});
      setFormData({
        category_id: listingData.category_id,
        subcategory_id: listingData.subcategory_id || '',
        country_id: listingData.country_id,
        title: listingData.title,
        description: listingData.description,
        condition: listingData.condition || '',
        status: listingData.status || 'active',
        price: listingData.price?.toString() || '',
        currency: listingData.currency,
        price_type: listingData.price_type,
        seller_name: listingData.seller_name,
        seller_email: listingData.seller_email,
        seller_phone: listingData.seller_phone || '',
        seller_whatsapp: listingData.seller_whatsapp || '',
        seller_type: listingData.seller_type,
        location_details: listingData.location_details || '',
        accepts_coins: !!listingData.accepts_coins,
        coin_price: listingData.coin_price?.toString() || '',
      });

      // Photos, primary first then by stored order — matching how the
      // detail page and search cards pick which image to show.
      const { data: imageRows } = await supabase
        .from('marketplace_listing_images')
        .select('id, image_url, display_order, is_primary')
        .eq('listing_id', listingId)
        .order('is_primary', { ascending: false })
        .order('display_order', { ascending: true });

      originalImageOrder.current = Object.fromEntries(
        (imageRows || []).map((row: any) => [
          row.id,
          { display_order: row.display_order, is_primary: !!row.is_primary },
        ])
      );

      setImages(
        (imageRows || []).map((row: any) => ({
          kind: 'existing' as const,
          id: row.id,
          url: row.image_url,
        }))
      );

      const { data: categoriesData } = await supabase
        .from('marketplace_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      setCategories(categoriesData || []);

      const { data: countriesData } = await supabase
        .from('countries')
        .select('id, name, code')
        .order('name');
      setCountries(countriesData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({ title: "Error", description: "Error loading listing", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchSubcategories = async (categoryId: string) => {
    const { data } = await supabase
      .from('marketplace_subcategories')
      .select('*')
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .order('display_order');
    setSubcategories(data || []);
  };

  const handleImagesChange = (next: EditableImage[]) => {
    // Remember which stored photos disappeared so they can be deleted on save.
    const stillPresent = new Set(
      next.filter((i) => i.kind === 'existing').map((i) => (i as any).id)
    );
    const dropped = images
      .filter((i) => i.kind === 'existing' && !stillPresent.has(i.id))
      .map((i) => (i as any).id as string);
    if (dropped.length) setRemovedImageIds((prev) => [...prev, ...dropped]);
    setImages(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (images.length === 0) {
      toast({
        title: 'Add a photo',
        description: 'A listing needs at least one photo before you can save it.',
        variant: 'destructive',
      });
      return;
    }
    if (formData.accepts_coins && !(parseInt(formData.coin_price) > 0)) {
      toast({
        title: 'Set a coin price',
        description: 'You turned on BARA Coins — enter how many coins the item costs.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    setUploadProgress({});

    try {
      const authed = await getClient();

      // 1. Upload any newly-added photos, keeping list order.
      const resolved: Array<{ url: string; existingId: string | null }> = [];
      for (let index = 0; index < images.length; index++) {
        const image = images[index];
        if (image.kind === 'existing') {
          resolved.push({ url: image.url, existingId: image.id });
          continue;
        }
        setUploadProgress((p) => ({ ...p, [index]: 0 }));
        try {
          const url = await uploadImage(image.file, 'marketplace-listings', 'listings');
          setUploadProgress((p) => ({ ...p, [index]: 1 }));
          resolved.push({ url, existingId: null });
        } catch (err) {
          setUploadProgress((p) => ({ ...p, [index]: -1 }));
          throw new Error(
            `Photo ${index + 1} failed to upload. Your other changes have not been saved — try again.`
          );
        }
      }

      // 2. Save the listing itself.
      const { error: updateError } = await authed
        .from('marketplace_listings')
        .update({
          category_id: formData.category_id,
          subcategory_id: formData.subcategory_id || null,
          country_id: formData.country_id,
          title: formData.title,
          description: formData.description,
          condition: formData.condition || null,
          status: formData.status,
          attributes,
          price: parseFloat(formData.price) || 0,
          currency: formData.currency,
          price_type: formData.price_type,
          seller_name: formData.seller_name,
          seller_email: formData.seller_email,
          seller_phone: formData.seller_phone,
          seller_whatsapp: formData.seller_whatsapp,
          seller_type: formData.seller_type,
          location_details: formData.location_details,
          accepts_coins: formData.accepts_coins && parseInt(formData.coin_price) > 0,
          coin_price: formData.accepts_coins && parseInt(formData.coin_price) > 0 ? parseInt(formData.coin_price) : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', listingId);

      if (updateError) throw updateError;

      // 3. Reconcile photos: drop removed rows, insert new ones, then rewrite
      //    order and the primary flag across the whole set.
      if (removedImageIds.length) {
        const { error } = await authed
          .from('marketplace_listing_images')
          .delete()
          .in('id', removedImageIds);
        if (error) throw error;
      }

      const newRows = resolved
        .map((r, order) => ({ ...r, order }))
        .filter((r) => r.existingId === null)
        .map((r) => ({
          listing_id: listingId,
          image_url: r.url,
          display_order: r.order,
          is_primary: r.order === 0,
        }));

      if (newRows.length) {
        const { error } = await authed.from('marketplace_listing_images').insert(newRows);
        if (error) throw error;
      }

      // Existing rows may have moved; rewrite order and primary flag, but
      // only where it actually changed. The common edit is a typo fix that
      // leaves photos untouched, and that should cost zero extra requests.
      for (let order = 0; order < resolved.length; order++) {
        const row = resolved[order];
        if (!row.existingId) continue;
        const before = originalImageOrder.current[row.existingId];
        if (before && before.display_order === order && before.is_primary === (order === 0)) {
          continue;
        }
        const { error } = await authed
          .from('marketplace_listing_images')
          .update({ display_order: order, is_primary: order === 0 })
          .eq('id', row.existingId);
        if (error) throw error;
      }

      setRemovedImageIds([]);
      toast({ title: 'Saved', description: 'Your ad has been updated.' });
      navigate('/marketplace/my-ads');
    } catch (error: any) {
      console.error('Error updating ad:', error);
      const raw = String(error?.message || error || '');
      let description = 'Something went wrong saving your changes. Please try again.';
      if (/failed to upload/i.test(raw)) {
        description = raw;
      } else if (/row-level security|permission|denied|JWT|401|403/i.test(raw)) {
        description = 'You are not allowed to edit this listing. Try signing out and back in.';
      } else if (/network|fetch|timeout/i.test(raw)) {
        description = 'Network problem — your changes were not saved. Check your connection and try again.';
      }
      toast({ title: 'Could not save', description, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </main>
        <Footer />
      </div>
    );
  }

  const soldLabel = getSoldLabel(selectedCategorySlug || '');

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/marketplace/my-ads')}
              className="mb-4"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to My Ads
            </Button>
            <h1 className="text-3xl font-bold text-black font-comfortaa">Edit Ad</h1>
          </div>

          <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-8 space-y-6">
            {/*
              Status sits first because marking something sold is the most
              common reason a seller opens this page at all, and it used to
              be impossible here — the only route was the transaction flow.
            */}
            <div className="border border-gray-200 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
                Listing status
              </label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active — visible to buyers</SelectItem>
                  <SelectItem value="pending">Paused — hidden from search</SelectItem>
                  <SelectItem value="sold">{soldLabel} — no longer available</SelectItem>
                </SelectContent>
              </Select>
              {formData.status !== 'active' && (
                <p className="text-xs text-gray-500 mt-2 font-roboto">
                  Buyers will not find this ad while it is {formData.status === 'sold' ? soldLabel.toLowerCase() : 'paused'}.
                  You can set it back to active at any time.
                </p>
              )}
            </div>

            {/* Photos */}
            <ListingImageManager
              images={images}
              onChange={handleImagesChange}
              uploadProgress={saving ? uploadProgress : undefined}
              disabled={saving}
              onError={(message) =>
                toast({ title: 'Photo problem', description: message, variant: 'destructive' })
              }
            />

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
                Category *
              </label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => {
                  // Attributes are category-shaped; keeping them across a
                  // category change would write mileage onto a sofa.
                  setAttributes({});
                  setFormData({ ...formData, category_id: value, subcategory_id: '' });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subcategory */}
            {subcategories.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
                  Subcategory (Optional)
                </label>
                <Select value={formData.subcategory_id} onValueChange={(value) => setFormData({ ...formData, subcategory_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategories.map((subcat) => (
                      <SelectItem key={subcat.id} value={subcat.id}>
                        {subcat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
                Country *
              </label>
              <Select value={formData.country_id} onValueChange={(value) => setFormData({ ...formData, country_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.id} value={country.id}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
                Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., 2024 Toyota Camry, 3BR Apartment"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
                Description *
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide detailed information..."
                rows={6}
                required
              />
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
                Condition
              </label>
              <Select
                value={formData.condition || 'unspecified'}
                onValueChange={(value) =>
                  setFormData({ ...formData, condition: value === 'unspecified' ? '' : value })
                }
              >
                <SelectTrigger className="max-w-xs">
                  <SelectValue placeholder="Not specified" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unspecified">Not specified</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="like-new">Like new</SelectItem>
                  <SelectItem value="used">Used</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category-specific fields — the same set the posting form shows. */}
            <CategoryAttributeFields
              categorySlug={selectedCategorySlug}
              attributes={attributes}
              setAttributes={setAttributes}
            />

            {/* Price */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
                  Price *
                </label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
                  Currency
                </label>
                <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="AED">AED</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="RWF">RWF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Accept BARA Coins (27.8.3 — coins-as-barter, merchant opt-in) */}
            <div className="border border-gray-200 rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.accepts_coins}
                  onChange={(e) => setFormData({ ...formData, accepts_coins: e.target.checked })}
                  className="mt-1 h-4 w-4 flex-shrink-0 rounded border-gray-400 accent-black"
                />
                <div>
                  <span className="font-bold text-gray-900 text-sm">Accept BARA Coins</span>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Let buyers pay with their BARA Coins instead of cash — you receive the coins.
                    You set the coin amount; coins have no cash value and can't be withdrawn.
                  </p>
                </div>
              </label>
              {formData.accepts_coins && (
                <div className="mt-4 max-w-xs">
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
                    Price in coins *
                  </label>
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    value={formData.coin_price}
                    onChange={(e) => setFormData({ ...formData, coin_price: e.target.value })}
                    placeholder="e.g. 500"
                  />
                </div>
              )}
            </div>

            {/* Contact Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
                Your Name *
              </label>
              <Input
                value={formData.seller_name}
                onChange={(e) => setFormData({ ...formData, seller_name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
                Email *
              </label>
              <Input
                type="email"
                value={formData.seller_email}
                onChange={(e) => setFormData({ ...formData, seller_email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
                Phone Number *
              </label>
              <Input
                value={formData.seller_phone}
                onChange={(e) => setFormData({ ...formData, seller_phone: e.target.value })}
                placeholder="+1234567890"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
                WhatsApp Number (Optional)
              </label>
              <Input
                value={formData.seller_whatsapp}
                onChange={(e) => setFormData({ ...formData, seller_whatsapp: e.target.value })}
                placeholder="+1234567890"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
                Location Details *
              </label>
              <Textarea
                value={formData.location_details}
                onChange={(e) => setFormData({ ...formData, location_details: e.target.value })}
                placeholder="Street address, city, area..."
                rows={3}
                required
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/marketplace/my-ads')}
                disabled={saving}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="flex-1 bg-black hover:bg-gray-800"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EditListing;
