interface WikipediaCountryInfo {
  name: string;
  description: string;
  flag_url: string;
  coat_of_arms_url?: string;
  capital: string;
  currency: string;
  population: string;
  code: string;
  language: string;
  area?: string;
  gdp?: string;
  timezone?: string;
  // Enhanced fields from updates.md
  president_name?: string;
  gdp_usd?: number;
  average_age?: number;
  largest_city?: string;
  largest_city_population?: number;
  capital_population?: number;
  ethnic_groups?: Array<{
    name: string;
    percentage: number;
    note?: string;
  }>;
  formation_date?: string;
  hdi_score?: number;
  calling_code?: string;
  latitude?: number;
  longitude?: number;
  area_sq_km?: number;
}

// Enhanced GDP parsing function
const parseGDP = (gdpStr: string): number | null => {
  if (!gdpStr) return null;
  
  // Extract number and unit
  const match = gdpStr.match(/(\d+(?:\.\d+)?)\s*(billion|million|trillion)/i);
  if (match) {
    const num = parseFloat(match[1]);
    const unit = match[2].toLowerCase();
    
    if (unit === 'trillion') {
      return num * 1000000000000;
    } else if (unit === 'billion') {
      return num * 1000000000;
    } else if (unit === 'million') {
      return num * 1000000;
    }
  }
  
  // Try to extract just numbers
  const cleanStr = gdpStr.replace(/[^\d.]/g, '');
  const num = parseFloat(cleanStr);
  if (isNaN(num)) return null;
  
  // Handle billions and millions based on context
  if (gdpStr.toLowerCase().includes('billion')) {
    return num * 1000000000;
  } else if (gdpStr.toLowerCase().includes('million')) {
    return num * 1000000;
  } else if (gdpStr.toLowerCase().includes('trillion')) {
    return num * 1000000000000;
  }
  
  // If it's a very large number, assume it's already in the right units
  if (num > 1000) {
    return num;
  }
  
  return null;
};

