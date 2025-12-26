# Moderation Protocol

**Status:** Active
**Owner:** Product/Ops
**Last Updated:** 2025-12-26
**Applies To:** DAB Platform (Web + Mobile)

## Overview
This document defines the moderation service level agreements (SLAs), escalation paths, and protocols for DAB. All moderators must follow this protocol when reviewing and actioning reports.

## Service Level Agreements (SLAs)

### Response Times
| Report Type | Initial Review | Resolution Target | Notes |
|------------|----------------|-------------------|-------|
| **P0 - Critical Safety** | 1 hour | 4 hours | Immediate threats, illegal activity, doxxing |
| **P1 - High Priority** | 4 hours | 24 hours | Harassment, hate speech, explicit content |
| **P2 - Medium Priority** | 24 hours | 72 hours | Spam, inappropriate behavior, policy violations |
| **P3 - Low Priority** | 72 hours | 7 days | Duplicate reports, unclear violations |

### Coverage Hours
- **Primary Coverage:** Monday-Friday, 9:00-18:00 CET (Munich time)
- **Emergency Contact:** safety@dab.app (24/7 email monitoring for P0 issues)
- **After Hours:** P0 issues escalated to on-call moderator via email

## Report Categories & Actions

### P0 - Critical Safety Issues
**Triggers:**
- Threats of violence or self-harm
- Illegal activity (drug sales, fraud, explicit illegal content)
- Doxxing (sharing personal info without consent)
- Child safety concerns (CSAM, grooming)

**Actions:**
1. Immediate account suspension (blocker)
2. Preserve evidence (screenshots, user data)
3. Notify local authorities if required by law
4. Email user within 24 hours with reason
5. Permanent ban (no appeal for CSAM or violence)

### P1 - High Priority Violations
**Triggers:**
- Harassment (repeated unwanted contact after block)
- Hate speech (discrimination based on protected characteristics)
- Sexual harassment or explicit unsolicited content
- Impersonation or catfishing

**Actions:**
1. Temporary suspension (24-48 hours) for first offense
2. Review user history for patterns
3. Email user with warning and policy link
4. Permanent ban for repeat offenders (3 strikes)
5. Add to watchlist for monitoring

### P2 - Medium Priority Violations
**Triggers:**
- Spam (copy-paste messages, promotional content)
- Misrepresentation (fake climbing ability, misleading profile)
- Inappropriate content (not explicit but violates guidelines)
- Minor policy violations (e.g., multiple accounts)

**Actions:**
1. Warning email to user
2. Content removal if applicable
3. 7-day suspension for repeat offenses
4. Require profile correction (e.g., remove fake photos)

### P3 - Low Priority
**Triggers:**
- Duplicate reports (same issue reported multiple times)
- Unclear or insufficient evidence
- Interpersonal disputes (not policy violations)
- False reports (misuse of report system)

**Actions:**
1. Review and close with notes
2. No action if no policy violation found
3. Educate reporter on proper use (if false report)
4. Monitor for patterns of abuse

## Escalation Path

### Level 1: Initial Review (Moderator)
1. Report received and auto-assigned to available moderator
2. Moderator reviews report, evidence, and user history
3. Categorizes as P0/P1/P2/P3
4. Takes initial action based on category (see above)
5. Updates report status to "reviewed" with notes

### Level 2: Complex Cases (Lead Moderator)
**Escalate when:**
- Unclear whether content violates policy
- High-profile user or viral content involved
- Legal implications (defamation, copyright, etc.)
- Conflicting reports (multiple users reporting each other)
- Requires permanent ban decision

**Lead Moderator Actions:**
1. Reviews moderator's initial assessment
2. Consults with Product/Legal if needed
3. Makes final decision on action
4. Emails user with detailed explanation
5. Updates moderation playbook if new edge case

### Level 3: Executive Review (Product Lead)
**Escalate when:**
- Press/media involved or risk of public incident
- Legal action threatened by user
- Requires policy change or clarification
- Platform-wide safety issue identified

**Product Lead Actions:**
1. Reviews full case context and precedent
2. Consults with Legal/PR teams if needed
3. Approves or overrides moderator decision
4. Communicates externally if required
5. Updates policy documents or protocol

## Moderation Tools & Access

