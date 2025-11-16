# 🚀 BuzzTrack - Brand Mention & Reputation Tracker

> Real-time brand monitoring across Reddit, News, and Social Media with AI-powered sentiment analysis and conversation spike detection.

[![Live Demo]](https://buzztrack.netlify.app/)
[![API Status]](https://buzztrack09-production.up.railway.app/health)
[![React]](https://reactjs.org/)
[![Node.js]](https://nodejs.org/)

---

## 📋 Table of Contents

- [Demo Links](#-demo-links)
- [Problem Statement](#-problem-statement)
- [Solution Overview](#-solution-overview)
- [Key Features](#-key-features)
- [Tech Stack](#tech-stack)
- [Installation](#-installation)
- [API Documentation](#-api-documentation)
- [Technical Decisions](#-technical-decisions)

---

## 🌐 Demo Links

| Resource | URL |
|----------|-----|
| **Live Application** | [https://buzztrack.netlify.app/](https://buzztrack.netlify.app/) |
| **API Health Check** | [https://buzztrack09-production.up.railway.app/health](https://buzztrack09-production.up.railway.app/health) |
| **API Base URL** | [https://buzztrack09-production.up.railway.app/api](https://buzztrack09-production.up.railway.app/api) |

---

## 🎯 ***Problem Statement***

Marketers struggle to monitor brand mentions across multiple platforms in real-time. Critical conversations—especially negative sentiment or viral spikes—often go unnoticed, leading to:
- Missed opportunities for engagement
- Delayed crisis response
- Loss of brand reputation
- Inefficient manual monitoring

---

## 💡 Solution Overview

**BuzzTrack** is an intelligent brand monitoring platform that:
- ✅ Aggregates mentions from Reddit, News APIs
- ✅ Analyzes sentiment using VADER AI (positive/neutral/negative)
- ✅ Detects conversation spikes in real-time
- ✅ Clusters topics and identifies trending themes
- ✅ Provides actionable insights through an intuitive dashboard
- ✅ Delivers real-time WebSocket updates

---

## ✨ Key Features

### 1. **Real-Time Monitoring**
- Live mention feed with WebSocket streaming
- Instant spike alerts (🔥 visual notifications)

### 2. **AI-Powered Sentiment Analysis**
- VADER sentiment analyzer (context-aware)
- Negation handling ("not good" → negative)
- Brand-proximity sentiment weighting

### 3. **Advanced Topic Analysis**
- TF-IDF keyword extraction
- Topic clustering by themes (quality, price, service, etc.)
- Trending topic detection with velocity calculation

### 4. **Spike Detection System**
- 7-day rolling window comparison
- Source breakdown during spikes
- Top engaging mentions identified

### 5. **Interactive Dashboard**
- Drag-and-drop widget rearrangement
- Dark/Light theme toggle
- Brand switching (multi-brand tracking)
- Responsive design (mobile-optimized)

### 6. **Export Analytics** *(Feature)*
- JSON formats
- Customizable date ranges & filters
- Sentiment reports & topic exports
- Cross-brand comparison exports

### 7. **Onboarding Tour**
- Interactive guided tour
- Smart positioning with spotlights
- Skip/navigate functionality

---

## 🛠️ Tech Stack

### **Frontend**
| Technology | Purpose |
|------------|---------|
| React 18.3 + Vite | Fast development, modern tooling |
| Tailwind CSS | Rapid, utility-first styling |
| React Query (TanStack) | Data fetching, caching, real-time sync |
| Recharts | Data visualization (charts/graphs) |
| Lucide React | Premium icon library |
| Socket.io Client | WebSocket real-time updates |

### **Backend**
| Technology | Purpose |
|------------|---------|
| Node.js + Express | REST API server |
| Socket.io | Real-time WebSocket server |
| VADER Sentiment | AI sentiment analysis |
| Axios | HTTP client for APIs |
| Node-cron | Scheduled data collection |

### **Data Sources**
- **Reddit API** - Public posts/comments (no auth required)
- **News API** - Global news articles (free tier)

### **Deployment**
- **Frontend**: Netlify (CDN + Auto-deploy)
- **Backend**: Railway (Serverless Node.js)

---

## 📦 Installation

### Prerequisites
- Node.js 18.x or higher
- npm or yarn
- Reddit API access (optional, uses public data)
- News API key ([Get free key](https://newsapi.org/))

### 1. Clone Repository
```bash
git clone https://github.com/Ushnika09/BuzzTrack09.git
cd buzztrack
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file
cat > .env << EOF
PORT=5000
NODE_ENV=development

# API Keys
NEWS_API_KEY=your_news_api_key_here
EOF

# Start server
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Create .env file
cat > .env << EOF
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=http://localhost:5000
EOF

# Start development server
npm run dev
```

## 🧠 Technical Decisions

### **1. Why React Query?**
- **Automatic caching** - Reduces API calls
- **Background refetching** - Always fresh data
- **Optimistic updates** - Instant UI feedback
- **Error retry logic** - Built-in resilience

### **2. Why VADER over OpenAI?**
- **Offline processing** - No API costs
- **89% accuracy** - Excellent for social media
- **Instant results** - No latency
- **Privacy** - Data stays on server

### **3. Why WebSockets?**
- **True real-time** - Sub-second updates
- **Bidirectional** - Server can push alerts
- **Connection persistence** - Efficient for live data
- **Room-based** - Per-brand subscriptions

### **4. Why In-Memory Storage (MVP)?**
- **Fast reads/writes** - No DB overhead
- **Simple deployment** - No DB setup needed
- **Easy to migrate** - Can add SQLite/Postgres later
- **Sufficient for demo** - Handles 10K+ mentions

### **5. Why Tailwind CSS?**
- **Rapid development** - Utility-first approach
- **Consistent design** - Pre-defined scale
- **Dark mode support** - Built-in with `dark:` prefix
- **Small bundle** - PurgeCSS removes unused styles

---



## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@ushnika09](https://github.com/Ushnika09)
- LinkedIn: [Ushnika](https://www.linkedin.com/in/ushnika-kar-32246a36a/)
- Email: karushnika@gmail.com

---

## 🙏 Acknowledgments

- [VADER Sentiment](https://github.com/cjhutto/vaderSentiment) - Sentiment analysis
- [Reddit API](https://www.reddit.com/dev/api/) - Public data access
- [News API](https://newsapi.org/) - Global news aggregation
- [Recharts](https://recharts.org/) - Data visualization
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework

---


<div align="center">

**⭐ Star this repo if you found it helpful!**

Made with ❤️ by Ushnika

[Live Demo](https://buzztrack.netlify.app/) • [API Docs](https://buzztrack09-production.up.railway.app/api) 

</div>
