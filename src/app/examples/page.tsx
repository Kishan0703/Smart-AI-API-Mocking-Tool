"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Copy,
  Check,
  Users,
  ShoppingCart,
  FileText,
  MessageSquare,
  Calendar,
  CreditCard,
  MapPin,
  Image,
  Briefcase,
  BookOpen,
  Music,
  Film,
  Zap,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Example {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.ElementType;
  color: string;
  prompt: string;
  sampleData: object;
}

const examples: Example[] = [
  {
    id: "users",
    title: "User Profiles",
    description: "Complete user data with personal info and preferences",
    category: "Users",
    icon: Users,
    color: "indigo",
    prompt: "10 user profiles with id, firstName, lastName, email, phone, avatarUrl, role (admin/user/guest), isVerified, createdAt",
    sampleData: {
      users: [
        {
          id: 1,
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          phone: "+1-555-0123",
          avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
          role: "admin",
          isVerified: true,
          createdAt: "2024-01-15T09:30:00Z"
        }
      ]
    }
  },
  {
    id: "products",
    title: "E-commerce Products",
    description: "Product catalog with pricing and inventory",
    category: "E-commerce",
    icon: ShoppingCart,
    color: "green",
    prompt: "8 products with id, name, description, price, discountPercent, images array (3 urls), category, inStock, rating, reviewCount",
    sampleData: {
      products: [
        {
          id: 1,
          name: "Wireless Bluetooth Headphones",
          description: "Premium noise-canceling headphones with 30-hour battery life",
          price: 199.99,
          discountPercent: 15,
          images: [
            "https://example.com/headphones-1.jpg",
            "https://example.com/headphones-2.jpg",
            "https://example.com/headphones-3.jpg"
          ],
          category: "Electronics",
          inStock: true,
          rating: 4.7,
          reviewCount: 2341
        }
      ]
    }
  },
  {
    id: "blog-posts",
    title: "Blog Posts",
    description: "Rich blog content with author and metadata",
    category: "Content",
    icon: FileText,
    color: "purple",
    prompt: "5 blog posts with id, title, slug, excerpt, content (3 paragraphs), author object (name, avatar, bio), tags array, publishedAt, readingTime, featured",
    sampleData: {
      posts: [
        {
          id: 1,
          title: "Getting Started with React 19",
          slug: "getting-started-react-19",
          excerpt: "Learn the new features in React 19 and how to migrate your apps",
          content: "React 19 brings exciting new features...",
          author: {
            name: "Sarah Chen",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
            bio: "Senior Frontend Developer"
          },
          tags: ["react", "javascript", "tutorial"],
          publishedAt: "2024-03-15T10:00:00Z",
          readingTime: 8,
          featured: true
        }
      ]
    }
  },
  {
    id: "comments",
    title: "Comments & Replies",
    description: "Nested comment threads with user info",
    category: "Social",
    icon: MessageSquare,
    color: "blue",
    prompt: "6 comments with id, postId, author object (name, avatar), content, likes, createdAt, replies array (2-3 nested comments)",
    sampleData: {
      comments: [
        {
          id: 1,
          postId: 42,
          author: { name: "Alex Kim", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex" },
          content: "Great article! This really helped me understand the concept.",
          likes: 24,
          createdAt: "2024-03-10T14:30:00Z",
          replies: [
            {
              id: 2,
              author: { name: "Author", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=author" },
              content: "Thanks Alex! Glad it was helpful.",
              likes: 5,
              createdAt: "2024-03-10T15:00:00Z"
            }
          ]
        }
      ]
    }
  },
  {
    id: "events",
    title: "Events & Calendar",
    description: "Event listings with dates and venues",
    category: "Events",
    icon: Calendar,
    color: "orange",
    prompt: "6 events with id, title, description, startDate, endDate, location object (venue, address, city), organizer, attendeeCount, maxCapacity, ticketPrice, category",
    sampleData: {
      events: [
        {
          id: 1,
          title: "Tech Conference 2024",
          description: "Annual technology conference featuring industry leaders",
          startDate: "2024-06-15T09:00:00Z",
          endDate: "2024-06-17T18:00:00Z",
          location: {
            venue: "Convention Center",
            address: "123 Main Street",
            city: "San Francisco, CA"
          },
          organizer: "TechEvents Inc.",
          attendeeCount: 1500,
          maxCapacity: 2000,
          ticketPrice: 299,
          category: "Technology"
        }
      ]
    }
  },
  {
    id: "transactions",
    title: "Payment Transactions",
    description: "Financial transaction records",
    category: "Finance",
    icon: CreditCard,
    color: "emerald",
    prompt: "10 transactions with id, userId, amount, currency (USD/EUR/GBP), type (credit/debit), status (pending/completed/failed), description, createdAt, merchantName",
    sampleData: {
      transactions: [
        {
          id: "txn_abc123",
          userId: 42,
          amount: 59.99,
          currency: "USD",
          type: "debit",
          status: "completed",
          description: "Online purchase",
          createdAt: "2024-03-12T16:45:00Z",
          merchantName: "Amazon"
        }
      ]
    }
  },
  {
    id: "locations",
    title: "Locations & Places",
    description: "Geographic locations with coordinates",
    category: "Location",
    icon: MapPin,
    color: "red",
    prompt: "8 places with id, name, type (restaurant/hotel/museum/park), address, city, country, coordinates object (lat, lng), rating, priceLevel (1-4), photoUrl",
    sampleData: {
      places: [
        {
          id: 1,
          name: "The Grand Hotel",
          type: "hotel",
          address: "456 Ocean Drive",
          city: "Miami",
          country: "USA",
          coordinates: { lat: 25.7617, lng: -80.1918 },
          rating: 4.8,
          priceLevel: 4,
          photoUrl: "https://example.com/grand-hotel.jpg"
        }
      ]
    }
  },
  {
    id: "media",
    title: "Media Gallery",
    description: "Images and media with metadata",
    category: "Media",
    icon: Image,
    color: "pink",
    prompt: "12 media items with id, title, type (image/video/audio), url, thumbnailUrl, width, height, fileSize, uploadedBy, uploadedAt, tags array",
    sampleData: {
      media: [
        {
          id: 1,
          title: "Sunset Beach",
          type: "image",
          url: "https://example.com/sunset-beach.jpg",
          thumbnailUrl: "https://example.com/sunset-beach-thumb.jpg",
          width: 1920,
          height: 1080,
          fileSize: 2456789,
          uploadedBy: "photographer123",
          uploadedAt: "2024-03-01T18:30:00Z",
          tags: ["nature", "sunset", "beach"]
        }
      ]
    }
  },
  {
    id: "jobs",
    title: "Job Listings",
    description: "Job postings with company info",
    category: "Jobs",
    icon: Briefcase,
    color: "cyan",
    prompt: "6 job listings with id, title, company object (name, logo, website), location, type (full-time/part-time/contract/remote), salary object (min, max, currency), requirements array, postedAt, deadline",
    sampleData: {
      jobs: [
        {
          id: 1,
          title: "Senior Frontend Developer",
          company: {
            name: "TechCorp",
            logo: "https://example.com/techcorp-logo.png",
            website: "https://techcorp.com"
          },
          location: "San Francisco, CA",
          type: "full-time",
          salary: { min: 150000, max: 200000, currency: "USD" },
          requirements: ["5+ years React", "TypeScript", "GraphQL"],
          postedAt: "2024-03-10T00:00:00Z",
          deadline: "2024-04-10T00:00:00Z"
        }
      ]
    }
  },
  {
    id: "courses",
    title: "Online Courses",
    description: "Educational content and courses",
    category: "Education",
    icon: BookOpen,
    color: "yellow",
    prompt: "8 courses with id, title, description, instructor object (name, avatar, title), category, level (beginner/intermediate/advanced), duration (hours), lessons array with titles, price, enrolled, rating",
    sampleData: {
      courses: [
        {
          id: 1,
          title: "Complete Web Development Bootcamp",
          description: "Learn HTML, CSS, JavaScript, React, and Node.js from scratch",
          instructor: {
            name: "Dr. Angela Yu",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=angela",
            title: "Lead Instructor"
          },
          category: "Web Development",
          level: "beginner",
          duration: 65,
          lessons: [
            { title: "Introduction to HTML" },
            { title: "CSS Fundamentals" }
          ],
          price: 89.99,
          enrolled: 125000,
          rating: 4.9
        }
      ]
    }
  },
  {
    id: "music",
    title: "Music Tracks",
    description: "Song and album data",
    category: "Entertainment",
    icon: Music,
    color: "violet",
    prompt: "10 songs with id, title, artist object (name, image), album, duration (seconds), genre, releaseDate, playCount, coverArt, explicit",
    sampleData: {
      tracks: [
        {
          id: 1,
          title: "Midnight Dreams",
          artist: { name: "Luna Eclipse", image: "https://example.com/luna.jpg" },
          album: "Starlight",
          duration: 234,
          genre: "Electronic",
          releaseDate: "2024-02-14",
          playCount: 1500000,
          coverArt: "https://example.com/starlight-cover.jpg",
          explicit: false
        }
      ]
    }
  },
  {
    id: "movies",
    title: "Movies & TV Shows",
    description: "Film and series catalog",
    category: "Entertainment",
    icon: Film,
    color: "rose",
    prompt: "6 movies with id, title, overview, genres array, releaseDate, runtime, rating, voteCount, posterPath, backdropPath, cast array (3 actors with name and character)",
    sampleData: {
      movies: [
        {
          id: 1,
          title: "The Last Adventure",
          overview: "An epic journey through uncharted territories...",
          genres: ["Action", "Adventure", "Sci-Fi"],
          releaseDate: "2024-07-20",
          runtime: 148,
          rating: 8.5,
          voteCount: 15000,
          posterPath: "/posters/last-adventure.jpg",
          backdropPath: "/backdrops/last-adventure.jpg",
          cast: [
            { name: "Chris Evans", character: "Jack Hunter" },
            { name: "Zoe Saldana", character: "Maya Chen" }
          ]
        }
      ]
    }
  }
];

const categories = ["All", ...new Set(examples.map(e => e.category))];

const colorClasses: Record<string, { bg: string; text: string; border: string; light: string }> = {
  indigo: { bg: "bg-indigo-500", text: "text-indigo-600", border: "border-indigo-200", light: "bg-indigo-50" },
  green: { bg: "bg-green-500", text: "text-green-600", border: "border-green-200", light: "bg-green-50" },
  purple: { bg: "bg-purple-500", text: "text-purple-600", border: "border-purple-200", light: "bg-purple-50" },
  blue: { bg: "bg-blue-500", text: "text-blue-600", border: "border-blue-200", light: "bg-blue-50" },
  orange: { bg: "bg-orange-500", text: "text-orange-600", border: "border-orange-200", light: "bg-orange-50" },
  emerald: { bg: "bg-emerald-500", text: "text-emerald-600", border: "border-emerald-200", light: "bg-emerald-50" },
  red: { bg: "bg-red-500", text: "text-red-600", border: "border-red-200", light: "bg-red-50" },
  pink: { bg: "bg-pink-500", text: "text-pink-600", border: "border-pink-200", light: "bg-pink-50" },
  cyan: { bg: "bg-cyan-500", text: "text-cyan-600", border: "border-cyan-200", light: "bg-cyan-50" },
  yellow: { bg: "bg-yellow-500", text: "text-yellow-600", border: "border-yellow-200", light: "bg-yellow-50" },
  violet: { bg: "bg-violet-500", text: "text-violet-600", border: "border-violet-200", light: "bg-violet-50" },
  rose: { bg: "bg-rose-500", text: "text-rose-600", border: "border-rose-200", light: "bg-rose-50" },
};

function ExampleCard({ example, onClick }: { example: Example; onClick: () => void }) {
  const colors = colorClasses[example.color];
  const Icon = example.icon;

  return (
    <button
      onClick={onClick}
      className={cn(
        "text-left p-6 bg-white rounded-2xl border-2 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group",
        colors.border
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn("p-3 rounded-xl", colors.light)}>
          <Icon className={cn("w-6 h-6", colors.text)} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-lg group-hover:text-indigo-600 transition-colors">
            {example.title}
          </h3>
          <p className="text-sm text-gray-500 mt-1">{example.description}</p>
          <span className={cn("inline-block mt-3 px-3 py-1 text-xs font-medium rounded-full", colors.light, colors.text)}>
            {example.category}
          </span>
        </div>
      </div>
    </button>
  );
}

function ExampleModal({ example, onClose }: { example: Example; onClose: () => void }) {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedData, setCopiedData] = useState(false);
  const colors = colorClasses[example.color];
  const Icon = example.icon;

  const handleCopyPrompt = async () => {
    await navigator.clipboard.writeText(example.prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleCopyData = async () => {
    await navigator.clipboard.writeText(JSON.stringify(example.sampleData, null, 2));
    setCopiedData(true);
    setTimeout(() => setCopiedData(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden animate-fade-in">
        {/* Header */}
        <div className={cn("px-6 py-4 border-b", colors.light)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-xl", colors.bg)}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-xl">{example.title}</h2>
                <p className="text-sm text-gray-500">{example.description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] space-y-6">
          {/* Prompt */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">Prompt</h3>
              <button
                onClick={handleCopyPrompt}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
              >
                {copiedPrompt ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <div className="p-4 bg-gray-100 rounded-xl font-mono text-sm text-gray-700">
              "{example.prompt}"
            </div>
          </div>

          {/* Sample Response */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">Sample Response</h3>
              <button
                onClick={handleCopyData}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
              >
                {copiedData ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <div className="bg-gray-900 rounded-xl overflow-hidden">
              <pre className="p-4 text-sm text-green-400 overflow-x-auto font-mono">
                {JSON.stringify(example.sampleData, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
          >
            <Zap className="w-4 h-4" />
            Try this prompt
            <ExternalLink className="w-4 h-4" />
          </Link>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ExamplesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedExample, setSelectedExample] = useState<Example | null>(null);

  const filteredExamples = examples.filter((example) => {
    const matchesSearch = 
      example.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      example.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      example.prompt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || example.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-600" />
                <span className="font-bold text-gray-900">Examples Gallery</span>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search examples..."
                className="w-64 pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Example Templates
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Browse our collection of ready-to-use prompt templates. Click any example to view 
            the prompt and sample response, then use it to generate your own mock API.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                selectedCategory === category
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              )}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Examples Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExamples.map((example) => (
            <ExampleCard
              key={example.id}
              example={example}
              onClick={() => setSelectedExample(example)}
            />
          ))}
        </div>

        {filteredExamples.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No examples found</h3>
            <p className="text-gray-500">
              Try adjusting your search or filter to find what you're looking for.
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedExample && (
        <ExampleModal
          example={selectedExample}
          onClose={() => setSelectedExample(null)}
        />
      )}
    </div>
  );
}
