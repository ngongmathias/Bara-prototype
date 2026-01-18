# Rewards System - Ideas & Possibilities

## Overview
A points-based rewards system to incentivize user engagement and activity on the platform.

---

## 1. EARNING POINTS - How Users Get Points

### Engagement Actions
- **Posting a listing**: 50 points
- **Liking a listing**: 2 points
- **Commenting on a listing**: 5 points
- **Sharing a listing**: 10 points
- **Reviewing a seller**: 15 points
- **Adding to favorites**: 3 points
- **Completing profile**: 100 points (one-time)
- **Uploading profile picture**: 25 points (one-time)
- **Verifying email**: 50 points (one-time)
- **Verifying phone**: 75 points (one-time)

### Transaction Actions
- **Making a purchase**: 1 point per $1 spent (or 10 points per $1)
- **Selling an item**: 5% of sale price in points
- **First purchase**: 200 points bonus (one-time)
- **First sale**: 300 points bonus (one-time)

### Social Actions
- **Referring a friend**: 500 points (when friend makes first purchase)
- **Following a seller**: 5 points
- **Being followed**: 3 points per follower

### Daily/Weekly Actions
- **Daily login**: 10 points
- **Weekly login streak (7 days)**: 100 points bonus
- **Monthly active user**: 500 points bonus

---

## 2. SPENDING POINTS - How Users Use Points

### Option A: Marketplace Discounts
- **100 points = $1 discount** on any purchase
- Users can apply points at checkout
- Maximum 50% of purchase can be paid with points
- **Pros**: Simple, universally useful, easy to understand
- **Cons**: Reduces seller revenue unless platform compensates

### Option B: Seller Opt-In Program
- Sellers can choose to accept points for their products
- Sellers set their own point conversion rate
- Platform badges for "Points Accepted" listings
- **Pros**: Seller control, no platform cost
- **Cons**: Inconsistent experience, may confuse users

### Option C: Platform Perks & Features
- **Premium listing (7 days)**: 1,000 points
- **Featured listing (3 days)**: 500 points
- **Boost listing to top**: 200 points
- **Remove ads**: 2,000 points/month
- **Custom profile badge**: 1,500 points
- **Priority customer support**: 3,000 points/month
- **Analytics dashboard**: 1,000 points/month
- **Pros**: No impact on marketplace, incentivizes engagement
- **Cons**: Only useful for active sellers/users

### Option D: Exclusive Deals & Auctions
- Platform creates "Points-Only" section
- Special deals from partner sellers
- Weekly/monthly auctions for premium items
- **Pros**: Creates excitement, drives engagement
- **Cons**: Requires partnerships, inventory management

### Option E: Tiered Membership System
- **Bronze (0-999 points)**: Standard features
- **Silver (1,000-4,999 points)**: 5% discount, priority support
- **Gold (5,000-9,999 points)**: 10% discount, featured badge, analytics
- **Platinum (10,000+ points)**: 15% discount, all perks, exclusive deals
- **Pros**: Gamification, status symbol, retention
- **Cons**: Complex to manage, may alienate new users

### Option F: Prize Drawings & Competitions
- **Monthly raffle**: 100 points = 1 entry
- **Top 10 earners**: Cash prizes or gift cards
- **Quarterly competitions**: Biggest spenders, most active, etc.
- **Pros**: Excitement, viral potential, low cost
- **Cons**: Gambling concerns, may not appeal to all

---

## 3. HYBRID APPROACHES - Combining Multiple Options

### Recommended Hybrid Model
**Earning**: All engagement + transaction actions  
**Spending**:
- 50% Platform perks (listings, features, badges)
- 30% Marketplace discounts (capped at 25% of purchase)
- 20% Monthly prize drawings

**Why this works**:
- Multiple ways to use points = broader appeal
- Platform perks don't hurt seller revenue
- Discounts are capped to protect sellers
- Prizes create excitement and virality

---

## 4. TECHNICAL CONSIDERATIONS

### Database Schema Additions
```sql
-- Points transactions table
CREATE TABLE points_transactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  points INTEGER,
  action_type VARCHAR(50), -- 'earn' or 'spend'
  source VARCHAR(100), -- 'listing_posted', 'purchase', 'discount_used', etc.
  reference_id UUID, -- ID of related listing, purchase, etc.
  created_at TIMESTAMP
);

-- User points balance (cached)
ALTER TABLE users ADD COLUMN points_balance INTEGER DEFAULT 0;

-- Points settings for sellers
CREATE TABLE seller_points_settings (
  id UUID PRIMARY KEY,
  seller_id UUID REFERENCES users(id),
  accepts_points BOOLEAN DEFAULT false,
  points_per_dollar INTEGER, -- e.g., 100 points = $1
  max_points_percentage INTEGER DEFAULT 50 -- max % of price payable in points
);
```

### UI Components Needed
- Points balance display in navbar/profile
- Points history page (transactions log)
- Points redemption interface at checkout
- Seller settings for points acceptance
- Leaderboard page (top earners)
- Rewards catalog (what points can buy)

