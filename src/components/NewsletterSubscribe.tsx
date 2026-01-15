import { useState } from 'react';
import { Mail, CheckCircle } from 'lucide-react';
import { blogSubscriptionsService } from '../lib/blogService';
import { useToast } from '../hooks/use-toast';

export const NewsletterSubscribe = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await blogSubscriptionsService.subscribe(email);
      setIsSubscribed(true);
      toast({
        title: 'Successfully Subscribed!',
        description: 'You will receive our latest blog posts in your inbox.',
      });
      setEmail('');
    } catch (error) {
      toast({
        title: 'Subscription Failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubscribed) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-8 text-center">
        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-2 font-comfortaa">
          You're Subscribed!
        </h3>
        <p className="text-gray-600 font-roboto">
          Thank you for subscribing to BARA Blog. Check your inbox for our latest articles.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8">
      <div className="max-w-2xl mx-auto text-center">
        <Mail className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-2 font-comfortaa">
          Subscribe to Our Newsletter
        </h3>
        <p className="text-gray-600 mb-6 font-roboto">
          Get the latest articles, insights, and updates delivered straight to your inbox.
        </p>
        
        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-roboto"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isLoading ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
        
        <p className="text-xs text-gray-500 mt-4 font-roboto">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </div>
    </div>
  );
};
