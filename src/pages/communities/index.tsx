import { Link } from 'react-router-dom';
import { DiscoverMore } from '@/components/DiscoverMore';

// Community data matching the footer list
const communities = [
  { id: 'benincredible-benin', name: 'BeninCredible Benin' },
  { id: 'egyptional-egypt', name: 'EgypTional Egypt' },
  { id: 'ethutopia-ethiopia', name: 'Ethutopia Ethiopia' },
  { id: 'gambion-gambia', name: 'GambiOn Gambia' },
  { id: 'ghananion-ghana', name: 'GhaNation Ghana' },
  { id: 'kensential-kenya', name: 'KenSential Kenya' },
  { id: 'nigeriayeah-nigeria', name: 'NigeriaYeah Nigeria' },
  { id: 'rwandaful-rwanda', name: 'Rwandaful Rwanda' },
  { id: 'senegalastic-senegal', name: 'SenegalAstic Senegal' },
  { id: 'south-african-south-africa', name: 'South AfriCan South Africa' },
  { id: 'spotswana-botswana', name: 'Spotswana Botswana' },
  { id: 'tanzaniya-tanzania', name: 'TanzaniYa Tanzania' },
  { id: 'ugandalous-uganda', name: 'UgandaLous Uganda' },
];

export default function CommunitiesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Our Communities</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.map((community) => (
            <Link
              key={community.id}
              to={`/communities/${community.id}`}
              className="block bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-100"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {community.name}
              </h2>
              <p className="text-gray-600">
                Join our {community.name} community to connect with others
              </p>
              <div className="mt-4 text-blue-600 font-medium flex items-center">
                Visit community
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <DiscoverMore exclude={['Communities']} maxItems={3} />
    </div>
  );
}