### Business Logic
- Point expiration? (e.g., expire after 1 year of inactivity)
- Anti-fraud measures (prevent point farming)
- Point transfer between users? (probably no)
- Refund policy (return points if purchase refunded?)

---

## 5. MONETIZATION OPPORTUNITIES

### How Platform Makes Money from Rewards
1. **Increased engagement** → More transactions → More fees
2. **Premium point packages**: Sell points directly ($10 = 1,000 points)
3. **Sponsored points**: Advertisers pay to give users points
4. **Data insights**: Reward behavior analytics for sellers (paid feature)
5. **Reduced refunds**: Points create sunk cost, reduce churn

---

## 6. COMPETITIVE ANALYSIS

### What Others Do
- **eBay**: Bucks program (1% back on purchases)
- **Amazon**: Prime points (5% back for Prime members)
- **Etsy**: No points, but seller rewards program
- **Facebook Marketplace**: No rewards system
- **Airbnb**: Travel credits, referral bonuses

### Our Differentiation
- **Community-focused**: Reward engagement, not just purchases
- **Seller participation**: Sellers can opt-in to accept points
- **Gamification**: Leaderboards, badges, tiers
- **Local focus**: Points for local pickups, community events

---

## 7. IMPLEMENTATION PHASES

### Phase 1: MVP (Month 1-2)
- Basic point earning (posting, purchasing, reviewing)
- Simple point balance display
- Platform perks redemption (featured listings, boosts)
- Points history page

### Phase 2: Marketplace Integration (Month 3-4)
- Checkout discount with points
- Seller opt-in program
- Points acceptance badges
- Refund/return point handling

### Phase 3: Gamification (Month 5-6)
- Tiered membership system
- Leaderboards
- Badges and achievements
- Monthly competitions

### Phase 4: Advanced Features (Month 7+)
- Points-only marketplace section
- Partner deals and exclusives
- Sponsored points from advertisers
- Mobile app push notifications for point milestones

---

## 8. RISKS & MITIGATION

### Potential Issues
1. **Point farming/abuse**: Users create fake accounts to earn points
   - **Solution**: Require verified email/phone, limit points per IP, manual review of suspicious activity

2. **Seller revenue loss**: Discounts reduce seller income
   - **Solution**: Cap point discounts at 25%, platform subsidizes some discounts, or only allow on platform fees

3. **Complexity**: Too many rules confuse users
   - **Solution**: Start simple (Phase 1), add features gradually, clear documentation

4. **Liability**: Points have perceived monetary value
   - **Solution**: Legal terms stating points have no cash value, cannot be transferred, expire after inactivity

5. **Cost**: Platform pays for discounts/prizes
   - **Solution**: Fund from increased transaction fees, sell point packages, sponsored points

---

## 9. SUCCESS METRICS

### KPIs to Track
- **Engagement rate**: % increase in likes, comments, shares
- **Retention**: % of users returning weekly/monthly
- **Transaction volume**: % increase in purchases
- **Average order value**: Do points increase spending?
- **Referrals**: How many new users from referral program?
- **Point redemption rate**: What % of earned points are spent?
- **User satisfaction**: Survey scores, NPS

---

## 10. RECOMMENDED STARTING APPROACH

### For Team Discussion
**I recommend starting with Option C (Platform Perks) + Option F (Prize Drawings)**

**Why?**
1. **Low risk**: Doesn't impact seller revenue
2. **High engagement**: Perks incentivize active participation
3. **Excitement**: Monthly prizes create buzz
4. **Scalable**: Easy to add marketplace discounts later
5. **Profitable**: Perks cost platform little (digital goods)

**Initial Point Values**:
- Post listing: 50 points
- Make purchase: 10 points per $1
- Review seller: 15 points
- Daily login: 10 points
- Refer friend: 500 points

**Initial Redemption Options**:
- Featured listing (3 days): 500 points
- Premium listing (7 days): 1,000 points
- Monthly raffle entry: 100 points
- Custom badge: 1,500 points

**Launch Strategy**:
1. Announce 2 weeks before launch
2. Give all existing users 500 "welcome bonus" points
3. First month: Double points on all actions
4. Monthly newsletter highlighting top earners
5. Quarterly review and adjust point values based on data

---

## Questions for Team Discussion

1. What's our primary goal? (Engagement, retention, revenue, or all?)
2. What's our budget for rewards/prizes?
3. Should points expire? If yes, after how long?
4. Do we want tiered membership or keep it simple?
5. Should sellers be able to accept points? (Opt-in or mandatory?)
6. What legal/compliance issues do we need to consider?
7. How do we prevent abuse and fraud?
8. What's our timeline for launch?
9. How will we market the rewards program?
10. What happens to points if a user is banned?

---

## Next Steps

1. **Team meeting**: Discuss this document, gather feedback
2. **Legal review**: Ensure compliance with local laws
3. **User survey**: Ask current users what rewards they'd want
4. **Competitive research**: Deep dive into what works for others
5. **Technical planning**: Database schema, API endpoints, UI mockups
6. **Pilot program**: Test with 100 users before full launch
7. **Marketing plan**: How to announce and promote the program

---

*Document created: January 2026*  
*For internal team discussion only*
