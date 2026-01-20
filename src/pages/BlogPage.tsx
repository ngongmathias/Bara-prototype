import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp, PenSquare } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { Header } from '../components/Header';
import Footer from '../components/Footer';
import { TopBannerAd } from '../components/TopBannerAd';
import { BottomBannerAd } from '../components/BottomBannerAd';
import { BlogHero } from '../components/BlogHero';
import { BlogCard } from '../components/BlogCard';
import { CategoryFilter } from '../components/CategoryFilter';
import { NewsletterSubscribe } from '../components/NewsletterSubscribe';
import { Button } from '../components/ui/button';
import { 
  blogPostsService, 
  blogCategoriesService, 
  BlogPost, 
  BlogCategory 
} from '../lib/blogService';
import { useToast } from '../hooks/use-toast';

export const BlogPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isSignedIn } = useUser();
  
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [featuredPost, setFeaturedPost] = useState<BlogPost | null>(null);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const postsPerPage = 9;

  useEffect(() => {
    loadCategories();
    loadFeaturedPost();
  }, []);

  useEffect(() => {
    loadPosts();
  }, [selectedCategory, searchQuery, currentPage]);

  const loadCategories = async () => {
    try {
      const data = await blogCategoriesService.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadFeaturedPost = async () => {
    try {
      const featured = await blogPostsService.getFeatured();
      if (featured.length > 0) {
        setFeaturedPost(featured[0]);
      }
    } catch (error) {
      console.error('Error loading featured post:', error);
    }
  };

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const { posts: data, total } = await blogPostsService.getAll({
        status: 'published',
        category: selectedCategory || undefined,
        search: searchQuery || undefined,
        limit: postsPerPage,
        offset: (currentPage - 1) * postsPerPage,
      });
      
      setPosts(data.filter(post => !post.is_featured || post.id !== featuredPost?.id));
      setTotalPosts(total);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load blog posts',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReadMore = (slug: string) => {
    navigate(`/blog/${slug}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadPosts();
  };

  const totalPages = Math.ceil(totalPosts / postsPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <TopBannerAd />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-4xl md:text-5xl font-bold text-black font-comfortaa">
              BARA Blog
            </h1>
            {isSignedIn && (
              <Button
                onClick={() => navigate('/blog/write')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <PenSquare className="w-4 h-4 mr-2" />
                Write Post
              </Button>
            )}
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-roboto">
            Insights, stories, and expert advice to help you grow your business and connect with opportunities worldwide.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
              className="w-full px-6 py-4 pr-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-roboto"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-black transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>
        </div>

        {/* Featured Post Hero */}
        {featuredPost && !searchQuery && !selectedCategory && (
          <BlogHero post={featuredPost} onReadMore={handleReadMore} />
        )}

        {/* Category Filter */}
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Posts Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm h-96 animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} onReadMore={handleReadMore} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mb-12">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <div className="flex gap-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-4 py-2 rounded-lg ${
                        currentPage === i + 1
                          ? 'bg-black text-white'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2 font-comfortaa">
              No Posts Found
            </h3>
            <p className="text-gray-600 font-roboto">
              {searchQuery
                ? 'Try adjusting your search terms'
                : 'Check back soon for new content!'}
            </p>
          </div>
        )}

        {/* Newsletter Subscribe Section */}
        <NewsletterSubscribe />
      </main>

      <BottomBannerAd />
      <Footer />
    </div>
  );
};

export default BlogPage;
