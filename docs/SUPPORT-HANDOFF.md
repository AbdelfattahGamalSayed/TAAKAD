# Support handoff: demonstration and activation requirements

Status: **demonstration only**. The user confirmed there is no receiving-team agreement. No authority, partner, endpoint, callback commitment or service-level agreement is approved. Do not describe a community post or demo case as a police report.

## Official routes

Verified against official pages on 22 November 2026:

- [Aman FAQ](https://srv.adpolice.gov.ae/en/aman/Pages/QA.aspx): Aman receives security information, not formal criminal reports; the FAQ directs criminal reporting to police stations. Aman is not an emergency channel.
- [Abu Dhabi Police contacts](https://adpolice.gov.ae/en/ContactUs): call center 8003333, Aman 8002626, emergencies 999 (UAE).

Community offers these options to guests and signed-in users. Buttons open the phone or official website only after a tap. No report, contact data or prefilled message is attached. This verifies public contact routes, not a partnership or approval to integrate.

## Implemented demonstration

My reports offers a separate support preview, including for unpublished drafts. Public-post consent, AI consent and support consent are independent. Support consent starts unchecked and names **TAAKAD local demo support**, the purpose, exact summary, fictional contact and expiry. It is not consent to share with a future organization.

The backend accepts only a report ID, action, affirmative consent and `demo-handoff-v1` consent version. It fixes the recipient and contact (`demo-person@example.invalid`); arbitrary contacts, recipients and extra fields are rejected. No phone number, identity, private note or evidence enters the support view. No external delivery code exists. Real contact entry is intentionally unavailable while the recipient is unconfirmed.

The local support role can list consented case IDs/status/expiry, open one case, or close it. Opening exposes only the generated summary and fictional contact. The author sees actual demo state: available, opened, closed or revoked. Closed does not mean the real incident was resolved. Public feeds and moderator views do not expose support records.

Owner consent, staff opens/closes and revocation produce timestamped in-memory events (last 30). Revocation removes the contact and prevents further support access; withdrawing the report also revokes access. Earlier viewing cannot be undone. Report/session expiry (at most one hour) or server restart removes the case. Signing out loses the owner's session access but does not immediately erase an already-consented case; revoke before signing out if desired. A new consent after revocation starts a new demo event history.

## Local support access

Run `npm.cmd start`, then use a second terminal:

```powershell
node scripts/support-cases.mjs list
node scripts/support-cases.mjs open CASE_ID
node scripts/support-cases.mjs close CASE_ID
```

Only the locally provisioned support secret in ignored `.local/report-support.json`, plus the pairing secret, grants this role. A user's session and the moderation secret do not grant access. The support secret cannot moderate reports. It is never bundled into Expo or forwarded by Metro; use the CLI directly against localhost. Do not share secrets or case output. The local-machine owner can read these files: this is a trusted-development-machine demonstration, not production staff authentication.

## Private staff-access design for a real partnership (not implemented)

Use named staff accounts with organization identity verification and MFA, short sessions, timely offboarding and server-enforced roles. Intake staff receive minimal queue metadata; only staff assigned to a case may read its consented data. Moderators cannot browse contact details. Supervisors may reassign cases with a recorded reason. Deny by default and test cross-user, cross-organization and unassigned access.

Keep contact/evidence encrypted separately from public summaries. Record immutable recipient, purpose, approved payload, consent text/version/time and retention policy. Re-consent after any recipient or payload expansion. Record access, assignment, exports and status changes in tamper-resistant audit storage without duplicating sensitive content in logs. Disable bulk export by default. Support withdrawal, deletion and access requests under the agreed retention rules; explain any limits after delivery.

Delivery must use an agreed authenticated channel with minimal payload, idempotency, retries, receipt verification and failure handling. Distinguish queued, delivered, acknowledged and assigned using real evidence; never infer acknowledgement or a callback from a successful HTTP request or post. No production flag or environment switch currently bypasses this missing integration.

## Organizer confirmation gate — all outstanding

- [ ] Exact receiving organization, department and authorized owner; written acceptance of the use case.
- [ ] Whether the workflow is an information tip, assistance request or formal criminal report; correct legal/service route and eligibility.
- [ ] Accepted fields, identity/contact verification, evidence policy and whether anonymous referrals are allowed.
- [ ] Secure transport/API, staff provisioning/assignment, receipt semantics, response expectations, operating hours and escalation arrangements.
- [ ] Privacy responsibilities, lawful handling, recipient-specific consent wording, retention/deletion, withdrawal and incident response.
- [ ] Approved user wording/branding and explicit policy on whether anyone may promise a callback.
- [ ] Authorized synthetic end-to-end acceptance test, security review and operational sign-off before any real contact sharing.

No messages have been sent to organizers or authorities by this implementation. The team must obtain the agreement; a public FAQ cannot supply it.
