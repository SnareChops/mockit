import { Element, button, div, h2 } from './element.js'
import { formatBody } from './format.js'
import { blankMessage } from './blank.js'

/**
 * @typedef RegisteredRoute
 * @prop {string} path
 * @prop {string} method
 * @prop {number} status
 * @prop {string} type
 * @prop {any} body
 * @prop {boolean} once
 */

/**
 * @type {Map<string, RegisteredRoute>}
 */
const registered = new Map()

/**
 * Load the registered route UI
 */
export async function loadRegistered() {
  for (const mock of await getRegistered()) {
    registered.set(mock.method + mock.path, mock)
  }
  render()
}
/**
 * Add a new registered route
 * @param {RegisteredRoute} route
 */
export function addRegistered(route) {
  registered.set(route.method + route.path, route)
  render()
}
/**
 * Signals that a route has been called
 * If the route is a "once" route, it will be removed
 * @param {string} method
 * @param {string} path
 */
export function routeCalled(method, path) {
  const route = registered.get(method + path)
  if (!!route && route.once) {
    registered.delete(method + path)
    render()
  }
}
/**
 * Clears all registered routes
 */
export function clearRegistered() {
  registered.clear()
  render()
}
/**
 * Get the list of currently registered routes from the
 * mockit server
 * @returns RegisteredRoute
 */
async function getRegistered() {
  const res = await fetch('/mockit/routes')
  return res.json()
}

function render() {
  const root = document.querySelector('#registered-routes')
  if (!root) return
  root.innerHTML = ''
  if (registered.size === 0)
    return root.append(blankMessage('No active registered routes'))
  for (const route of registered.values()) {
    root.append(createRegisteredRouteElement(route))
  }
}
/**
 * Create a registered route HTML element
 * @param {RegisteredRoute} route
 * @returns {HTMLElement}
 */
function createRegisteredRouteElement(route) {
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
        `${route.method} ${route.path}`
      )
    ),
    div(
      {
        id,
        class: 'accordion-collapse collapse',
        'data-bs-parent': '#registered-routes',
      },
      div(
        { class: 'accordion-body' },
        `Status Code: ${route.status}\nContent-Type: ${
          route.type
        }\n\n${formatBody(route.body)}`
      )
    )
  ).el()
}
