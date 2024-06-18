import { Element } from './element.js'
/**
 * Returns a blank message HTML element
 * @param {string} message
 * @returns {HTMLElement}
 */
export function blankMessage(message) {
  return new Element('div').class('alert alert-secondary').text(message).el()
}
