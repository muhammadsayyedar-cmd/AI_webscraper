import { ArrowRight, Zap, Search, TrendingUp, FileText, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  const exampleUrls = [
    { 
      title: 'AI History', 
      url: 'https://en.wikipedia.org/wiki/Artificial_intelligence',
      keyword: 'machine learning'
    },
    { 
      title: 'Tesla Analysis', 
      url: 'https://en.wikipedia.org/wiki/Tesla,_Inc.',
      keyword: 'electric vehicles'
    },
    { 
      title: 'Blockchain Origins', 
      url: 'https://en.wikipedia.org/wiki/Blockchain',
      keyword: 'cryptocurrency'
    },
  ];

  const features = [
    {
      icon: <Search className="w-6 h-6" />,
      title: 'Smart Web Scraping',
      description: 'Extract clean content from any URL using advanced FireCrawl technology'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'AI-Powered Analysis',
      description: 'Get historical origins, current status, and future predictions in seconds'
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: 'Research Reports',
      description: 'Professional 3-part analysis: Source Summary, Origins, and Forecasts'
    },
    {
      icon: <Download className="w-6 h-6" />,
      title: 'Export Anywhere',
      description: 'Download as TXT, DOC, or JSON. Save to your research library'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-gray-900"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          <div className="text-center animate-fade-in-up">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-2 mb-8">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-purple-300 text-sm font-medium">
                AI-Powered Research in 30 Seconds
              </span>
            </div>

            {/* Main heading */}
            <h1 className="text-6xl md:text-7xl font-extrabold mb-6">
              <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                ScrapeMaster
              </span>
            </h1>
            
            <p className="text-2xl md:text-3xl text-gray-300 mb-4 font-light">
              Transform Any URL into Professional Research
            </p>
            
            <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto">
              Get instant AI analysis with historical origins, current insights, and future forecasts. 
              What takes hours of manual research now takes 30 seconds.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                to="/scraper"
                className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 transition-all duration-300 hover:scale-105 flex items-center space-x-2"
              >
                <span>Start Researching</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                to="/dashboard"
                className="px-8 py-4 bg-gray-800 border border-purple-500/30 text-white font-medium rounded-xl hover:bg-gray-700 transition-all duration-300 flex items-center space-x-2"
              >
                <span>View Dashboard</span>
              </Link>
            </div>

            {/* Example URLs */}
            <div className="max-w-4xl mx-auto">
              <p className="text-gray-500 text-sm mb-4">Try these example URLs:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {exampleUrls.map((example, index) => (
                  <Link
                    key={index}
                    to="/scraper"
                    state={{ url: example.url, keyword: example.keyword }}
                    className="group p-4 bg-gray-800/50 border border-purple-500/20 rounded-xl hover:border-purple-500/50 hover:bg-gray-800/70 transition-all duration-300"
                  >
                    <div className="text-purple-400 font-medium mb-1 group-hover:text-purple-300 transition-colors">
                      {example.title}
                    </div>
                    <div className="text-gray-500 text-xs truncate">
                      {example.url}
                    </div>
                    <div className="text-blue-400 text-xs mt-1">
                      Focus: {example.keyword}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Why ScrapeMaster?
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            The only tool that combines web scraping with AI-powered historical analysis and future forecasting
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 bg-gray-800/50 border border-purple-500/20 rounded-2xl hover:border-purple-500/50 hover:bg-gray-800/70 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gray-800/30 border-y border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-400">
              From URL to professional research report in 3 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Input URL</h3>
              <p className="text-gray-400">
                Paste any URL and optionally add keywords to focus the analysis
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold text-white mb-2">AI Analysis</h3>
              <p className="text-gray-400">
                Our AI scrapes the content and generates a comprehensive 3-part research report
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Export & Save</h3>
              <p className="text-gray-400">
                Download as DOC/TXT/JSON or save to your research library
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* What You Get */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            What You Get
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Every analysis includes these three essential sections
          </p>
        </div>

        <div className="space-y-6">
          <div className="p-8 bg-green-900/20 border border-green-500/30 rounded-2xl">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Source Summary</h3>
                <p className="text-gray-300 text-lg">
                  Clear explanation of what the webpage is about. Main topics, purpose, and key messages in plain English.
                </p>
              </div>
            </div>
          </div>

          <div className="p-8 bg-orange-900/20 border border-orange-500/30 rounded-2xl">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Verified Origin / Moment of Truth</h3>
                <p className="text-gray-300 text-lg">
                  Historical context and timeline. When did this topic originate? Key milestones, earliest mentions, and evolution over time.
                </p>
              </div>
            </div>
          </div>

          <div className="p-8 bg-blue-900/20 border border-blue-500/30 rounded-2xl">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Latest Updates & Future Forecast</h3>
                <p className="text-gray-300 text-lg">
                  Current status and future predictions. Recent developments, emerging trends, and expert forecasts for what's coming next.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border-y border-purple-500/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Research?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join researchers, marketers, and analysts using ScrapeMaster to save hours every day
          </p>
          <Link
            to="/scraper"
            className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 transition-all duration-300 hover:scale-105"
          >
            <span>Start Your First Analysis</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
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

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}