import BasePage from './base.page.js';
import { getLanguage } from '../config/languages.js';

class HomePage extends BasePage {
    private readonly mainMenuLinks = 'header a, nav a';

    async openInLanguage(language: string): Promise<void> {
        await this.open(getLanguage(language).homePath);
    }

    async clickMainMenu(menuName: string): Promise<void> {
        const link = await this.findVisibleByText(this.mainMenuLinks, menuName);
        await link.scrollIntoView({ block: 'center' });
        await link.click();
    }
}

export default new HomePage();
