'use strict';

var Utils = require( './Utils.js' );


/**
 * Common function available to all modules.
 * @type {Object}
 */
var ModuleBase = {
  /**
   * @param  {DOMElement} element
   * @param  {String}     className
   */
  removeClass: function( element, className ) {
    element.className = element.className.replace( className.replace( '.', '' ), '' );
  },

  safeSplitArray: function( element, attribute, currentMediaQuery ) {
    var attr = element.getAttribute( attribute );
    if( attr === null ) return null;

    var array = attr.split( ',' );
    if( array.length === 0 ) return null;

    return array;
  },

  safeArrayGet: function( element, attribute, currentMediaQuery ) {
    var array = ModuleBase.safeSplitArray( element, attribute, currentMediaQuery );
    return array === null ? null : array[ Math.min( currentMediaQuery, array.length - 1 ) ];
  },


  /**
   * Try to get the source from the list of sources of the element, using the current media query index.
   *
   * @param  {DOMElement} element           the placeholder DOM Element
   * @param  {Integer}    currentMediaQuery index
   * @return {String}                       source URL if any
   */
  getSource: function( element, currentMediaQuery ) {
    return ModuleBase.safeArrayGet( element, 'data-sources', currentMediaQuery );
  },


  /**
   * Check whether the element has a query override, and find the matching one.
   *
   * @param  {DOMElement} element           the placeholder DOM Element
   * @param  {Integer}    currentMediaQuery index
   * @return {Integer}                      new index
   */
  findQueryOverride: function( element, currentMediaQuery ) {
    var queriesOverrideAttr = element.getAttribute( 'data-media-queries' );
    if( queriesOverrideAttr ) {
      currentMediaQuery = Utils.matchMediaQueries( queriesOverrideAttr.split( ',' ) );
    }

    return currentMediaQuery;
  },


  /**
   * Combines getSource and findQueryOverride
   * @param  {DOMElement} element           the placeholder DOM Element
   * @param  {Integer}    currentMediaQuery index
   * @return {String}                       source URL if any
   */
  getSourceWithOverride: function( element, currentMediaQuery ) {
    currentMediaQuery = ModuleBase.findQueryOverride( element, currentMediaQuery );
    return ModuleBase.getSource( element, currentMediaQuery );
  }

};


module.exports = ModuleBase;
