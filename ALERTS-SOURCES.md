# UAE official alerts - source policy and operation

Reviewed: 19 November 2026

## Enabled publisher

**Abu Dhabi Media Office**, the Abu Dhabi Government communication office. This is the only publisher currently enabled. No commercial news outlet, news agency, social account, or search-engine result is ingested.

- Publisher identity: https://www.mediaoffice.abudhabi/en/abu-dhabi-media-office/
- English RSS permission and feed catalogue: https://www.mediaoffice.abudhabi/en/rss-news-feeds-abu-dhabi-media-office/
- Arabic RSS catalogue: https://www.mediaoffice.abudhabi/ar/rss-news-feeds-abu-dhabi-media-office/
- General terms: https://www.mediaoffice.abudhabi/en/terms-conditions/
- Robots: https://www.mediaoffice.abudhabi/robots.txt

The dedicated RSS guidance expressly lists aggregators, automation tools and "Custom APIs and scrapers" as intended users. The implementation relies on that specific RSS invitation, not on public accessibility or a blanket licence for the website. General terms restrict broader scraping/republication; the collector therefore never crawls article HTML, downloads images, follows article links automatically, or ingests other sections. Attribution, original article links and publication dates remain visible.

The catalogue offers these exact six feeds:

- https://www.mediaoffice.abudhabi/en/security/rss/
- https://www.mediaoffice.abudhabi/en/technology/rss/
- https://www.mediaoffice.abudhabi/en/community/rss/
- https://www.mediaoffice.abudhabi/ar/security/rss/
- https://www.mediaoffice.abudhabi/ar/technology/rss/
- https://www.mediaoffice.abudhabi/ar/community/rss/

No additional publisher is enabled merely because it has an open-data page. For example, TDRA's open-data policy was not treated as permission to crawl all TDRA news. The UAE Government portal's general copyright page is restrictive, so it was not added. Cyber Security Council pages are not enabled without a verified reuse/automation basis for their relevant endpoints.

## Collector controls

- Fixed URL allowlist; clients cannot submit a source URL.
- Honest TAAKADAlerts/1.0 user agent.
- robots.txt checked before each collection cycle; unavailable/challenge responses stop collection.
- A disallow removes affected cached entries from the public response.
- Sequential requests, minimum 500 ms spacing, and longer robots crawl-delay respected up to 60 seconds; longer requirements disable collection.
- Hourly refresh while the Node backend is running, and one startup collection.
- Single shared refresh, conditional ETag/Last-Modified requests, Retry-After backoff.
- No redirect following, logins, cookies, access-control bypasses or social sources.
- 12-second request timeout, bounded response sizes, XML validation, DTD/entity-declaration rejection.
- HTML removed and text rendered as plain text, with same-publisher HTTPS article links only.
- Stale results labelled during failures; cache expires after 24 hours. Cache is in memory, not a permanent news archive.

## Content behaviour

- English and Arabic source feeds are consumed separately; no invented translations.
- Cyber-safety keyword filtering, URL deduplication, newest publication first.
- Only source-provided titles and short excerpts are displayed. No AI-generated threat claims or severity scores.
- Items older than 30 days are marked Earlier update. Past-30-days filter available.
- Items over a year old, invalid dates and future publication dates are omitted.
- A successful empty feed does not mean there are no threats.
- Partial outages and failed checks are shown explicitly.
- Coverage is limited to what these RSS feeds currently publish. This is not a comprehensive UAE threat-intelligence service.

## Adding sources

Review the publisher's identity, explicit feed/API or reuse permission, scope, terms, and robots rules. Record the evidence and review date before extending SOURCES and the link/network allowlists. Recheck these rules before public deployment and when the publisher changes its policies. Do not assume an open-data licence applies to all website content.

## Run

Use npm.cmd start, then open the Alerts tab. Stopping the backend stops collection. The phone can refresh the displayed cache, but cannot force more-frequent upstream scraping.

Automated checks: npm.cmd test and npm.cmd run test:ui.
