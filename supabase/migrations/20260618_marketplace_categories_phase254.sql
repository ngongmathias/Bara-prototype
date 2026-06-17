-- ============================================================
-- Phase 25.4 — Marketplace "4 Main Categories" restructure (option B)
-- ============================================================
-- Option B: the four finer-grained electronics categories replace the old
-- "Electronics & Appliances" + "Mobile & Tablets" buckets; everything else
-- stays. End state ~14 main categories.
--
-- This migration is ADDITIVE and idempotent:
--   * renames the existing 'electronics' and 'mobile-tablets' categories,
--   * inserts the two new categories ('appliances', 'climate-control') if
--     missing,
--   * inserts the new subcategories without deleting any existing rows, so
--     live marketplace_listings (which reference category_id / subcategory)
--     are never orphaned.
--
-- Remap of existing listings into the new sub-taxonomy (25.4.6) is a separate,
-- reviewed data step — intentionally NOT done here.
-- ============================================================

-- 1. Rename / refine the two existing electronics buckets
UPDATE public.marketplace_categories
SET name = 'Electronics', description = 'TVs, audio, computers, cameras, gaming and more'
WHERE slug = 'electronics';

UPDATE public.marketplace_categories
SET name = 'Mobile Phones & Tablets', description = 'Phones, tablets, e-readers, wearables and accessories'
WHERE slug = 'mobile-tablets';

-- 2. Add the two new top-level categories (if not already present)
INSERT INTO public.marketplace_categories (name, slug, icon, description, display_order, is_active)
SELECT 'Appliances', 'appliances', 'refrigerator', 'Kitchen, laundry and cleaning appliances', 8, true
WHERE NOT EXISTS (SELECT 1 FROM public.marketplace_categories WHERE slug = 'appliances');

INSERT INTO public.marketplace_categories (name, slug, icon, description, display_order, is_active)
SELECT 'Climate Control', 'climate-control', 'air-vent', 'Air conditioners, fans, heaters and purifiers', 9, true
WHERE NOT EXISTS (SELECT 1 FROM public.marketplace_categories WHERE slug = 'climate-control');

-- 3. Insert subcategories for the four categories (idempotent per category+slug)
DO $$
DECLARE
    rec   record;
    cat_id uuid;
    ord   int;
    sub_slug text;
BEGIN
    FOR rec IN
        SELECT * FROM (VALUES
            ('mobile-tablets', ARRAY['Mobile Phones','Tablets & E-Readers','Accessories','Wearable Tech']),
            ('electronics',    ARRAY['TVs','Home Audio','Portable Audio','Video','Computers, Laptops & Notebooks','Computer Accessories & Components','Gaming & Accessories','Cameras','Camera Accessories','Smart Home','Vehicle Electronics','Specialized Electronics']),
            ('appliances',     ARRAY['Refrigerators & Freezers','Ovens & Ranges','Dishwashers','Microwaves','Range Hoods & Ventilation','Food Prep','Cooking & Heating','Coffee & Espresso','Cleaning Appliances','Washing Machines & Dryers']),
            ('climate-control',ARRAY['Air Conditioners','Fans','Heaters','Air Purifiers & Dehumidifiers'])
        ) AS t(cat_slug, subs)
    LOOP
        SELECT id INTO cat_id FROM public.marketplace_categories WHERE slug = rec.cat_slug;
        IF cat_id IS NULL THEN
            CONTINUE;
        END IF;

        ord := 0;
        FOR i IN 1 .. array_length(rec.subs, 1) LOOP
            ord := ord + 1;
            sub_slug := lower(regexp_replace(regexp_replace(rec.subs[i], '[^a-zA-Z0-9]+', '-', 'g'), '(^-|-$)', '', 'g'));

            INSERT INTO public.marketplace_subcategories (category_id, name, slug, display_order)
            SELECT cat_id, rec.subs[i], sub_slug, ord
            WHERE NOT EXISTS (
                SELECT 1 FROM public.marketplace_subcategories s
                WHERE s.category_id = cat_id AND s.slug = sub_slug
            );
        END LOOP;
    END LOOP;
END $$;
