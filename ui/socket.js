import { addRegistered, clearRegistered, routeCalled } from './registered.js'
import { addRequest } from './requests.js'
/**
 * @typedef MockitMessage
 * @prop {number} id
 * @prop {string} type
 * @prop {any} value
 */

export class Socket extends WebSocket {
  /** @type {number} */
  latest
  constructor() {
    super('/mockit/ws')
    this.addEventListener('error', (err) => console.error(err))
    this.addEventListener('close', () => console.log('Socket closed'))
    this.addEventListener('open', () => this.open())
    this.addEventListener('message', (message) => this.handle(message.data))
  }

  open() {
    console.log('Socket opened')
  }
  /**
   * Handles an incoming socket message
   * @param {MockitMessage} message
   */
  handle(message) {
    // @ts-expect-error reuse of message
    message = JSON.parse(message)
    // Dedupe messages
    if (message.id <= this.latest) return
    this.latest = message.id
    // Verify message has a type
    if (!message.type || typeof message.type !== 'string') return
    // Route message to correct handler
    switch (message.type) {
      case 'created':
        return addRegistered(message.value)
      case 'cleared':
        return clearRegistered()
      case 'called':
        routeCalled(message.value.method, message.value.path)
        addRequest(message.value)
        return
      default:
        console.log(message)
    }
  }
}
