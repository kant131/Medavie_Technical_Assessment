import { browser, $ } from '@wdio/globals';
import { matchKey } from '../utils/text.js';

const COOKIE_ACCEPT_SELECTORS = [
    '#onetrust-accept-btn-handler',
    '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll',
    'button[id*="accept" i]',
    'button[class*="accept" i]',
];

export default class BasePage {
    /** Opens a path relative to baseUrl and clears any cookie banner that could block clicks. */
    async open(path: string): Promise<void> {
        await browser.url(path);
        await this.dismissCookieBannerIfPresent();
    }

    /** Best effort: never fails the test if no banner is shown. */
    async dismissCookieBannerIfPresent(timeout = 3000): Promise<void> {
        let button: WebdriverIO.Element | undefined;
        try {
            await browser.waitUntil(
                async () => {
                    for (const selector of COOKIE_ACCEPT_SELECTORS) {
                        const el = await $(selector);
                        if ((await el.isExisting()) && (await el.isDisplayed())) {
                            button = await el.getElement();
                            return true;
                        }
                    }
                    return false;
                },
                { timeout, interval: 250 },
            );
        } catch {
            return; // no banner
        }
        await button?.click();
    }

    /**
     * Finds the first *visible* element matching `selector` whose text equals `text`.
     * textContent is used rather than rendered text because the site's navigation is
     * styled uppercase via CSS ("CONTACT"), while the underlying text is "Contact".
     */
    protected async findVisibleByText(selector: string, text: string, timeout = 10000): Promise<WebdriverIO.Element> {
        const wanted = matchKey(text);
        const marker = `wdio-find-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        let found: WebdriverIO.Element | undefined;

        await browser.waitUntil(
            async () => {
                try {
                    // Read every candidate's text in a single browser round trip. Querying each
                    // element separately is slow and, while the page is still changing (e.g. right
                    // after a navigation), hits stale element references that stall WebdriverIO.
                    const texts = await browser.execute(
                        (sel: string, attr: string) =>
                            Array.from(document.querySelectorAll<HTMLElement>(sel)).map((el, i) => {
                                el.setAttribute(attr, String(i));
                                return el.textContent ?? '';
                            }),
                        selector,
                        marker,
                    );
                    for (const [i, content] of texts.entries()) {
                        if (matchKey(content) !== wanted) continue;
                        const el = await $(`[${marker}="${i}"]`).getElement();
                        if ((await el.isExisting()) && (await el.isDisplayed())) {
                            found = el;
                            return true;
                        }
                    }
                } catch {
                    // Page changed mid-lookup; try again on the next poll.
                }
                return false;
            },
            {
                timeout,
                interval: 250,
                timeoutMsg: `No visible element "${selector}" with text "${text}" found within ${timeout}ms`,
            },
        );

        return found as WebdriverIO.Element;
    }
}
