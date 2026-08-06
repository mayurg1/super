/**
 * @file HTML escaping for safe text insertion.
 */

/**
 * Escape HTML special characters in a string.
 * @param {unknown} value
 * @returns {string}
 */
export function escapeHtml(value) {
  const str = typeof value === 'string' ? value : String(value ?? '');
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
