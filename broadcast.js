require('dotenv').config();
const { TwitterApi } = require('twitter-api-v2');
const { createClient } = require('@supabase/supabase-js');
const { chromium } = require('playwright'); 
const { getHighImpactEvents, generateSocialPayload } = require('./utils/intelligence');
const { generateGlobalInsights } = require('./utils/contentEngine');

// Initialize Clients
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const DISCORD_WEBHOOK = process.env.DISCORD_SURVEILLANCE_WEBHOOK;
const DASHBOARD_URL = "https://nexus-intelligence-six.vercel.app/"; 

async function takeSnapshot() {
  console.log("📸 Warmup: Generating visual evidence...");
  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1200, height: 630 });
    await page.goto(DASHBOARD_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const buffer = await page.screenshot({ type: 'png' });
    await browser.close();
    return buffer;
  } catch (err) {
    console.error("❌ Snapshot failed:", err.message);
    return null;
  }
}

async function runBroadcast() {
  console.log("🤖 Nexus Intel: Starting Multi-Tier Broadcast...");
  
  const today = new Date();
  const isMonday = today.getDay() === 1;

  // 1. Data Gathering
  const event = await getHighImpactEvents(supabase);
  const { data: history } = await supabase
    .from('price_history')
    .select('*')
    .order('detected_at', { ascending: false })
    .limit(20);

  // 2. AI Content Generation
  let deepInsights = null;
  if (history && history.length > 0) {
    try {
      deepInsights = await generateGlobalInsights(history);
      
      // Archive to the "Oracle" Table (Always happens for the public /reports page)
      await supabase.from('intelligence_reports').insert([{
        report_type: isMonday ? 'weekly' : 'daily_insight',
        content: deepInsights,
        created_at: today.toISOString()
      }]);
      console.log("💾 Intelligence archived to Oracle Archive.");
    } catch (e) { console.error("⚠️ AI Engine error:", e.message); }
  }

  if (!event && !deepInsights) return console.log("💤 No significant data today.");

  // 3. Prepare Visual Evidence (Warm up the link crawlers)
  await takeSnapshot();

  // 4. Prepare Social Payloads
  const eventPayload = event ? generateSocialPayload(event) : null;
  
  const xText = eventPayload 
    ? `${eventPayload.headline}\n\n${eventPayload.body}\n\nAnalysis: ${DASHBOARD_URL}reports\n${eventPayload.tags}`
    : `Nexus Intel: Market Pattern Detected\n\n${deepInsights?.market_insight}\n\nFull Oracle Report: ${DASHBOARD_URL}reports`;

  const linkedInHeadline = eventPayload ? eventPayload.headline : "📈 AI Infrastructure Intelligence Update";
  const linkedInText = `🚀 Nexus Intel Update\n\n${deepInsights?.market_insight || "Analyzing AI infrastructure shifts."}\n\nAutomated surveillance of the 2026 token economy. Built by Abeeb Beloved Salam.\n\nRead more: ${DASHBOARD_URL}reports\n\n#AIAutomation #SystemsArchitecture #NexusIntel`;

  const xIntent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(xText)}`;
  const linkedinIntent = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(DASHBOARD_URL + "reports")}`;

  // 5. Build Discord Command Center Message
  const discordMessage = {
    content: event ? "🚀 **NEXUS: FLASH INTELLIGENCE DETECTED**" : "📡 **NEXUS: DAILY SURVEILLANCE LOG**",
    embeds: []
  };

  // TIER 1: Daily Event/Insight (The "Discovery" Card)
  discordMessage.embeds.push({
    title: linkedInHeadline,
    description: eventPayload ? eventPayload.body : `**Daily Analyst Insight:** ${deepInsights?.market_insight}`,
    color: 3799235, 
    fields: [
      { name: "𝕏 (Twitter) Intent", value: `[Post to X Account](${xIntent})`, inline: true },
      { name: "💼 LinkedIn Intent", value: `[Share to LinkedIn](${linkedinIntent})`, inline: true },
      { name: "📋 LinkedIn Copy-Paste", value: `\`\`\`${linkedInText}\`\`\`` }
    ],
    footer: { text: "Nexus Surveillance | Built by Abeeb Beloved Salam" }
  });

  // TIER 2: Weekly Strategic Report (Only on Mondays)
  if (isMonday && deepInsights) {
    discordMessage.embeds.push({
      title: "🏛️ WEEKLY STRATEGIC ORACLE REPORT",
      description: `**Executive Summary:**\n${deepInsights.market_insight}\n\nThis high-level analysis has been archived to your public Oracle. Perfect for high-ticket client discovery.`,
      color: 10181046, 
      fields: [
        { name: "Platform", value: "LinkedIn /reports", inline: true },
        { name: "Target", value: "Strategic Contracts", inline: true },
        { name: "Action", value: `[View Full Oracle](${DASHBOARD_URL}reports)`, inline: false }
      ]
    });
  }

  // Send to Discord
  try {
    await fetch(DISCORD_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordMessage)
    });
    console.log("✅ Intelligence Package sent to Discord.");
  } catch (err) { console.error("❌ Discord delivery failed:", err.message); }

  // 6. Automated X Fallback
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
    } catch (e) { console.log("⚠️ X Auto-post skipped (Account probation)."); }
  }
}

runBroadcast();