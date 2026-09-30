import { browser, expect } from '@wdio/globals';
import BasePage from './base.page.js';

class ContactPage extends BasePage {
    async verifyIsDisplayed(pageHeading: string): Promise<void> {
        const heading = await this.findVisibleByText('h1', pageHeading);
        await expect(heading).toBeDisplayed();
    }

    async getSectionItems(sectionHeading: string): Promise<string[]> {
        const heading = await this.findVisibleByText('h2, h3, h4', sectionHeading);
        await heading.scrollIntoView({ block: 'center' });

        const items = await browser.execute((wanted: string) => {
            const norm = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase();
            const headingEl = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).find(
                (el) => norm(el.textContent ?? '') === norm(wanted),
            );
            if (!headingEl) return null;

            const level = Number(headingEl.tagName.substring(1));
            const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
            walker.currentNode = headingEl;

            const texts: string[] = [];
            let node = walker.nextNode() as HTMLElement | null;
            while (node) {
                const isHeading = /^H[1-6]$/.test(node.tagName);
                if (isHeading && Number(node.tagName.substring(1)) <= level) break;
                if (node.tagName === 'LI') texts.push(node.innerText || node.textContent || '');
                node = walker.nextNode() as HTMLElement | null;
            }
            return texts;
        }, sectionHeading);

        if (items === null) {
            throw new Error(`Section heading "${sectionHeading}" was not found on the page`);
        }
        return items;
    }
}

export default new ContactPage();
