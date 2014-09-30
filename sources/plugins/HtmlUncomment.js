'use strict';

var ModuleBase = require( '../ModuleBase.js' );
var Utils = require( '../Utils.js' );



/**
 * HTML Uncomment will uncomment everything that is inside the placeholder.
 * The HTML can therefore be pushed directly to the client, and will be only be evaluated upon
 * lazy loading or deferred.
 * Any scripts inside the snippet will be evaluated.
 *
 * Usage
 *   <div class="eager-html-uncomment" data-defer>
 *     <!--LF[
 *       <div></div>
 *     ]FL-->
 *   </div>
 *
 *   <div class="lazy-html-uncomment">
 *     <!--
 *       <code></code>
 *     -->
 *   </div>
 *
 * As with any component, it can deferred as to be loaded after onload event.
 *
 * @class HtmlUncommentModule
 */
var HtmlUncommentModule = {
  /**
   *
   * @param {Component} component           the Component object representing the element
   * @return {Function} the new handler
   */
  show: function( component )
  {
    var placeholder = component.element;
    placeholder.innerHTML = placeholder.innerHTML.replace( '<!--LF[', '' ).replace( ']FL-->', '' );
    var scripts = placeholder.querySelectorAll( 'script' );

    // scripts aren't evaluated when inserted with innerHTML.
    for (var i = 0; i < scripts.length; i++) {
      Utils.globalEvalJavascript( scripts[i] );
    }

    return void 0;
  },


  /**
   * No processing.
   * @return {Function} the new handler
   */
  process: function()
  {
    return HtmlUncommentModule.show;
  },

  eagerSelector:  '.eager-html-uncomment',

  lazySelector:   '.lazy-html-uncomment'

};


module.exports = HtmlUncommentModule;
