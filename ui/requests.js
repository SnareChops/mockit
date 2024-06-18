import { Element } from './element.js'
import { formatBody } from './format.js'
import { blankMessage } from './blank.js'

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
  return new Element('div')
    .class('accordion-item')
    .append(
      new Element('h2')
        .class('accordion-header')
        .append(
          new Element('button')
            .class('accordion-button collapsed')
            .attr('type', 'button')
            .attr('data-bs-toggle', 'collapse')
            .attr('data-bs-target', `#${id}`)
            .text(`${req.status} ${req.method} ${req.path}`)
        )
    )
    .append(
      new Element('div')
        .id(id)
        .class('accordion-collapse collapse')
        .attr('data-bs-parent', '#requests')
        .append(
          new Element('div')
            .class('accordion-body container')
            .append(
              new Element('div')
                .class('request-common row')
                .text(`Query Params:\n${formatQuery(req.query)}`)
            )
            .append(document.createElement('hr'))
            .append(
              new Element('div')
                .class('row')
                .append(
                  new Element('div')
                    .class('col')
                    .text(`Request:\n\n${formatBody(req.req)}`)
                )
                .append(
                  new Element('div')
                    .class('col')
                    .text(`Response:\n\n${formatBody(req.res)}`)
                )
            )
        )
    )
    .el()
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
