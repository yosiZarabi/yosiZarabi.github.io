# Zarabi & Co. — local website

A private, local-only design implementation based on the supplied Hebrew/English
DOCX. Nothing was connected to Azure DevOps, work repositories, analytics, a CMS,
or a hosting service. No Git repository was created.

At the user's subsequent request, a design-reference URL was viewed read-only
and the supplied shared brand kit was downloaded. The reference only exposed a
sign-in screen; its authenticated overview was not accessed. No account was
signed into and no remote files were changed. These are design inputs only;
the website never loads assets from either service.

## Run locally

Requires Node.js 22.12+ (or a supported later release).

```sh
cd /Users/ahimeircohen/projects/zarabi-law-website
npm install
npm run dev -- --port 5187
```

Open `http://127.0.0.1:5187/he` for Hebrew or `/en` for English. The server binds
only to the loopback interface, not the local network.

```sh
npm run build
npm test
npm run test:browser
```

Browser tests use the locally installed Google Chrome. They temporarily serve the
production build on port 5188, independently of the development preview on 5187.
Design screenshots are written to [previews/](./previews/).

## Uploading the source to GitHub

Create a private repository named `zarabi-law-website`. GitHub Free supports
private source repositories. If using the prepared `github-upload.zip`, extract
it first, then upload the contents of its `zarabi-law-website` folder to the
repository root. Do not upload the ZIP itself.

The source package includes the application, local brand assets and fonts,
dependency manifests, build configuration, tests, and asset-import scripts.
It excludes dependencies, build output, browser screenshots, test artifacts,
environment files, and the original brand archive. Never add passwords,
personal access tokens, or account screenshots.

This is source storage only, not a configured public deployment. There is no
GitHub Pages workflow or production domain configuration in this package.
GitHub Pages has restrictions on online-business hosting; review its
[official usage limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)
before selecting it for a commercial site. Choose and authorise the hosting
service separately, then complete the pre-launch checks below.

## Design plan and implementation

- **Official identity:** the provided palette uses blue `#24408C`, charcoal
  `#1B1E27`, and off-white `#F2F2F2`. Near-black backgrounds and accessible
  pale-blue/silver accents extend that palette. The original geometric logo
  appears in the header, footer, founder seal, decorative monograms and favicon.
- **Clean typography:** Heebo Variable for Hebrew; the supplied Poppins family
  for English. The original Poppins outlines are converted from OTF to local
  WOFF2 without changing their shapes. Its SIL Open Font License is retained.
  No serif fonts, external font APIs or font CDNs are used.
- **Immersive composition:** full-width night-blue hero, diffuse animated mesh
  lighting, a fine background grid, an original projected three-dimensional
  ribbon sculpture, translucent cards and a blur-backed sticky header.
- **Advanced native scrolling:** the sculpture responds to scroll and pointer
  position; a pinned statement progressively illuminates its words; contour
  outlines rotate with scroll; cards have pointer-following light and restrained
  3D tilt; the four-chapter approach section remains sticky on larger screens.
  There is no scroll hijacking, custom cursor or external motion library.
- **Motion discipline:** the hero includes an explicit pause/resume control.
  OS reduced motion always takes precedence, makes the sculpture static, shows
  all content immediately and removes the pinned statement's extra scroll
  distance. The canvas loop runs at no more than roughly 30 fps, caps pixel ratio
  at 1.5, and stops offscreen and in hidden tabs. Touch devices have no pointer
  tracking. If canvas is unavailable, a local CSS sculpture remains visible.
- **Other pages:** the original architectural illustration remains on About,
  now monochrome. It is conceptual, not a photograph of Toyota Tower.
- **Pages:** Home, About, Practice Areas (all seven with anchor navigation),
  Contact, and draft Privacy, Terms, and Accessibility pages. Hebrew and English
  have separate direct URLs and full RTL/LTR layouts. Page titles and meta
  descriptions come from the supplied brief.
- **Responsive:** mobile menu with keyboard focus management, tablet layouts,
  readable mobile forms, desktop and mobile tests.

## Supplied brand assets

