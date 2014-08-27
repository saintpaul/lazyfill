'use strict';
var ModuleBase        = require( '../ModuleBase.js' );


/**
 * Allows the loading of iframes.
 * An iframe is always deferred, as not to block the onload event with an external resource.
 *
 * The iframe tag is appended to the placeholder.
 * The placeholder can have the following attributes, which will be passed directly to the iframe tag:
 * - frame-width
 * - frame-height
 * - scrolling (default 'no')
 * - frameborder (default 0)
 *
 *   <div class="eager-iframe" data-sources="https://myiframe/"
 *     data-frame-width="300px" data-frame-height="320px"
 *     data-media-query="(min-width: 768px)">
 *   </div>
 *
 *   <div class="lazy-iframe" data-sources="https://myiframe/"
 *     data-frame-width="300px" data-frame-height="320px"
 *     data-media-query="(min-width: 768px)">
 *   </div>
 */
var IframeModule = {
  /**
   * This shows the eager-responsive-image ASAP, which equates to the domcontent ready event
   *
   * @param {Component} component           the Component object representing the element
   * @param {Integer}   currentMediaQuery   index of the current media query

   * @return {Function} the new handler
   */
  show: function( component, currentMediaQuery ) {
    var placeholder = component.element;
    var source = ModuleBase.getSourceWithOverride( placeholder, currentMediaQuery );

    if( source === '' || source === null ) { //if( /*nativeMediaMatch && */mediaQuery && window.matchMedia( mediaQuery ).matches === false ) {
      return IframeModule.show;
    }

    var f           = document.createElement( 'iframe' );
    f.src           = source;
    f.scrolling     = placeholder.getAttribute( 'data-scrolling' )    || 'no';
    f.frameBorder   = placeholder.getAttribute( 'data-frameborder' )  || 0;
    f.width         = placeholder.getAttribute( 'data-frame-width' );
    f.height        = placeholder.getAttribute( 'data-frame-height' );

    placeholder.appendChild( f );

    return void 0;
  },


  /**
   * No processing.
   * @return {Function} the new handler
   */
  process: function() {
    return IframeModule.show;
  },

  eagerSelector:  '.eager-iframe',

  lazySelector:   '.lazy-iframe',

  /**
   * Every iframe should be loaded after the onload event as not to block it
   * @type {Boolean}
   */
  defer: true
};


module.exports = IframeModule;
