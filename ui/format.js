/**
 * Formats the body as a string
 * @param {any} body
 * @returns {string}
 */
export function formatBody(body) {
  if (typeof body === 'undefined') return ''
  if (typeof body === 'string') return body
  if (typeof body === 'number') return '' + body
  if (Array.isArray(body)) return JSON.stringify(body, void 0, 2)
  if (typeof body === 'object') {
    if (body === null) return ''
    else return JSON.stringify(body, void 0, 2)
  }
  throw new Error('Unexpected body type')
}
