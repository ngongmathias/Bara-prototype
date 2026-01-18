# Payment Methods Setup Guide - Office Phase

## Current State Analysis

### What We Have Now
Based on the codebase, the current payment integration status:

**✅ Implemented:**
- Basic payment flow structure
- Checkout pages and UI
- Order creation system

**❌ Not Implemented:**
- No actual payment gateway integration
- No API connections to payment providers
- No transaction processing
- No payment confirmation system

---

## Payment Methods Needed for Office Phase

### Priority by Market

**Rwanda (Primary Market)**
1. Mobile Money - MTN MoMo
2. Mobile Money - Airtel Money
3. Credit/Debit Cards (Visa, Mastercard)
4. Bank Transfer

**East Africa Expansion (Future)**
1. M-Pesa (Kenya, Tanzania)
2. MTN Mobile Money (Uganda)
3. Airtel Money (Kenya, Uganda, Tanzania)
4. Tigopesa (Tanzania)

---

## 1. MOBILE MONEY - RWANDA

### MTN Mobile Money (MoMo)

#### What You Need (Company Side):
1. **Business Registration**
   - Registered company in Rwanda (RDB certificate)
   - Tax Identification Number (TIN)
   - Business bank account

2. **MTN MoMo Merchant Account**
   - Visit MTN Rwanda office or apply online
   - Documents needed:
     - Company registration certificate
     - TIN certificate
     - ID of company director
     - Business bank account details
     - Business plan/description
   - Application fee: ~RWF 50,000 (one-time)
   - Monthly fee: ~RWF 10,000

3. **API Access**
   - After merchant account approval, request API credentials
   - MTN provides:
     - API Key
     - API Secret
     - Merchant Code
     - Callback URL setup
   - Technical documentation provided by MTN

4. **Transaction Fees**
   - Typically 1-3% per transaction
   - Negotiable based on volume
   - Settlement: T+1 (next business day)

#### How to Apply:
```
Step 1: Visit MTN Rwanda Business Center
        - Kigali: MTN Tower, Boulevard de la Revolution
        - Or call: +250 788 183 000

Step 2: Submit application with documents
        - Processing time: 2-4 weeks

Step 3: Sign merchant agreement
        - Review terms, fees, settlement period

Step 4: Receive API credentials
        - Technical team gets sandbox access first
        - Test integration
        - Go live after approval

Step 5: Integration & testing
        - Use MTN MoMo API documentation
        - Implement payment flow
        - Test with sandbox
        - Submit for production approval
```

#### Contact Information:
- **MTN Rwanda Business**: business@mtn.co.rw
- **Phone**: +250 788 183 000
- **Website**: https://www.mtn.co.rw/business/mobile-money/

---

### Airtel Money (Rwanda)

#### What You Need (Company Side):
1. **Business Registration** (same as MTN)
   - Registered company
   - TIN
   - Business bank account

2. **Airtel Money Merchant Account**
   - Visit Airtel Rwanda office
   - Documents needed:
     - Company registration
     - TIN certificate
     - Director's ID
     - Bank account details
   - Application fee: ~RWF 30,000
   - Monthly fee: ~RWF 8,000

3. **API Access**
   - Request after merchant approval
   - Airtel provides:
     - API credentials
     - Merchant ID
     - Technical documentation

4. **Transaction Fees**
   - 1-2.5% per transaction
   - Settlement: T+1

#### How to Apply:
```
Step 1: Visit Airtel Rwanda Office
        - Kigali: Airtel House, KN 4 Ave
        - Or call: +250 788 100 100

Step 2: Submit merchant application
        - Processing: 1-3 weeks

Step 3: Receive API credentials
        - Sandbox for testing
        - Production after approval

Step 4: Integration
        - Use Airtel Money API
        - Test and go live
```

#### Contact Information:
- **Airtel Rwanda Business**: business@rw.airtel.com
- **Phone**: +250 788 100 100
- **Website**: https://www.airtel.co.rw/business

---

## 2. CREDIT/DEBIT CARDS (VISA, MASTERCARD)

### Option A: Payment Gateway Aggregators (RECOMMENDED)

These companies handle multiple payment methods including cards, mobile money, and bank transfers.

#### **Flutterwave** (Most Popular in Africa)

**What You Need:**
1. **Business Registration**
   - Registered company
   - TIN
   - Business bank account
   - Website/app

