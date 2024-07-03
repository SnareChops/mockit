import { blankMessage } from './blank.js'
import { b, button, div, h2, nbsp } from './element.js'
import { formatBody } from './format.js'

/**
 * @typedef LoggedRequest
 * @prop {string} path
 * @prop {string} method
 * @prop {Map<string, string[]>} query
 * @prop {number} status
 * @prop {any} req
 * @prop {any} res
 */

/**
 * @type {LoggedRequest[]}
 */
let requests = []
/**
 * Loads the requests UI
 */
export async function loadRequests() {
  const res = await fetch('/mockit/requests')
  const reqs = await res.json()
  for (const req of reqs) {
    requests.push(req)
  }
  render()
}
/**
 * Adds a logged request
 * @param {LoggedRequest} req
 */
export function addRequest(req) {
  requests.push(req)
  render()
}
/**
 * Clears all requests
 */
export function clearRequests() {
  requests = []
  render()
}

function render() {
  const root = document.querySelector('#requests')
  if (!root) return
  root.innerHTML = ''
  if (requests.length === 0)
    return root.append(blankMessage('No requests recorded'))
  for (const req of requests) {
    root.append(createRequestElement(req))
  }
}
/**
 * Create a request HTML element
 * @param {LoggedRequest} req
 * @returns {HTMLElement}
 */
function createRequestElement(req) {
  const id = crypto.randomUUID()
  return div(
    { class: 'accordion-item' },
    h2(
      { class: 'accordion-header' },
      button(
        {
          class: 'accordion-button collapsed',
          type: 'button',
          'data-bs-toggle': 'collapse',
          'data-bs-target': `#${id}`,
        },
        b(req.status.toString()),
        nbsp(),
        `${req.method} ${req.path}`
      )
    ),
    div(
      {
        id,
        class: 'accordion-collapse collapse',
        'data-bs-parent': '#requests',
      },
      div(
        { class: 'accordion-body container' },
        div({ class: 'row' }, `Query Params:\n${formatQuery(req.query)}`),
        document.createElement('hr'),
        div(
          { class: 'row' },
          div({ class: 'col' }, `Request:\n\n${formatBody(req.req)}`),
          div({ class: 'col' }, `Response:\n\n${formatBody(req.res)}`)
        )
      )
    )
  ).el()
}

function formatQuery(query) {
  let result = ''
  for (const key in query) {
    for (const val of query[key]) {
      result += key + ' = ' + val + '\n'
    }
  }
  return result
}
