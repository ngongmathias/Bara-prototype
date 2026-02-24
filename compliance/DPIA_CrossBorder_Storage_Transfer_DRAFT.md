# Data Protection Impact Assessment (DPIA) — Cross-Border Storage & Transfer (Draft)

**Organization:** [LEGAL ENTITY NAME] (Bara Afrika)

**Date:** [DATE]

**Owner:** [DPO / RESPONSIBLE PERSON]

## 1. Project / processing name
Cross-border storage and transfer of personal data for Bara Afrika platform operations.

## 2. Processing overview
### 2.1 Product description
Bara Afrika is a digital platform that provides:
- user accounts and profiles
- reviews
- events and ticketing workflows
- marketplace listings
- streams features (play history, likes, playlists)

### 2.2 Data subjects
- Users / account holders
- Businesses/merchants
- Event organizers and attendees
- Artists/creators
- Administrators

### 2.3 Personal data categories
- Identity/contact: name, email, phone number (where provided)
- Account/auth: platform IDs (e.g., Clerk user ID), login metadata
- User-generated content: reviews, listings, event submissions, photos
- Operational/technical: IP/logs (as applicable), timestamps, device/browser metadata (as applicable)

### 2.4 Special categories (sensitive personal data)
Not intentionally collected. If users include sensitive information inside free-text fields, it is treated as incidental user-generated content.

## 3. Purpose and lawful basis
### 3.1 Purpose
- Provide and operate the platform
- Authenticate users
- Store content and platform records
- Send transactional/service notifications
- Maintain security and prevent abuse

### 3.2 Lawful basis (high-level)
- Contract / service performance (core platform functions)
- Legitimate interests (security, abuse prevention, reliability)
- Consent (only where optional, e.g., marketing)

## 4. Necessity and proportionality
### 4.1 Necessity
Cross-border vendors are used to provide managed infrastructure and identity services necessary for secure operation.

### 4.2 Data minimization
- Only required account data is collected.
- Sensitive data is not requested.

### 4.3 Retention
- Account data retained while account is active.
- Logs retained for limited periods for security and debugging.
- Deletion requests handled according to policy and legal requirements.

## 5. Cross-border storage and transfers
### 5.1 Vendors / destinations
- **Supabase** (DB/Storage): Switzerland, Zurich region `eu-central-2`
- **Clerk** (Auth): Germany (primary), Ireland (backup)
- **Resend** (Email): [RESEND LOCATION — per legal docs]

### 5.2 Nature and frequency
- Continuous/recurring transfers during normal platform operation.

## 6. Risk assessment
### 6.1 Key risks
- Unauthorized access to personal data
- Accidental disclosure
- Vendor/subprocessor risk
- Cross-border access risk
- Availability and data loss

### 6.2 Severity/likelihood (qualitative)
- Unauthorized access: Medium severity / Medium likelihood (mitigated by access controls and encryption)
- Data loss: Medium severity / Low likelihood (mitigated by backups)
- Misconfiguration: Medium severity / Medium likelihood (mitigated by review and least privilege)

## 7. Measures to address risks
### 7.1 Organizational
- Assign privacy/security responsibility
- Incident response procedure and breach handling
- Vendor due diligence and contractual safeguards (DPA)

### 7.2 Technical
- TLS/HTTPS for in-transit encryption
- Access controls / least privilege
- Row Level Security (RLS) in Supabase where applicable
- Backup/DR strategy via managed providers
- Key management and rotation procedures

### 7.3 Contractual safeguards
- Supabase DPA attached
- Clerk and Resend contractual docs attached
- Rwanda DPO SCCs attached where applicable

## 8. Residual risk & conclusion
Residual risk is assessed as **acceptable** given the safeguards implemented.

**Decision:** Proceed with cross-border storage and transfer subject to obtaining supervisory authorization and maintaining ongoing compliance.

## 9. Approvals
- **DPO/Owner:** ____________________ Date: ________
- **Executive sign-off:** _____________ Date: ________