2. **Flutterwave Account**
   - Sign up at https://flutterwave.com
   - Submit business documents
   - Verification: 1-3 days
   - No setup fees

3. **What You Get:**
   - Visa/Mastercard processing
   - Mobile Money (MTN, Airtel, M-Pesa)
   - Bank transfers
   - Single API for all methods
   - Dashboard for transactions
   - Settlement to your bank account

4. **Fees:**
   - Cards: 3.8% per transaction
   - Mobile Money: 1.4% per transaction
   - No monthly fees
   - Settlement: T+1 to T+3

**How to Apply:**
```
Step 1: Sign up at https://dashboard.flutterwave.com/signup
        - Use company email
        - Verify email

Step 2: Complete business profile
        - Upload documents (RDB cert, TIN, ID)
        - Add bank account for settlements
        - Describe business

Step 3: Get API keys
        - Test keys (sandbox) immediately
        - Live keys after verification (1-3 days)

Step 4: Integration
        - Use Flutterwave API/SDK
        - Test in sandbox
        - Go live with production keys
```

**Contact:**
- **Email**: hi@flutterwave.com
- **Rwanda Support**: +250 788 190 000
- **Website**: https://flutterwave.com

---

#### **Paystack** (Alternative)

**What You Need:**
1. Same business requirements as Flutterwave
2. Sign up at https://paystack.com
3. Verification: 1-2 days

**What You Get:**
- Visa/Mastercard
- Mobile Money
- Bank transfers
- Single API

**Fees:**
- Cards: 3.9% per transaction
- Mobile Money: 1.5%
- No setup or monthly fees

**How to Apply:**
```
Step 1: Sign up at https://dashboard.paystack.com/signup
Step 2: Submit business documents
Step 3: Get API keys (test & live)
Step 4: Integrate using Paystack API
```

**Contact:**
- **Email**: support@paystack.com
- **Website**: https://paystack.com

---

#### **DPO Group** (Local Option)

**What You Need:**
1. Business registration documents
2. Apply through their website
3. More traditional, may require in-person meetings

**What You Get:**
- Cards, mobile money, bank transfers
- Strong presence in East Africa

**Fees:**
- Setup fee: ~$500
- Monthly fee: ~$50
- Transaction: 2.5-3.5%

**Contact:**
- **Rwanda Office**: info@dpogroup.com
- **Phone**: +250 788 383 000
- **Website**: https://www.dpogroup.com

---

### Option B: Direct Bank Integration (NOT RECOMMENDED)

**Why Not Recommended:**
- Requires individual contracts with each bank
- Complex compliance requirements
- High setup costs ($5,000+)
- Long approval process (3-6 months)
- Only works with that specific bank
- Better for very large enterprises

---

## 3. M-PESA (Kenya, Tanzania - Future Expansion)

### Safaricom M-Pesa (Kenya)

**What You Need:**
1. **Registered business in Kenya**
   - Certificate of Incorporation
   - KRA PIN certificate
   - Kenyan bank account

2. **M-Pesa Paybill/Till Number**
   - Apply through Safaricom
   - Documents: Business cert, KRA PIN, ID
   - Fee: KES 2,500 setup
   - Monthly: KES 500

3. **M-Pesa API (Daraja API)**
   - Apply at https://developer.safaricom.co.ke
   - Get API credentials
   - Free to use

**Fees:**
- 0.5-1.5% per transaction
- Settlement: T+1

**How to Apply:**
```
Step 1: Get Paybill number from Safaricom
        - Visit Safaricom shop or apply online
        
Step 2: Register on Daraja Portal
        - https://developer.safaricom.co.ke
        
Step 3: Create app and get credentials
        - Consumer Key
        - Consumer Secret
        
Step 4: Integrate M-Pesa API
        - Use STK Push for payments
        - Test in sandbox
        - Go live
```

**Contact:**
- **Safaricom Business**: business@safaricom.co.ke
- **Phone**: +254 722 002 002
- **Daraja Support**: apisupport@safaricom.co.ke

---

## 4. RECOMMENDED APPROACH FOR OFFICE PHASE

### Phase 1: Rwanda Launch (NOW)

**Use Flutterwave (All-in-One Solution)**

**Why Flutterwave:**
✅ Single integration for all payment methods
✅ No setup fees
✅ Fast approval (1-3 days)
✅ Handles MTN MoMo, Airtel Money, Cards
✅ Easy API integration
✅ Good documentation
✅ Reliable support
✅ Trusted by major African companies

