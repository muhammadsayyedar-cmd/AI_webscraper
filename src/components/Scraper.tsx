import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Loader2, Globe, Tag, Save, Check, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { performScrape, saveScrape } from '../services/api';
import { ScrapeData } from '../lib/supabase';
import ResultsDisplay from './ResultsDisplay';
import LoadingProgress from './LoadingProgress';

export default function Scraper() {
  const location = useLocation();
  const [url, setUrl] = useState('');
  const [keywords, setKeywords] = useState('');
  const [useGemini, setUseGemini] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [results, setResults] = useState<ScrapeData | null>(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  // Pre-fill URL and keyword from Home page example click
  useEffect(() => {
    if (location.state?.url) {
      setUrl(location.state.url);
    }
    if (location.state?.keyword) {
      setKeywords(location.state.keyword);
    }
  }, [location.state]);

  const isValidUrl = (urlString: string) => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  const handleScrape = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    if (!isValidUrl(url)) {
      setError('Please enter a valid URL (include http:// or https://)');
      return;
    }

    setError('');
    setIsLoading(true);
    setResults(null);
    setSaved(false);

    try {
      const keywordArray = keywords
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0);

      const result = await performScrape(url, keywordArray, useGemini);

      if (result.success && result.data) {
        setResults(result.data);

        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#a855f7', '#3b82f6', '#8b5cf6', '#6366f1'],
        });
      } else {
        setError(result.error || 'Failed to scrape website');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!results) return;

    setIsSaving(true);
    try {
      await saveScrape(results);
      setSaved(true);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10b981', '#34d399'],
      });

      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError('Failed to save scrape');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-5xl font-extrabold mb-4">
            <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Web Scraper
            </span>
          </h1>
          <p className="text-xl text-gray-400">
            Extract and analyze website content with AI precision
          </p>
        </div>

        {!isLoading && !results && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8 mb-8 shadow-2xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="space-y-6">
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                  <Globe className="w-4 h-4 text-purple-400" />
                  <span>Website URL</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-4 py-3 bg-gray-900 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors duration-300"
                    onKeyDown={(e) => e.key === 'Enter' && handleScrape()}
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                  <Tag className="w-4 h-4 text-purple-400" />
                  <span>Keywords (optional)</span>
                </label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="Enter keywords separated by commas (e.g., pricing, features, API)"
                  className="w-full px-4 py-3 bg-gray-900 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors duration-300"
                  onKeyDown={(e) => e.key === 'Enter' && handleScrape()}
                />
                <p className="mt-2 text-xs text-gray-500">
                  Add keywords to focus the scrape on specific content. Leave empty to scrape all content.
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="useGemini"
                  checked={useGemini}
                  onChange={(e) => setUseGemini(e.target.checked)}
                  className="w-4 h-4 text-purple-600 bg-gray-900 border-purple-500/30 rounded focus:ring-purple-500 focus:ring-2"
                />
                <label htmlFor="useGemini" className="text-sm text-gray-300">
                  Use Google Gemini AI for deep research analysis (recommended)
                </label>
              </div>

              {error && (
                <div className="flex items-start space-x-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg animate-fade-in">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={handleScrape}
                disabled={isLoading}
                className="w-full group relative px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center space-x-2">
                  <Search className="w-5 h-5" />
                  <span>Scrape & Analyze Now</span>
                </span>
                {!isLoading && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}
              </button>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="animate-fade-in">
            <LoadingProgress />
          </div>
        )}

        {results && !isLoading && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Results</h2>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setResults(null);
                    setError('');
                  }}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-300"
                >
                  New Analysis
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || saved}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                    saved
                      ? 'bg-green-600 text-white'
                      : 'bg-purple-600 hover:bg-purple-700 text-white hover:scale-105'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : saved ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Save Results</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <ResultsDisplay data={results} />
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
      `}</style>
    </div>
  );
}