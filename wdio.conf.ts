import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

/**
 * Runtime switches (all optional):
 *   HEADLESS=true            run without a visible browser window
 *   BROWSER=chrome|firefox|edge   (default: chrome)
 *   BASE_URL=https://...     (default: https://www.medavie.ca)
 *   TAGS=@english            Cucumber tag expression to filter scenarios
 */
const headless = process.env.HEADLESS === 'true';
const browserName = (process.env.BROWSER ?? 'chrome').toLowerCase();
const SCREENSHOT_DIR = path.resolve('./reports/screenshots');

function buildCapability(): WebdriverIO.Capabilities {
    const chromiumArgs = [
        ...(headless ? ['--headless=new'] : []),
        '--window-size=1920,1080',
        '--disable-search-engine-choice-screen',
    ];

    switch (browserName) {
        case 'firefox':
            return {
                browserName: 'firefox',
                'moz:firefoxOptions': {
                    args: [...(headless ? ['-headless'] : []), '-width=1920', '-height=1080'],
                },
            };
        case 'edge':
            return {
                browserName: 'MicrosoftEdge',
                'ms:edgeOptions': { args: chromiumArgs },
            };
        default: {
            const installed = installedChromeOnWindows();
            return {
                browserName: 'chrome',
                ...(installed && { browserVersion: installed.version }),
                'goog:chromeOptions': {
                    args: chromiumArgs,
                    ...(installed && { binary: installed.binary }),
                },
            };
        }
    }
}

/**
 * On Windows, WebdriverIO guesses the Chrome version from the newest version folder next to
 * chrome.exe. While a Chrome update is staged but not yet applied (restart pending), that folder
 * is newer than the chrome.exe that actually launches, so the wrong ChromeDriver is downloaded.
 * Read the real version from chrome.exe and pin both the binary and the driver version to it.
 */
function installedChromeOnWindows(): { binary: string; version: string } | undefined {
    if (process.platform !== 'win32') return undefined;
    const candidates = [
        process.env.CHROME_BIN,
        path.join(process.env.PROGRAMFILES ?? 'C:\\Program Files', 'Google\\Chrome\\Application\\chrome.exe'),
        path.join(process.env['PROGRAMFILES(X86)'] ?? 'C:\\Program Files (x86)', 'Google\\Chrome\\Application\\chrome.exe'),
        path.join(process.env.LOCALAPPDATA ?? '', 'Google\\Chrome\\Application\\chrome.exe'),
    ];
    const binary = candidates.find((p): p is string => !!p && fs.existsSync(p));
    if (!binary) return undefined;

    const result = spawnSync(
        'powershell.exe',
        ['-NoProfile', '-Command', `(Get-Item -LiteralPath '${binary}').VersionInfo.ProductVersion`],
        { encoding: 'utf8' },
    );
    const version = result.stdout?.trim();
    if (!version || !/^\d+\.\d+\.\d+\.\d+$/.test(version)) return undefined;

    return { binary, version };
}

export const config: WebdriverIO.Config = {
    runner: 'local',
    tsConfigPath: './tsconfig.json',

    specs: ['./features/**/*.feature'],
    maxInstances: 1,
    capabilities: [buildCapability()],

    logLevel: 'warn',
    baseUrl: process.env.BASE_URL ?? 'https://www.medavie.ca',
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 2,

    framework: 'cucumber',
    reporters: ['spec'],

    cucumberOpts: {
        require: ['./features/step-definitions/**/*.ts'],
        tags: process.env.TAGS ?? '',
        timeout: 60000,
        failAmbiguousDefinitions: true,
    },

    onPrepare() {
        fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    },

    /** Capture a screenshot whenever a step fails, to make failures easy to diagnose. */
    async afterStep(step, scenario, result) {
        if (result.passed) return;
        const safeName = `${scenario.name}-${step.text}`.replace(/[^a-z0-9]+/gi, '_').slice(0, 120);
        const file = path.join(SCREENSHOT_DIR, `${Date.now()}-${safeName}.png`);
        try {
            await browser.saveScreenshot(file);
            console.log(`Screenshot saved: ${file}`);
        } catch (err) {
            console.warn(`Could not save screenshot: ${(err as Error).message}`);
        }
    },
};
