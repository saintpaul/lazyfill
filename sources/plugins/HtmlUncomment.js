'use strict';

var ModuleBase = require( '../ModuleBase.js' );


/**
 * Globally evaluates a JavaScript code.
 * @param  {String} code JS source code to evaluate
 *
 * @private
 */
function globalEval( code ) {
  var script = document.createElement( 'script' );
  script.text = code;
  document.getElementsByTagName('head')[0].appendChild( script ).parentNode.removeChild( script );
}



/**
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
    placeholder.innerHTML = placeholder.innerHTML.replace( '<!--', '' ).replace( '-->', '' );
    var scripts = placeholder.querySelectorAll( 'script' );

    // scripts aren't evaluated when inserted with innerHTML.
    for (var i = 0; i < scripts.length; i++) {
      globalEval( scripts[i].innerHTML );
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
