import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';

// Define the type for community data
type CommunityData = {
  id: string;
  name: string;
  description: string;
  channelLink?: string;
  groups?: string[];
};

// Community data - we'll move this to a separate file later
const communityData: Record<string, Omit<CommunityData, 'id'>> = {
  'benincredible-benin': {
    name: 'BeninCredible Benin',
    description: 'Discover the rich cultural heritage of Benin, the birthplace of the ancient Kingdom of Dahomey and the Vodun religion. Known for its vibrant traditions, stunning royal palaces, and the historic Route des Esclaves in Ouidah, Benin offers a profound connection to African history and spirituality.'
  },
  'egyptional-egypt': {
    name: 'EgypTional Egypt',
    description: 'Explore the wonders of ancient and modern Egypt, where pharaohs once ruled and where the Nile River continues to sustain life. From the Great Pyramids of Giza to the bustling streets of Cairo, Egypt remains a cornerstone of African civilization and a bridge between continents.'
  },
  'ethutopia-ethiopia': {
    name: 'Ethutopia Ethiopia',
    description: 'Experience the only African country never colonized, Ethiopia, home to ancient Christian traditions, the rock-hewn churches of Lalibela, and the source of the Blue Nile. With its unique alphabet, calendar, and rich coffee culture, Ethiopia is a true cradle of civilization.'
  },
  'gambion-gambia': {
    name: 'GambiOn Gambia',
    description: 'Discover the smallest country in mainland Africa, known for its beautiful beaches along the Atlantic coast and rich birdlife along the Gambia River. The Gambia offers a warm welcome with its friendly people and vibrant cultural heritage.'
  },
  'ghananion-ghana': {
    name: 'GhaNation Ghana',
    description: 'Experience the gateway to Africa, Ghana is known for its rich history, beautiful beaches, and as the center of the transatlantic slave trade. Experience the warmth of Ghanaian hospitality and the rhythm of highlife music.'
  },
  'kensential-kenya': {
    name: 'KenSential Kenya',
    description: 'Famous for its wildlife safaris, the Great Rift Valley, and the Maasai culture, Kenya offers breathtaking landscapes and incredible wildlife experiences. From the savannas of the Maasai Mara to the white sand beaches of the coast, Kenya is a land of contrasts and natural beauty.',
    groups: [
      'https://chat.whatsapp.com/ERGTm2rfMGuAqMHeQMd339',
      'https://chat.whatsapp.com/KHw6dnedPr9KG5XkgUdVWj',
      'https://chat.whatsapp.com/JNVJUnsh3ZV5xcN6UyDZf6',
      'https://chat.whatsapp.com/HeMn0O4wggs5vwjyFnK0ZK'
    ]
  },
  'nigeriayeah-nigeria': {
    name: 'NigeriaYeah Nigeria',
    description: 'Experience the giant of Africa, where diverse cultures, music, and cuisine come together in a vibrant celebration of life. Nigeria is home to Nollywood, Afrobeat music, and some of the most welcoming people on the continent.'
  },
  'rwandaful-rwanda': {
    name: 'Rwandaful Rwanda',
    description: 'Discover the land of a thousand hills, where vibrant culture meets breathtaking landscapes. Rwanda is renowned for its mountain gorillas, rich cultural heritage, and remarkable transformation into one of Africa\'s cleanest and safest countries.',
    channelLink: 'https://whatsapp.com/channel/0029Vb8RoY211ulWvNjHLq0X',
    groups: [
      'https://chat.whatsapp.com/CTXgiOGUbUV6x6JaP83rRm',
      'https://chat.whatsapp.com/E1vc00NDaTp6IP582Z1WGi',
      'https://chat.whatsapp.com/D85ihyzUNrZIe9ELaHnwKk',
      'https://chat.whatsapp.com/JPyVanlaRvs9ylC1EKtt64',
      'https://chat.whatsapp.com/Io6PvS54IQrHGH4PSnqu2Z'
    ]
  },
  'senegalastic-senegal': {
    name: 'SenegalAstic Senegal',
    description: 'Where West African culture meets French colonial influence, Senegal is known for its vibrant music scene, stunning beaches, and the iconic African Renaissance Monument.'
  },
  'south-african-south-africa': {
    name: 'South AfriCan South Africa',
    description: 'A world in one country, South Africa boasts stunning landscapes, diverse cultures, and incredible wildlife, from Table Mountain to Kruger National Park.'
  },
  'spotswana-botswana': {
    name: 'Spotswana Botswana',
    description: 'Known for the Okavango Delta and Kalahari Desert, Botswana offers some of Africa\'s most pristine wilderness areas and incredible wildlife viewing.'
  },
  'tanzaniya-tanzania': {
    name: 'TanzaniYa Tanzania',
    description: 'From the Serengeti to Zanzibar, Tanzania offers some of Africa\'s most iconic wildlife experiences and stunning Indian Ocean beaches.'
  },
  'ugandalous-uganda': {
    name: 'UgandaLous Uganda',
    description: 'The Pearl of Africa, Uganda is home to the source of the Nile, mountain gorillas, and some of the most diverse wildlife and landscapes on the continent.'
  }
};

export const CommunityPage = () => {
  const { communityId } = useParams<{ communityId: string }>();
  const community = communityId ? communityData[communityId] : null;

  if (!community) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Community not found</h1>
          <Link to="/" className="text-blue-600 hover:underline">
            Return to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link 
          to="/" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 md:p-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            {community.name}
          </h1>
          
          <div className="prose max-w-3xl text-gray-600 mb-8">
            <p className="text-lg">{community.description}</p>
          </div>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">WhatsApp Channel</h2>
              {community.channelLink ? (
                <a 
                  href={community.channelLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <span>Join Channel</span>
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              ) : (
                <p className="text-gray-500">Coming soon</p>
              )}
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">WhatsApp Community</h2>
              {community.groups && community.groups.length > 0 ? (
                <div className="space-y-3">
                  {community.groups.map((group, index) => (
                    <a
                      key={index}
                      href={group}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full sm:w-auto px-4 py-2 border border-green-500 text-green-600 rounded-lg hover:bg-green-50 transition-colors flex items-center justify-between"
                    >
                      <span>Community {index + 1}</span>
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">More groups coming soon</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
