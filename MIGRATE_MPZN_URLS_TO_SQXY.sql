begin;

update country_info
set coat_of_arms_url = replace(coat_of_arms_url, 'https://mpznrdvodqiwgwnkwgsb.supabase.co', 'https://sqxybqvrctegnejbkpwg.supabase.co')
where coat_of_arms_url like '%mpznrdvodqiwgwnkwgsb.supabase.co%';

update country_info
set ad_image_url = replace(ad_image_url, 'https://mpznrdvodqiwgwnkwgsb.supabase.co', 'https://sqxybqvrctegnejbkpwg.supabase.co')
where ad_image_url like '%mpznrdvodqiwgwnkwgsb.supabase.co%';

update country_info
set flag_url = replace(flag_url, 'https://mpznrdvodqiwgwnkwgsb.supabase.co', 'https://sqxybqvrctegnejbkpwg.supabase.co')
where flag_url like '%mpznrdvodqiwgwnkwgsb.supabase.co%';

update country_info
set leader_image_url = replace(leader_image_url, 'https://mpznrdvodqiwgwnkwgsb.supabase.co', 'https://sqxybqvrctegnejbkpwg.supabase.co')
where leader_image_url like '%mpznrdvodqiwgwnkwgsb.supabase.co%';

update country_info
set monument_image_url = replace(monument_image_url, 'https://mpznrdvodqiwgwnkwgsb.supabase.co', 'https://sqxybqvrctegnejbkpwg.supabase.co')
where monument_image_url like '%mpznrdvodqiwgwnkwgsb.supabase.co%';

update events
set event_image_url = replace(event_image_url, 'https://mpznrdvodqiwgwnkwgsb.supabase.co', 'https://sqxybqvrctegnejbkpwg.supabase.co')
where event_image_url like '%mpznrdvodqiwgwnkwgsb.supabase.co%';

update sponsored_banners
set banner_image_url = replace(banner_image_url, 'https://mpznrdvodqiwgwnkwgsb.supabase.co', 'https://sqxybqvrctegnejbkpwg.supabase.co')
where banner_image_url like '%mpznrdvodqiwgwnkwgsb.supabase.co%';

update popup_ads
set image_url = replace(image_url, 'https://mpznrdvodqiwgwnkwgsb.supabase.co', 'https://sqxybqvrctegnejbkpwg.supabase.co')
where image_url like '%mpznrdvodqiwgwnkwgsb.supabase.co%';

update event_slideshow_images
set image_url = replace(image_url, 'https://mpznrdvodqiwgwnkwgsb.supabase.co', 'https://sqxybqvrctegnejbkpwg.supabase.co')
where image_url like '%mpznrdvodqiwgwnkwgsb.supabase.co%';

update slideshow_images
set image_url = replace(image_url, 'https://mpznrdvodqiwgwnkwgsb.supabase.co', 'https://sqxybqvrctegnejbkpwg.supabase.co')
where image_url like '%mpznrdvodqiwgwnkwgsb.supabase.co%';

update user_slideshow_submissions
set media_url = replace(media_url, 'https://mpznrdvodqiwgwnkwgsb.supabase.co', 'https://sqxybqvrctegnejbkpwg.supabase.co')
where media_url like '%mpznrdvodqiwgwnkwgsb.supabase.co%';

commit;

select 'events.event_image_url' as location, count(*) as hits
from events
where event_image_url like '%mpznrdvodqiwgwnkwgsb.supabase.co%'
union all
select 'event_details.event_image_url (view check)' as location, count(*) as hits
from event_details
where event_image_url like '%mpznrdvodqiwgwnkwgsb.supabase.co%'
union all
select 'country_info.coat_of_arms_url' as location, count(*) as hits
from country_info
where coat_of_arms_url like '%mpznrdvodqiwgwnkwgsb.supabase.co%'
union all
select 'country_info.ad_image_url' as location, count(*) as hits
from country_info
where ad_image_url like '%mpznrdvodqiwgwnkwgsb.supabase.co%'
union all
select 'country_info.flag_url' as location, count(*) as hits
from country_info
where flag_url like '%mpznrdvodqiwgwnkwgsb.supabase.co%'
union all
select 'country_info.leader_image_url' as location, count(*) as hits
from country_info
where leader_image_url like '%mpznrdvodqiwgwnkwgsb.supabase.co%'
union all
select 'country_info.monument_image_url' as location, count(*) as hits
from country_info
where monument_image_url like '%mpznrdvodqiwgwnkwgsb.supabase.co%'
union all
select 'sponsored_banners.banner_image_url' as location, count(*) as hits
from sponsored_banners
where banner_image_url like '%mpznrdvodqiwgwnkwgsb.supabase.co%'
union all
select 'popup_ads.image_url' as location, count(*) as hits
from popup_ads
where image_url like '%mpznrdvodqiwgwnkwgsb.supabase.co%'
union all
select 'event_slideshow_images.image_url' as location, count(*) as hits
from event_slideshow_images
where image_url like '%mpznrdvodqiwgwnkwgsb.supabase.co%'
union all
select 'slideshow_images.image_url' as location, count(*) as hits
from slideshow_images
where image_url like '%mpznrdvodqiwgwnkwgsb.supabase.co%'
union all
select 'user_slideshow_submissions.media_url' as location, count(*) as hits
from user_slideshow_submissions
where media_url like '%mpznrdvodqiwgwnkwgsb.supabase.co%'
order by hits desc, location;

select bucket_id, count(*) as files
from storage.objects
group by bucket_id
order by files desc;
