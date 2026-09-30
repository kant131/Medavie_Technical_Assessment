import { Given, When, Then } from '@wdio/cucumber-framework';
import type { DataTable } from '@wdio/cucumber-framework';
import { browser } from '@wdio/globals';

import HomePage from '../../src/pageobjects/home.page.js';
import ContactPage from '../../src/pageobjects/contact.page.js';
import { normalizeText } from '../../src/utils/text.js';

Given('I open the Medavie homepage in {string}', async (language: string) => {
    await HomePage.openInLanguage(language);
});

When('I click on the {string} menu', async (menuName: string) => {
    await HomePage.clickMainMenu(menuName);
});

Then('the {string} page is displayed', async (pageHeading: string) => {
    await ContactPage.verifyIsDisplayed(pageHeading);
});

Then(
    'the {string} section shows the following contact information:',
    async (sectionHeading: string, table: DataTable) => {
        const actual = (await ContactPage.getSectionItems(sectionHeading)).map(normalizeText);

        const expected = table
            .hashes()
            .map((row) => normalizeText(`${row['Region']}: ${row['Phone number']}`));

        const missing = expected.filter((item) => !actual.includes(item));

        if (missing.length > 0) {
            throw new Error(
                `Section "${sectionHeading}" is missing expected contact information.\n` +
                    `Missing:\n  - ${missing.join('\n  - ')}\n` +
                    `Found on page:\n  - ${actual.join('\n  - ') || '(nothing)'}`,
            );
        }
    },
);

Then('I close the browser', async () => {
    // Ends the current browser session (closing the window). WebdriverIO starts a
    // fresh session so the next scenario begins from a clean browser.
    await browser.reloadSession();
});
