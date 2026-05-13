# Unit Economics — SpendScan AI

## Cost Structure (Free Services Used)

| Service | Free Limit | Cost Above Free |
|---|---|---|
| Vercel | 100GB bandwidth/mo | $0.15/GB |
| MongoDB Atlas M0 | 512MB storage | $57/mo (M2) |
| Gemini API | 15 RPM, 1M tokens/day | $0.075/1M input tokens |
| Resend | 100 emails/day | $0.001/email |

**Cost per audit (free tier):** ~$0.003
- Gemini summary: ~300 tokens → $0.00002
- Email send: $0.001
- MongoDB write: ~$0.002 amortized

## Revenue Model

**Freemium → SaaS:**
- Free tier: 1 audit/month
- Pro ($49/mo): Unlimited audits + monitoring
- Team ($149/mo): Multi-user + alerts + API
- Enterprise (custom): SSO + dedicated support

**Target at 100 paid customers:**
- Blended ARPU: $99/mo
- MRR: $9,900
- Infrastructure: ~$500/mo
- **Gross Margin: ~95%**

## Customer Economics

| Metric | Target |
|---|---|
| CAC | <$50 (SEO-driven) |
| Avg. contract | 18 months |
| LTV | $1,782 (at $99/mo × 18) |
| LTV/CAC ratio | >35x |

## Savings as Marketing

Each audit finds avg. $847/yr in savings. At a 10% success fee model, that's $84.70/customer — significantly above $50 CAC. The product pays for itself in customer value.
