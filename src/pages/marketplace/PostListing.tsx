import React, { useState, useEffect, useMemo } from 'react';

import { useNavigate } from 'react-router-dom';

import { useUser } from '@clerk/clerk-react';

import { Header } from '@/components/Header';

import Footer from '@/components/Footer';

import { TopBannerAd } from '@/components/TopBannerAd';

import { BottomBannerAd } from '@/components/BottomBannerAd';

import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';

import { Textarea } from '@/components/ui/textarea';

import { Label } from '@/components/ui/label';

import {

  Select,

  SelectContent,

  SelectItem,

  SelectTrigger,

  SelectValue,

} from '@/components/ui/select';

import { supabase } from '@/lib/supabase';

import { useToast } from '@/components/ui/use-toast';

import { GamificationService } from '@/lib/gamificationService';

import {

  Upload,

  X,

  Image as ImageIcon,

  CheckCircle,

  Loader2,

  Zap,

  Star,

  ShieldCheck,

  AlertCircle

} from 'lucide-react';

import { FaWhatsapp } from 'react-icons/fa';

import { uploadImage } from '@/lib/storage';
import { validateImage } from '@/utils/imageOptimization';

import { useCountrySelection } from '@/context/CountrySelectionContext';
import { getCategoryConfig } from '@/config/categoryFieldConfigs';
import { VariantBuilder, type VariantRow } from '@/components/marketplace/listing-parts/VariantBuilder';



/** Where an in-progress listing is parked so a sign-out can't destroy it. */
const DRAFT_KEY = 'bara:marketplace:post-draft';

/**
 * The form is split into four steps rather than one ~20-field page.
 *
 * Photos come FIRST, with the title and category, because on classifieds
 * that is the strongest completion lever there is: it front-loads the part
 * sellers are motivated to do and defers the tedious part until they are
 * already invested. Previously everything — title, category, up to seven
 * category-specific attributes, pricing, variants, location and contact —
 * arrived on a single screen, which on a phone is several thousand pixels
 * of form before anything feels like progress.
 */
const STEPS = [
  { n: 1, label: 'Your item', hint: 'Photos, title and category' },
  { n: 2, label: 'Details', hint: 'Specifics buyers look for' },
  { n: 3, label: 'Price & contact', hint: 'What it costs and how to reach you' },
  { n: 4, label: 'Review', hint: 'Check it over and publish' },
] as const;