export const fetchWikipediaCountryInfo = async (countryName: string): Promise<WikipediaCountryInfo | null> => {
  try {
    // Try multiple search terms to find the best Wikipedia page
    const searchTerms = [
      countryName,
      `${countryName} country`,
      `${countryName} government`,
      `${countryName} president`,
      `${countryName} prime minister`
    ];

    let pageId = null;
    let pageTitle = null;

    for (const searchTerm of searchTerms) {
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchTerm)}&format=json&origin=*`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

      if (searchData.query?.search?.[0]) {
        pageId = searchData.query.search[0].pageid;
        pageTitle = searchData.query.search[0].title;
        break;
      }
    }

    if (!pageId) {
      console.warn(`No Wikipedia page found for ${countryName}`);
      return null;
    }

    // Get page content and images (removed exintro=true to get full article)
    const contentUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages|pageprops&explaintext=true&piprop=original&pageids=${pageId}&format=json&origin=*`;
    const contentResponse = await fetch(contentUrl);
    const contentData = await contentResponse.json();

    // Also try to get infobox data for more structured information
    const infoboxUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content&pageids=${pageId}&format=json&origin=*`;
    const infoboxResponse = await fetch(infoboxUrl);
    const infoboxData = await infoboxResponse.json();

    const page = contentData.query?.pages?.[pageId];
    if (!page) {
      console.warn(`No page content found for ${countryName}`);
      return null;
    }

    // Extract basic information
    const description = page.extract || '';
    
    // Get flag and coat of arms images
    const flagUrl = page.original?.source || '';
    
    // Try to get coat of arms from page images
    const imagesUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=images&titles=${encodeURIComponent(pageTitle)}&format=json&origin=*`;
    const imagesResponse = await fetch(imagesUrl);
    const imagesData = await imagesResponse.json();
    
    let coatOfArmsUrl = '';
    const imageTitles = imagesData.query?.pages?.[pageId]?.images || [];
    
    for (const image of imageTitles) {
      if (image.title.toLowerCase().includes('coat of arms') || 
          image.title.toLowerCase().includes('national emblem') ||
          image.title.toLowerCase().includes('state emblem')) {
        const imageInfoUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url&titles=${encodeURIComponent(image.title)}&format=json&origin=*`;
        const imageInfoResponse = await fetch(imageInfoUrl);
        const imageInfoData = await imageInfoResponse.json();
        const imageInfo = Object.values(imageInfoData.query?.pages || {})[0] as any;
        if (imageInfo?.imageinfo?.[0]?.url) {
          coatOfArmsUrl = imageInfo.imageinfo[0].url;
          break;
        }
      }
    }

         // Enhanced extraction function for detailed country information
     const extractInfo = (text: string) => {
       // Basic information patterns
       const capitalMatch = text.match(/capital[:\s]+([^,\.\n]+)/i);
       const currencyMatch = text.match(/currency[:\s]+([^,\.\n]+)/i);
       
       // Population patterns
       const populationMatch = text.match(/population[:\s]+([^,\.\n]+(?:million|billion|thousand)?)/i) || 
                              text.match(/(\d+(?:,\d{3})*(?:\s*million|\s*billion|\s*thousand)?)\s*(?:people|inhabitants|residents)/i);
       
       // Enhanced Language patterns
       const languageMatch = text.match(/language[:\s]+([^,\.\n]+)/i) || 
                           text.match(/official\s+language[:\s]+([^,\.\n]+)/i) ||
                           text.match(/languages[:\s]+([^,\.\n]+)/i) ||
                           text.match(/speaks?\s+([^,\.\n]+)/i) ||
                           text.match(/(?:primary|main)\s+language[:\s]+([^,\.\n]+)/i) ||
                           text.match(/(?:national|official)\s+languages?[:\s]+([^,\.\n]+)/i) ||
                           text.match(/linguistic[:\s]+([^,\.\n]+)/i);
       
       // Area patterns
       const areaMatch = text.match(/area[:\s]+([^,\.\n]+(?:square|sq|km|kilometers?|miles?)?)/i) || 
                        text.match(/(\d+(?:,\d{3})*(?:\s*square\s*kilometers?|\s*sq\s*km|\s*km²))/i);
       
       // Enhanced GDP patterns
       const gdpMatch = text.match(/gdp[:\s]+([^,\.\n]+)/i) ||
                       text.match(/gross domestic product[:\s]+([^,\.\n]+)/i) ||
                       text.match(/economy[:\s]+([^,\.\n]*(?:billion|million|trillion)[^,\.\n]*)/i) ||
                       text.match(/(\d+(?:\.\d+)?\s*(?:billion|million|trillion))\s*(?:usd|dollars?)/i);
       const timezoneMatch = text.match(/timezone[:\s]+([^,\.\n]+)/i);

       // Enhanced President/Head of State patterns with better validation
       const presidentPatterns = [
         /(?:president|head of state|prime minister|leader)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
         /(?:current|incumbent)\s+(?:president|head of state|prime minister)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
         /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:is|serves as)\s+(?:president|head of state|prime minister)/i,
         /(?:president|head of state|prime minister)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
         /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:president|head of state|prime minister)/i,
         /(?:president|head of state|prime minister)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:since|from)/i,
         /(?:since|from)\s+(\d{4})[^.]*?(?:president|head of state|prime minister)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
         // Additional patterns for African countries
         /(?:president|head of state|prime minister)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:of|in)/i,
         /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:president|head of state|prime minister)\s+(?:of|in)/i,
         /(?:president|head of state|prime minister)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:since|from)\s+\d{4}/i
       ];

       let presidentMatch = null;
       for (const pattern of presidentPatterns) {
         const match = text.match(pattern);
         if (match && match[1] && match[1].length > 3) {
           presidentMatch = match;
           break;
         }
       }

       // Formation/Independence date patterns
       const formationMatch = text.match(/(?:independence|formed|established|founded)[:\s]+([^,\.\n]+(?:19|20)\d{2})/i) ||
                             text.match(/(?:gained independence|became independent)[:\s]+([^,\.\n]+(?:19|20)\d{2})/i);

       // Calling code patterns
       const callingCodeMatch = text.match(/(?:calling code|phone code|dialing code)[:\s]+([+\d]+)/i) ||
                               text.match(/\+(\d{1,4})/);

       // Largest city patterns
       const largestCityMatch = text.match(/(?:largest city|biggest city)[:\s]+([^,\.\n]+)/i) ||
                               text.match(/(?:major cities include|main cities)[:\s]+([^,\.\n]+)/i);

       // HDI patterns
       const hdiMatch = text.match(/hdi[:\s]+([0-9.]+)/i) ||
                       text.match(/human development index[:\s]+([0-9.]+)/i);

       // Ethnic groups patterns (simplified)
       const ethnicGroupsMatch = text.match(/(?:ethnic groups|ethnicity)[:\s]+([^,\.\n]+)/i);

       // Helper function to parse population numbers
       const parsePopulation = (popStr: string): number | null => {
         if (!popStr) return null;
         const cleanStr = popStr.replace(/[^\d]/g, '');
         const num = parseInt(cleanStr);
         if (isNaN(num)) return null;
         
         // Handle millions and billions
         if (popStr.toLowerCase().includes('million')) {
           return num * 1000000;
         } else if (popStr.toLowerCase().includes('billion')) {
           return num * 1000000000;
         } else if (popStr.toLowerCase().includes('thousand')) {
           return num * 1000;
         }
         return num;
       };

       // Helper function to parse area
       const parseArea = (areaStr: string): number | null => {
         if (!areaStr) return null;
         const cleanStr = areaStr.replace(/[^\d]/g, '');
         const num = parseInt(cleanStr);
         if (isNaN(num)) return null;
         
         // Convert to square kilometers if needed
         if (areaStr.toLowerCase().includes('mile')) {
           return Math.round(num * 2.59); // Convert square miles to square km
         }
         return num;
       };


       // Helper function to parse HDI score
       const parseHDI = (hdiStr: string): number | null => {
         if (!hdiStr) return null;
         const num = parseFloat(hdiStr);
         return isNaN(num) ? null : num;
       };

       // Helper function to extract ethnic groups
       const extractEthnicGroups = (ethnicStr: string): Array<{name: string; percentage: number; note?: string}> => {
         if (!ethnicStr) return [];
         
         const groups: Array<{name: string; percentage: number; note?: string}> = [];
         
         // Simple pattern to extract ethnic groups with percentages
         const groupMatches = ethnicStr.match(/([A-Za-z\s]+?)\s*(\d+(?:\.\d+)?)%/g);
         if (groupMatches) {
           groupMatches.forEach(match => {
             const parts = match.match(/([A-Za-z\s]+?)\s*(\d+(?:\.\d+)?)%/);
             if (parts) {
               groups.push({
                 name: parts[1].trim(),
                 percentage: parseFloat(parts[2])
               });
             }
           });
         }
         
         return groups;
       };

       // Helper function to clean extracted text
       const cleanText = (text: string): string => {
         if (!text) return '';
         return text
           .replace(/[^\w\s\-.,()]/g, '') // Remove special characters except basic punctuation
           .replace(/\s+/g, ' ') // Replace multiple spaces with single space
           .trim();
       };

       // Helper function to validate president name
       const validatePresidentName = (name: string): string => {
         if (!name) return '';
         const cleaned = cleanText(name);
         // Check if it looks like a real name (at least 2 words, starts with capital letters)
         const words = cleaned.split(' ');
         if (words.length >= 2 && words.every(word => /^[A-Z][a-z]+$/.test(word))) {
           return cleaned;
         }
         return '';
       };

       // Helper function to validate language
       const validateLanguage = (lang: string): string => {
         if (!lang) return '';
         const cleaned = cleanText(lang);
         // Remove common prefixes and clean up
         return cleaned
           .replace(/^(with|and|or|including)\s+/i, '')
           .replace(/\s+(and|or|including).*$/i, '')
           .trim();
       };

       return {
         capital: cleanText(capitalMatch?.[1] || ''),
         currency: cleanText(currencyMatch?.[1] || ''),
         population: cleanText(populationMatch?.[1] || ''),
         language: validateLanguage(languageMatch?.[1] || ''),
         area: cleanText(areaMatch?.[1] || ''),
         gdp: cleanText(gdpMatch?.[1] || ''),
         timezone: cleanText(timezoneMatch?.[1] || ''),
         // Enhanced fields
         president_name: validatePresidentName(presidentMatch?.[1] || ''),
         formation_date: cleanText(formationMatch?.[1] || ''),
         calling_code: cleanText(callingCodeMatch?.[1] || ''),
         largest_city: cleanText(largestCityMatch?.[1] || ''),
         hdi_score: parseHDI(hdiMatch?.[1] || ''),
         ethnic_groups: extractEthnicGroups(ethnicGroupsMatch?.[1] || ''),
         // Parsed numeric values
         population_numeric: parsePopulation(populationMatch?.[1] || ''),
         area_sq_km: parseArea(areaMatch?.[1] || ''),
         gdp_usd: parseGDP(gdpMatch?.[1] || '')
       };
     };

    const extractedInfo = extractInfo(description);

    // Debug logging
    console.log(`📊 Extracted info for ${countryName}:`, {
      president: extractedInfo.president_name,
      gdp: extractedInfo.gdp,
      gdp_usd: extractedInfo.gdp_usd,
      language: extractedInfo.language,
      largest_city: extractedInfo.largest_city
    });

    // Try to extract additional data from infobox if main extraction failed
    // Utility: clean wiki markup → plain text
    const cleanWikiText = (text: string): string => {
      if (!text) return '';
      return text
        .replace(/\{\{[^}]*\}\}/g, ' ') // remove templates
        .replace(/<br\s*\/?\s*>/gi, ', ') // <br> to comma
        .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2') // [[target|label]] → label
        .replace(/\[\[([^\]]+)\]\]/g, '$1') // [[target]] → target
        .replace(/<[^>]+>/g, ' ') // remove HTML
        .replace(/\s+/g, ' ') // collapse spaces
        .trim();
    };

    const normalizeLanguages = (raw: string): string => {
      if (!raw) return '';
      const cleaned = cleanWikiText(raw)
        .replace(/languages?:/i, '')
        .trim();
      // Split on commas, slashes, semicolons
      const parts = cleaned
        .split(/[,;/]|\band\b|\bor\b/gi)
        .map(s => s.trim())
        .filter(Boolean)
        .map(s => s
          .replace(/ language$/i, '')
          .replace(/^official\s*/i, '')
          .replace(/^national\s*/i, '')
          .replace(/^co[- ]?official\s*/i, '')
        );
      // Deduplicate and capitalize nicely
      const unique = Array.from(new Set(parts.map(p => p.replace(/\s+/g, ' ').trim())));
      return unique.join(', ');
    };

    const extractFromInfobox = (infoboxText: string) => {
      if (!infoboxText) return {};
      
      const infoboxData: any = {};
      
      // Extract president/head of state from infobox
      const presidentMatch = infoboxText.match(/\|\s*(?:president|head_of_state|prime_minister|leader)\s*=\s*([^|\n]+)/i);
      if (presidentMatch && !extractedInfo.president_name) {
        infoboxData.president_name = presidentMatch[1].trim().replace(/\[\[|\]\]/g, '');
      }
      
      // Extract GDP from infobox
      const gdpMatch = infoboxText.match(/\|\s*(?:gdp|gdp_nominal|gdp_ppp)\s*=\s*([^|\n]+)/i);
      if (gdpMatch && !extractedInfo.gdp_usd) {
        infoboxData.gdp_text = gdpMatch[1].trim();
      }
      
      // Extract languages from infobox with robust parsing
      const langMatch = infoboxText.match(/\|\s*(?:languages|official_languages|national_languages|working_languages)\s*=\s*([^\n]+)/i);
      if (langMatch) {
        infoboxData.language = normalizeLanguages(langMatch[1]);
      }
      
      return infoboxData;
    };

    // Extract infobox data if available
    const infoboxText = infoboxData.query?.pages?.[pageId]?.revisions?.[0]?.['*'] || '';
    const infoboxExtractedData = extractFromInfobox(infoboxText);

         // Clean and format description to create a comprehensive overview
     const cleanDescription = description
       .replace(/\n+/g, ' ') // Replace newlines with spaces
       .replace(/\s+/g, ' ') // Replace multiple spaces with single space
       .trim();
     
     // Split into sentences and take first 8-10 sentences for a longer description
     const sentences = cleanDescription.split('.').filter(sentence => sentence.trim().length > 20);
     
     // Take first 8 sentences or until we reach 800 characters, whichever comes first
     let finalDescription = '';
     let characterCount = 0;
     const maxCharacters = 800;
     
     for (let i = 0; i < Math.min(8, sentences.length); i++) {
       const sentence = sentences[i].trim() + '.';
       if (characterCount + sentence.length <= maxCharacters) {
         finalDescription += (finalDescription ? ' ' : '') + sentence;
         characterCount += sentence.length;
       } else {
         break;
       }
     }
     
     // If we still have room and more sentences, add a bit more
     if (characterCount < maxCharacters - 50 && sentences.length > 8) {
       const remainingSpace = maxCharacters - characterCount - 10; // Leave room for "..."
       const nextSentence = sentences[8].trim();
       if (nextSentence.length <= remainingSpace) {
         finalDescription += ' ' + nextSentence + '.';
       } else {
         finalDescription += ' ' + nextSentence.substring(0, remainingSpace - 3) + '...';
       }
     } else if (finalDescription.length < 200) {
       // If description is too short, add more context
       finalDescription += ' This country is known for its rich cultural heritage, diverse population, and significant contributions to regional and global affairs.';
     }

    return {
       name: countryName,
       description: finalDescription + ' 🌍✨',
       flag_url: flagUrl,
       coat_of_arms_url: coatOfArmsUrl,
       capital: extractedInfo.capital,
       currency: extractedInfo.currency,
       population: extractedInfo.population,
       code: '', // Will be filled from database
      language: normalizeLanguages(extractedInfo.language || infoboxExtractedData.language || ''),
       area: extractedInfo.area,
       gdp: extractedInfo.gdp,
       timezone: extractedInfo.timezone,
       // Enhanced fields from updates.md with infobox fallback
       president_name: extractedInfo.president_name || infoboxExtractedData.president_name || '',
       gdp_usd: extractedInfo.gdp_usd || (infoboxExtractedData.gdp_text ? parseGDP(infoboxExtractedData.gdp_text) : null),
       average_age: null, // Not easily extractable from Wikipedia
       largest_city: extractedInfo.largest_city,
       largest_city_population: null, // Not easily extractable from Wikipedia
       capital_population: null, // Not easily extractable from Wikipedia
       ethnic_groups: extractedInfo.ethnic_groups,
       formation_date: extractedInfo.formation_date,
       hdi_score: extractedInfo.hdi_score,
       calling_code: extractedInfo.calling_code,
       latitude: null, // Not easily extractable from Wikipedia
       longitude: null, // Not easily extractable from Wikipedia
       area_sq_km: extractedInfo.area_sq_km
     };

  } catch (error) {
    console.error('Error fetching Wikipedia data:', error);
    return null;
  }
};

export const getCountryFlagFromWikipedia = async (countryName: string): Promise<string | null> => {
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(countryName + ' flag')}&format=json&origin=*`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchData.query?.search?.[0]) {
      return null;
    }

    const pageId = searchData.query.search[0].pageid;
    const contentUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&piprop=original&pageids=${pageId}&format=json&origin=*`;
    const contentResponse = await fetch(contentUrl);
    const contentData = await contentResponse.json();

    const page = contentData.query?.pages?.[pageId];
    return page?.original?.source || null;

  } catch (error) {
    console.error('Error fetching flag from Wikipedia:', error);
    return null;
  }
};
