export interface LanguageConfig {
    homePath: string;
}

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
