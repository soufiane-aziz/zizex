/**
 * Utility functions for generating and parsing SEO-friendly keyword slugs.
 */

/**
 * Creates a keyword-rich SEO slug from a title and ID.
 * Example: ("Fight Club", 550, "movie") => "watch-fight-club-550"
 */
export function createSlug(title, id, type = 'movie') {
    if (!id) return '';
    if (!title) return String(id);

    const cleanTitle = String(title)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // remove accents
        .replace(/[^a-z0-9\s-]/g, '') // keep clean ASCII alphanumeric, spaces, hyphens
        .trim()
        .replace(/\s+/g, '-');

    const prefix = 'watch';
    return cleanTitle ? `${prefix}-${cleanTitle}-${id}` : `${prefix}-${id}`;
}

/**
 * Extracts the numeric ID from a slug string.
 * Supports: "550", "fight-club-550", "watch-fight-club-550"
 */
export function extractIdFromSlug(slug) {
    if (!slug) return null;
    const str = String(slug).trim();

    if (/^\d+$/.test(str)) {
        return parseInt(str, 10);
    }

    const match = str.match(/-(\d+)$/);
    if (match) {
        return parseInt(match[1], 10);
    }

    return null;
}
