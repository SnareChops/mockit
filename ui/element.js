/**
 * @typedef {string | Element | HTMLElement | Text} Appendable
 * //*
 * @typedef {Record<string,string>} Attributes
 * //*
 * @typedef {Attributes|Appendable} ElementArg
 */
export class Element {
  /**@type {HTMLElement} */
  #el
  /**
   *
   * @param {string|HTMLElement} tag
   * @param {...(Attributes | Appendable)} args
   */
  constructor(tag, ...args) {
    if (tag instanceof HTMLElement) this.#el = tag
    else this.#el = document.createElement(tag)
    for (const o of args) {
      if (typeof o === 'string') {
        this.append(document.createTextNode(o))
        continue
      }
      if (
        o instanceof Element ||
        o instanceof HTMLElement ||
        o instanceof Text
      ) {
        this.append(o)
        continue
      }
      if (typeof o === 'object' && o !== null) {
        this.attr(o)
        continue
      }
    }
  }
  /**
   * @overload
   * @param {string} id
   * @returns {this}
   * //*
   * @overload
   * @returns {string}
   */
  id(id) {
    if (!!id) {
      this.#el.id = id
      return this
    }
    return this.#el.id
  }
  /**
   * @overload
   * @param {string} name
   * @returns {this}
   * //*
   * @overload
   * @returns {string}
   */
  class(name) {
    if (!!name) {
      this.#el.className = name
      return this
    }
    return this.#el.className
  }
  /**
   * @overload
   * @param {Record<string, string>} attrs
   * @returns {this}
   * //*
   * @overload
   * @returns {Record<string, string>}
   */
  attr(attrs) {
    if (!!attrs) {
      for (const key in attrs) {
        if (key == 'id') {
          this.id(attrs[key])
          continue
        }
        if (key == 'class') {
          this.class(attrs[key])
          continue
        }
        if (attrs[key] === null || attrs[key] === undefined)
          this.#el.removeAttribute(key)
        else this.#el.setAttribute(key, attrs[key])
      }
      return this
    }
    /**@type {Record<string,string>} */
    const result = {
      id: this.id(),
      class: this.class(),
    }
    for (const attr of this.#el.attributes) {
      result[attr.name] = attr.value
    }
    return result
  }
  /**
   * @overload
   * @param {string} value
   * @returns {this}
   * //*
   * @overload
   * @returns {string}
   */
  text(value) {
    if (!!value) {
      this.#el.innerText = value
      return this
    }
    return this.#el.innerText
  }
  /**
   * Appends element(s)
   * @param {...(Element | HTMLElement | Text)} elements
   * @return {this}
   */
  append(...elements) {
    for (const e of elements) {
      if (e instanceof Element) this.#el.append(e.el())
      else this.#el.append(e)
    }
    return this
  }
  /**
   * @returns {HTMLElement}
   */
  el() {
    return this.#el
  }
  /**
   * @param {string} selector
   * @returns {Element | undefined}
   */
  query(selector) {
    const el = this.#el.querySelector(selector)
    if (el instanceof HTMLElement) return new Element(el)
  }
  /**
   * @param {string} selector
   * @returns {Element[]}
   */
  queryAll(selector) {
    const els = this.#el.querySelectorAll(selector)
    const result = []
    for (const el of els) {
      if (el instanceof HTMLElement) result.push(new Element(el))
    }
    return result
  }
}
/**
 * Query the DOM for an element
 * @param {string} selector
 * @return {Element|undefined}
 */
export function query(selector) {
  const el = document.querySelector(selector)
  if (el instanceof HTMLElement) return new Element(el)
}
/**
 * Query the DOM for elements
 * @param {string} selector
 * @return {Element[]}
 */
export function queryAll(selector) {
  const els = document.querySelectorAll(selector)
  const result = []
  for (const el of els) {
    if (el instanceof HTMLElement) result.push(new Element(el))
  }
  return result
}
/**
 * Creates a div
 * @param {...ElementArg} args
 * @returns {Element}
 */
export function div(...args) {
  return new Element('div', ...args)
}
/**
 * Creates a paragraph
 * @param {...ElementArg} args
 * @returns {Element}
 */
export function p(...args) {
  return new Element('p', ...args)
}
/**
 * Creates a span
 * @param {...ElementArg} args
 * @returns {Element}
 */
export function span(...args) {
  return new Element('span', ...args)
}
/**
 * Creates a b tag
 * @param {...ElementArg} args
 * @returns {Element}
 */
export function b(...args) {
  return new Element('b', ...args)
}
/**
 * Creates a button tag
 * @param {...ElementArg} args
 * @returns {Element}
 */
export function button(...args) {
  return new Element('button', ...args)
}
/**
 * Creates h2 button tag
 * @param {...ElementArg} args
 * @returns {Element}
 */
export function h2(...args) {
  return new Element('h2', ...args)
}
export function nbsp() {
  return document.createTextNode(String.fromCharCode(160))
}
