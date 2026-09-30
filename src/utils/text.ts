export function normalizeText(value: string): string {
    return value
        .normalize('NFC')
        .replace(/[\u00A0\u2007\u2009\u202F]/g, ' ')
        .replace(/[\u2010-\u2015\u2212]/g, '-')
        .replace(/[\u2018\u2019\u02BC]/g, "'")
        .replace(/\s*:\s*/g, ': ')
        .replace(/\s+/g, ' ')
        .trim();
}

export function matchKey(value: string): string {
    return normalizeText(value).toLocaleLowerCase();
}
