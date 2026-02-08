# nexus-intelligence
An AI-powered stealth engine for SaaS competitor price monitoring and market intelligence.

# Nexus Intelligence 🚀
### AI-Powered Stealth Engine for SaaS Market Monitoring

Nexus Intelligence is an advanced **Systems Architecture** project designed to solve a critical business problem: automated, reliable competitor monitoring. 

While most scrapers are easily detected and blocked, Nexus uses **Stealth-grade automation** and **Generative AI** to extract structured pricing data from any SaaS landing page, regardless of its underlying code structure.

---

## 🛠 The Architecture
This project is built with a focus on **Separation of Concerns** and **Scalability**.



### **Technical Stack**
* **Frontend:** Next.js 15 (App Router) + Tailwind CSS + Shadcn/UI
* **Database:** Supabase (PostgreSQL)
* **Automation:** Playwright Stealth + Residential Proxies
* **Intelligence:** Gemini 1.5 Flash (AI Data Extraction)
* **State Management:** TanStack Query

---

## 🏗 System Design & Trade-offs
In building Nexus, I made several key architectural decisions:

1.  **AI-Driven Extraction vs. Selectors:** Traditional scrapers rely on CSS selectors (e.g., `.price-tag`). If the competitor changes their UI, the scraper breaks. Nexus sends raw HTML to **Gemini 1.5**, allowing the system to "understand" where the price is, making the engine **self-healing**.
2.  **Stealth Execution:** To bypass Cloudflare and other anti-bot measures, the system utilizes **Playwright Stealth** with rotated user agents and residential proxies to mimic human behavior.
3.  **Server-Side Security:** All scraping and AI logic is handled via **Next.js Server Actions** to ensure sensitive API keys and proxy credentials never reach the client-side.

---

## 📊 Database Schema
```mermaid
erDiagram
    COMPANIES ||--o{ PRICE_SNAPSHOTS : "tracks"
    COMPANIES ||--o{ FEATURE_LOGS : "monitors"
    COMPANIES {
        uuid id PK
        string name
        string homepage_url
        string industry
    }
    PRICE_SNAPSHOTS {
        uuid id PK
        uuid company_id FK
        float price_value
        string plan_name
        timestamp created_at
    }