### Database Queries (Current MVP Setup)
Moderators use SQL queries in Supabase to:
- View all reports: `SELECT * FROM reports WHERE status = 'pending' ORDER BY created_at DESC;`
- Update report status: `UPDATE reports SET status = 'resolved', moderation_notes = '...', moderator_id = '...', resolved_at = NOW() WHERE id = '...';`
- View user report history: `SELECT * FROM reports WHERE reported_user_id = '...' OR reporter_id = '...';`
- View blocked users: `SELECT * FROM blocks WHERE blocker_id = '...' OR blocked_id = '...';`

### Admin Panel (Phase 2 - To Be Built)
Future UI will include:
- Report queue dashboard
- User profile viewer with full history
- One-click actions (suspend, ban, warn)
- Email template editor
- Analytics (reports by type, resolution time)

## User Communication Templates

### Warning Email (P2 Violations)
```
Subject: DAB Community Guidelines Reminder

Hi [Username],

We've received a report about your recent activity on DAB. Specifically: [brief description].

This violates our Community Guidelines: [link to specific section].

Please review our guidelines and adjust your behavior. Continued violations may result in suspension or permanent removal from DAB.

If you believe this is a mistake, reply to this email with details.

Stay safe and keep climbing,
DAB Safety Team
```

### Suspension Email (P1 Violations)
```
Subject: DAB Account Temporarily Suspended

Hi [Username],

Your DAB account has been suspended for [duration] due to: [specific violation].

This behavior violates our [Community Guidelines/Safety Policy]: [link].

Your account will be reactivated on [date]. Further violations will result in permanent removal.

If you'd like to appeal this decision, reply to this email within 7 days.

Best,
DAB Safety Team
```

### Permanent Ban Email (P0 or Repeat P1)
```
Subject: DAB Account Permanently Removed

Hi [Username],

Your DAB account has been permanently removed due to: [specific violation].

This decision is final and cannot be appealed. You are prohibited from creating new accounts on DAB.

If you believe this is an error, contact us at safety@dab.app with evidence within 30 days.

DAB Safety Team
```

## Evidence Preservation

### Required for All P0/P1 Cases:
1. **Screenshots:** Full conversation thread or profile
2. **User Data:** Profile info, join date, activity summary
3. **Report Details:** Reporter ID, timestamp, description
4. **Message IDs:** Exact message_id from database
5. **Action Log:** What action was taken and when

### Storage:
- Store in `moderation_evidence/` folder (not in git repo)
- Use naming: `[report-id]_[user-id]_[date].png`
- Retain for 90 days minimum (legal requirement)
- Delete after retention period (GDPR compliance)

## Appeals Process

### User Can Appeal:
- P1 suspensions (within 7 days)
- P2 warnings (within 14 days)
- Profile/content removal (within 30 days)

### Cannot Appeal:
- P0 permanent bans (CSAM, violence, illegal activity)
- Repeat offender bans (3+ violations)

### Appeal Review:
1. User emails safety@dab.app with:
   - Report ID (from email)
   - Their side of the story
   - Any evidence supporting their case
2. Different moderator reviews (not original reviewer)
3. Decision within 7 days
4. Final decision communicated via email

## Reporting & Metrics

### Weekly Report (Sent to Product Lead)
- Total reports received (by category)
- Average resolution time (by priority)
- Actions taken (warnings, suspensions, bans)
- Appeals received and outcomes
- Trends or patterns identified

### Monthly Review
- Policy effectiveness assessment
- Moderator workload analysis
- User feedback on safety experience
- Recommendations for policy updates

## Training & Onboarding

### New Moderator Checklist:
- [ ] Read Community Guidelines and Safety Policy
- [ ] Review this Moderation Protocol
- [ ] Complete SQL training for report queries
- [ ] Shadow 5 report reviews with experienced moderator
- [ ] Review 10 past cases independently with feedback
- [ ] Granted moderator access in database

### Ongoing Training:
- Monthly case study review (complex or edge cases)
- Quarterly policy updates and refresher
- Annual re-certification

## Contact Information

- **Safety Email:** safety@dab.app
- **Moderator Slack:** #moderation-team (internal)
- **Legal Counsel:** [To be added]
- **Law Enforcement Liaison:** [To be added]

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-26 | Initial protocol created for MVP launch |

---

**Next Review Date:** 2026-03-26 (3 months after launch)
**Document Owner:** Product Lead
**Approved By:** [Pending]
