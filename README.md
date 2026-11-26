# MANTRALO

พักสักนิด กลับมาฟังตัวเอง — a local frontend preview for chakra education, short daily practices, digital books and a 12-lesson course.

Start with [LLMS.txt](LLMS.txt) for the current product facts, implementation map and handoff constraints.

## Run the existing frontend

Install Node.js and Git LFS, then:

```sh
git clone https://github.com/wannapap189/MANTRALO.git
cd MANTRALO
git lfs pull
node server.mjs
```

Open http://127.0.0.1:8140/ . The server binds to localhost. The root site needs no dependency install or build step. Use `PORT` to select another port if 8140 is already running.

Large curated preview videos are tracked with Git LFS. Downloading a GitHub source ZIP without resolving LFS does not provide playable video bytes.

## What is included

- Buildless HTML/CSS/JavaScript frontend with book/course sales, free starter kit, digital-book offers, knowledge videos and reflection/result previews.
- Thai/English UI for home, book and course. Other routes and original learning materials remain Thai.
- After-purchase example flow at `post-purchase.html`, plus eight email drafts in `funnel/email-drafts/`.
- New React/TypeScript MagicPath design in [design/magicpath](design/magicpath/README.md). This is a separate three-page visual prototype, not an already-integrated replacement of the full site.
- Local browser-check scripts in `qa/` and approved commercial terms in `funnel/approved-terms.json`.

## Selected commercial terms

| Item | Current terms |
| --- | --- |
| Printed book | THB 290, including the complete digital edition of the same title |
| Shipping | THB 59 for standard domestic areas; one set totals THB 349 |
| Course | 12 lessons; 12 months from activation; proposed full price THB 2,900 |
| Upgrade | THB 2,610 additional only after the full eligible THB 290 credit is verified |

Shipping never counts as course credit. Full and upgrade learners receive the same duration. No automatic renewal. Actual media, final file formats and delivery service levels remain to be confirmed.

## Development checks

Start the local server. Set `MANTRALO_PLAYWRIGHT` to an installed Playwright module path with Chrome available, then run the relevant script:

```sh
node qa/browser-check.cjs
node qa/i18n-check.cjs
node qa/post-purchase-check.cjs
node qa/purchase-terms-check.cjs
```

Checks may write local reports/screenshots. Some older check-script names or fixture dates reflect the development history; see [delivery status](docs/DELIVERY-STATUS.md).

## Status

Private development handoff. No production deployment, payment, authentication, order creation, outbound email/LINE messages or paid-course access is activated by this repository. No GitHub Actions deployment or Pages configuration is included.

Paid book PDFs, full course media, customer/contact exports, account credentials and machine inventory scans are excluded. Included PDF files are public starter-kit drafts or the approved lesson sample, not the full paid books.

No open-source license is granted by this handoff. Keep existing font-license notices with the assets.
