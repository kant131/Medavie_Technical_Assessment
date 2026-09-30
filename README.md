# Medavie Contact Page – UI Automation

Automated UI tests for the Medavie website's **Contact** page. The tests cover the English and French versions of the site with **WebdriverIO v9**, **Cucumber** and **TypeScript**.

Each scenario performs these steps:

1. Opens the Medavie homepage in English (`/en/`) or French (`/fr/`).
2. Clicks the **Contact** / **Coordonnées** main menu item.
3. Verifies that the Contact page is displayed, using its page heading.
4. Verifies the phone numbers in the **Medavie Blue Cross** / **Croix Bleue Medavie** section.
5. Closes the browser.

## Prerequisites

- **Node.js 20+**. Run `node -v` to check. An `.nvmrc` file is included for nvm users.
- **Google Chrome**. Firefox and Microsoft Edge are also supported (see *Configuration*).

You don't need to install a driver. WebdriverIO v9 downloads the matching browser driver automatically on the first run.

## Setup

```bash
git clone <this-repo-url>
cd medavie-contact-automation
npm install
```

## Running the tests

| Command | What it does |
| --- | --- |
| `npm test` | Runs both scenarios with a visible browser |
| `npm run test:headless` | Runs both scenarios headless |
| `npm run test:en` | Runs the English scenario only |
| `npm run test:fr` | Runs the French scenario only |
| `npm run typecheck` | Type-checks the TypeScript code |

Results are printed to the console by the spec reporter. When a step fails, a screenshot is saved to `reports/screenshots/`.

## Configuration

These settings are optional environment variables, and you can combine them with any command above:

| Variable | Default | Purpose |
| --- | --- | --- |
| `HEADLESS` | `false` | `true` runs without a browser window |
| `BROWSER` | `chrome` | `chrome`, `firefox` or `edge` |
| `BASE_URL` | `https://www.medavie.ca` | Target environment |
| `TAGS` | *(all)* | Cucumber tag expression, e.g. `@french` |
| `EN_PATH` / `FR_PATH` | `/en/` / `/fr/` | Localized homepage paths |

For example:

```bash
npx cross-env BROWSER=firefox HEADLESS=true npm test
```

## Project structure

```
├── features/
│   ├── contact-page.feature          # Gherkin scenarios (English + French)
│   └── step-definitions/
│       └── contact.steps.ts          # Thin step definitions
├── src/
│   ├── config/languages.ts           # Language -> homepage path mapping
│   ├── pageobjects/
│   │   ├── base.page.ts              # Shared helpers (open, cookie banner, find by text)
│   │   ├── home.page.ts              # Homepage / main navigation
│   │   └── contact.page.ts           # Contact page heading + section reading
│   └── utils/text.ts                 # Text normalization for reliable comparisons
├── .github/workflows/e2e.yml         # CI: runs the suite headless on every push
├── wdio.conf.ts                      # WebdriverIO configuration
└── tsconfig.json
```

## Design notes

- **Readable, data-driven scenarios.** The expected regions and phone numbers are in Gherkin data tables. Anyone can read or update them without touching code. Both languages share the same step definitions.
- **Page Object Model.** Locators and page behavior live in page objects. Step definitions only describe intent.
- **Resilient locators.** Menu items and headings are located by their text, not by generated CSS classes. The text is read from `textContent` because the navigation is displayed uppercase through CSS ("CONTACT"), while the underlying text is "Contact". A section's phone numbers are the list items between its heading and the next heading at the same level, so the test doesn't depend on the page's exact markup.
- **Text normalization.** French typography uses non-breaking spaces before colons, and phone numbers can contain non-breaking hyphens. These characters look identical on screen but break exact string comparisons. `normalizeText()` converts these variants before comparing, so the assertion checks content rather than typography.
- **Clear failure messages.** When a check fails, the message lists exactly which numbers are missing and what was actually found on the page. A screenshot is also captured.
- **"Close the browser" step.** This step ends the WebDriver session with `browser.reloadSession()`, which closes the browser window. Each scenario then starts in a fresh browser.
- **Cookie banner.** If a cookie consent banner appears, it is accepted automatically so that it can't block clicks. If no banner appears, the step does nothing and doesn't fail.

## Assumptions

- The assessment lists the French URL as `https://www.medavie.ca/fn/`. That appears to be a typo for `/fr/`, the site's standard French path, so the tests use `/fr/`. If you need a different path, override it with `FR_PATH`.
- The "Contact page is displayed" check is based on the page's main heading ("Contact" / "Coordonnées"), which matches the highlighted element in the assessment screenshots.