The user provided the "Zarabi Branding 2nd part" kit. Its official horizontal
SVG is cropped to the actual artwork (no stretched proportions or redrawn logo),
and its existing dark, white and blue treatments are exported for the web.
The official symbol is also used to generate the favicon.

- [public/brand/](./public/brand/): cropped, local vector logo variants.
- [public/fonts/poppins/](./public/fonts/poppins/): licensed local webfonts.
- [src/brand-mark.json](./src/brand-mark.json): the original monogram geometry.
- [scripts/prepare_brand.py](./scripts/prepare_brand.py): reproducible local
  conversion from the downloaded source archive; requires Python `fonttools`
  and `brotli`, used in an isolated session environment.

```sh
python scripts/prepare_brand.py "/absolute/path/to/zarabi-brand-assets.zip"
```

No SharePoint sharing tokens or brand-source archive are included in the public
website. Brand-guideline photographs, print layouts, and social-media mockups
are not republished. The browser tests verify fonts, logo loading, animation
pause/resume, offscreen suspension, fallback rendering, scroll illumination,
pointer effects, responsiveness, accessibility and absence of external requests.

## Language selection — local and privacy-conscious

Opening `/` uses:

1. The user's manual `zarabi-language` preference, if stored.
2. An Israeli browser time zone (`Asia/Jerusalem`, `Asia/Tel_Aviv`, `Israel`) ->
   Hebrew; another non-UTC time zone -> English.
3. If the time zone is unavailable or UTC, the primary browser language; Hebrew
   or an Israeli locale -> Hebrew, other languages -> English.
4. No hints -> Hebrew.

Direct `/he/...` and `/en/...` URLs always take precedence. The language switch
preserves the page, practice anchor, and enquiry subject.

**This is not reliable country detection.** Time zones can differ from physical
location. No GPS permission, external IP lookup, or remote geolocation request is
made. If exact country-based routing is needed later, configure a trusted
hosting-provided country signal after explicit approval; always preserve the
manual override.

## Contact behavior — deliberately not a fake submission

- Telephone, email, and WhatsApp links use the details in the supplied document.
  WhatsApp contacts an external service **only if the visitor clicks it**.
- The form validates required fields, email, phone, subject, and privacy consent.
- Submitting the form prepares a reviewable email draft in memory; it does not
  send, persist, or post the enquiry anywhere. The visitor must explicitly open
  the draft and send it in their own email application.
- If no email application is configured, the preview is selectable and the
  recipient address is displayed. The page never claims an enquiry was received.
- The contact map is a clearly labelled local schematic illustration, not an
  external map embed.

## Source content and outstanding approval

[src/brief.json](./src/brief.json) contains the approved copy extracted locally.
The source DOCX was not copied into this project. The importer is deterministic:

```sh
python3 scripts/import_brief.py "/absolute/path/to/the-supplied-document.docx"
```

Before publication, the firm must confirm:

- The founding year: the Hebrew source contains an unfinished bracket around
  2022, so the year is intentionally omitted in both languages.
- Office hours and parking: source values were marked for confirmation.
  The site currently says meetings by appointment.
- A genuine founder portrait, any LinkedIn URL, and permission for client logos.
  The current founder section uses the official brand monogram, not a fabricated
  portrait; client sectors are text-only.
- Contact details, professional credentials and all translated copy.
- Final privacy/terms/accessibility policies. Current policies clearly describe
  this local prototype and are **drafts**, not legal or accessibility certification.

## Before any future launch

No launch or external integration is authorised or configured. If requested later:

1. Approve all copy, portrait assets, credentials, hours and legal notices.
2. Arrange an accessibility review with assistive-technology testing.
3. If actual form delivery is desired, add a secured backend, abuse protection,
   retention policy, and truthful delivery status; do not put mail credentials in
   frontend code.
4. Configure HTTPS, a real domain, server fallback for client-side routes, and
   prerendering/SSR for per-language SEO, canonical URLs, hreflang and a sitemap.
   Current title/description updates are client-side only.
5. Only then remove the intentional `noindex, nofollow` preview setting.

Dependencies are obtained through npm during local setup. Browsing the built
website itself requires no third-party requests. Automated tests do not activate
telephone, email, or WhatsApp links and never send an enquiry.
