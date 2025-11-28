# Events Platform - React + TypeScript

A modern events discovery platform built with React, TypeScript, and Supabase, featuring advanced hashtag functionality, real-time search, and comprehensive admin management system.

## 🚀 Features

### Core Platform
- **Event Discovery**: Browse and search events by location, category, and date
- **Interactive Maps**: Leaflet integration for location-based event discovery
- **User Authentication**: Clerk-powered authentication with Supabase integration
- **Responsive Design**: TailwindCSS with shadcn/ui components
- **Multi-language Support**: i18n support for multiple languages

### 🏷️ Advanced Hashtag System
- **Smart Auto-complete**: Real-time hashtag suggestions with trending tags
- **Multi-hashtag Search**: Search by multiple hashtags using various separators
- **Admin Multi-input**: Bulk hashtag management for event creators
- **Popular Hashtags**: Click-to-add trending hashtags with usage counts
- **Performance Optimized**: GIN indexing for fast hashtag queries

### Business Features
- **Business Listings**: Comprehensive business directory with claims system
- **Premium Features**: Sponsored content and advertising system
- **Admin Dashboard**: Full-featured admin interface for content management
- **Analytics**: User engagement tracking and business analytics

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **TailwindCSS** - Utility-first CSS framework
- **shadcn/ui** - Modern, accessible component library
- **React Query** - Server state management and caching
- **React Hook Form + Zod** - Type-safe form validation

### Backend & Database
- **Supabase** - PostgreSQL database with real-time subscriptions
- **Clerk** - Authentication and user management
- **PostgreSQL** - Robust relational database with array support
- **GIN Indexing** - Optimized hashtag and full-text search

### Maps & Location
- **React Leaflet** - Interactive maps
- **OpenStreetMap** - Open-source map tiles
- **Geocoding APIs** - Location search and coordinates

## 📋 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or bun package manager
- Supabase account
- Clerk account

### Installation

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd events-platform
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Supabase
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Clerk
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   ```

4. **Database Setup**
   ```bash
   # Run the hashtag migration in Supabase SQL editor
   # Execute: database/migrations/add_hashtags_to_events.sql
   ```

5. **Start Development Server**
   ```bash
   bun dev
   # or
   npm run dev
   ```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui base components
│   ├── admin/          # Admin-specific components
│   └── layout/         # Layout components
├── pages/              # Page components
├── lib/                # Utilities and services
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── context/            # React context providers
└── locales/            # i18n translation files

database/
└── migrations/         # SQL migration scripts

public/                 # Static assets
```

## 🏷️ Hashtag System Guide

The platform includes a comprehensive hashtag system with the following components:

### For Users:
- **Smart Search**: `music, art tech` or `#music #art #tech`
- **Popular Tags**: Click trending hashtags to add/remove from search
- **Real-time Filtering**: Instant results as you type

### For Admins:
- **Multi-input Text**: Paste comma-separated hashtags
- **Quick Add**: One-click popular hashtag addition
- **Bulk Management**: Edit multiple hashtags efficiently

### Technical Details:
- **Database**: PostgreSQL TEXT[] arrays with GIN indexing
- **Performance**: Optimized queries for fast hashtag searches
- **Flexibility**: Support for various input formats and separators

See `HASHTAG_SYSTEM_SUMMARY.md` for complete implementation details.

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Build
```bash
bun build
# or
npm run build

# Serve static files from dist/
```

## 📚 Documentation

- **Setup Instructions**: `SETUP_INSTRUCTIONS.md`
- **Feature Requirements**: `FEATURE_REQUIREMENTS.md`
- **Development Plan**: `DEVELOPMENT_PLAN.md`
- **Hashtag System**: `HASHTAG_SYSTEM_SUMMARY.md`
- **Copilot Instructions**: `.github/copilot-instructions.md`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` folder for detailed guides
- **Issues**: Open a GitHub issue for bugs or feature requests
- **Discussion**: Use GitHub Discussions for questions and ideas

## 🎯 Roadmap

### Current Features ✅
- [x] Event discovery and search
- [x] Advanced hashtag system with autocomplete
- [x] Business listings and claims
- [x] Admin dashboard
- [x] Multi-language support

### Upcoming Features 🚧
- [ ] Event booking system
- [ ] Social features (follow, share)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] AI-powered event recommendations

---

**Built with ❤️ using React, TypeScript, and modern web technologies**
