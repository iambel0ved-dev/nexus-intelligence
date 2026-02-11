# Nexus Intelligence: AI Market Surveillance Engine 📡

**Live Demo:** [nexus-intelligence-six.vercel.app](https://nexus-intelligence-six.vercel.app/)

## 🚀 The Business Case
In 2026, AI infrastructure is the #1 expense for tech startups. Prices change weekly, and manual tracking is impossible. **Nexus Intelligence** is a full-stack automated surveillance system that monitors 17+ AI providers (OpenAI, Anthropic, DeepSeek, etc.) in real-time, alerting stakeholders to price drops and market shifts instantly.

## 🛠️ The Tech Stack
- **Engine:** Node.js / Playwright (Automated Scrapers)
- **Intelligence:** Gemini 2.5 Flash (LLM-based data extraction/cleaning)
- **Database:** Supabase (PostgreSQL with Real-time triggers)
- **Frontend:** Next.js 16 (App Router, Tailwind CSS, shadcn/ui)
- **Infrastructure:** GitHub Actions (Cron-scheduled surveillance), Vercel

## 🧠 Key Engineering Challenges Solved
- **Dynamic Data Extraction:** Built a resilient scraper that handles non-standard pricing formats (e.g., converting "1.5% + 20p" into standardized $ per 1M tokens).
- **Rate-Limit Resilience:** Implemented exponential backoff and jitter to bypass strict anti-scraping measures on high-traffic provider sites.
- **Real-time Alerting:** Integrated Discord webhooks to deliver instant market intelligence notifications the moment a price change is detected.

## 📈 Scalability & Future Roadmap
- [ ] **Nexus-Index:** A weighted index of AI costs for financial forecasting.
- [ ] **Auto-Switching:** API middleware to automatically route traffic to the cheapest provider.
- [ ] **Historical Analysis:** Predictive modeling on when the next price drop will occur.

---
**Available for Contract & Full-Time Roles** *Specializing in: Automation, System Architecture, and AI Integration.*
