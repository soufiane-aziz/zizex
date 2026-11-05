/**
 * Security utilities: JSON-LD sanitization, rate limiting helpers, and input guards.
 */

/**
 * Safely serializes data for injection inside <script type="application/ld+json">.
 * Prevents HTML / script breakout attacks by escaping '<' as '\\u003c'.
 * Valid JSON parsers (Google, Bing, browsers) decode '\\u003c' transparently.
 */
export function safeJsonLd(data) {
  if (!data) return '{}';
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

