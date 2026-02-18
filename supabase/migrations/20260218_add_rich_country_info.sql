-- Add rich content columns to country_info table
ALTER TABLE country_info ADD COLUMN IF NOT EXISTS geography TEXT;
ALTER TABLE country_info ADD COLUMN IF NOT EXISTS history TEXT;
ALTER TABLE country_info ADD COLUMN IF NOT EXISTS culture TEXT;

-- Update existing Rwanda data as a high-quality example
UPDATE country_info 
SET 
  geography = 'Rwanda is located in East-Central Africa, south of the Equator. Known as the "Land of a Thousand Hills", its landscape is dominated by mountains in the west and savanna to the east, with numerous lakes throughout the country. The Virunga mountains in the northwest include Mount Karisimbi, the countrys highest peak.',
  history = 'Rwandas history is marked by a rich pre-colonial kingdom followed by German and Belgian colonial rule. Since the 1994 genocide against the Tutsi, Rwanda has undergone a remarkable period of reconstruction and reconciliation, becoming one of Africas fastest-growing economies and a leader in digital transformation.',
  culture = 'Rwandan culture is centered around community, respect, and traditional arts. The Intore dance is a world-renowned traditional performance. The culture is also defined by the concept of "Umuganda" (community work) and a strong emphasis on preservation of natural heritage.'
WHERE country_id IN (SELECT id FROM countries WHERE code = 'RW');

-- Update local Nigeria data
UPDATE country_info 
SET 
  geography = 'Nigeria is located on the western coast of Africa. It has a varied landscape featuring tropical rainforests in the south, central plateaus, and the semi-arid Sahel in the north. The Niger River and Benue River are the primary geographical features.',
  history = 'Home to several ancient kingdoms like the Oyo and Benin Empires, Nigeria became a British protectorate in the late 19th century. Since independence in 1960, it has become Africas most populous nation and a major economic powerhouse.',
  culture = 'Known as the "Giant of Africa", Nigeria is incredibly diverse with over 250 ethnic groups. Its culture is globally influential through Afrobeats music, Nollywood cinema, and rich culinary traditions like Jollof rice.'
WHERE country_id IN (SELECT id FROM countries WHERE code = 'NG');
