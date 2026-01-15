-- Insert Sample Blog Data for Testing
-- This creates sample authors and blog posts to test the BARA Blog system

-- First, create a sample author (you'll need to replace the user_id with your actual Clerk user ID)
-- For now, using a placeholder - you should update this with your real Clerk user ID
INSERT INTO blog_authors (user_id, display_name, bio, avatar_url, is_verified, post_count)
VALUES 
  ('sample_user_1', 'BARA Editorial Team', 'The official editorial team at BARA, bringing you insights on business, entrepreneurship, and global opportunities.', 'https://api.dicebear.com/7.x/initials/svg?seed=BARA', true, 0),
  ('sample_user_2', 'Sarah Johnson', 'Business consultant and entrepreneur with 15 years of experience helping companies expand internationally.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', true, 0),
  ('sample_user_3', 'Michael Chen', 'Digital marketing expert specializing in cross-border e-commerce and marketplace strategies.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael', false, 0)
ON CONFLICT (user_id) DO NOTHING;

-- Get category IDs for reference
DO $$
DECLARE
  cat_business_tips UUID;
  cat_country_spotlights UUID;
  cat_success_stories UUID;
  cat_industry_insights UUID;
  cat_how_to_guides UUID;
  cat_community_features UUID;
  author_bara UUID;
  author_sarah UUID;
  author_michael UUID;
BEGIN
  -- Get category IDs
  SELECT id INTO cat_business_tips FROM blog_categories WHERE slug = 'business-tips';
  SELECT id INTO cat_country_spotlights FROM blog_categories WHERE slug = 'country-spotlights';
  SELECT id INTO cat_success_stories FROM blog_categories WHERE slug = 'success-stories';
  SELECT id INTO cat_industry_insights FROM blog_categories WHERE slug = 'industry-insights';
  SELECT id INTO cat_how_to_guides FROM blog_categories WHERE slug = 'how-to-guides';
  SELECT id INTO cat_community_features FROM blog_categories WHERE slug = 'community-features';
  
  -- Get author IDs
  SELECT id INTO author_bara FROM blog_authors WHERE user_id = 'sample_user_1';
  SELECT id INTO author_sarah FROM blog_authors WHERE user_id = 'sample_user_2';
  SELECT id INTO author_michael FROM blog_authors WHERE user_id = 'sample_user_3';

  -- Insert Sample Blog Posts
  
  -- Post 1: Featured Post
  INSERT INTO blog_posts (
    title, slug, excerpt, content, featured_image, author_id, category_id, 
    tags, status, is_featured, reading_time, seo_title, seo_description, 
    published_at, view_count
  ) VALUES (
    '10 Essential Tips for Expanding Your Business Internationally',
    '10-essential-tips-expanding-business-internationally',
    'Thinking about taking your business global? Here are the key strategies you need to know before making the leap into international markets.',
    '<h2>Introduction</h2>
<p>Expanding your business internationally can be one of the most rewarding decisions you make as an entrepreneur. However, it requires careful planning, research, and execution. In this comprehensive guide, we''ll walk you through the essential tips that will help you successfully navigate the complexities of international business expansion.</p>

<h2>1. Research Your Target Market Thoroughly</h2>
<p>Before entering any new market, conduct extensive research on local consumer behavior, cultural preferences, and market demand. Understanding your target audience is crucial for success.</p>

<h2>2. Understand Legal and Regulatory Requirements</h2>
<p>Each country has its own set of business regulations, tax laws, and compliance requirements. Work with local legal experts to ensure you''re operating within the law.</p>

<h2>3. Build Local Partnerships</h2>
<p>Partnering with local businesses can provide invaluable insights, distribution channels, and credibility in new markets. Look for partners who share your values and vision.</p>

<h2>4. Adapt Your Marketing Strategy</h2>
<p>What works in your home market may not resonate abroad. Customize your marketing messages, branding, and campaigns to align with local culture and preferences.</p>

<h2>5. Consider Currency and Payment Methods</h2>
<p>Offer multiple payment options and be prepared to handle currency fluctuations. Local payment methods can significantly impact your conversion rates.</p>

<h2>6. Invest in Local Talent</h2>
<p>Hiring local employees brings cultural understanding and language skills that are essential for connecting with customers and navigating the business landscape.</p>

<h2>7. Start Small and Scale Gradually</h2>
<p>Don''t try to conquer an entire country at once. Test your product or service in a specific region first, learn from the experience, and then expand.</p>

<h2>8. Leverage Technology</h2>
<p>Use digital tools and platforms to streamline operations, communicate with teams across borders, and reach customers efficiently.</p>

<h2>9. Protect Your Intellectual Property</h2>
<p>Register your trademarks, patents, and copyrights in each country where you operate to prevent infringement and maintain your competitive advantage.</p>

<h2>10. Be Patient and Persistent</h2>
<p>International expansion takes time. Be prepared for challenges, setbacks, and a learning curve. Stay committed to your vision and adapt as needed.</p>

<h2>Conclusion</h2>
<p>Expanding internationally is a journey that requires dedication, resources, and strategic thinking. By following these essential tips and staying flexible, you can successfully grow your business across borders and tap into new opportunities worldwide.</p>',
    'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&h=600&fit=crop',
    author_sarah,
    cat_business_tips,
    ARRAY['international business', 'expansion', 'global markets', 'entrepreneurship'],
    'published',
    true,
    8,
    '10 Essential Tips for International Business Expansion | BARA Blog',
    'Learn the key strategies for successfully expanding your business internationally. Expert tips on market research, partnerships, and scaling globally.',
    NOW() - INTERVAL '2 days',
    1247
  );

  -- Post 2: Country Spotlight
  INSERT INTO blog_posts (
    title, slug, excerpt, content, featured_image, author_id, category_id,
    tags, status, is_featured, reading_time, published_at, view_count
  ) VALUES (
    'Why Dubai is the Perfect Hub for African Entrepreneurs',
    'why-dubai-perfect-hub-african-entrepreneurs',
    'Discover why Dubai has become the go-to destination for African entrepreneurs looking to scale their businesses and access global markets.',
    '<h2>The Rise of Dubai as a Business Hub</h2>
<p>Dubai has transformed itself into one of the world''s most dynamic business hubs, attracting entrepreneurs from across the globe. For African business owners, Dubai offers unique advantages that make it an ideal location for expansion and growth.</p>

<h2>Strategic Geographic Location</h2>
<p>Positioned between Africa, Asia, and Europe, Dubai serves as a perfect bridge for African entrepreneurs looking to access multiple markets. The city''s world-class infrastructure and connectivity make it easy to do business across continents.</p>

<h2>Business-Friendly Environment</h2>
<p>Dubai offers 100% foreign ownership in many sectors, zero corporate tax in free zones, and streamlined business registration processes. These factors make it incredibly attractive for entrepreneurs looking to establish a regional presence.</p>

<h2>Access to Capital and Investment</h2>
<p>The UAE is home to numerous investors, venture capital firms, and financial institutions eager to support innovative businesses. African entrepreneurs can tap into this ecosystem to secure funding and partnerships.</p>

<h2>World-Class Infrastructure</h2>
<p>From state-of-the-art office spaces to advanced logistics and transportation networks, Dubai provides the infrastructure needed to run efficient, scalable operations.</p>

<h2>Success Stories</h2>
<p>Many African entrepreneurs have successfully used Dubai as a launchpad for their businesses, accessing markets in the Middle East, Asia, and beyond while maintaining strong ties to their home countries.</p>

<h2>Getting Started</h2>
<p>If you''re considering Dubai as your next business destination, start by researching the various free zones, understanding visa requirements, and connecting with the African business community already thriving in the emirate.</p>',
    'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&h=600&fit=crop',
    author_bara,
    cat_country_spotlights,
    ARRAY['Dubai', 'UAE', 'African entrepreneurs', 'business hub'],
    'published',
    false,
    6,
    NOW() - INTERVAL '5 days',
    892
  );

  -- Post 3: Success Story
  INSERT INTO blog_posts (
    title, slug, excerpt, content, featured_image, author_id, category_id,
    tags, status, is_featured, reading_time, published_at, view_count
  ) VALUES (
    'From Lagos to London: How One Entrepreneur Built a £5M Fashion Empire',
    'lagos-to-london-fashion-empire-success-story',
    'Meet Amara Okafor, who turned her passion for African-inspired fashion into a thriving international business with customers across three continents.',
    '<h2>The Beginning</h2>
<p>Amara Okafor started her journey in a small workshop in Lagos, Nigeria, creating custom clothing that blended traditional African fabrics with contemporary designs. What began as a side hustle quickly turned into a full-time passion.</p>

<h2>The Turning Point</h2>
<p>After gaining traction on social media and receiving orders from across Africa, Amara realized the potential for international expansion. She made the bold decision to establish a presence in London to access European markets.</p>

<h2>Overcoming Challenges</h2>
<p>The journey wasn''t easy. Amara faced challenges with logistics, cultural differences, and establishing credibility in a new market. However, her commitment to quality and authentic storytelling helped her brand stand out.</p>

<h2>Building the Brand</h2>
<p>By focusing on sustainability, ethical production, and celebrating African heritage, Amara''s brand resonated with conscious consumers in Europe and beyond. She built a loyal customer base that valued both the aesthetics and the story behind each piece.</p>

<h2>Scaling Up</h2>
<p>Today, Amara''s company employs over 50 people across Nigeria and the UK, with annual revenues exceeding £5 million. She''s expanded into accessories, home décor, and has even launched a mentorship program for aspiring fashion entrepreneurs.</p>

<h2>Lessons Learned</h2>
<p>"Stay true to your vision, but be flexible in your approach," Amara advises. "Success in international business requires cultural sensitivity, patience, and a willingness to learn from every market you enter."</p>

<h2>What''s Next</h2>
<p>Amara is now setting her sights on the North American market and plans to open a flagship store in New York City next year. Her story is a testament to the power of determination, cultural pride, and strategic thinking.</p>',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&h=600&fit=crop',
    author_sarah,
    cat_success_stories,
    ARRAY['success story', 'fashion', 'entrepreneurship', 'Africa', 'UK'],
    'published',
    false,
    7,
    NOW() - INTERVAL '1 week',
    1563
  );

  -- Post 4: How-To Guide
  INSERT INTO blog_posts (
    title, slug, excerpt, content, featured_image, author_id, category_id,
    tags, status, is_featured, reading_time, published_at, view_count
  ) VALUES (
    'How to Use BARA to Find Business Opportunities in New Markets',
    'how-to-use-bara-find-business-opportunities',
    'A step-by-step guide to leveraging BARA''s platform to discover partnerships, suppliers, and customers in markets around the world.',
    '<h2>Getting Started with BARA</h2>
<p>BARA is your gateway to global business opportunities. Whether you''re looking for suppliers, partners, or customers, our platform connects you with verified businesses across multiple countries and industries.</p>

<h2>Step 1: Create Your Business Profile</h2>
<p>Start by creating a comprehensive business profile that showcases your products, services, and unique value proposition. Include high-quality images, detailed descriptions, and contact information.</p>

<h2>Step 2: Explore Country Listings</h2>
<p>Use our country-specific directories to discover businesses in your target markets. Filter by industry, location, and business type to find exactly what you''re looking for.</p>

<h2>Step 3: Use Advanced Search Features</h2>
<p>Take advantage of our advanced search filters to narrow down results based on specific criteria such as company size, years in business, certifications, and more.</p>

<h2>Step 4: Connect and Network</h2>
<p>Reach out to potential partners through our messaging system. Introduce yourself, explain your business goals, and explore collaboration opportunities.</p>

<h2>Step 5: Verify and Research</h2>
<p>Before committing to any partnership, use BARA''s verification features and read reviews from other users. Conduct thorough due diligence to ensure you''re working with reputable businesses.</p>

<h2>Step 6: Leverage BARA Events</h2>
<p>Attend virtual and in-person events hosted on BARA to network with business owners, learn from experts, and discover new opportunities.</p>

<h2>Step 7: Stay Active</h2>
<p>Regularly update your profile, respond to inquiries promptly, and engage with the BARA community. The more active you are, the more opportunities you''ll discover.</p>

<h2>Pro Tips</h2>
<ul>
<li>Use the marketplace feature to buy and sell products directly</li>
<li>Join relevant communities to connect with like-minded entrepreneurs</li>
<li>Subscribe to country-specific newsletters for market insights</li>
<li>Take advantage of BARA''s tools and resources for business growth</li>
</ul>',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=600&fit=crop',
    author_michael,
    cat_how_to_guides,
    ARRAY['BARA platform', 'how-to', 'business networking', 'opportunities'],
    'published',
    false,
    5,
    NOW() - INTERVAL '3 days',
    678
  );

  -- Post 5: Industry Insights
  INSERT INTO blog_posts (
    title, slug, excerpt, content, featured_image, author_id, category_id,
    tags, status, is_featured, reading_time, published_at, view_count
  ) VALUES (
    'The Future of Cross-Border E-Commerce in Africa',
    'future-cross-border-ecommerce-africa',
    'Explore the trends, challenges, and opportunities shaping the future of e-commerce across African markets.',
    '<h2>The E-Commerce Boom in Africa</h2>
<p>Africa''s e-commerce market is experiencing unprecedented growth, driven by increasing internet penetration, mobile adoption, and a young, tech-savvy population. The continent represents one of the last major frontiers for digital commerce.</p>

<h2>Key Trends to Watch</h2>
<h3>Mobile-First Commerce</h3>
<p>With mobile phones being the primary internet access point for most Africans, successful e-commerce platforms are designed with mobile users in mind from the ground up.</p>

<h3>Payment Innovation</h3>
<p>Mobile money solutions like M-Pesa have revolutionized payments in Africa. New fintech innovations are making cross-border transactions easier and more affordable.</p>

<h3>Logistics Solutions</h3>
<p>Companies are developing creative solutions to overcome infrastructure challenges, from motorcycle delivery fleets to partnerships with local shops serving as pickup points.</p>

<h2>Challenges and Solutions</h2>
<p>While opportunities abound, challenges remain: inconsistent internet connectivity, payment trust issues, and complex customs procedures. However, innovative entrepreneurs are finding ways to overcome these obstacles.</p>

<h2>The Role of Regional Integration</h2>
<p>The African Continental Free Trade Area (AfCFTA) is set to transform cross-border commerce by reducing tariffs and harmonizing regulations, making it easier for businesses to sell across borders.</p>

<h2>What This Means for Businesses</h2>
<p>Now is the time to establish a presence in African e-commerce markets. Early movers who understand local nuances and build trust with consumers will be well-positioned for long-term success.</p>',
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=600&fit=crop',
    author_michael,
    cat_industry_insights,
    ARRAY['e-commerce', 'Africa', 'digital transformation', 'trends'],
    'published',
    false,
    6,
    NOW() - INTERVAL '1 day',
    445
  );

  -- Post 6: Community Feature (Draft)
  INSERT INTO blog_posts (
    title, slug, excerpt, content, featured_image, author_id, category_id,
    tags, status, is_featured, reading_time, published_at, view_count
  ) VALUES (
    'Meet the BARA Community: Entrepreneurs Making a Difference',
    'meet-bara-community-entrepreneurs-making-difference',
    'Get to know some of the inspiring entrepreneurs in the BARA community who are building businesses that create positive social impact.',
    '<h2>Introduction</h2>
<p>The BARA community is home to thousands of entrepreneurs from around the world, each with unique stories, challenges, and successes. In this series, we highlight members who are not just building profitable businesses, but also making a positive impact in their communities.</p>

<h2>Featured Entrepreneurs</h2>
<p>Coming soon: In-depth profiles of BARA community members who are changing the game in their industries and communities.</p>

<p>This post is currently being developed. Check back soon for inspiring stories!</p>',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=600&fit=crop',
    author_bara,
    cat_community_features,
    ARRAY['community', 'entrepreneurs', 'social impact'],
    'draft',
    false,
    4,
    NULL,
    0
  );

END $$;

-- Add some sample comments to the first post
DO $$
DECLARE
  post_id UUID;
  comment_id UUID;
BEGIN
  -- Get the first post ID
  SELECT id INTO post_id FROM blog_posts WHERE slug = '10-essential-tips-expanding-business-internationally';
  
  IF post_id IS NOT NULL THEN
    -- Add root comment
    INSERT INTO blog_comments (post_id, user_id, user_name, user_avatar, content, is_approved)
    VALUES (
      post_id,
      'sample_commenter_1',
      'John Smith',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      'This is exactly what I needed! I''m planning to expand my business to East Africa next year. The tip about building local partnerships really resonates with me.',
      true
    ) RETURNING id INTO comment_id;
    
    -- Add reply to the comment
    INSERT INTO blog_comments (post_id, user_id, user_name, user_avatar, content, parent_id, is_approved)
    VALUES (
      post_id,
      'sample_user_2',
      'Sarah Johnson',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      'Thanks John! Local partnerships are crucial. Feel free to reach out if you need any advice on the East African market.',
      comment_id,
      true
    );
    
    -- Add another root comment
    INSERT INTO blog_comments (post_id, user_id, user_name, user_avatar, content, is_approved, likes_count)
    VALUES (
      post_id,
      'sample_commenter_2',
      'Maria Garcia',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
      'Great article! The point about adapting marketing strategy is so important. What worked in Spain didn''t work at all in Latin America until we localized everything.',
      true,
      5
    );
  END IF;
END $$;

-- Update reading times for all posts
UPDATE blog_posts 
SET reading_time = CEIL(LENGTH(content)::FLOAT / 1000)
WHERE reading_time IS NULL;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Sample blog data inserted successfully!';
  RAISE NOTICE 'Created 3 sample authors and 6 blog posts (5 published, 1 draft)';
  RAISE NOTICE 'Added sample comments to demonstrate the commenting system';
END $$;
