# VIIRL product-work boards — local concepts

Three runnable, review-only concepts for Gwen and Gregg. All records and owner roles are fictional. This is a public concept preview with fictional demo data, not a production portal or live integration.

## Public preview

[Open the prototypes](https://handgwenade.github.io/viirl-product-board-prototypes/) · [GitHub repository](https://github.com/handgwenade/viirl-product-board-prototypes)

GitHub Pages serves the root of the `codex/preview` branch. Push committed changes to that branch to update the preview. The repository and preview are public; keep all content fictional.

## View locally

Open a terminal in this extracted folder and run:

```sh
python3 -m http.server 5180 --bind 127.0.0.1
```

Then open http://127.0.0.1:5180/. No npm install is needed. Keep the terminal open while reviewing. Do not double-click index.html: browser modules need a local HTTP server.

Use the review links for pause, previous/next, interval and light/dark controls. TV links hide those controls. Press Escape to return to review, or Tab then Enter on the return link. The default rotation is 20 seconds. All content and fonts are included locally.

## Compare the concepts

| Concept | Strongest use | Tradeoff |
| --- | --- | --- |
| Team status board | A quick team-wide scan of active work and blockers. A wider active column and persistent blocked lane establish priority without a metric dashboard. | One item per lane is visible at once. Smaller lanes repeat their items while busier lanes cycle; counts describe all work, not just the current page. |
| Weekly delivery timeline | A delivery conversation: seven days, three workstreams, and numbered milestones linked to full visible work cards. The next delivery and blocked/overdue summary persist between pages. | It displays the current page's milestones, not every milestone at once. Reading the complete week requires a rotation; long titles get their own page. |
| Rotating product spotlight | Passive awareness of one workstream, with one large priority and up to two supporting items. It has the clearest focal point across a room. | Other workstreams are temporarily off-screen. Priority is a demo rule (blocked, then in progress, then upcoming, then done), not a validated business ranking. |

## Edit the demo

`data.mjs` is the single content source. It contains the eight work records, three workstream names, fixed reference date **October 14, 2026**, and week starting **October 12, 2026**. Owners are fictional role labels rather than employee names. Dates are ISO calendar dates; use `null` for missing dates or estimates. Hours are reported separately as spent and estimated total, with no completion percentage. A completed item's older due date is labeled Delivered rather than Overdue; this does not claim it was delivered on time.

Keep display copy short: tested titles reach 56 characters, expectations are short single sentences, and owner/workstream names match the provided compact role labels. Unbounded imported text is outside this concept's contract and needs editorial/validation rules before production. No text is deliberately truncated or reduced to fit. Timeline pages hold two short titles or one long title; spotlight pages hold three items, or two when that workstream contains a title longer than 40 characters. Additional items create additional pages rather than smaller text. Missing or out-of-week dates are named under the timeline for that page.

All boards use a fixed **1920 × 1080, 16:9** composition, scaled uniformly to fit the viewport. At **3840 × 2160** the composition is exactly 2×. Other aspect ratios are letterboxed. Essential content remains within a 5% safe inset; work facts and expectations use 32px type on the reference canvas. Ancillary labels use 22–30px. Inter and DM Mono are bundled with their licenses, so there are no runtime font-service requests.

Rotation changes the page directly without sliding, ticking, or fading. Reduced-motion preference starts paused, and switching that preference on pauses a running board. Review mode can explicitly resume it. Background tabs stop rotating. Changing the interval or manually moving resets the timer. Interval choices are session-local; the TV link carries the selected interval. A physical TV browser and remote still need testing.

## Design references and boundaries

The user brief is the composition reference for all three directions. The VIIRL 2.0 skill supplies the palette, Inter/DM Mono, rounded geometry, and semantic brand roles. The Refero tool was unavailable; its bundled typography and visual-QA craft references informed readable type, restrained hierarchy, and rendered verification. No external product screenshots or Gregg concepts were available or implied.

| Decision | Source and reason |
| --- | --- |
| Light status board, wider active lane | User brief: make active work dominant and keep blockers obvious. Lane words and the warning glyph accompany color. |
| Calendar above full delivery details | User brief: show dates by day without hiding hours or expectations behind interactions. |
| Dark hero, one workstream per slide | User brief and VIIRL 2.0 dark hero token: establish a distant-viewing focal point. |
| 32px essential facts, 5% inset, proportionate 4K | User's TV requirements; preserve hierarchy rather than squeeze density. |
| Local token snapshot and standalone entry | Review-only artifact with different TV geometry. Existing Portal primitives are for scrolling app pages; the TV shell does not alter those primitives, generated tokens, routes, or LWC parity references. |

The token snapshot in `style.css` names the VIIRL 2.0 colors and preserves their roles: blue for active work, labeled yellow for blockers, neutral text for quantities, and a solid green badge with white text for done. This is a scoped concept, not an additional production token source. A plain VIIRL text label is used, not a recreated logo.

## Verify

Run the included dependency-free logic checks with Node 22 or newer:

```sh
node --test tests/logic.test.mjs
```

Screenshots and JSON results from the original browser checks are included in `screenshots/`. The browser verification covered both themes, all three concepts, 1080p/4K, long titles, missing values, excess items, and controls. Portal-specific build checks mentioned below were run in the original workspace, not this standalone package.

Real-TV checks still required: actual screen dimensions and viewing distance, ambient light/glare, overscan settings, browser scaling/font rendering, remote/keyboard access, and comfortable reading time. Browser captures cannot certify across-room legibility.

Verification on October 17, 2026: all 20 normal page/resolution combinations and six long-title/excess-item combinations passed the browser geometry checks. Rotation and review interactions passed; all three logic test groups passed. The repository build and design checks passed. Full-repository lint completed with zero errors and 28 warnings in existing Portal files. Final screenshots were visually inspected for each concept at both target resolutions. The geometry check initially caught footer overflow; those failures were corrected before this handoff.

## Decisions before production

- Obtain Gregg's prior concepts and work-list context; compare these concepts against them.
- Choose the preferred layout or a specific combination and decide what deserves the main-room screen.
- Confirm the actual TV size, resolution, mounting, viewing distance, and player/browser.
- Identify the authoritative source and mapping for each field: item title, workstream, owner, status, due date, hours spent, estimated total hours, and next expectation/acceptance condition.
- Define hours operationally: logged effort versus elapsed time, whose hours are included, estimate ownership, rounding, and how estimate revisions are handled.
- Agree update cadence, stale-data treatment, and any rotation schedule.
- Assign content ownership, review responsibilities, and maintenance of the eventual display.

No production input above was assumed to build the demo.

## Light and dark review

Use the **Dark mode / Light mode** link on the comparison screen or any concept's review toolbar. The choice is encoded as `theme=dark` or `theme=light` in the URL and carried into TV links and return navigation; there is no control on the TV canvas itself. Dark mode uses a near-black canvas, raised charcoal panels, pale text, and labeled semantic statuses. It does not change records or pagination. The timeline uses Inter for its calendar, dates, hours, and identifiers following the readability review.

Theme verification: 40 normal page/resolution/theme combinations and 12 long-title/excess-item cases passed, along with theme switching and returning from TV mode. Dark screenshots are in `screenshots/dark/`. Browser captures do not replace physical-TV contrast and viewing-distance checks.
