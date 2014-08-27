'use strict';

/**
 * Core model for every component of the page.
 *
 * @param {DOMElement}  element   the placeholder
 * @param {Function}    handler   function that will be executed once the lazy triggers
 * @param {Boolean}     deferred  whether the component has to be deferred
 *
 * @class Component
 */
var Component = function( element, handler, deferred ) {
  this.element = element;
  this.handler = handler;
  this.callback = void 0;
  this.deferred = deferred || false;
};


/**
 * Executes the handler of the component, and keeps the new one returned
 */
Component.prototype.execHandler = function( currentMediaQuery ) {
  if( typeof this.handler === 'function' ) {
    this.handler = this.handler.call( null, this, currentMediaQuery );
  }
};


/**
 * The callbacks are executed only once, when the element is first loaded.
 */
Component.prototype.execCallbackOnce = function() {
  if( this.callback ) this.callback.call( null, this );
  this.callback = void 0;
};


module.exports = Component;
