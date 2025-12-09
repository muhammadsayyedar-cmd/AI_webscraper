import { useState, useEffect } from 'react';
import { Trash2, ExternalLink, Calendar, Search, Loader2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ScrapeData } from '../lib/supabase';
import ResultsDisplay from './ResultsDisplay';

export default function Dashboard() {
  const [scrapes, setScrapes] = useState<ScrapeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadScrapes();
  }, []);

  const loadScrapes = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { data, error: fetchError } = await supabase
        .from('scrapes')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setScrapes(data || []);
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load scrapes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this scrape?')) {
      return;
    }

    setDeletingId(id);
    try {
      const { error: deleteError } = await supabase
        .from('scrapes')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setScrapes(scrapes.filter(s => s.id !== id));
      if (expandedId === id) {
        setExpandedId(null);
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete scrape');
    } finally {
      setDeletingId(null);
    }
  };

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredScrapes = scrapes.filter(scrape =>
    scrape.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
    scrape.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    scrape.meta_description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Loading your scrapes...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-5xl font-extrabold mb-4">
            <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              My Saved Scrapes
            </span>
          </h1>
          <p className="text-xl text-gray-400">
            View and manage all your scraped content
          </p>
        </div>

        <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by URL, title, or description..."
              className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors duration-300"
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-start space-x-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-300 text-sm font-medium mb-1">{error}</p>
              <p className="text-red-400/70 text-xs">
                Make sure your Supabase database is set up correctly. Check the console for more details.
              </p>
            </div>
          </div>
        )}

        {filteredScrapes.length === 0 ? (
          <div className="text-center py-16 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {searchQuery ? 'No matching scrapes found' : 'No scrapes yet'}
            </h3>
            <p className="text-gray-400 mb-8">
              {searchQuery
                ? 'Try adjusting your search query'
                : 'Start scraping websites to see them appear here'}
            </p>
            {!searchQuery && (
              <a
                href="/scraper"
                className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 transition-all duration-300 hover:scale-105"
              >
                Start Scraping
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-400 text-sm mb-4">
              {filteredScrapes.length} {filteredScrapes.length === 1 ? 'scrape' : 'scrapes'} found
            </p>

            {filteredScrapes.map((scrape, index) => (
              <div
                key={scrape.id}
                className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl overflow-hidden shadow-xl hover:border-purple-500/40 transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${0.1 + index * 0.05}s` }}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-white mb-2 truncate">
                        {scrape.title || 'Untitled Scrape'}
                      </h3>
                      <a
                        href={scrape.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 flex items-center space-x-1 group transition-colors duration-300 mb-2"
                      >
                        <span className="truncate">{scrape.url}</span>
                        <ExternalLink className="w-4 h-4 flex-shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                      </a>
                      {scrape.meta_description && (
                        <p className="text-gray-400 text-sm line-clamp-2">
                          {scrape.meta_description}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleDelete(scrape.id!)}
                      disabled={deletingId === scrape.id}
                      className="ml-4 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete scrape"
                    >
                      {deletingId === scrape.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {scrape.created_at
                            ? new Date(scrape.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Unknown date'}
                        </span>
                      </div>

                      {scrape.keywords && scrape.keywords.length > 0 && (
                        <div className="flex items-center space-x-2">
                          {scrape.keywords.slice(0, 3).map((keyword, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30"
                            >
                              {keyword}
                            </span>
                          ))}
                          {scrape.keywords.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{scrape.keywords.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => toggleExpanded(scrape.id!)}
                      className="flex items-center space-x-1 px-4 py-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition-all duration-300"
                    >
                      <span className="text-sm font-medium">
                        {expandedId === scrape.id ? 'Hide Details' : 'View Details'}
                      </span>
                      {expandedId === scrape.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {expandedId === scrape.id && (
                  <div className="border-t border-purple-500/20 p-6 bg-gray-900/30 animate-fade-in">
                    <ResultsDisplay data={scrape} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}