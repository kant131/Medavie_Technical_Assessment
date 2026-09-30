/**
 * Normalizes visible text so comparisons are not broken by typography.
 *
 * French pages in particular use non-breaking / narrow non-breaking spaces
 * (e.g. before a colon: "Québec : ...") and may use non-breaking hyphens in
 * phone numbers. Those look identical on screen but fail strict equality.
 */
export function normalizeText(value: string): string {
    return value
        .normalize('NFC')
        .replace(/[\u00A0\u2007\u2009\u202F]/g, ' ') // non-breaking & thin spaces
        .replace(/[\u2010-\u2015\u2212]/g, '-') // hyphen/dash variants
        .replace(/[\u2018\u2019\u02BC]/g, "'") // curly apostrophes
        .replace(/\s*:\s*/g, ': ') // "Label : value" and "Label:\nvalue" -> "Label: value"
        .replace(/\s+/g, ' ')
        .trim();
}

/** Case-insensitive key for matching labels such as menu items and headings. */
export function matchKey(value: string): string {
    return normalizeText(value).toLocaleLowerCase();
}