export const PostListing = () => {

  const navigate = useNavigate();

  const { toast } = useToast();

  const { selectedCountry } = useCountrySelection();

  const { user: clerkUser, isLoaded, isSignedIn } = useUser();

  const [userId, setUserId] = useState<string>('');

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [categories, setCategories] = useState<any[]>([]);

  const [countries, setCountries] = useState<any[]>([]);

  const [draftRestored, setDraftRestored] = useState(false);
  const [step, setStep] = useState(1);
  const [boostCost, setBoostCost] = useState<number | null>(null);
  const [coinBalance, setCoinBalance] = useState<number | null>(null);
  /** Per-photo upload progress, 0–1, keyed by index in selectedImages. */
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({});

  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  const [variantsEnabled, setVariantsEnabled] = useState(false);
  const [variantRows, setVariantRows] = useState<VariantRow[]>([]);

  const [formData, setFormData] = useState({

    title: '',

    description: '',

    category_id: '',

    subcategory_id: '',

    price: '',

    currency: 'USD',

    price_type: 'fixed',

    condition: '',

    seller_name: '',

    seller_email: '',

    seller_phone: '',

    seller_whatsapp: '',

    seller_website: '',

    seller_type: 'individual',

    location_details: '',

    is_premium: false,

    accepts_coins: false,

    coin_price: '',

  });



  // Category-specific attributes

  const [attributes, setAttributes] = useState<Record<string, any>>({});

  const [selectedCategorySlug, setSelectedCategorySlug] = useState('');

  const [subcategories, setSubcategories] = useState<any[]>([]);



  useEffect(() => {

    // In local preview mode Clerk never finishes loading (domain-locked
    // production keys), so isLoaded stays false and checkAuth would never
    // run — leaving the page stuck on "Loading…". Call it regardless there.
    if (isLoaded || (import.meta.env.DEV && import.meta.env.VITE_ADMIN_PREVIEW === 'true')) {

      checkAuth();

    }

  }, [isLoaded, isSignedIn]);



  useEffect(() => {

    fetchCategories();

    fetchCountries();

  }, []);

  // Live boost price and the seller's balance, so the checkbox states the
  // real cost and can warn BEFORE submitting rather than failing afterwards.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const cost = await GamificationService.getSetting('cost.listing_boost');
        if (!cancelled) setBoostCost(cost);
        if (clerkUser?.id) {
          const profile = await GamificationService.getProfile(clerkUser.id);
          if (!cancelled) setCoinBalance(profile?.bara_coins ?? null);
        }
      } catch { /* the checkbox degrades to "—" rather than lying */ }
    })();
    return () => { cancelled = true; };
  }, [clerkUser?.id]);

  // ---- Draft autosave -------------------------------------------------
  //
  // checkAuth() hard-navigates to /user/sign-in whenever Clerk reports the
  // user as signed out, and it re-runs whenever the session state changes. A
  // brief token refresh mid-form therefore threw away everything the seller
  // had typed, with no warning and no way back. On a 20-field form that is
  // the difference between "the site logged me out" and "the site ate my
  // advert".
  //
  // Text fields only: File objects can't be serialised, so photos still have
  // to be re-picked. The restore notice says so rather than pretending
  // otherwise.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (!saved) return;
      const { formData: savedForm, selectedCountries: savedCountries, savedAt } = JSON.parse(saved);
      // Drafts older than 7 days are more likely to confuse than help.
      if (!savedAt || Date.now() - savedAt > 7 * 24 * 3600_000) {
        localStorage.removeItem(DRAFT_KEY);
        return;
      }
      if (savedForm) setFormData((prev) => ({ ...prev, ...savedForm }));
      if (Array.isArray(savedCountries)) setSelectedCountries(savedCountries);
      setDraftRestored(true);
    } catch {
      localStorage.removeItem(DRAFT_KEY);
    }
  }, []);

  useEffect(() => {
    // Don't write an empty draft on first mount.
    if (!formData.title?.trim() && !formData.description?.trim() && !formData.price) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({ formData, selectedCountries, savedAt: Date.now() })
        );
      } catch { /* quota or private mode — drafting is best-effort */ }
    }, 800);
    return () => clearTimeout(t);
  }, [formData, selectedCountries]);



  useEffect(() => {

    if (formData.category_id) {

      fetchSubcategories(formData.category_id);

    } else {

      setSubcategories([]);

    }

  }, [formData.category_id]);



  useEffect(() => {

    if (selectedCountry && selectedCountries.length === 0) {

      setSelectedCountries([selectedCountry.id]);

    }

  }, [selectedCountry]);



  const checkAuth = async () => {

    // Local-only: render the form without a Clerk session so the layout can
    // be worked on. Clerk's production keys are domain-locked and refuse to
    // initialise on localhost, which otherwise leaves this page stuck on
    // "Loading…" forever and makes the form impossible to see or style.
    //
    // Requires BOTH a dev build and VITE_ADMIN_PREVIEW=true from gitignored
    // .env.local; Vite replaces DEV with false at build time so this branch
    // is stripped from production bundles. `userId` is deliberately left
    // empty — handleSubmit refuses to post without one, so this can preview
    // the form but never create a listing.
    if (import.meta.env.DEV && import.meta.env.VITE_ADMIN_PREVIEW === 'true') {
      setLoading(false);
      return;
    }

    try {

      if (!isLoaded) {

        return;

      }



      if (!isSignedIn || !clerkUser) {

        toast({

          title: 'Authentication Required',

          description: 'Please sign in to post an ad',

          variant: 'destructive',

        });

        navigate('/user/sign-in?redirect_url=/marketplace/post');

        return;

      }



      setUserId(clerkUser.id);



      // Pre-fill user info from Clerk

      const userEmail = clerkUser.primaryEmailAddress?.emailAddress || '';

      const userName = clerkUser.fullName || clerkUser.firstName || userEmail.split('@')[0] || '';



      setFormData(prev => ({

        ...prev,

        seller_name: userName,

        seller_email: userEmail,

      }));

    } catch (error) {

      console.error('Auth check error:', error);

    } finally {

      setLoading(false);

    }

  };



  const fetchCategories = async () => {

    try {

      const { data } = await supabase

        .from('marketplace_categories')

        .select('*')

        .eq('is_active', true)

        .order('display_order');



      setCategories(data || []);

    } catch (error) {

      console.error('Error fetching categories:', error);

    }

  };



  const fetchCountries = async () => {

    try {

      const { data, error } = await supabase

        .from('countries')

        .select('*')

        .order('name');



      if (error) throw error;

      setCountries(data || []);

    } catch (error) {

      console.error('Error fetching countries:', error);

    }

  };



  const fetchSubcategories = async (categoryId: string) => {

    try {

      const { data, error } = await supabase

        .from('marketplace_subcategories')

        .select('*')

        .eq('category_id', categoryId)

        .eq('is_active', true)

        .order('display_order');



      if (error) throw error;

      setSubcategories(data || []);

    } catch (error) {

      console.error('Error fetching subcategories:', error);

      setSubcategories([]);

    }

  };



  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const room = 10 - selectedImages.length;
    if (room <= 0) {
      toast({
        title: 'Photo limit reached',
        description: 'You can add up to 10 photos.',
        variant: 'destructive',
      });
      return;
    }

    // Validate as each photo is picked, not at submit. Previously a seller
    // added photos, saw them accepted, filled in the whole form, and only
    // then discovered one was rejected — by which point the failure looked
    // like the form being broken.
    const accepted: File[] = [];
    const rejected: string[] = [];

    for (const file of files.slice(0, room)) {
      const result = validateImage(file);
      if (result === true) accepted.push(file);
      else rejected.push(`${file.name}: ${result}`);
    }

    if (files.length > room) {
      rejected.push(`Only ${room} more photo${room === 1 ? '' : 's'} could be added (limit is 10).`);
    }

    if (rejected.length > 0) {
      toast({
        title: accepted.length ? 'Some photos couldn\'t be added' : 'Photo couldn\'t be added',
        description: rejected.join(' · '),
        variant: 'destructive',
      });
    }

    if (accepted.length === 0) {
      e.target.value = '';
      return;
    }

    // Object URLs are created synchronously, so previews stay index-aligned
    // with selectedImages. The old code pushed previews from an async
    // FileReader callback, so they could land out of order and removing
    // photo 2 could remove the wrong thumbnail.
    setSelectedImages((prev) => [...prev, ...accepted]);
    setImagePreviews((prev) => [...prev, ...accepted.map((f) => URL.createObjectURL(f))]);

    // Let the same file be re-picked after removal.
    e.target.value = '';
  };



  /**
   * What still blocks moving on from a given step.
   *
   * Returned as messages rather than a boolean so the seller is told what is
   * missing instead of finding the Next button inert with no explanation.
   * The final step is validated by the existing validateForm() on submit.
   */
  const blockersForStep = (s: number): string[] => {
    const out: string[] = [];
    if (s === 1) {
      if (!formData.title?.trim()) out.push('a title');
      if (!formData.category_id) out.push('a category');
      if (selectedImages.length === 0) out.push('at least one photo');
    }
    if (s === 3) {
      if (!formData.price || parseFloat(formData.price) <= 0) out.push('a price');
      if (!formData.seller_phone?.trim() && !formData.seller_whatsapp?.trim()) {
        out.push('a phone or WhatsApp number');
      }
    }
    return out;
  };

  const goToStep = (target: number) => {
    // Moving backwards is always allowed — never trap someone who wants to
    // fix something they already entered.
    if (target < step) {
      setStep(target);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    // Moving forward: check every step between here and there.
    for (let s = step; s < target; s++) {
      const blockers = blockersForStep(s);
      if (blockers.length > 0) {
        setStep(s);
        toast({
          title: `Still needed: ${blockers.join(', ')}`,
          description: 'Add these and you can carry on.',
          variant: 'destructive',
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }
    setStep(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      // Release the object URL so previews don't leak while a seller shuffles
      // through photos on a phone.
      const url = prev[index];
      if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== index);
    });
  };



  const toggleCountrySelection = (countryId: string) => {

    setSelectedCountries(prev =>

      prev.includes(countryId)

        ? prev.filter(id => id !== countryId)

        : [...prev, countryId]

    );

  };



  const validateForm = () => {

    if (!formData.title.trim()) {

      toast({

        title: 'Validation Error',

        description: 'Please enter a title',

        variant: 'destructive',

      });

      return false;

    }



    if (!formData.description.trim()) {

      toast({

        title: 'Validation Error',

        description: 'Please enter a description',

        variant: 'destructive',

      });

      return false;

    }



    if (!formData.category_id) {

      toast({

        title: 'Validation Error',

        description: 'Please select a category',

        variant: 'destructive',

      });

      return false;

    }



    // Price validation — category-aware
    const catConfig = getCategoryConfig(selectedCategorySlug);
    const priceRequired = catConfig?.priceField ? catConfig.priceField.required : true;
    if (priceRequired && (!formData.price || parseFloat(formData.price) <= 0)) {

      toast({

        title: 'Validation Error',

        description: `Please enter a valid ${catConfig?.priceField?.label?.toLowerCase() || 'price'}`,

        variant: 'destructive',

      });

      return false;

    }



    if (selectedCountries.length === 0) {

      toast({

        title: 'Validation Error',

        description: 'Please select a country',

        variant: 'destructive',

      });

      return false;

    }



    if (!formData.seller_whatsapp && !formData.seller_phone && !formData.seller_email) {

      toast({

        title: 'Validation Error',

        description: 'Please provide at least one contact method (WhatsApp, Phone, or Email)',

        variant: 'destructive',

      });

      return false;

    }



    // Image validation — category-aware (optional for jobs, services, businesses)
    const imageRequired = catConfig?.imageRequired !== false;
    if (imageRequired && selectedImages.length === 0) {

      toast({

        title: 'Validation Error',

        description: 'Please upload at least one image',

        variant: 'destructive',

      });

      return false;

    }



    return true;

  };



  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();



    if (!validateForm()) return;

    // Never write a listing with no owner. created_by is TEXT, so an empty
    // string would be silently accepted and produce a listing its owner can
    // never find in My Ads — invisible to them, unmanageable by them. Also
    // the backstop that keeps the local preview above from posting.
    if (!userId) {
      toast({
        title: 'Please sign in again',
        description: 'We couldn\'t confirm your account. Your details are saved — sign in and try once more.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);



    try {

      // Upload images

      // Upload photos sequentially with per-file progress.
      //
      // Previously this was a bare Promise.all with no feedback at all: ten
      // photos on a 3G connection meant a spinner and several minutes of
      // silence, which is indistinguishable from a hang — and the single
      // biggest reason a seller gives up and assumes the site is broken.
      // Sequential also keeps memory sane on low-end phones, where ten
      // simultaneous canvas encodes can exhaust the tab.
      setUploadProgress({});
      const uploadedImages: Array<{ image_url: string; display_order: number; is_primary: boolean }> = [];

      for (let index = 0; index < selectedImages.length; index++) {
        const file = selectedImages[index];
        setUploadProgress((p) => ({ ...p, [index]: 0.05 }));
        try {
          const imageUrl = await uploadImage(file, 'marketplace-listings', 'listings');
          setUploadProgress((p) => ({ ...p, [index]: 1 }));
          uploadedImages.push({
            image_url: imageUrl,
            display_order: index,
            is_primary: index === 0,
          });
        } catch (err) {
          setUploadProgress((p) => ({ ...p, [index]: -1 }));
          // Name the offending photo — "upload failed" on its own leaves the
          // seller with ten pictures and no idea which to replace.
          throw new Error(
            `Photo ${index + 1}${file.name ? ` (${file.name})` : ''} failed to upload: ` +
            (err instanceof Error ? err.message : String(err))
          );
        }
      }



      // Create listing

      const { data: listingData, error: listingError } = await supabase

        .from('marketplace_listings')

        .insert({

          title: formData.title,

          description: formData.description,

          category_id: formData.category_id,

          subcategory_id: formData.subcategory_id || null,

          country_id: selectedCountries[0],

          price: parseFloat(formData.price) || 0,

          currency: formData.currency,

          price_type: formData.price_type,

          condition: formData.condition || null,

          seller_name: formData.seller_name,

          seller_email: formData.seller_email,

          seller_phone: formData.seller_phone,

          seller_whatsapp: formData.seller_whatsapp,

          seller_type: formData.seller_type,

          location_details: formData.location_details,

          status: 'active',

          created_by: userId,

          attributes: attributes,

          is_premium: formData.is_premium,

          accepts_coins: formData.accepts_coins && parseInt(formData.coin_price) > 0,

          coin_price: formData.accepts_coins && parseInt(formData.coin_price) > 0 ? parseInt(formData.coin_price) : null,

        })

        .select()

        .single();



      if (listingError) throw listingError;



      // Insert images

      const imagesWithListingId = uploadedImages.map(img => ({

        ...img,

        listing_id: listingData.id,

      }));



      const { error: imagesError } = await supabase

        .from('marketplace_listing_images')

        .insert(imagesWithListingId);



      if (imagesError) throw imagesError;



      // Insert country associations

      const countryInserts = selectedCountries.map(countryId => ({

        listing_id: listingData.id,

        country_id: countryId,

      }));



      const { error: countriesError } = await supabase

        .from('marketplace_listing_countries')

        .insert(countryInserts);



      if (countriesError) throw countriesError;

      // Insert variants if enabled
      if (variantsEnabled && variantRows.length > 0) {
        const variantInserts = variantRows.map((v, idx) => ({
          listing_id: listingData.id,
          label: v.label,
          attributes: v.attributes,
          price_override: v.price_override ? parseFloat(v.price_override) : null,
          quantity: parseInt(v.quantity) || 1,
          quantity_sold: 0,
          image_url: v.image_url || null,
          is_available: true,
          sort_order: idx,
        }));
        const { error: variantError } = await supabase
          .from('marketplace_listing_variants')
          .insert(variantInserts);
        if (variantError) console.error('Variant insert error:', variantError);
      }

      // Upsert partner profile on first post (fire-and-forget; non-blocking)

      try {

        const slugBase = (formData.seller_name || clerkUser?.fullName || 'seller')

          .toLowerCase()

          .replace(/[^a-z0-9]+/g, '-')

          .replace(/^-|-$/g, '')

          .slice(0, 40);

        const partnerSlug = `${slugBase}-${userId.slice(-6)}`;

        await supabase.from('marketplace_partners').upsert({

          owner_user_id: userId,

          display_name: formData.seller_name || clerkUser?.fullName || 'Seller',

          slug: partnerSlug,

          contact_email: formData.seller_email,

          contact_phone: formData.seller_phone,

          contact_whatsapp: formData.seller_whatsapp,

          business_type: formData.seller_type,

          country_id: selectedCountries[0],

          verification_level: 'unverified',

        }, { onConflict: 'owner_user_id', ignoreDuplicates: false });

      } catch (partnerErr) {

        console.warn('Partner upsert failed (non-critical):', partnerErr);

      }



      // Frontend email fallback in case DB trigger is not applied yet

      try {

        await supabase.from('email_queue').insert({

          to_email: formData.seller_email,

          subject: '🛒 Ad Received: ' + formData.title,

          html_content: `<p>Hi ${formData.seller_name || 'Seller'},</p><p>Your marketplace ad <strong>${formData.title}</strong> has been received and is currently under review. We will notify you once it is published.</p><p>Ad ID: ${listingData.id}</p><p>— The Bara Afrika Team</p>`,

          metadata: { listing_id: listingData.id, type: 'marketplace_submission' }

        });

      } catch (emailErr) {

        // Email failure must never block listing creation

        console.warn('Email enqueue failed (non-critical):', emailErr);

      }



      // Gamification: Award XP and check for first listing achievement

      try {

        await GamificationService.addXP(userId, await GamificationService.getSetting('xp.listing_create'), `Posted listing: ${formData.title}`);

        await GamificationService.awardAchievement(userId, 'market_entry');

        await GamificationService.trackMissionProgress(userId, 'weekly_market_post');



        // If premium, spend coins (boost cost is admin-tunable)

        if (formData.is_premium) {

          const boostCost = await GamificationService.getSetting('cost.listing_boost');

          await GamificationService.spendCoins(userId, boostCost, `Premium boost for: ${formData.title}`);

        }

      } catch (gamifyErr) {

        console.warn('Gamification update failed:', gamifyErr);

      }



      // The listing is inserted with status 'active', and the form itself
      // says it goes live immediately — so don't tell the seller it is "under
      // review". The page previously gave three different answers to the same
      // question (live now / submitted for review / currently under review in
      // the email).
      toast({
        title: 'Your ad is live',
        description: 'It\'s now visible in the marketplace. You can edit it any time from My Ads.',
      });

      // Posted successfully — the parked draft is no longer wanted.
      try { localStorage.removeItem(DRAFT_KEY); } catch { /* best-effort */ }

      navigate(`/marketplace/ad/${listingData.id}`);

    } catch (error) {

      console.error('Error creating ad:', error);

      // Say what actually went wrong. Every distinct failure — a rejected
      // photo, a storage error, a denied insert, a network drop — used to
      // collapse into "Failed to create ad. Please try again.", which told
      // the seller nothing and told us nothing either. The draft is
      // deliberately NOT cleared here, so a retry keeps their work.
      const raw = error instanceof Error ? error.message : String(error);
      let description = 'Something went wrong creating your ad. Your details have been saved — please try again.';

      if (/mime|content type|not supported|image\//i.test(raw)) {
        description = 'One of your photos is in a format we can\'t accept. Try removing it and adding a different one.';
      } else if (/storage|bucket|upload/i.test(raw)) {
        description = 'Your photos couldn\'t be uploaded. Check your connection and try again — your details are saved.';
      } else if (/row-level security|permission|denied|JWT|401|403/i.test(raw)) {
        description = 'Your session expired. Please sign in again — your draft has been saved.';
      } else if (/network|fetch|timeout|Failed to fetch/i.test(raw)) {
        description = 'We couldn\'t reach the server. Check your connection and try again — your details are saved.';
      } else if (/column|schema|violates|constraint/i.test(raw)) {
        description = `We couldn't save this ad: ${raw.slice(0, 120)}`;
      }

      toast({
        title: 'Couldn\'t post your ad',
        description,
        variant: 'destructive',
      });

    } finally {

      setSubmitting(false);

    }

  };



  // MUST stay above the `if (loading)` early return below.
  //
  // This useMemo sat *after* that return, so render 1 (loading === true) ran
  // N hooks and render 2 ran N+1. React throws "Rendered more hooks than
  // during the previous render", the ErrorBoundary swallows it, and the user
  // sees a blank screen with nothing in the console and nothing in the
  // database. That shipped on 14 Apr 2026 and no listing has been created
  // since 13 Apr — this one misplaced hook is why.
  //
  // Rule: every hook goes above every conditional return. `eslint-plugin-
  // react-hooks` catches this class of bug; tsc and the build do not, which
  // is exactly how it survived four months.
  const completeness = useMemo(() => {
    const checks: Array<{ key: string; label: string; done: boolean }> = [
      { key: 'title', label: 'Title', done: !!formData.title.trim() },
      { key: 'desc', label: 'Description (30+ chars)', done: formData.description.trim().length >= 30 },
      { key: 'category', label: 'Category', done: !!formData.category_id },
      { key: 'price', label: 'Price', done: !!formData.price && parseFloat(formData.price) > 0 },
      { key: 'condition', label: 'Condition', done: !!formData.condition },
      { key: 'location', label: 'Location', done: !!(formData.location_details?.trim() || selectedCountries.length > 0) },
      { key: 'image1', label: 'At least 1 photo', done: imagePreviews.length >= 1 },
      { key: 'image3', label: '3+ photos (recommended)', done: imagePreviews.length >= 3 },
      { key: 'contact', label: 'Phone or WhatsApp', done: !!(formData.seller_phone?.trim() || formData.seller_whatsapp?.trim()) },
    ];
    const doneCount = checks.filter((c) => c.done).length;
    const percent = Math.round((doneCount / checks.length) * 100);
    const missing = checks.filter((c) => !c.done).map((c) => c.label);
    return { checks, percent, missing };
  }, [formData, imagePreviews.length, selectedCountries.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <TopBannerAd />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (

    <div className="min-h-screen bg-gray-50 font-roboto">

      <Header />
      <TopBannerAd />



      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="mb-8">

          <h1 className="text-3xl font-bold text-gray-900 mb-2 font-comfortaa">

            Sell Something

          </h1>

          <p className="text-gray-600">

            Fill in the details below to post your ad on the marketplace

          </p>

        </div>

        {draftRestored && (
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border border-gray-900 bg-gray-50 px-4 py-3">
            <p className="flex-1 text-sm text-gray-800">
              <span className="font-bold">We brought back your unfinished ad.</span>{' '}
              Photos need adding again — everything else is as you left it.
            </p>
            <button
              type="button"
              onClick={() => {
                try { localStorage.removeItem(DRAFT_KEY); } catch { /* best-effort */ }
                setDraftRestored(false);
                window.location.reload();
              }}
              className="shrink-0 text-sm font-bold text-gray-900 underline hover:no-underline"
            >
              Start fresh instead
            </button>
          </div>
        )}

        {/* Step indicator.
            Replaces a sticky completeness card that consumed ~110px of an
            already short mobile viewport for the entire scroll. Progress is
            now conveyed by which step you're on, which is both smaller and
            more meaningful than a percentage. */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            {STEPS.map((s) => (
              <button
                key={s.n}
                type="button"
                onClick={() => goToStep(s.n)}
                className="flex-1 group text-left"
                aria-current={step === s.n ? 'step' : undefined}
                aria-label={`Step ${s.n}: ${s.label}`}
              >
                <span
                  className={`block h-1.5 rounded-full transition-colors ${
                    s.n < step ? 'bg-gray-900'
                    : s.n === step ? 'bg-gray-900'
                    : 'bg-gray-200 group-hover:bg-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900 font-comfortaa">
                {STEPS[step - 1].label}
              </h2>
              <p className="text-sm text-gray-500">{STEPS[step - 1].hint}</p>
            </div>
            <span className="text-sm text-gray-400 tabular-nums shrink-0">
              Step {step} of {STEPS.length}
            </span>
          </div>
          {step === 1 && imagePreviews.length === 0 && (
            <p className="mt-3 text-xs text-gray-600 border border-gray-200 rounded-lg px-3 py-2 bg-gray-50">
              <span className="font-bold text-gray-900">Photos sell.</span> Ads with 3 or more
              clear pictures get far more views — use natural light and show every angle.
            </p>
          )}
        </div>



        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ---- STEP 1: photos, title, category ---- */}
          <div className={step === 1 ? 'contents' : 'hidden'}>

          {/* Basic Information */}

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">

            <h2 className="text-xl font-bold text-gray-900 mb-4 font-comfortaa">

              Basic Information

            </h2>



            <div className="space-y-4">

              <div>

                <Label htmlFor="title">Title *</Label>

                <Input

                  id="title"

                  value={formData.title}

                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}

                  placeholder="e.g., iPhone 13 Pro Max 256GB"

                  maxLength={100}

                />



                <p className="text-sm text-gray-500 mt-2">

                  {formData.title.length}/100 characters

                </p>

              </div>



              <div>

                <Label htmlFor="description">Description *</Label>

                <Textarea

                  id="description"

                  value={formData.description}

                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}

                  placeholder="Describe your item in detail..."

                  rows={6}

                  maxLength={2000}

                />

                <p className="text-sm text-gray-500 mt-1">

                  {formData.description.length}/2000 characters

                </p>

              </div>



              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>

                  <Label htmlFor="category">Category *</Label>

                  <Select

                    value={formData.category_id}

                    onValueChange={(value) => {

                      const category = categories.find(c => c.id === value);

                      setFormData({ ...formData, category_id: value, subcategory_id: '' });

                      setSelectedCategorySlug(category?.slug || '');

                      setAttributes({}); // Reset attributes when category changes

                    }}

                  >

                    <SelectTrigger>

                      <SelectValue placeholder="Select category" />

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



                {/* Subcategory - show if category has subcategories */}

                {subcategories.length > 0 && (

                  <div>

                    <Label htmlFor="subcategory">Type</Label>

                    <Select

                      value={formData.subcategory_id}

                      onValueChange={(value) => setFormData({ ...formData, subcategory_id: value })}

                    >

                      <SelectTrigger>

                        <SelectValue placeholder="Select type" />

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



                {/* Only show condition for physical products, not services/jobs/pets */}

                {!['jobs', 'services', 'pets', 'businesses'].includes(selectedCategorySlug) && !selectedCategorySlug.includes('property') && (

                  <div>

                    <Label htmlFor="condition">Condition</Label>

                    <Select

                      value={formData.condition}

                      onValueChange={(value) => setFormData({ ...formData, condition: value })}

                    >

                      <SelectTrigger>

                        <SelectValue placeholder="Select condition" />

                      </SelectTrigger>

                      <SelectContent>

                        <SelectItem value="new">New</SelectItem>

                        <SelectItem value="used">Used</SelectItem>

                        <SelectItem value="like-new">Like New</SelectItem>

                      </SelectContent>

                    </Select>

                  </div>

                )}

              </div>



          {/* Images */}

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">

            <h2 className="text-xl font-bold text-gray-900 mb-4 font-comfortaa">

              Images {getCategoryConfig(selectedCategorySlug)?.imageRequired === false ? '(Optional — Max 10)' : '* (Max 10)'}

            </h2>
            {getCategoryConfig(selectedCategorySlug)?.imageGuidance && (
              <p className="text-sm text-gray-500 mb-3">{getCategoryConfig(selectedCategorySlug)?.imageGuidance}</p>
            )}



            <div className="space-y-4">

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">

                <input

                  type="file"

                  accept="image/*"

                  multiple

                  onChange={handleImageSelect}

                  className="hidden"

                  id="image-upload"

                  disabled={selectedImages.length >= 10}

                />

                <label

                  htmlFor="image-upload"

                  className={`cursor-pointer ${selectedImages.length >= 10 ? 'opacity-50 cursor-not-allowed' : ''}`}

                >

                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />

                  <p className="text-gray-600 mb-2">

                    Click to upload images

                  </p>

                  <p className="text-sm text-gray-500">

                    PNG, JPG up to 10MB each ({selectedImages.length}/10)

                  </p>

                </label>

              </div>



              {imagePreviews.length > 0 && (

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">

                  {imagePreviews.map((preview, index) => (

                    <div key={index} className="relative group">

                      <img

                        loading="lazy" src={preview}

                        alt={`Preview ${index + 1}`}

                        className="w-full h-32 object-cover rounded-lg border border-gray-200"

                      />

                      {/* Per-photo upload state. Always visible on touch —
                          `opacity-0 group-hover` hides the remove button
                          entirely on phones, where there is no hover. */}
                      {submitting && uploadProgress[index] !== undefined && (
                        <div className="absolute inset-0 rounded-lg bg-white/85 flex flex-col items-center justify-center gap-2 px-2">
                          {uploadProgress[index] === -1 ? (
                            <span className="text-xs font-bold text-red-600 text-center">Failed</span>
                          ) : uploadProgress[index] >= 1 ? (
                            <>
                              <CheckCircle className="w-5 h-5 text-gray-900" />
                              <span className="text-[11px] font-bold text-gray-700">Uploaded</span>
                            </>
                          ) : (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin text-gray-900" />
                              <span className="text-[11px] font-bold text-gray-700">Uploading…</span>
                            </>
                          )}
                        </div>
                      )}

                      <button

                        type="button"

                        onClick={() => removeImage(index)}

                        disabled={submitting}

                        aria-label={`Remove photo ${index + 1}`}

                        className="absolute top-2 right-2 w-7 h-7 bg-gray-900 text-white rounded-full flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 transition-opacity disabled:hidden"

                      >

                        <X className="w-4 h-4" />

                      </button>

                      {index === 0 && (

                        <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">

                          Primary

                        </div>

                      )}

                    </div>

                  ))}

                </div>

              )}

            </div>

          </div>

          </div>
          {/* ---- end STEP 1 ---- */}

          {/* ---- STEP 2: category-specific details ---- */}
          <div className={step === 2 ? 'contents' : 'hidden'}>

              {/* Category-Specific Fields */}

              {selectedCategorySlug === 'motors' && (

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">

                  <h3 className="font-semibold text-gray-900 mb-4">Vehicle Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>

                      <Label>Brand/Make</Label>

                      <Select

                        value={attributes.make || ''}

                        onValueChange={(value) => setAttributes({ ...attributes, make: value })}

                      >

                        <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>

                        <SelectContent>

                          <SelectItem value="Toyota">Toyota</SelectItem>

                          <SelectItem value="Honda">Honda</SelectItem>

                          <SelectItem value="Nissan">Nissan</SelectItem>

                          <SelectItem value="Mercedes-Benz">Mercedes-Benz</SelectItem>

                          <SelectItem value="BMW">BMW</SelectItem>

                          <SelectItem value="Audi">Audi</SelectItem>

                          <SelectItem value="Volkswagen">Volkswagen</SelectItem>

                          <SelectItem value="Ford">Ford</SelectItem>

                          <SelectItem value="Chevrolet">Chevrolet</SelectItem>

                          <SelectItem value="Hyundai">Hyundai</SelectItem>

                          <SelectItem value="Kia">Kia</SelectItem>

                          <SelectItem value="Mazda">Mazda</SelectItem>

                          <SelectItem value="Subaru">Subaru</SelectItem>

                          <SelectItem value="Mitsubishi">Mitsubishi</SelectItem>

                          <SelectItem value="Suzuki">Suzuki</SelectItem>

                          <SelectItem value="Isuzu">Isuzu</SelectItem>

                          <SelectItem value="Land Rover">Land Rover</SelectItem>

                          <SelectItem value="Jeep">Jeep</SelectItem>

                          <SelectItem value="Peugeot">Peugeot</SelectItem>

                          <SelectItem value="Renault">Renault</SelectItem>

                          <SelectItem value="Other">Other</SelectItem>

                        </SelectContent>

                      </Select>

                    </div>

                    <div>

                      <Label>Model</Label>

                      <Input

                        value={attributes.model || ''}

                        onChange={(e) => setAttributes({ ...attributes, model: e.target.value })}

                        placeholder="e.g., Camry"

                      />

                    </div>

                    <div>

                      <Label>Year</Label>

                      <Select value={attributes.year || ''} onValueChange={(value) => setAttributes({ ...attributes, year: value })}>

                        <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>

                        <SelectContent>

                          {Array.from({ length: 10 }, (_, i) => 2024 - i).map(year => (

                            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>

                          ))}

                        </SelectContent>

                      </Select>

                    </div>

                    <div>

                      <Label>Body Type</Label>

                      <Select value={attributes.body_type || ''} onValueChange={(value) => setAttributes({ ...attributes, body_type: value })}>

                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>

                        <SelectContent>

                          <SelectItem value="Sedan">Sedan</SelectItem>

                          <SelectItem value="SUV">SUV</SelectItem>

                          <SelectItem value="Hatchback">Hatchback</SelectItem>

                          <SelectItem value="Coupe">Coupe</SelectItem>

                          <SelectItem value="Pickup">Pickup Truck</SelectItem>

                          <SelectItem value="Van">Van</SelectItem>

                        </SelectContent>

                      </Select>

                    </div>

                    <div>

                      <Label>Fuel Type</Label>

                      <Select value={attributes.fuel_type || ''} onValueChange={(value) => setAttributes({ ...attributes, fuel_type: value })}>

                        <SelectTrigger><SelectValue placeholder="Select fuel type" /></SelectTrigger>

                        <SelectContent>

                          <SelectItem value="Petrol">Petrol</SelectItem>

                          <SelectItem value="Diesel">Diesel</SelectItem>

                          <SelectItem value="Electric">Electric</SelectItem>

                          <SelectItem value="Hybrid">Hybrid</SelectItem>

                        </SelectContent>

                      </Select>

                    </div>

                    <div>

                      <Label>Transmission</Label>

                      <Select value={attributes.transmission || ''} onValueChange={(value) => setAttributes({ ...attributes, transmission: value })}>

                        <SelectTrigger><SelectValue placeholder="Select transmission" /></SelectTrigger>

                        <SelectContent>

                          <SelectItem value="Automatic">Automatic</SelectItem>

                          <SelectItem value="Manual">Manual</SelectItem>

                        </SelectContent>

                      </Select>

                    </div>

                    <div>

                      <Label>Mileage (km)</Label>

                      <Input

                        type="number"

                        value={attributes.mileage || ''}

                        onChange={(e) => setAttributes({ ...attributes, mileage: e.target.value })}

                        placeholder="e.g., 35000"

                      />

                    </div>

                  </div>

                </div>

              )}



              {selectedCategorySlug.includes('property') && (

                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">

                  <h3 className="font-semibold text-gray-900 mb-4">Property Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>

                      <Label>Property Type</Label>

                      <Select value={attributes.property_type || ''} onValueChange={(value) => setAttributes({ ...attributes, property_type: value })}>

                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>

                        <SelectContent>

                          <SelectItem value="Apartment">Apartment</SelectItem>

                          <SelectItem value="Villa">Villa</SelectItem>

                          <SelectItem value="House">House</SelectItem>

                          <SelectItem value="Land">Land</SelectItem>

                          <SelectItem value="Commercial">Commercial</SelectItem>

                        </SelectContent>

                      </Select>

                    </div>

                    <div>

                      <Label>Bedrooms</Label>

                      <Select value={attributes.bedrooms?.toString() || ''} onValueChange={(value) => setAttributes({ ...attributes, bedrooms: parseInt(value) })}>

                        <SelectTrigger><SelectValue placeholder="Select bedrooms" /></SelectTrigger>

                        <SelectContent>

                          {[1, 2, 3, 4, 5, 6].map(num => (

                            <SelectItem key={num} value={num.toString()}>{num}</SelectItem>

                          ))}

                        </SelectContent>

                      </Select>

                    </div>

                    <div>

                      <Label>Bathrooms</Label>

                      <Select value={attributes.bathrooms?.toString() || ''} onValueChange={(value) => setAttributes({ ...attributes, bathrooms: parseInt(value) })}>

                        <SelectTrigger><SelectValue placeholder="Select bathrooms" /></SelectTrigger>

                        <SelectContent>

                          {[1, 2, 3, 4, 5].map(num => (

                            <SelectItem key={num} value={num.toString()}>{num}</SelectItem>

                          ))}

                        </SelectContent>

                      </Select>

                    </div>

                    <div>

                      <Label>Area (sqm)</Label>

                      <Input

                        type="number"

                        value={attributes.area || ''}

                        onChange={(e) => setAttributes({ ...attributes, area: e.target.value })}

                        placeholder="e.g., 120"

                      />

                    </div>

                    <div>

                      <Label>Furnished</Label>

                      <Select value={attributes.furnished || ''} onValueChange={(value) => setAttributes({ ...attributes, furnished: value })}>

                        <SelectTrigger><SelectValue placeholder="Select option" /></SelectTrigger>

                        <SelectContent>

                          <SelectItem value="Furnished">Furnished</SelectItem>

                          <SelectItem value="Unfurnished">Unfurnished</SelectItem>

                          <SelectItem value="Semi-Furnished">Semi-Furnished</SelectItem>

                        </SelectContent>

                      </Select>

                    </div>

                  </div>

                </div>

              )}



              {(selectedCategorySlug === 'electronics' || selectedCategorySlug === 'mobile-tablets') && (

                <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">

                  <h3 className="font-semibold text-gray-900 mb-4">Product Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>

                      <Label>Brand</Label>

                      <Input

                        value={attributes.brand || ''}

                        onChange={(e) => setAttributes({ ...attributes, brand: e.target.value })}

                        placeholder="e.g., Apple, Samsung"

                      />

                    </div>

                    <div>

                      <Label>Warranty</Label>

                      <Select value={attributes.warranty || ''} onValueChange={(value) => setAttributes({ ...attributes, warranty: value })}>

                        <SelectTrigger><SelectValue placeholder="Select warranty" /></SelectTrigger>

                        <SelectContent>

                          <SelectItem value="Yes">With Warranty</SelectItem>

                          <SelectItem value="No">No Warranty</SelectItem>

                        </SelectContent>

                      </Select>

                    </div>

                  </div>

                </div>

              )}



              {selectedCategorySlug === 'fashion' && (

                <div className="mt-6 p-4 bg-pink-50 rounded-lg border border-pink-200">

                  <h3 className="font-semibold text-gray-900 mb-4">Fashion Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>

                      <Label>Gender</Label>

                      <Select value={attributes.gender || ''} onValueChange={(value) => setAttributes({ ...attributes, gender: value })}>

                        <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>

                        <SelectContent>

                          <SelectItem value="Men">Men</SelectItem>

                          <SelectItem value="Women">Women</SelectItem>

                          <SelectItem value="Unisex">Unisex</SelectItem>

                        </SelectContent>

                      </Select>

                    </div>

                    <div>

                      <Label>Size</Label>

                      <Select value={attributes.size || ''} onValueChange={(value) => setAttributes({ ...attributes, size: value })}>

                        <SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger>

                        <SelectContent>

                          <SelectItem value="XS">XS</SelectItem>

                          <SelectItem value="S">S</SelectItem>

                          <SelectItem value="M">M</SelectItem>

                          <SelectItem value="L">L</SelectItem>

                          <SelectItem value="XL">XL</SelectItem>

                          <SelectItem value="XXL">XXL</SelectItem>

                        </SelectContent>

                      </Select>

                    </div>

                  </div>

                </div>

              )}



              {selectedCategorySlug === 'jobs' && (

                <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">

                  <h3 className="font-semibold text-gray-900 mb-4">Job Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div className="md:col-span-2">

                      <Label>Company Name *</Label>

                      <Input
                        value={attributes.company_name || ''}
                        onChange={(e) => setAttributes({ ...attributes, company_name: e.target.value })}
                        placeholder="e.g., ABC Corporation"
                      />

                    </div>

                    <div>

                      <Label>Job Type *</Label>

                      <Select value={attributes.job_type || ''} onValueChange={(value) => setAttributes({ ...attributes, job_type: value })}>

                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>

                        <SelectContent>

                          <SelectItem value="Full-time">Full-time</SelectItem>

                          <SelectItem value="Part-time">Part-time</SelectItem>

                          <SelectItem value="Contract">Contract</SelectItem>

                          <SelectItem value="Freelance">Freelance</SelectItem>

                          <SelectItem value="Internship">Internship</SelectItem>

                        </SelectContent>

                      </Select>

                    </div>

                    <div>

                      <Label>Experience Level</Label>

                      <Select value={attributes.experience_level || ''} onValueChange={(value) => setAttributes({ ...attributes, experience_level: value })}>

                        <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>

                        <SelectContent>

                          <SelectItem value="Entry Level">Entry Level</SelectItem>

                          <SelectItem value="Mid Level">Mid Level</SelectItem>

                          <SelectItem value="Senior Level">Senior Level</SelectItem>

                          <SelectItem value="Executive">Executive</SelectItem>

                        </SelectContent>

                      </Select>

                    </div>

                    <div>

                      <Label>Work Type</Label>

                      <Select value={attributes.work_type || ''} onValueChange={(value) => setAttributes({ ...attributes, work_type: value })}>

                        <SelectTrigger><SelectValue placeholder="Select work type" /></SelectTrigger>

                        <SelectContent>

                          <SelectItem value="Remote">Remote</SelectItem>

                          <SelectItem value="On-site">On-site</SelectItem>

                          <SelectItem value="Hybrid">Hybrid</SelectItem>

                        </SelectContent>

                      </Select>

                    </div>

                    <div>

                      <Label>Application Deadline</Label>

                      <Input
                        type="date"
                        value={attributes.deadline || ''}
                        onChange={(e) => setAttributes({ ...attributes, deadline: e.target.value })}
                      />

                    </div>

                  </div>

                </div>

              )}



              {selectedCategorySlug === 'pets' && (

                <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">

                  <h3 className="font-semibold text-gray-900 mb-4">Pet Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>

                      <Label>Pet Type *</Label>

                      <Select value={attributes.pet_type || ''} onValueChange={(value) => setAttributes({ ...attributes, pet_type: value })}>

                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>

                        <SelectContent>

                          <SelectItem value="Dog">Dog</SelectItem>

                          <SelectItem value="Cat">Cat</SelectItem>

                          <SelectItem value="Bird">Bird</SelectItem>

                          <SelectItem value="Fish">Fish</SelectItem>

                          <SelectItem value="Rabbit">Rabbit</SelectItem>

                          <SelectItem value="Other">Other</SelectItem>

                        </SelectContent>

                      </Select>

                    </div>

                    <div>

                      <Label>Breed</Label>

                      <Input
                        value={attributes.breed || ''}
                        onChange={(e) => setAttributes({ ...attributes, breed: e.target.value })}
                        placeholder="e.g., Labrador Retriever"
                      />

                    </div>

                    <div>

                      <Label>Age</Label>

                      <Select value={attributes.pet_age || ''} onValueChange={(value) => setAttributes({ ...attributes, pet_age: value })}>

                        <SelectTrigger><SelectValue placeholder="Select age" /></SelectTrigger>

                        <SelectContent>

                          <SelectItem value="Puppy/Kitten">Puppy/Kitten</SelectItem>

                          <SelectItem value="Young">Young</SelectItem>

                          <SelectItem value="Adult">Adult</SelectItem>

                          <SelectItem value="Senior">Senior</SelectItem>

                        </SelectContent>

                      </Select>

                    </div>

                    <div>

                      <Label>Gender</Label>

                      <Select value={attributes.pet_gender || ''} onValueChange={(value) => setAttributes({ ...attributes, pet_gender: value })}>

                        <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>

                        <SelectContent>

                          <SelectItem value="Male">Male</SelectItem>

                          <SelectItem value="Female">Female</SelectItem>

                        </SelectContent>

                      </Select>

                    </div>

                    <div>

                      <Label>Vaccinated</Label>

                      <Select value={attributes.vaccinated || ''} onValueChange={(value) => setAttributes({ ...attributes, vaccinated: value })}>

                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>

                        <SelectContent>

                          <SelectItem value="Yes">Yes</SelectItem>

                          <SelectItem value="No">No</SelectItem>

                          <SelectItem value="Partial">Partially</SelectItem>

                        </SelectContent>

                      </Select>

                    </div>

                  </div>

                </div>

              )}

              {selectedCategorySlug === 'services' && (

                <div className="mt-6 p-4 bg-teal-50 rounded-lg border border-teal-200">

                  <h3 className="font-semibold text-gray-900 mb-4">Service Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>

                      <Label>Service Type *</Label>

                      <Select value={attributes.service_type || ''} onValueChange={(value) => setAttributes({ ...attributes, service_type: value })}>

                        <SelectTrigger><SelectValue placeholder="Select service type" /></SelectTrigger>

                        <SelectContent>

                          <SelectItem value="Cleaning">Cleaning</SelectItem>

                          <SelectItem value="Repair">Repair & Maintenance</SelectItem>

                          <SelectItem value="Tutoring">Tutoring & Education</SelectItem>

                          <SelectItem value="Photography">Photography</SelectItem>

                          <SelectItem value="Catering">Catering</SelectItem>

                          <SelectItem value="Consulting">Consulting</SelectItem>

                          <SelectItem value="IT">IT & Technology</SelectItem>

                          <SelectItem value="Legal">Legal</SelectItem>

                          <SelectItem value="Health">Health & Wellness</SelectItem>

                          <SelectItem value="Other">Other</SelectItem>

                        </SelectContent>

                      </Select>

                    </div>

                    <div>

                      <Label>Availability *</Label>

                      <Select value={attributes.availability || ''} onValueChange={(value) => setAttributes({ ...attributes, availability: value })}>

                        <SelectTrigger><SelectValue placeholder="Select availability" /></SelectTrigger>

                        <SelectContent>

                          <SelectItem value="Weekdays">Weekdays</SelectItem>

                          <SelectItem value="Weekends">Weekends</SelectItem>

                          <SelectItem value="24/7">24/7</SelectItem>

                          <SelectItem value="By Appointment">By Appointment</SelectItem>

                        </SelectContent>

                      </Select>

                    </div>

                    <div>

                      <Label>Years of Experience</Label>

                      <Input
                        type="number"
                        value={attributes.experience_years || ''}
                        onChange={(e) => setAttributes({ ...attributes, experience_years: e.target.value })}
                        placeholder="e.g., 5"
                        min="0"
                      />

                    </div>

                    <div>

                      <Label>Service Area</Label>

                      <Input
                        value={attributes.service_area || ''}
                        onChange={(e) => setAttributes({ ...attributes, service_area: e.target.value })}
                        placeholder="e.g., City-wide, Specific neighborhoods"
                      />

                    </div>

                  </div>

                </div>

              )}

              {selectedCategorySlug === 'home-furniture' && (

                <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">

                  <h3 className="font-semibold text-gray-900 mb-4">Furniture Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>

                      <Label>Furniture Type</Label>

                      <Select value={attributes.furniture_type || ''} onValueChange={(value) => setAttributes({ ...attributes, furniture_type: value })}>

                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>

                        <SelectContent>

                          <SelectItem value="Sofa">Sofa</SelectItem>

                          <SelectItem value="Bed">Bed</SelectItem>

                          <SelectItem value="Table">Table</SelectItem>

                          <SelectItem value="Chair">Chair</SelectItem>

                          <SelectItem value="Cabinet">Cabinet</SelectItem>

                          <SelectItem value="Desk">Desk</SelectItem>

                          <SelectItem value="Appliance">Home Appliance</SelectItem>

                          <SelectItem value="Other">Other</SelectItem>

                        </SelectContent>

                      </Select>

                    </div>

                    <div>

                      <Label>Material</Label>

                      <Input
                        value={attributes.material || ''}
                        onChange={(e) => setAttributes({ ...attributes, material: e.target.value })}
                        placeholder="e.g., Wood, Metal, Fabric"
                      />

                    </div>

                    <div>

                      <Label>Dimensions</Label>

                      <Input
                        value={attributes.dimensions || ''}
                        onChange={(e) => setAttributes({ ...attributes, dimensions: e.target.value })}
                        placeholder="e.g., 200x100x80 cm"
                      />

                    </div>

                    <div>

                      <Label>Color</Label>

                      <Input
                        value={attributes.color || ''}
                        onChange={(e) => setAttributes({ ...attributes, color: e.target.value })}
                        placeholder="e.g., Brown"
                      />

                    </div>

                  </div>

                </div>

              )}

              {selectedCategorySlug === 'kids-babies' && (

                <div className="mt-6 p-4 bg-rose-50 rounded-lg border border-rose-200">

                  <h3 className="font-semibold text-gray-900 mb-4">Kids & Babies Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>

                      <Label>Item Type</Label>

                      <Select value={attributes.item_type || ''} onValueChange={(value) => setAttributes({ ...attributes, item_type: value })}>

                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>

                        <SelectContent>

                          <SelectItem value="Clothing">Clothing</SelectItem>

                          <SelectItem value="Toys">Toys & Games</SelectItem>

                          <SelectItem value="Stroller">Stroller / Pram</SelectItem>

                          <SelectItem value="Car Seat">Car Seat</SelectItem>

                          <SelectItem value="Feeding">Feeding Supplies</SelectItem>

                          <SelectItem value="Furniture">Nursery Furniture</SelectItem>

                          <SelectItem value="Other">Other</SelectItem>

                        </SelectContent>

                      </Select>

                    </div>

                    <div>

                      <Label>Age Group</Label>

                      <Select value={attributes.age_group || ''} onValueChange={(value) => setAttributes({ ...attributes, age_group: value })}>

                        <SelectTrigger><SelectValue placeholder="Select age group" /></SelectTrigger>

                        <SelectContent>

                          <SelectItem value="Newborn">Newborn (0-3 months)</SelectItem>

                          <SelectItem value="Baby">Baby (3-12 months)</SelectItem>

                          <SelectItem value="Toddler">Toddler (1-3 years)</SelectItem>

                          <SelectItem value="Preschool">Preschool (3-5 years)</SelectItem>

                          <SelectItem value="Kids">Kids (5-12 years)</SelectItem>

                          <SelectItem value="Teens">Teens (12+)</SelectItem>

                        </SelectContent>

                      </Select>

                    </div>

                    <div>

                      <Label>Gender</Label>

                      <Select value={attributes.gender || ''} onValueChange={(value) => setAttributes({ ...attributes, gender: value })}>

                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>

                        <SelectContent>

                          <SelectItem value="Boy">Boy</SelectItem>

                          <SelectItem value="Girl">Girl</SelectItem>

                          <SelectItem value="Unisex">Unisex</SelectItem>

                        </SelectContent>

                      </Select>

                    </div>

                    <div>

                      <Label>Brand</Label>

                      <Input
                        value={attributes.brand || ''}
                        onChange={(e) => setAttributes({ ...attributes, brand: e.target.value })}
                        placeholder="e.g., Graco, Fisher-Price"
                      />

                    </div>

                  </div>

                </div>

              )}

              {selectedCategorySlug === 'hobbies' && (

                <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">

                  <h3 className="font-semibold text-gray-900 mb-4">Hobby Item Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>

                      <Label>Category</Label>

                      <Select value={attributes.hobby_type || ''} onValueChange={(value) => setAttributes({ ...attributes, hobby_type: value })}>

                        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>

                        <SelectContent>

                          <SelectItem value="Sports">Sports Equipment</SelectItem>

                          <SelectItem value="Musical">Musical Instruments</SelectItem>

                          <SelectItem value="Books">Books & Media</SelectItem>

                          <SelectItem value="Games">Games & Puzzles</SelectItem>

                          <SelectItem value="Art">Art & Crafts</SelectItem>

                          <SelectItem value="Outdoor">Outdoor & Camping</SelectItem>

                          <SelectItem value="Collectibles">Collectibles</SelectItem>

                          <SelectItem value="Other">Other</SelectItem>

                        </SelectContent>

                      </Select>

                    </div>

                    <div>

                      <Label>Brand</Label>

                      <Input
                        value={attributes.brand || ''}
                        onChange={(e) => setAttributes({ ...attributes, brand: e.target.value })}
                        placeholder="e.g., Wilson, Yamaha"
                      />

                    </div>

                  </div>

                </div>

              )}

              {selectedCategorySlug === 'businesses' && (

                <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">

                  <h3 className="font-semibold text-gray-900 mb-4">Business Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>

                      <Label>Business Type *</Label>

                      <Select value={attributes.business_type || ''} onValueChange={(value) => setAttributes({ ...attributes, business_type: value })}>

                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>

                        <SelectContent>

                          <SelectItem value="Restaurant">Restaurant / Food</SelectItem>

                          <SelectItem value="Retail">Retail Shop</SelectItem>

                          <SelectItem value="Manufacturing">Manufacturing</SelectItem>

                          <SelectItem value="Service">Service Business</SelectItem>

                          <SelectItem value="Franchise">Franchise</SelectItem>

                          <SelectItem value="Online">Online Business</SelectItem>

                          <SelectItem value="Industrial">Industrial Equipment</SelectItem>

                          <SelectItem value="Other">Other</SelectItem>

                        </SelectContent>

                      </Select>

                    </div>

                    <div>

                      <Label>Years in Operation</Label>

                      <Input
                        type="number"
                        value={attributes.years_operating || ''}
                        onChange={(e) => setAttributes({ ...attributes, years_operating: e.target.value })}
                        placeholder="e.g., 5"
                        min="0"
                      />

                    </div>

                    <div>

                      <Label>Number of Employees</Label>

                      <Input
                        type="number"
                        value={attributes.employees || ''}
                        onChange={(e) => setAttributes({ ...attributes, employees: e.target.value })}
                        placeholder="e.g., 10"
                        min="0"
                      />

                    </div>

                    <div>

                      <Label>Revenue (Annual)</Label>

                      <Input
                        value={attributes.annual_revenue || ''}
                        onChange={(e) => setAttributes({ ...attributes, annual_revenue: e.target.value })}
                        placeholder="e.g., $50,000"
                      />

                    </div>

                  </div>

                </div>

              )}

            </div>

          </div>



          </div>
          {/* ---- end STEP 2 ---- */}

          {/* ---- STEP 3: pricing, coins, variants, location, contact ---- */}
          <div className={step === 3 ? 'contents' : 'hidden'}>

          {/* Elite Boost.
              Previously rendered INSIDE the Title field's container, between
              the title input and its own character counter — visually and
              semantically wrong. It belongs with pricing, since it is a paid
              upgrade. The cost is read from gamification_settings rather than
              hardcoded "50 Coins", which could disagree with what is actually
              charged, and the balance is checked before submit rather than
              after the listing already exists. */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex gap-3">
                <div className="mt-0.5 p-2 bg-gray-900 rounded-full h-fit">
                  <Zap className="text-white w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 font-comfortaa">Elite Boost</h4>
                  <p className="text-sm text-gray-600 max-w-sm">
                    Put your ad at the top of every relevant search for 7 days.
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-start sm:items-end gap-1.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    id="is-premium"
                    className="w-4 h-4 rounded border-gray-300 accent-black"
                    checked={formData.is_premium}
                    onChange={(e) => setFormData({ ...formData, is_premium: e.target.checked })}
                  />
                  <span className="font-bold text-sm text-gray-900">
                    Boost for {boostCost ?? '—'} coins
                  </span>
                </label>
                {boostCost != null && coinBalance != null && coinBalance < boostCost && (
                  <a href="/store" className="text-xs text-gray-600 font-bold underline hover:no-underline">
                    You have {coinBalance} — get more coins →
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Pricing — category-aware */}

          {(() => {
            const catConfig = getCategoryConfig(selectedCategorySlug);
            const pf = catConfig?.priceField;
            const isRange = pf?.isRange;
            const hasPeriod = pf?.periodOptions && pf.periodOptions.length > 0;
            const sectionTitle = pf?.label === 'Salary Range' ? 'Compensation' : pf?.label === 'Rate' ? 'Pricing / Rate' : 'Pricing';

            return (
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4 font-comfortaa">
                  {sectionTitle}
                </h2>

                {isRange ? (
                  /* --- Range mode (Jobs: salary min / max) --- */
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>{pf?.label ? `${pf.label} (Min)` : 'Min'}</Label>
                        <Input
                          type="number"
                          value={attributes.salary_min || ''}
                          onChange={(e) => setAttributes({ ...attributes, salary_min: e.target.value })}
                          placeholder={pf?.placeholder || 'e.g., 50000'}
                          min="0"
                        />
                      </div>
                      <div>
                        <Label>{pf?.label ? `${pf.label} (Max)` : 'Max'}</Label>
                        <Input
                          type="number"
                          value={attributes.salary_max || ''}
                          onChange={(e) => setAttributes({ ...attributes, salary_max: e.target.value })}
                          placeholder={pf?.placeholderMax || 'e.g., 80000'}
                          min="0"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Currency</Label>
                        <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                            <SelectItem value="GBP">GBP (£)</SelectItem>
                            <SelectItem value="RWF">RWF (FRw)</SelectItem>
                            <SelectItem value="NGN">NGN (₦)</SelectItem>
                            <SelectItem value="KES">KES (KSh)</SelectItem>
                            <SelectItem value="ZAR">ZAR (R)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {hasPeriod && (
                        <div>
                          <Label>Period</Label>
                          <Select value={attributes.salary_period || ''} onValueChange={(value) => setAttributes({ ...attributes, salary_period: value })}>
                            <SelectTrigger><SelectValue placeholder="Select period" /></SelectTrigger>
                            <SelectContent>
                              {pf!.periodOptions!.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">Leave blank if you prefer not to disclose salary.</p>
                  </div>
                ) : hasPeriod ? (
                  /* --- Period mode (Services: rate, Property: price with period) --- */
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="price">
                        {pf?.label || 'Price'}
                        {pf?.required !== false && ' *'}
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder={pf?.placeholder || '0.00'}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <Label>Currency</Label>
                      <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                          <SelectItem value="RWF">RWF (FRw)</SelectItem>
                          <SelectItem value="NGN">NGN (₦)</SelectItem>
                          <SelectItem value="KES">KES (KSh)</SelectItem>
                          <SelectItem value="ZAR">ZAR (R)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Period</Label>
                      <Select value={formData.price_type} onValueChange={(value) => setFormData({ ...formData, price_type: value })}>
                        <SelectTrigger><SelectValue placeholder="Select period" /></SelectTrigger>
                        <SelectContent>
                          {pf!.periodOptions!.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {pf?.required === false && (
                      <p className="text-sm text-gray-500 col-span-full">Leave blank if pricing varies or is negotiable.</p>
                    )}
                  </div>
                ) : (
                  /* --- Standard mode (Motors, Electronics, Fashion, etc.) --- */
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="price">
                        {pf?.label || 'Price'}
                        {pf?.required !== false && ' *'}
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder={pf?.placeholder || '0.00'}
                        min="0"
                        step="0.01"
                        disabled={formData.price_type === 'free' || formData.price_type === 'contact'}
                      />
                      {formData.price_type === 'free' && (
                        <p className="text-sm text-green-600 mt-1">This item is listed for free.</p>
                      )}
                      {formData.price_type === 'contact' && (
                        <p className="text-sm text-gray-500 mt-1">Buyers will contact you for pricing.</p>
                      )}
                    </div>
                    <div>
                      <Label>Currency</Label>
                      <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                          <SelectItem value="RWF">RWF (FRw)</SelectItem>
                          <SelectItem value="NGN">NGN (₦)</SelectItem>
                          <SelectItem value="KES">KES (KSh)</SelectItem>
                          <SelectItem value="ZAR">ZAR (R)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Price Type</Label>
                      <Select value={formData.price_type} onValueChange={(value) => {
                        const updates: any = { ...formData, price_type: value };
                        if (value === 'free') updates.price = '0';
                        if (value === 'contact') updates.price = '0';
                        setFormData(updates);
                      }}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {(pf?.priceTypeOptions || [
                            { value: 'fixed', label: 'Fixed' },
                            { value: 'negotiable', label: 'Negotiable' },
                          ]).map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Accept BARA Coins (27.8.3 — coins-as-barter, merchant opt-in) */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.accepts_coins}
                onChange={(e) => setFormData({ ...formData, accepts_coins: e.target.checked })}
                className="mt-1 h-4 w-4 flex-shrink-0 rounded border-gray-400 accent-black"
              />
              <div>
                <span className="font-bold text-gray-900">Accept BARA Coins</span>
                <p className="text-sm text-gray-500 mt-0.5">
                  Let buyers pay with their BARA Coins instead of cash — you receive the coins.
                  You set the coin amount; coins have no cash value and can't be withdrawn.
                </p>
              </div>
            </label>
            {formData.accepts_coins && (
              <div className="mt-4 max-w-xs">
                <Label htmlFor="coin_price">Price in coins *</Label>
                <Input
                  id="coin_price"
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

          {/* Variants — available for all categories */}
          {(() => {
            const catConfig = getCategoryConfig(selectedCategorySlug);
            const dims = catConfig?.variantDimensions || [
              { key: 'option', label: 'Option', presets: [] },
            ];
            return (
              <VariantBuilder
                dimensions={dims}
                variants={variantRows}
                onVariantsChange={setVariantRows}
                enabled={variantsEnabled}
                onEnabledChange={(on) => {
                  setVariantsEnabled(on);
                  if (!on) setVariantRows([]);
                }}
              />
            );
          })()}




          {/* Location & Countries */}

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">

            <h2 className="text-xl font-bold text-gray-900 mb-4 font-comfortaa">

              Location

            </h2>



            <div className="space-y-4">

              <div>

                <Label htmlFor="location">Location Details</Label>

                <Input

                  id="location"

                  value={formData.location_details}

                  onChange={(e) => setFormData({ ...formData, location_details: e.target.value })}

                  placeholder="e.g., Kigali, Kicukiro District"

                />

              </div>



              <div>

                <Label>Country *</Label>

                <Select
                  value={selectedCountries[0] || ''}
                  onValueChange={(value) => setSelectedCountries([value])}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.id} value={country.id}>
                        <span className="flex items-center gap-2">
                          {country.flag_url && <img loading="lazy" src={country.flag_url} alt={country.name} className="w-5 h-4 inline-block" />}
                          {country.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

              </div>

            </div>

          </div>



          {/* Contact Information */}

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">

            <h2 className="text-xl font-bold text-gray-900 mb-4 font-comfortaa">

              Contact Information

            </h2>



            <div className="space-y-4">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>

                  <Label htmlFor="seller_name">Your Name *</Label>

                  <Input

                    id="seller_name"

                    value={formData.seller_name}

                    onChange={(e) => setFormData({ ...formData, seller_name: e.target.value })}

                    placeholder="John Doe"

                  />

                </div>



                <div>

                  <Label htmlFor="seller_type">Seller Type</Label>

                  <Select

                    value={formData.seller_type}

                    onValueChange={(value) => setFormData({ ...formData, seller_type: value })}

                  >

                    <SelectTrigger>

                      <SelectValue />

                    </SelectTrigger>

                    <SelectContent>

                      <SelectItem value="individual">Individual</SelectItem>

                      <SelectItem value="dealer">Dealer</SelectItem>

                      <SelectItem value="agent">Agent</SelectItem>

                      <SelectItem value="company">Company</SelectItem>

                    </SelectContent>

                  </Select>

                </div>

              </div>



              <div>

                <Label htmlFor="seller_whatsapp" className="flex items-center gap-2">

                  <FaWhatsapp className="w-4 h-4 text-green-600" />

                  WhatsApp Number (Recommended)

                </Label>

                <Input

                  id="seller_whatsapp"

                  value={formData.seller_whatsapp}

                  onChange={(e) => setFormData({ ...formData, seller_whatsapp: e.target.value })}

                  placeholder="+250 XXX XXX XXX"

                />

                <p className="text-sm text-gray-500 mt-1">

                  Include country code (e.g., +250)

                </p>

              </div>



              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>

                  <Label htmlFor="seller_phone">Phone Number</Label>

                  <Input

                    id="seller_phone"

                    value={formData.seller_phone}

                    onChange={(e) => setFormData({ ...formData, seller_phone: e.target.value })}

                    placeholder="+250 XXX XXX XXX"

                  />

                </div>



                <div>

                  <Label htmlFor="seller_email">Email</Label>

                  <Input

                    id="seller_email"

                    type="email"

                    value={formData.seller_email}

                    onChange={(e) => setFormData({ ...formData, seller_email: e.target.value })}

                    placeholder="your@email.com"

                  />

                </div>

              </div>



              <div>

                <Label htmlFor="seller_website">Website (Optional)</Label>

                <Input

                  id="seller_website"

                  value={formData.seller_website}

                  onChange={(e) => setFormData({ ...formData, seller_website: e.target.value })}

                  placeholder="https://yourwebsite.com"

                />

              </div>

            </div>

          </div>



          </div>
          {/* ---- end STEP 3 ---- */}

          {/* ---- STEP 4: review and publish ---- */}
          <div className={step === 4 ? 'contents' : 'hidden'}>

          {/* Review summary — publishing shouldn't be blind after four steps.
              Anything still missing is listed with a link back to fix it. */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 font-comfortaa mb-4">
              Ready to publish
            </h3>

            <div className="flex gap-4 mb-5">
              {imagePreviews[0] ? (
                <img
                  src={imagePreviews[0]}
                  alt=""
                  className="w-24 h-24 rounded-lg object-cover border border-gray-200 shrink-0"
                />
              ) : (
                <div className="w-24 h-24 rounded-lg bg-gray-100 border border-gray-200 shrink-0" />
              )}
              <div className="min-w-0">
                <p className="font-bold text-gray-900 truncate">
                  {formData.title || 'Untitled ad'}
                </p>
                <p className="text-sm text-gray-600">
                  {formData.price
                    ? `${formData.currency || ''} ${Number(formData.price).toLocaleString()}`.trim()
                    : 'No price set'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {imagePreviews.length} photo{imagePreviews.length === 1 ? '' : 's'}
                  {formData.location_details ? ` · ${formData.location_details}` : ''}
                </p>
              </div>
            </div>

            {completeness.missing.length > 0 ? (
              <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <p className="text-sm text-gray-800">
                  <span className="font-bold">Optional, but they help:</span>{' '}
                  {completeness.missing.join(', ')}.
                </p>
                <button
                  type="button"
                  onClick={() => goToStep(1)}
                  className="mt-1 text-sm font-bold text-gray-900 underline hover:no-underline"
                >
                  Go back and add them
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-700">
                Everything's filled in. Publish whenever you're ready.
              </p>
            )}
          </div>

          {/* Important Notice */}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">

            <div className="flex gap-3">

              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />

              <div className="text-sm text-blue-900">

                <p className="font-semibold mb-1">Important Notice</p>

                <ul className="space-y-1">

                  <li>• Your ad will go live immediately after posting</li>

                  <li>• Make sure all information is accurate and truthful</li>

                  <li>• Upload clear, high-quality images for better engagement</li>

                  <li>• Provide at least one contact method so buyers can reach you</li>

                  <li>• Ads that violate our guidelines may be removed</li>

                </ul>

              </div>

            </div>

          </div>



          {/* Submit Button */}

          <div className="flex gap-4">

            <Button

              type="button"

              variant="outline"

              onClick={() => navigate('/marketplace')}

              className="flex-1"

              disabled={submitting}

            >

              Cancel

            </Button>

            <Button

              type="submit"

              className="flex-1 bg-gray-900 hover:bg-black"

              disabled={submitting}

            >

              {submitting ? (

                <>

                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />

                  Publishing…

                </>

              ) : (

                <>

                  <CheckCircle className="w-4 h-4 mr-2" />

                  Publish ad

                </>

              )}

            </Button>

          </div>

          </div>
          {/* ---- end STEP 4 ---- */}

          {/* Step navigation. Only the last step submits; the rest advance,
              so a stray Enter keypress can't publish a half-finished ad. */}
          {step < 4 && (
            <div className="flex gap-3">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => goToStep(step - 1)}
                  className="flex-1 sm:flex-none sm:px-8"
                >
                  Back
                </Button>
              )}
              <Button
                type="button"
                onClick={() => goToStep(step + 1)}
                className="flex-1 bg-gray-900 hover:bg-black font-bold"
              >
                Continue
              </Button>
            </div>
          )}

          {step === 4 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => goToStep(3)}
              className="w-full sm:w-auto sm:px-8"
              disabled={submitting}
            >
              Back
            </Button>
          )}

        </form>

      </main>



      <BottomBannerAd />

      <Footer />

    </div>

  );

};



export default PostListing;

