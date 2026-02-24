# DPO Submission Pack — Bara Afrika (Pre-filled drafts + checklist)

**Last updated:** 2026-02-24

This file gives you:
- Clear definitions of key terms (DPA, DR)
- Direct answers about audit logs & breach readiness
- Where to obtain hosting agreements
- Pre-filled content you can paste into DPO forms
- A complete checklist of documents to produce/download and email

---

## 1) Definitions

### DPA
**DPA = Data Processing Addendum / Data Processing Agreement.**

It’s the contract between you (the customer/data controller) and a vendor (processor) like **Supabase** describing:
- what data they process
- how they protect it
- sub-processors they use
- breach notification timelines

You already downloaded a Supabase DPA (and pasted key parts). That document is exactly what DPO expects as “contract/hosting agreement” evidence.

### DR
**DR = Disaster Recovery.**

This means backup/replication capability that lets a system recover after:
- data loss
- infrastructure failure
- cyber incidents

DPO forms ask whether you have **primary storage** and **DR storage**, and in which countries.

---

## 2) Do you have audit logs for admin actions?

### Conclusive answer
**Yes — but only for “admin management actions” (adding/removing admins, role changes), not for every admin action across the entire platform.**

Evidence in your repo:
- Migration creates an audit table: `admin_activity_log`
  - `supabase/migrations/20241211_create_admin_users_secure.sql`
- Guide explains it:
  - `ADMIN_SECURITY_SETUP_GUIDE.md` (mentions “Audit trail” and `admin_activity_log`)

### What is NOT implemented (yet)
There is **no universal platform-wide admin audit log** for actions like:
- approving/rejecting listings
- editing country info
- deleting events

If DPO asks for “audit logs”, you can truthfully say:
- admin-access management is logged (admin management module)
- other admin actions are restricted by access controls, and you can add a broader audit log later

---

## 3) “Breach playbook + DPO notification readiness” means

### Breach playbook
A simple internal document that tells you what to do if there is a personal data breach:
- who is responsible
- how to contain it
- how to investigate
- what to communicate
- how to document it

You already have a draft in repo:
- `compliance/BREACH_RESPONSE_PLAYBOOK_DRAFT.md`

### DPO notification readiness
This means you can quickly provide the required information to DPO using their breach form.
The DPO site provides:
- breach report form PDF (for reference): https://dpo.gov.rw/fileadmin/DPO/Services/Personal-Data-Breach-Report-Form.pdf

“Readiness” means you have:
- a contact person
- logs/records
- vendor contacts
- the ability to estimate affected data subjects

---

## 4) Where to get “Hosting agreement(s) with provider(s)”

DPO forms require contracts/agreements with providers.

### Supabase
- Use:
  - **Supabase DPA** (you downloaded: `Supabase+DPA+250314.pdf`)
  - **Supabase Terms** (download/print to PDF): https://supabase.com/terms

### Clerk
- Download/print to PDF:
  - Clerk Terms + privacy/data processing docs from Clerk dashboard/docs.
  - (If you have a DPA link in Clerk, use that.)

### Resend
- Download/print to PDF:
  - Resend Terms + privacy/DPA (from Resend docs/account/legal pages)

For DPO submission, it’s acceptable to:
- export these legal pages to PDF
- include DPAs when available

---

## 5) Conclusive technical facts (fill these in the forms)

### Data storage locations (confirmed)
- **Supabase primary database region:** `eu-central-2` (Central Europe — Zurich, Switzerland)
- **Supabase storage:** same project region (Zurich, Switzerland)
- **Clerk data location:** EU (Germany primary; Ireland backups) (per your provided Clerk info)

### Email sending provider (confirmed from code)
You are using **Resend** via a Supabase Edge Function:
- `supabase/functions/send-email/index.ts`
  - calls `https://api.resend.com/emails`
  - uses `RESEND_API_KEY`

### Third-party analytics SDKs
In a scan of the frontend repo, there is **no evidence of Google Analytics / GTM / Mixpanel / PostHog / Segment / Amplitude integration code**.
If you later add analytics, you must update the privacy policy and vendor list.

---

## 6) What to submit to DPO (the full checklist)

The DPO forms explicitly instruct you to:
- convert everything to PDF
- zip
- email to:
  - `registration@dpo.gov.rw`
  - `dpp@ncsa.gov.rw`
- subject: your organization name

### A) Data Controller registration (do first)
- Download the official form:
  - https://dpo.gov.rw/fileadmin/DPO/Services/Data-Controller-Registration-Form.docx

**Prepare & attach:**
- [ ] Completed controller registration form (PDF)
- [ ] (Optional but recommended) Privacy Policy + Terms (PDF)
- [ ] Vendor list + data locations (PDF)

### B) Authorization to STORE personal data outside Rwanda
**You must attach (as listed in the form):**
- [ ] Application letter to CEO of NCSA (PDF)
- [ ] Hosting agreement(s) with provider(s) (PDF)
  - Supabase DPA + Supabase terms
  - Clerk legal/DPA docs
  - Resend legal/DPA docs
- [ ] DPIA for hosting outside Rwanda (PDF)
- [ ] Any other supporting documents (PDF)

