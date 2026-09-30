export interface LanguageConfig {
    /** Path of the localized homepage, relative to baseUrl. */
    homePath: string;
}

/**
 * Localized homepages.
 * Note: the assessment document lists the French URL as "/fn/"; the site's French
 * homepage is served at "/fr/", so "/fr/" is used here. Override with FR_PATH if needed.
 */
export const LANGUAGES: Record<string, LanguageConfig> = {
    english: { homePath: process.env.EN_PATH ?? '/en/' },
    french: { homePath: process.env.FR_PATH ?? '/fr/' },
};

export function getLanguage(name: string): LanguageConfig {
    const config = LANGUAGES[name.trim().toLowerCase()];
    if (!config) {
        throw new Error(`Unsupported language "${name}". Supported: ${Object.keys(LANGUAGES).join(', ')}`);
    }
    return config;
}
