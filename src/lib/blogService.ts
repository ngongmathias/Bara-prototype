import { supabase } from './supabase';

// Types
export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  post_count: number;
  created_at: string;
  updated_at: string;
}

export interface BlogAuthor {
  id: string;
  user_id: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
  website_url?: string;
  twitter_handle?: string;
  linkedin_url?: string;
  is_verified: boolean;
  post_count: number;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image?: string;
  author_id: string;
  author?: BlogAuthor;
  category_id?: string;
  category?: BlogCategory;
  tags: string[];
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  is_featured: boolean;
  view_count: number;
  reading_time?: number;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  published_at?: string;
  scheduled_for?: string;
  created_at: string;
  updated_at: string;
}

export interface BlogComment {
  id: string;
  post_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  parent_id?: string;
  replies?: BlogComment[];
  likes_count: number;
  is_approved: boolean;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlogSubscription {
  id: string;
  email: string;
  is_active: boolean;
  subscribed_at: string;
  unsubscribed_at?: string;
}

// Blog Categories Service
export const blogCategoriesService = {
  async getAll(): Promise<BlogCategory[]> {
    const { data, error } = await supabase
      .from('blog_categories')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  async getBySlug(slug: string): Promise<BlogCategory | null> {
    const { data, error } = await supabase
      .from('blog_categories')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(category: Partial<BlogCategory>): Promise<BlogCategory> {
    const { data, error } = await supabase
      .from('blog_categories')
      .insert(category)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<BlogCategory>): Promise<BlogCategory> {
    const { data, error } = await supabase
      .from('blog_categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('blog_categories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Blog Authors Service
export const blogAuthorsService = {
  async getAll(): Promise<BlogAuthor[]> {
    const { data, error } = await supabase
      .from('blog_authors')
      .select('*')
      .order('post_count', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<BlogAuthor | null> {
    const { data, error } = await supabase
      .from('blog_authors')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getByUserId(userId: string): Promise<BlogAuthor | null> {
    const { data, error } = await supabase
      .from('blog_authors')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching author by user_id:', error);
      return null;
    }
    return data;
  },

  async create(author: Partial<BlogAuthor>): Promise<BlogAuthor> {
    const { data, error } = await supabase
      .from('blog_authors')
      .insert(author)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<BlogAuthor>): Promise<BlogAuthor> {
    const { data, error } = await supabase
      .from('blog_authors')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('blog_authors')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Blog Posts Service
export const blogPostsService = {
  async getAll(filters?: {
    status?: string;
    category?: string;
    author?: string;
    tag?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ posts: BlogPost[]; total: number }> {
    let query = supabase
      .from('blog_posts')
      .select(`
        *,
        author:blog_authors(*),
        category:blog_categories(*)
      `, { count: 'exact' });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.category) {
      query = query.eq('category_id', filters.category);
    }

    if (filters?.author) {
      query = query.eq('author_id', filters.author);
    }

    if (filters?.tag) {
      query = query.contains('tags', [filters.tag]);
    }

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,excerpt.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
    }

    query = query.order('published_at', { ascending: false, nullsFirst: false });

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error, count } = await query;
    
    if (error) throw error;
    return { posts: data || [], total: count || 0 };
  },

  async getPublished(limit?: number): Promise<BlogPost[]> {
    const { posts } = await this.getAll({ status: 'published', limit });
    return posts;
  },

  async getFeatured(): Promise<BlogPost[]> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        author:blog_authors(*),
        category:blog_categories(*)
      `)
      .eq('status', 'published')
      .eq('is_featured', true)
      .order('published_at', { ascending: false })
      .limit(3);
    
    if (error) throw error;
    return data || [];
  },

  async getBySlug(slug: string): Promise<BlogPost | null> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        author:blog_authors(*),
        category:blog_categories(*)
      `)
      .eq('slug', slug)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getById(id: string): Promise<BlogPost | null> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        author:blog_authors(*),
        category:blog_categories(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getRelated(postId: string, categoryId?: string, limit: number = 3): Promise<BlogPost[]> {
    let query = supabase
      .from('blog_posts')
      .select(`
        *,
        author:blog_authors(*),
        category:blog_categories(*)
      `)
      .eq('status', 'published')
      .neq('id', postId);

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query
      .order('published_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  },

  async create(post: Partial<BlogPost>): Promise<BlogPost> {
    const { data, error } = await supabase
      .from('blog_posts')
      .insert(post)
      .select(`
        *,
        author:blog_authors(*),
        category:blog_categories(*)
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<BlogPost>): Promise<BlogPost> {
    const { data, error } = await supabase
      .from('blog_posts')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        author:blog_authors(*),
        category:blog_categories(*)
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async incrementViewCount(id: string): Promise<void> {
    const { error } = await supabase.rpc('increment_blog_post_views', { post_id: id });
    if (error) {
      const { data } = await supabase
        .from('blog_posts')
        .select('view_count')
        .eq('id', id)
        .single();
      
      if (data) {
        await supabase
          .from('blog_posts')
          .update({ view_count: data.view_count + 1 })
          .eq('id', id);
      }
    }
  },

  async toggleBookmark(postId: string, userId: string): Promise<boolean> {
    const { data: existing } = await supabase
      .from('blog_bookmarks')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      await supabase
        .from('blog_bookmarks')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);
      return false;
    } else {
      await supabase
        .from('blog_bookmarks')
        .insert({ post_id: postId, user_id: userId });
      return true;
    }
  },

  async isBookmarked(postId: string, userId: string): Promise<boolean> {
    const { data } = await supabase
      .from('blog_bookmarks')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    return !!data;
  },

  async getUserBookmarks(userId: string): Promise<BlogPost[]> {
    const { data, error } = await supabase
      .from('blog_bookmarks')
      .select(`
        post:blog_posts(
          *,
          author:blog_authors(*),
          category:blog_categories(*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data?.map(item => item.post).filter(Boolean) || [];
  }
};

// Blog Comments Service
export const blogCommentsService = {
  async getByPostId(postId: string): Promise<BlogComment[]> {
    const { data, error } = await supabase
      .from('blog_comments')
      .select('*')
      .eq('post_id', postId)
      .eq('is_approved', true)
      .order('created_at', { ascending: true });
    
    if (error) throw error;

    const comments = data || [];
    const commentMap = new Map<string, BlogComment>();
    const rootComments: BlogComment[] = [];

    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    comments.forEach(comment => {
      const commentWithReplies = commentMap.get(comment.id)!;
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          parent.replies!.push(commentWithReplies);
        }
      } else {
        rootComments.push(commentWithReplies);
      }
    });

    return rootComments;
  },

  async create(comment: Partial<BlogComment>): Promise<BlogComment> {
    const { data, error } = await supabase
      .from('blog_comments')
      .insert(comment)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<BlogComment>): Promise<BlogComment> {
    const { data, error } = await supabase
      .from('blog_comments')
      .update({ ...updates, is_edited: true })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('blog_comments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async toggleLike(commentId: string, userId: string): Promise<boolean> {
    const { data: existing } = await supabase
      .from('blog_comment_likes')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      await supabase
        .from('blog_comment_likes')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', userId);
      return false;
    } else {
      await supabase
        .from('blog_comment_likes')
        .insert({ comment_id: commentId, user_id: userId });
      return true;
    }
  },

  async hasLiked(commentId: string, userId: string): Promise<boolean> {
    const { data } = await supabase
      .from('blog_comment_likes')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .single();

    return !!data;
  }
};

// Blog Subscriptions Service
export const blogSubscriptionsService = {
  async subscribe(email: string): Promise<BlogSubscription> {
    const { data, error } = await supabase
      .from('blog_subscriptions')
      .insert({ email, is_active: true })
      .select()
      .single();
    
    if (error) {
      if (error.code === '23505') {
        const { data: existing, error: updateError } = await supabase
          .from('blog_subscriptions')
          .update({ is_active: true, unsubscribed_at: null })
          .eq('email', email)
          .select()
          .single();
        
        if (updateError) throw updateError;
        return existing;
      }
      throw error;
    }
    return data;
  },

  async unsubscribe(email: string): Promise<void> {
    const { error } = await supabase
      .from('blog_subscriptions')
      .update({ is_active: false, unsubscribed_at: new Date().toISOString() })
      .eq('email', email);
    
    if (error) throw error;
  },

  async isSubscribed(email: string): Promise<boolean> {
    const { data } = await supabase
      .from('blog_subscriptions')
      .select('is_active')
      .eq('email', email)
      .single();

    return data?.is_active || false;
  },

  async getAll(): Promise<BlogSubscription[]> {
    const { data, error } = await supabase
      .from('blog_subscriptions')
      .select('*')
      .eq('is_active', true)
      .order('subscribed_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }
};

// Utility functions
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export const calculateReadingTime = (content: string): number => {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  return Math.max(readingTime, 1);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return formatDate(dateString);
};
