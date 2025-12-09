import React from 'react';
import { HelpCircle, Zap, Sparkles, Save, Search, Download, Shield, Clock } from 'lucide-react';

export default function Help() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <HelpCircle className="w-16 h-16 text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Help & About
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Learn how to use ScrapeMaster to extract, analyze, and save web data with AI-powered precision
          </p>
        </div>

        {/* About Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            About ScrapeMaster
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            ScrapeMaster is an AI-powered web scraping platform that helps you extract and analyze website content with unprecedented ease and accuracy. Built with cutting-edge technologies including FireCrawl API for robust scraping and Google Gemini AI for intelligent content analysis.
          </p>
          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Lightning Fast</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Extract data from any website in seconds</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">AI-Powered</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Intelligent content analysis and insights</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Save className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Save & Organize</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Store all your scrapes with powerful search</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Secure</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Your data is protected and private</p>
              </div>
            </div>
          </div>
        </div>

        {/* How to Use Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            How to Use ScrapeMaster
          </h2>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Enter Website URL
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Navigate to the Scraper page and paste the URL of the website you want to scrape. Make sure it's a valid, publicly accessible URL.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Add Keywords (Optional)
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Add specific keywords to focus the AI analysis on topics that matter to you. This helps extract more relevant insights from the content.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Start Scraping
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Click "Start Scraping" and wait while ScrapeMaster extracts the content. The AI will analyze the page and provide intelligent insights.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Review Results
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  View the extracted content, AI-generated summary, verified origin information, and future forecasts. All data is presented in an easy-to-read format.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                5
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Save & Export
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Save your scrape to the dashboard for future reference, or export it as a PDF. All your saved scrapes are accessible from the Dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Key Features
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Search className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Smart Keyword Filtering</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Focus on specific topics by adding keywords. The AI will prioritize content related to your keywords.
              </p>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">AI Analysis</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get AI-powered summaries, origin verification, and future forecasts for scraped content.
              </p>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Download className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">PDF Export</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Export your scrapes as beautifully formatted PDF documents for easy sharing and archiving.
              </p>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">History & Search</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Access all your past scrapes from the Dashboard with powerful search and filtering capabilities.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                What websites can I scrape?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                You can scrape most publicly accessible websites. Always respect robots.txt and terms of service of the websites you scrape.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Is my data secure?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes! Your scrapes are private and only accessible to you. We use industry-standard security practices to protect your data.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                How does the AI analysis work?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                We use Google Gemini AI to analyze scraped content, providing summaries, historical context, and future predictions based on the content.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Can I export my scrapes?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes! You can export any scrape as a PDF document directly from the results page or dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="text-center mt-12 p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Need More Help?
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Contact our support team or check out our documentation for more detailed guides.
          </p>
        </div>
      </div>
    </div>
  );
}