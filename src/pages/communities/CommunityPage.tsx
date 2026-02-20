import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Users, Globe, MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';



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
      'https://chat.whatsapp.com/BvppCFgXgpU7Tsmu9LGNjE',
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
  const { communitySlug } = useParams<{ communitySlug: string }>();
  const [community, setCommunity] = useState(communitySlug ? communityData[communitySlug] : null);
  const [loading, setLoading] = useState(true);
  const [globalAfricaData, setGlobalAfricaData] = useState<any>(null);

  useEffect(() => {
    const fetchCommunityData = async () => {
      if (!communitySlug) {
        setLoading(false);
        return;
      }

      // First check hardcoded data
      const hardcodedCommunity = communityData[communitySlug];
      if (hardcodedCommunity) {
        setCommunity(hardcodedCommunity);
      }

      // Also fetch from database for additional info
      try {
        const pattern = communitySlug.replace(/-/g, ' ');
        const { data: gaData } = await supabase
          .from('global_africa')
          .select('*')
          .ilike('name', `%${pattern}%`)
          .maybeSingle();

        if (gaData) {
          setGlobalAfricaData(gaData);
          // If no hardcoded data, create community from DB data
          if (!hardcodedCommunity) {
            setCommunity({
              name: gaData.name,
              description: gaData.description || `${gaData.name} - A vibrant African community.`,
              channelLink: gaData.channel_link,
              groups: gaData.groups || []
            });
          }
        }
      } catch (error) {
        console.error('Error fetching community:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunityData();
  }, [communitySlug]);



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#70905a] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading community...</p>
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <div className="text-center max-w-lg">
          <Globe className="w-20 h-20 text-[#70905a] mx-auto mb-6 opacity-50" />
          <h1 className="text-3xl font-bold mb-4 text-gray-900">Community Coming Soon</h1>
          <p className="text-gray-600 mb-6">
            This community page is being set up. We're working with local members to build a vibrant space for connection and collaboration.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              to="/communities" 
              className="inline-flex items-center justify-center px-6 py-3 bg-[#70905a] text-white rounded-lg hover:bg-[#5a7549] transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Browse All Communities
            </Link>
            <Link 
              to="/ask-question" 
              className="inline-flex items-center justify-center px-6 py-3 border border-[#70905a] text-[#70905a] rounded-lg hover:bg-[#70905a]/10 transition-colors"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Express Interest
            </Link>
          </div>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link 
          to="/communities" 
          className="inline-flex items-center text-[#70905a] hover:text-[#5a7549] mb-6 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Communities
        </Link>
        
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 md:p-12 border border-gray-100">
          {/* Header with icon */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-[#70905a] rounded-2xl flex items-center justify-center flex-shrink-0">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                {community.name}
              </h1>
              <p className="text-gray-500 mt-1">Community Hub</p>
            </div>
          </div>
          
          {/* Description */}
          <div className="prose max-w-3xl text-gray-600 mb-12">
            <p className="text-lg leading-relaxed">{community.description}</p>
          </div>
          
          {/* Stats or info if available from global_africa */}
          {globalAfricaData && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {globalAfricaData.member_count && (
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-[#70905a]">{globalAfricaData.member_count}</p>
                  <p className="text-sm text-gray-500">Members</p>
                </div>
              )}
              {globalAfricaData.city && (
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-lg font-semibold text-gray-900">{globalAfricaData.city}</p>
                  <p className="text-sm text-gray-500">Location</p>
                </div>
              )}
            </div>
          )}
          
          {/* WhatsApp Links */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-green-50 rounded-xl p-6 border border-green-100">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-green-600" />
                WhatsApp Channel
              </h2>
              {community.channelLink || globalAfricaData?.channel_link ? (
                <a 
                  href={community.channelLink || globalAfricaData?.channel_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm"
                >
                  <span>Join Channel</span>
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              ) : (
                <div className="text-gray-500">
                  <p className="mb-2">Channel coming soon</p>
                  <Link 
                    to="/ask-question" 
                    className="text-sm text-green-600 hover:underline"
                  >
                    Want to help set this up?
                  </Link>
                </div>
              )}
            </div>
            
            <div className="bg-green-50 rounded-xl p-6 border border-green-100">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-green-600" />
                WhatsApp Groups
              </h2>
              {(community.groups && community.groups.length > 0) || (globalAfricaData?.groups && globalAfricaData.groups.length > 0) ? (
                <div className="space-y-3">
                  {(community.groups || globalAfricaData?.groups || []).map((group: string, index: number) => (
                    <a
                      key={index}
                      href={group}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full px-4 py-3 bg-white border border-green-200 text-green-700 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-between shadow-sm"
                    >
                      <span className="font-medium">Group {index + 1}</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500">
                  <p className="mb-2">Groups coming soon</p>
                  <Link 
                    to="/ask-question" 
                    className="text-sm text-green-600 hover:underline"
                  >
                    Express interest in joining
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          {/* Additional info from database */}
          {globalAfricaData?.additional_info && (
            <div className="mt-10 pt-10 border-t border-gray-200">
              <h2 className="text-xl font-semibold mb-4">About This Community</h2>
              <p className="text-gray-600 leading-relaxed">{globalAfricaData.additional_info}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

};

