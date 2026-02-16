-- Fix Country Codes for Diaspora Communities
-- The frontend is using standard country codes (e.g. BE for Belgium) for diaspora communities (Black/African Europeans),
-- but the RSS system uses custom codes (EU-BA). This script aligns them.

-- 1. Fix Black/African Europeans (was using 'BE', should be 'EU-BA')
UPDATE countries 
SET code = 'EU-BA' 
WHERE name = 'Black/African Europeans' AND code = 'BE';

-- 2. Fix Black/African British (was using 'GB', should be 'GB-BA')
-- Only update if it's strictly the community entry, not the actual country
UPDATE countries 
SET code = 'GB-BA' 
WHERE name = 'Black/African British' AND code = 'GB';

-- 3. Fix Black/African Americans (should be 'US-BA')
UPDATE countries 
SET code = 'US-BA' 
WHERE name = 'Black/African Americans' AND code = 'US';

-- 4. Fix Black/African Brazilians (should be 'BR-BA')
UPDATE countries 
SET code = 'BR-BA' 
WHERE name = 'Black/African Brazilians' AND code = 'BR';