**What You Need to Do:**

1. **Company Setup (1 week)**
   - Ensure company is registered in Rwanda
   - Get TIN certificate
   - Open business bank account (if not done)
   - Prepare documents

2. **Flutterwave Application (3 days)**
   - Sign up at Flutterwave
   - Upload documents
   - Add bank account
   - Get verified

3. **Development Integration (2 weeks)**
   - Get API keys
   - Integrate Flutterwave SDK
   - Implement payment flow
   - Test in sandbox
   - Go live

4. **Testing (1 week)**
   - Test all payment methods
   - Test refunds
   - Test edge cases
   - User acceptance testing

**Total Time: ~1 month**

---

### Phase 2: East Africa Expansion (LATER)

**Flutterwave Already Covers:**
- Kenya: M-Pesa, Cards, Bank
- Uganda: MTN, Airtel, Cards
- Tanzania: M-Pesa, Tigopesa, Cards

**Additional Setup:**
- Register business in each country (if required)
- Add local bank accounts for settlements
- Enable countries in Flutterwave dashboard
- Test local payment methods

---

## 5. WHAT YOU NEED - CHECKLIST

### Legal/Business Requirements

**✅ Must Have:**
- [ ] Registered company in Rwanda (RDB certificate)
- [ ] Tax Identification Number (TIN)
- [ ] Business bank account
- [ ] Company director's ID
- [ ] Business description/plan

**📄 Documents to Prepare:**
- [ ] Certificate of Incorporation
- [ ] TIN Certificate
- [ ] Bank account statement (recent)
- [ ] Director's National ID
- [ ] Proof of business address
- [ ] Website/app screenshots

---

### Financial Requirements

**Initial Costs (Flutterwave - Recommended):**
- Setup fee: $0
- Monthly fee: $0
- Transaction fees: 3.8% (cards), 1.4% (mobile money)
- Minimum balance: None

**Alternative (Direct MoMo):**
- MTN MoMo setup: RWF 50,000
- MTN MoMo monthly: RWF 10,000
- Airtel Money setup: RWF 30,000
- Airtel Money monthly: RWF 8,000
- Transaction fees: 1-3%

**Recommendation:** Start with Flutterwave (no upfront costs)

---

### Technical Requirements (Development Side)

**For Flutterwave Integration:**
- [ ] Flutterwave account and API keys
- [ ] Backend API to handle payments
- [ ] Webhook endpoint for payment confirmations
- [ ] Database schema for transactions
- [ ] Frontend payment UI
- [ ] Testing environment

**Development Time:**
- Backend integration: 1 week
- Frontend UI: 3 days
- Testing: 1 week
- **Total: 2-3 weeks**

---

## 6. STEP-BY-STEP ACTION PLAN

### Week 1: Business Setup
**Day 1-2:**
- [ ] Verify company registration is complete
- [ ] Get TIN certificate (if not done)
- [ ] Open business bank account (if needed)

**Day 3-5:**
- [ ] Gather all required documents
- [ ] Scan/digitize documents
- [ ] Prepare business description

### Week 2: Flutterwave Application
**Day 1:**
- [ ] Sign up at https://flutterwave.com
- [ ] Create business account
- [ ] Verify email

**Day 2-3:**
- [ ] Upload all documents
- [ ] Add bank account details
- [ ] Submit for verification

**Day 4-5:**
- [ ] Wait for approval (usually 1-3 days)
- [ ] Get API keys (test & live)
- [ ] Review documentation

### Week 3-4: Development Integration
**Week 3:**
- [ ] Install Flutterwave SDK
- [ ] Implement payment initiation
- [ ] Create payment confirmation flow
- [ ] Set up webhooks
- [ ] Test in sandbox

**Week 4:**
- [ ] Complete frontend UI
- [ ] Test all payment methods
- [ ] Test refund flow
- [ ] Security review
- [ ] User acceptance testing

### Week 5: Go Live
**Day 1-2:**
- [ ] Switch to production API keys
- [ ] Final testing with real small amounts
- [ ] Monitor first transactions

**Day 3-5:**
- [ ] Soft launch to limited users
- [ ] Monitor for issues
- [ ] Collect feedback

**Day 6-7:**
- [ ] Full public launch
- [ ] Marketing announcement
- [ ] Customer support ready

---

