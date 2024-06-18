export class Element {
  /**
   * @type {HTMLElement}
   */
  #element
  /**
   * Creates a new dom element
   * @param {string} tag
   */
  constructor(tag) {
    this.#element = document.createElement(tag)
  }
  /**
   * Sets the id value
   * @param {string} value
   * @returns {this}
   */
  id(value) {
    this.#element.id = value
    return this
  }
  /**
   * Sets the class name
   * @param {string} name
   * @returns {this}
   */
  class(name) {
    this.#element.className = name
    return this
  }
  /**
   * Sets an attribute on the element
   * @param {string} key
   * @param {string} value
   * @returns {this}
   */
  attr(key, value) {
    this.#element.setAttribute(key, value)
    return this
  }
  /**
   * Appends an HTMLElement
   * @param {HTMLElement|this} element
   * @returns {this}
   */
  append(element) {
    this.#element.append(
      // @ts-expect-error el doesn't exist on HTMLElement, hence the check
      typeof element.el === 'function' ? element.el() : element
    )
    return this
  }
  /**
   * Sets element inner text
   * @param {string} value
   * @returns {this}
   */
  text(value) {
    this.#element.innerText = value
    return this
  }
  /**
   * Returns the native HTMLElement
   * @returns {HTMLElement}
   */
  el() {
    return this.#element
  }
}
