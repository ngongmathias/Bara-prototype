# Rwanda DPO (dpo.gov.rw) — Compliance Summary for Bara Afrika

**Date:** 2026-02-24

## What the DPO site provides (official actions/forms)
The Rwanda Data Protection and Privacy Office (DPO) site provides the following services and downloadable forms:

1. **Apply as a Data Controller**
- Service page: https://dpo.gov.rw/services/data-controller-certificate
- Application form (DOCX): https://dpo.gov.rw/fileadmin/DPO/Services/Data-Controller-Registration-Form.docx

2. **Apply as a Data Processor**
- Service page: https://dpo.gov.rw/services/data-processor-certificate
- Application form (DOCX): https://dpo.gov.rw/fileadmin/DPO/Services/Data-Processor-Registration-Form.docx

3. **Authorization to Transfer Outside Rwanda**
- Service page: https://dpo.gov.rw/services/authorization-to-transfer-outside-rwanda
- Application form (PDF): https://dpo.gov.rw/fileadmin/DPO/Services/application-form-for-external-transfer-authorization.pdf

4. **Authorization to Store Outside Rwanda**
- Service page: https://dpo.gov.rw/services/authorization-to-store-outside-rwanda
- Application form (PDF): https://dpo.gov.rw/fileadmin/DPO/Services/application-form-for-external-storage-authorization.pdf

5. **Report a Data Breach**
- Service page: https://dpo.gov.rw/services/report-a-data-breach
- Breach report form (PDF): https://dpo.gov.rw/fileadmin/DPO/Services/Personal-Data-Breach-Report-Form.pdf

6. **Standard Contractual Clauses (SCCs) for transferring personal data outside Rwanda**
- PDF: https://dpo.gov.rw/fileadmin/DPO/ComplianceTools/Standard%20Contractual%20Clauses%20for%20Transfer%20Personal%20Data%20Outside%20Rwanda_.pdf

## What Bara Afrika likely is (role classification)
- **Primary role:** **Data Controller** (you determine purposes/means of processing for accounts, profiles, reviews, events, marketplace, streams, analytics, marketing).
- **Secondary role (possible):** Data Processor only if you process personal data strictly on behalf of another organization as their instruction.

## What you likely must do (practical actions)
### A) Registration / certification
- Complete and submit the **Data Controller Registration Form** to the DPO.

### B) Cross-border storage / transfer authorization (important)
If any of the following are true:
- your primary database is hosted outside Rwanda
- your file storage (images, uploads) is hosted outside Rwanda
- your email/analytics vendors process personal data outside Rwanda

…then you likely need to apply for:
- **Authorization to Store Outside Rwanda**
- **Authorization to Transfer Outside Rwanda**

### C) Cross-border safeguards / contracts
- Use DPO’s **SCCs** (or equivalent contractual safeguards) for vendors/processors outside Rwanda.

### D) Breach handling
- Establish an internal breach-response process so you can report using the DPO breach form when required.

## DPO contact details (as published on service pages)
- **Phone:** +250 782 847 756
- **Toll-free:** 9080
- **Emails:**
  - dpp@dpo.gov.rw
  - databreach@dpo.gov.rw
  - complaint@dpo.gov.rw
  - registration@dpo.gov.rw
- **Address:** 21 KG 7 Ave, Kacyiru, A&P Building, Ground Floor, Kigali, Rwanda

## Gaps (what the DPO site does NOT decide for you)
The site provides forms and service entry points, but you still need to decide internally:
- your exact data inventory (what personal data you collect)
- lawful bases and purpose mapping
- retention periods
- vendor list + data locations
- whether your current architecture triggers cross-border storage/transfer authorization

## Next step recommendation
1. Confirm where your:
   - Supabase database region
   - Supabase storage region
   - email provider region
   - analytics/ads providers region
2. Then prepare:
   - Data Controller registration submission
   - cross-border authorization submissions (if applicable)
   - vendor SCC pack

---

*This is not legal advice; it’s an implementation-oriented summary of what’s available on the DPO site and how it maps to a SaaS/app like Bara Afrika.*
