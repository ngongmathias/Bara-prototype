import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import DemographicProfile from '../components/demographics/DemographicProfile';
import BrazilDemographicProfile from '../components/demographics/BrazilDemographicProfile';
import HBCUProfile from '../components/demographics/HBCUProfile';
import DOMPurify from 'dompurify';

type CountryData = {
  id: string;
  title: string;
  description: string;
  flag: string;
  content: string;
};

export const countryData: Record<string, CountryData> = {
  'black-americans': {
    id: 'black-americans',
    title: 'African/Black Americans',
    description: 'Exploring the African roots and cultural heritage of African/Black Americans',
    flag: '🇺🇸',
    content: `
      <h2 className="text-2xl font-bold mb-4">The African Roots of African/Black Americans</h2>
      <p className="mb-4">
        The story of Black Americans is deeply intertwined with the African continent, where their ancestors were forcibly taken during the transatlantic slave trade. 
        Despite the brutality of slavery, African cultural traditions, music, food, and spiritual practices were preserved and adapted in the Americas.
      </p>
      <p className="mb-4">
        The Great Migration in the early 20th century saw millions of African Americans move from the rural South to urban centers in the North, bringing with them 
        rich cultural traditions that would shape American music, literature, and civil rights movements.
      </p>
      <div id="demographics"></div>
    `
  },
  'brazil': {
    id: 'brazil',
    title: 'Brazil',
    description: 'Exploring the African influence on Brazilian culture and society',
    flag: '🇧🇷',
    content: `
      <h2 className="text-2xl font-bold mb-4">African Heritage in Brazil</h2>
      <p className="mb-4">
        Brazil received more African slaves than any other country in the Americas, and today has the largest population of African descendants outside of Africa. 
        This profound influence is evident in Brazil's music, dance, religion, and cuisine.
      </p>
      <p className="mb-4">
        Cultural expressions like samba, capoeira, and Candomblé all have strong African roots and continue to be celebrated as vital parts of Brazilian identity.
      </p>
    `
  },
  'haiti': {
    id: 'haiti',
    title: 'Haïti',
    description: 'The first Black republic and its enduring African legacy',
    flag: '🇭🇹',
    content: `
      <h2 className="text-2xl font-bold mb-4">Haïti: The First Black Republic</h2>
      <p className="mb-4">
        Haïti made history in 1804 as the first independent nation in Latin America and the Caribbean, the second republic in the Americas, 
        and the first country in the modern world to be governed by former slaves.
      </p>
      <p className="mb-4">
        The Haitian Revolution was a defining moment in the history of the African diaspora, inspiring enslaved people throughout the Americas and 
        demonstrating that freedom from colonial rule was possible.
      </p>
    `
  },
  'jamaica': {
    id: 'jamaica',
    title: 'Jamaica',
    description: 'The African roots of Jamaican culture and the Rastafari movement',
    flag: '🇯🇲',
    content: `
      <h2 className="text-2xl font-bold mb-4">Jamaica's African Legacy</h2>
      <p className="mb-4">
        Jamaica's cultural identity is deeply rooted in its African heritage, particularly through the Maroons, escaped slaves who established 
        independent communities in the island's mountainous interior.
      </p>
      <p className="mb-4">
        The Rastafari movement, which emerged in Jamaica in the 1930s, looks to Africa as the spiritual homeland and has had a profound influence 
        on global music, particularly through reggae and the message of artists like Bob Marley.
      </p>
    `
  },
  'trinidad': {
    id: 'trinidad',
    title: 'Trinidad',
    description: 'The African influence on Trinidadian culture and Carnival',
    flag: '🇹🇹',
    content: `
      <h2 className="text-2xl font-bold mb-4">African Roots of Trinidadian Culture</h2>
      <p className="mb-4">
        Trinidad's African heritage is most visibly expressed in its world-famous Carnival, which has its roots in the Canboulay festivals of the 19th century 
        that celebrated the end of the sugarcane harvest and emancipation from slavery.
      </p>
      <p className="mb-4">
        The steelpan, the only acoustic musical instrument invented in the 20th century, was created in Trinidad by descendants of African slaves 
        and has become a powerful symbol of cultural resilience and creativity.
      </p>
    `
  },
  'hbcus': {
    id: 'hbcus',
    title: 'HBCUs',
    description: 'Historically Black Colleges and Universities in the United States',
    flag: '🎓',
    content: `
      <h2 className="text-2xl font-bold mb-4">Historically Black Colleges & Universities (HBCUs)</h2>
      <p className="mb-4">
        HBCUs have been the backbone of African American higher education since the 19th century, providing opportunities for Black students 
        who were systematically excluded from predominantly white institutions. These institutions have produced generations of Black leaders, 
        professionals, and change-makers.
      </p>
      <p className="mb-4">
        From their founding through the Civil Rights Movement to today, HBCUs continue to play a vital role in advancing educational 
        opportunities and fostering leadership within the African American community.
      </p>
    `
  }
};

const GlobalAfricaPage = () => {
  const { id } = useParams<{ id: string }>();
  const [pageData, setPageData] = useState<CountryData | null>(null);
  const [showDemographics, setShowDemographics] = useState(false);
  const [showBrazilDemographics, setShowBrazilDemographics] = useState(false);
  const [showHBCUDemographics, setShowHBCUDemographics] = useState(false);

  useEffect(() => {
    if (id && countryData[id]) {
      setPageData(countryData[id]);
    } else {
      // Default to African/Black Americans if no valid ID
      setPageData(countryData['black-americans']);
    }
  }, [id]);

  useEffect(() => {
    setShowDemographics(id === 'black-americans');
    setShowBrazilDemographics(id === 'brazil');
    setShowHBCUDemographics(id === 'hbcus');
  }, [id]);

  if (!pageData) {
    return <div className="min-h-screen bg-gray-50 p-4 md:p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex items-center mb-6">
            <span className="text-4xl mr-4">{pageData.flag}</span>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              {pageData.title}
            </h1>
          </div>

          <p className="text-lg text-gray-700 mb-8">
            {pageData.description}
          </p>

          <div
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(pageData.content) }}
          />
          {showDemographics && <DemographicProfile />}
          {showBrazilDemographics && <BrazilDemographicProfile />}
          {showHBCUDemographics && <HBCUProfile />}

          <div className="mt-12 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Explore More</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Object.values(countryData)
                .filter(country => country.id !== pageData.id)
                .map(country => (
                  <a
                    key={country.id}
                    href={`/global-africa/${country.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{country.flag}</span>
                      <span className="font-medium">{country.title}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {country.description}
                    </p>
                  </a>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalAfricaPage;
