require('dotenv').config();
const { TwitterApi } = require('twitter-api-v2');
const { createClient } = require('@supabase/supabase-js');
const { getHighImpactEvents, generateSocialPayload } = require('./utils/intelligence');
const { generateGlobalInsights } = require('./utils/contentEngine'); // NEW: Trend Module

// Initialize Clients
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const DISCORD_WEBHOOK = process.env.DISCORD_SURVEILLANCE_WEBHOOK;
const DASHBOARD_URL = "https://nexus-intelligence-six.vercel.app/"; 

async function runBroadcast() {
  console.log("🤖 Nexus Intel: Starting Broadcast Sequence...");

  // 1. Fetch High Impact Event (Single Price Shift)
  const event = await getHighImpactEvents(supabase);
  
  // 2. Fetch History for Deep Trend Analysis (Last 20 changes)
  const { data: history } = await supabase
    .from('price_history')
    .select('*')
    .order('detected_at', { ascending: false })
    .limit(20);

  // 3. Generate the "Deep Story" via Content Engine
  let deepInsights = null;
  if (history && history.length > 0) {
    try {
      deepInsights = await generateGlobalInsights(history);
      console.log("🧠 Market Pattern Analysis complete.");
    } catch (e) {
      console.error("⚠️ AI Content Engine error:", e.message);
    }
  }

  if (!event && !deepInsights) {
    return console.log("💤 No significant data to broadcast today.");
  }

  // 4. Prepare Social Payloads
  const eventPayload = event ? generateSocialPayload(event) : null;
  const xText = eventPayload 
    ? `${eventPayload.headline}\n\n${eventPayload.body}\n\n${eventPayload.cta}\n${eventPayload.tags}`
    : `Nexus Intel: Analyzing market patterns...\n\n${deepInsights?.market_insight}\n\nCheck the live data: ${DASHBOARD_URL}`;

  // Intent URLs
  const xIntent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(xText)}`;
  const linkedinIntent = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(DASHBOARD_URL)}`;

  // 5. Build Discord Command Center Message
  const discordMessage = {
    content: "📡 **NEXUS INTEL: INTELLIGENCE BROADCAST READY**",
    embeds: [
      {
        title: eventPayload ? eventPayload.headline : "Market Pattern Analysis",
        description: eventPayload ? eventPayload.body : "No single event detected, but patterns found in history.",
        color: 3799235, // Nexus Blue
        fields: [
          { name: "𝕏 (Twitter) Intent", value: `[Post to X Account](${xIntent})`, inline: true },
          { name: "💼 LinkedIn Intent", value: `[Share Dashboard](${linkedinIntent})`, inline: true },
        ],
        footer: { text: "Built by Abeeb Beloved Salam | Systems Architect" }
      }
    ]
  };

  // Add the "Deep Insight" block if available
  if (deepInsights) {
    discordMessage.embeds.push({
      title: "🧠 AI Content Generation Module (JSON Output)",
      description: `**Market Insight:** ${deepInsights.market_insight}`,
      color: 10181046, // Purple
      fields: [
        { name: "Tweet Template", value: deepInsights.tweet_templates[0] || "N/A" },
        { name: "Weekly Report Markdown", value: `\`\`\`${deepInsights.weekly_report_markdown.substring(0, 500)}...\`\`\`` },
        { name: "Hiring CTA", value: deepInsights.call_to_action }
      ]
    });
  }

  // Send to Discord
  try {
    const response = await fetch(DISCORD_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordMessage)
    });
    
    if (response.ok) console.log("✅ Intelligence Package sent to Discord.");
    else console.error("❌ Discord Webhook failed.");
  } catch (err) {
    console.error("❌ Network error sending to Discord:", err.message);
  }

  // 6. Automated Fallback (X Only - Disabled if suspended)
  if (process.env.X_API_KEY && process.env.X_ACCOUNT_ACTIVE === 'true') {
    try {
      const twitterClient = new TwitterApi({
        appKey: process.env.X_API_KEY,
        appSecret: process.env.X_API_SECRET,
        accessToken: process.env.X_ACCESS_TOKEN,
        accessSecret: process.env.X_ACCESS_SECRET,
      });
      await twitterClient.v2.tweet(xText);
      console.log("🚀 Auto-tweet successfully broadcasted.");
    } catch (e) {
      console.log("⚠️ X Auto-post skipped (Account probation or error). Use manual intent.");
    }
  }
}

runBroadcast();