## 7. COSTS BREAKDOWN

### Option A: Flutterwave (RECOMMENDED)

**Setup Costs:**
- Application: $0
- Integration: $0
- Testing: $0
- **Total: $0**

**Monthly Costs:**
- Platform fee: $0
- Maintenance: $0
- **Total: $0**

**Transaction Costs:**
- Cards (Visa/Mastercard): 3.8% per transaction
- Mobile Money (MTN/Airtel): 1.4% per transaction
- Example: $100 sale = $3.80 fee (cards) or $1.40 fee (mobile money)

**Annual Cost Estimate (based on volume):**
- 100 transactions/month @ $50 avg = $5,000/month volume
- Cards (50%): $2,500 × 3.8% = $95/month
- Mobile Money (50%): $2,500 × 1.4% = $35/month
- **Total: ~$130/month or $1,560/year**

---

### Option B: Direct Mobile Money Integration

**Setup Costs:**
- MTN MoMo: RWF 50,000 (~$40)
- Airtel Money: RWF 30,000 (~$25)
- Development: $0 (internal)
- **Total: ~$65**

**Monthly Costs:**
- MTN MoMo: RWF 10,000 (~$8)
- Airtel Money: RWF 8,000 (~$6)
- **Total: ~$14/month or $168/year**

**Transaction Costs:**
- 1-3% per transaction
- Example: $100 sale = $1-3 fee

**Annual Cost Estimate:**
- Monthly fees: $168/year
- Transaction fees: ~$1,200/year (2% avg)
- **Total: ~$1,368/year**

**BUT:**
- No card payments
- No international expansion
- More complex integration
- Multiple APIs to maintain

---

## 8. FINAL RECOMMENDATION

### ✅ START WITH FLUTTERWAVE

**Reasons:**
1. **Zero upfront cost** - No risk to try
2. **Fast setup** - Live in 1-3 days
3. **All payment methods** - Cards + Mobile Money
4. **Single API** - Easy integration
5. **Scalable** - Works across Africa
6. **Reliable** - Trusted by thousands of businesses
7. **Good support** - Responsive team

**Next Steps:**
1. **This Week**: Gather documents, sign up for Flutterwave
2. **Next Week**: Get verified, receive API keys
3. **Week 3-4**: Development team integrates
4. **Week 5**: Go live!

---

## 9. CONTACTS & RESOURCES

### Flutterwave
- **Website**: https://flutterwave.com
- **Signup**: https://dashboard.flutterwave.com/signup
- **Docs**: https://developer.flutterwave.com
- **Email**: hi@flutterwave.com
- **Rwanda**: +250 788 190 000

### MTN Rwanda (Backup/Future)
- **Email**: business@mtn.co.rw
- **Phone**: +250 788 183 000
- **Website**: https://www.mtn.co.rw/business

### Airtel Rwanda (Backup/Future)
- **Email**: business@rw.airtel.com
- **Phone**: +250 788 100 100
- **Website**: https://www.airtel.co.rw/business

### Rwanda Development Board (RDB)
- **For company registration**: https://rdb.rw
- **Phone**: +250 252 580 420

---

## 10. FREQUENTLY ASKED QUESTIONS

**Q: Do we need a bank account for each payment method?**
A: No, with Flutterwave you only need ONE business bank account. All payments (cards, mobile money) settle to that account.

**Q: How long does money take to reach our account?**
A: T+1 to T+3 (1-3 business days after transaction)

**Q: Can we refund customers?**
A: Yes, Flutterwave supports refunds through their dashboard or API.

**Q: What if a payment fails?**
A: Customer is not charged. They can retry. You get notified via webhook.

**Q: Do we need PCI compliance for cards?**
A: No, Flutterwave is PCI-DSS compliant. They handle card data securely.

**Q: Can we test before going live?**
A: Yes, Flutterwave provides sandbox environment with test cards and mobile money.

**Q: What about fraud protection?**
A: Flutterwave has built-in fraud detection and 3D Secure for cards.

**Q: Can we accept international cards?**
A: Yes, Visa and Mastercard from anywhere in the world.

**Q: What currencies are supported?**
A: RWF (Rwandan Franc), USD, EUR, and 20+ other currencies.

**Q: Is there a minimum transaction amount?**
A: Usually RWF 100 (~$0.08), but check with Flutterwave.

---

*Document created: January 2026*  
*For Office Phase payment integration planning*
