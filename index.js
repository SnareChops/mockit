const { WebSocket } = require('ws')
/**
 * @typedef FakeRoute
 * @prop {string} path
 * @prop {string} method
 * @prop {number} status
 * @prop {any} body
 * @prop {boolean} once
 */
/**
 * @template {any} T
 * @template {any} U
 * @typedef MockitLoggedRequest
 * @prop {string} path
 * @prop {string} method
 * @prop {object} query
 * @prop {number} status
 * @prop {T} req
 * @prop {U} res
 */
/** @typedef {() => void} Tracker */
/** @typedef {() => Promise<void>} Waiter */

class Mockit {
  /** @type {WebSocket} */
  #socket
  /** @type {Map<string, Tracker>} */
  #trackers = new Map()
  /** @type {string} */
  #url
  /**
   * @param {string} url
   */
  constructor(url) {
    this.url = url
    this.socket = new WebSocket(`${url}/mockit/ws`)
    this.socket.on('close', () => this.#trackers.clear())
    this.socket.on('error', (err) => console.log(err, this.#trackers.clear()))
    this.socket.on('message', (message) => this.#onMessage(message.toString()))
  }
  /**
   * Mock an endpoint for every call to this method + path
   * Returns a waiter that can be awaited and resolves when this mock endpoint
   * has been called
   * @param {string} method
   * @param {string} path
   * @param {number} status
   * @param {any} [body]
   * @returns {Promise<Waiter>}
   */
  async mock(method, path, status, body) {
    return this.#mock(method, path, status, false, body)
  }
  /**
   * Mock an endpoint for only the next call to this method+path
   * Returns a waiter that can be awaited and resolves when this mock endpoint
   * has been called
   * @param {string} method
   * @param {string} path
   * @param {number} status
   * @param {any} [body]
   * @returns {Promise<Waiter>}
   */
  async mockOnce(method, path, status, body) {
    return this.#mock(method, path, status, true, body)
  }
  /**
   * Get a list of requests that have been called since the last clear()
   * @template {any} T
   * @template {any} U
   * @returns {Promise<MockitLoggedRequest<T,U>[]>}
   */
  async requests() {
    const res = await fetch(`${this.url}/mockit/requests`)
    return (await res.json()) || []
  }
  /** Clear all mocks and spied requests */
  async clear() {
    await fetch(`${this.url}/mockit/clear`, { method: 'POST' })
    this.#trackers.clear()
  }
  /**
   *
   * @param {string} method
   * @param {string} path
   * @param {number} status
   * @param {boolean} once
   * @param {any} body
   * @returns {Promise<Waiter>}
   */
  async #mock(method, path, status, once, body) {
    /** @type {Tracker} */
    let resolver;
    /** @type {Promise<void>} */
    const waiter = new Promise((resolve) => { resolver = resolve })
    //@ts-expect-error Hacky stuff...
    this.#trackers.set(method+path, resolver)
    let type = 'text/plain; charset=utf-8'
    if (Array.isArray(body) || (typeof body === 'object' && body !== null)) {
      type = 'application/json'
    }
    await fetch(`${this.url}/mockit/routes`, {
      method: 'POST',
      body: JSON.stringify({ path, method, status, body, type, once }),
    })
    return () => waiter
  }
  /**
   * @param {string} message
   */
  #onMessage(message) {
    if (typeof message !== 'string') return
    try {
      const json = JSON.parse(message)
      if (json.type !== 'called') return
      this.#trigger(json.value)
    } catch (err) {
      console.error(err)
    }
  }
  /**
   * @param {MockitLoggedRequest<any,any>} route
   */
  #trigger(route) {
    if (!route.method || !route.path) return
    const tracker = this.#trackers.get(route.method + route.path)
    if (!tracker) return
    tracker()
  }
}
module.exports = { Mockit }