### C) Authorization to TRANSFER personal data outside Rwanda
**You must attach (as listed in the form):**
- [ ] Application letter to CEO of NCSA (PDF)
- [ ] Contracts for transfer with recipients (PDF)
  - Supabase DPA + terms
  - Clerk DPA/terms
  - Resend DPA/terms
- [ ] DPIA for transfer outside Rwanda (PDF)
- [ ] Data Flow Diagram (DFD) (PDF)
- [ ] Any other supporting documents (PDF)

### D) Recommended extra attachments (improves approval)
- [ ] “Security controls summary” (1–2 pages) (PDF)
- [ ] “Data retention summary” (1 page) (PDF)
- [ ] Breach response summary (PDF)

---

## 7)
### 7.1 STORE OUTSIDE RWANDA — Form Answers

#### Section 1 — Applicant Details
- **Organization Name:** [Bara Afrika legal entity name]
- **Registered as Controller/Processor/Both:** Controller (once registered) / If not yet registered: Not yet registered (registration submitted)
- **Type of organization:** Private
- **Sector:** Other — Technology / Digital platform
- **Address:** [legal address]
- **Phone:** [company phone]
- **Email:** [official compliance email]
- **Website:** [baraafrika.com]

**Data Protection Officer**
- **Name:** [your name]
- **Phone:** [your phone]
- **Email:** [your email]

#### Section 2 — Personal data to store outside Rwanda
**Category of data subjects → Personal data stored → Reasons → Dataset volume**
- **Users (account holders):** name, email, phone (if provided), profile image, location preference, Clerk user id → operate authentication + user accounts, secure managed cloud storage, availability, scalability, backups/DR → [projected year-1 count]
- **Businesses/sellers/organizers:** profile details, listings/events content, contact info they provide → provide marketplace/events services, storage reliability and security controls → [projected count]
- **General app activity:** play history, likes, preferences, logs (as applicable) → product functionality, security monitoring → [projected count]

#### Section 3 — Sensitive personal data
- Tick: **Not Applicable**

#### Section 4 — Hosting service providers
**Service Provider 1: Supabase**
- Destination country: **Switzerland**
- Primary storage: Switzerland (Zurich, `eu-central-2`)
- DR: Provided as per Supabase service configuration (see Supabase DPA)
- Type: Cloud hosting
- Third parties: See Supabase DPA sub-processors schedule
- Applicable laws: Swiss/EU data protection laws (as applicable)

**Service Provider 2: Clerk**
- Destination country: **Germany** (primary), **Ireland** (backup)
- Type: Cloud hosting
- Third parties: As per Clerk subprocessors/DPA
- Applicable laws: EU data protection laws

#### Section 5 — Protection measures
**Your measures (Bara Afrika):**
- role-based access controls for admin
- least privilege
- encryption in transit (TLS)
- secrets management
- incident response process

**Provider measures:**
- Supabase controls per DPA (encryption at rest, encrypted backups, least privilege access, audit trails, incident notification)
- Clerk controls per their compliance/security documentation

#### Supporting documents (attach)
- Application letter
- Hosting agreements (Supabase DPA/terms, Clerk docs, Resend docs)
- DPIA for hosting outside Rwanda
- Other supporting docs

---

### 7.2 TRANSFER OUTSIDE RWANDA — Form Answers

#### Section 2 — Personal data transferred
- **Data subjects:** users, businesses/sellers, event organizers/attendees
- **Personal data:** name, email, phone (if provided), profile image, UGC (reviews/listings/photos), usage and operational logs (as applicable)
- **Purpose:** authentication, service delivery (storage/hosting), transactional email notifications, security monitoring
- **Dataset volume:** [projected year-1 count]
- **Ground:** Authorization from supervisory authority + Necessity for performance of service contract

#### Section 3 — Sensitive data
- Tick: Not applicable

#### Section 4 — Recipients
- **Recipient 1:** Supabase — Switzerland — recurring/continuous — duration: while account active + retention
- **Recipient 2:** Clerk — Germany/Ireland — recurring/continuous — duration: while account active + retention
- **Recipient 3:** Resend — [country/region per provider docs] — recurring/continuous — duration: per email retention/logs

#### Section 5 — Protection
- Format: encrypted in transit (TLS), at rest encryption by providers
- Means: Integration/API
- Safeguards (you): access control, least privilege, RLS, key management, monitoring
- Safeguards (recipients): per DPA/terms/security docs

#### Supporting documents (attach)
- Application letter
- Contracts with recipients
- DPIA for transfer
- Data Flow Diagram (DFD)

---

## 8) Templates you should create (I recommend these exact filenames)

Create these PDFs to attach:
- `DPO_Application_Letter_Storage.pdf`
- `DPO_Application_Letter_Transfer.pdf`
- `DPIA_CrossBorder_Storage_Transfer.pdf`
- `DFD_BaraAfrika_DataFlow.pdf`
- `Security_Controls_Summary.pdf`
- `Vendor_Data_Location_Register.pdf`

---

## 9) Things you *must* fill in manually (minimal inputs)
I could not infer these from code:
- [Legal entity name]
- [Legal address]
- [Company phone]
- [Compliance email]
- [Named DPO/Responsible person]
- [Projected volumes]

