# ScrapeMaster - AI-Powered Web Scraping Platform

A modern, interactive web scraping application with AI-powered content analysis. Built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

- **Beautiful Landing Page** - Stunning hero section with confetti animations on load
- **Smart Web Scraping** - Extract content from any website with FireCrawl API
- **Keyword-Based Scraping** - Focus on specific content by providing keywords
- **AI-Powered Analysis** - Automatic content summarization and key insight extraction using OpenAI or Google Gemini
- **Highlighted Content** - AI identifies and highlights important bullet points and information
- **Data Persistence** - Save all your scrapes to Supabase database
- **Dashboard** - View, search, and manage all saved scrapes
- **Responsive Design** - Works beautifully on desktop, tablet, and mobile
- **Modern UI** - Dark mode with purple-to-blue gradients, glassmorphism effects, and smooth animations

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **Database**: Supabase (PostgreSQL)
- **APIs**: FireCrawl, OpenAI, Google Gemini
- **Icons**: Lucide React
- **Animations**: Canvas Confetti
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account (database is already provisioned)
- FireCrawl API key
- OpenAI API key (or Google Gemini API key)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:

The Supabase configuration is already set up in your `.env` file. You'll need to add:

- **FireCrawl API Key**: Get from [https://www.firecrawl.dev/](https://www.firecrawl.dev/)
- **OpenAI API Key**: Get from [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- **Google Gemini API Key** (optional): Get from [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)

3. Run the development server:
```bash
npm run dev
```

4. Open your browser and visit the local development URL shown in the terminal

## Project Structure

```
src/
├── components/
│   ├── Header.tsx          # Navigation header
│   ├── Hero.tsx            # Landing page with confetti
│   ├── Scraper.tsx         # Main scraping interface
│   ├── ResultsDisplay.tsx  # Display scraped results
│   └── Dashboard.tsx       # Saved scrapes dashboard
├── services/
│   └── api.ts              # API integration (FireCrawl, OpenAI, Gemini, Supabase)
├── lib/
│   └── supabase.ts         # Supabase client configuration
├── App.tsx                 # Main app with routing
└── main.tsx                # App entry point
```

## API Integration

### FireCrawl API
FireCrawl is used for web scraping. The integration is located in `src/services/api.ts` in the `scrapeWithFireCrawl` function. Currently using mock data - replace with actual API calls once you have your API key.

### OpenAI API
OpenAI is used for content analysis and summarization. The integration is in the `analyzeWithOpenAI` function. Currently using mock data - replace with actual API calls once you have your API key.

### Google Gemini API
Google Gemini serves as a fallback for OpenAI. The integration is in the `analyzeWithGemini` function. The app will automatically fall back to Gemini if OpenAI fails.

### Supabase Database
The database schema includes a `scrapes` table with the following fields:
- `id` - Unique identifier
- `url` - Scraped website URL
- `title` - Page title
- `meta_description` - Meta description
- `keywords` - Array of search keywords used
- `links` - Extracted links (JSON)
- `highlighted_content` - AI-identified key points (JSON)
- `og_data` - Open Graph metadata (JSON)
- `raw_content` - Raw scraped content
- `ai_summary` - AI-generated summary
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

## Usage

1. **Landing Page**: Visit the home page to see the animated hero section with confetti
2. **Start Scraping**: Click "Start Scraping Now" or navigate to the Scraper page
3. **Enter URL**: Input the website URL you want to scrape
4. **Add Keywords** (Optional): Add comma-separated keywords to focus the scrape
5. **Scrape**: Click "Scrape Now" and watch the magic happen
6. **View Results**: See extracted content, AI summary, key insights, and links
7. **Save Results**: Click "Save Results" to store in the database
8. **Dashboard**: View all saved scrapes, search, and manage them

## Features in Detail

### Keyword-Based Scraping
Instead of scraping the entire page, you can provide keywords to focus on specific content. For example:
- Keywords: `pricing, features, API` - Will extract content related to these topics
- No keywords - Will scrape all main content

### AI Analysis
The AI analyzes scraped content and provides:
- **Summary**: A concise overview of the content
- **Key Insights**: Important bullet points with importance ratings
- **Highlighted Content**: Automatically identified crucial information

### Confetti Effects
- Landing page: Confetti animation plays automatically on load
- After scraping: Success confetti when scrape completes
- After saving: Green confetti when results are saved

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Run type checking
npm run typecheck

# Run linting
npm run lint
```

## License

MIT License - Feel free to use this project for any purpose!
