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
 * HTML Snippet is a piece of HTML that will be loaded from an external URL, and placed inside the
 * placeholder.
 * The complete content of the placeholder will be replaced.
 * Any scripts inside the snippet will be evaluated.
 *
 * Usage
 *   <div class="eager-html-snippet" data-sources="snippet.html">
 *   </div>
 *
 * As with any component, it can deferred as to be loaded after onload event.
 *
 * @class HtmlSnippetModule
 */
var HtmlSnippetModule = {
  /**
   *
   * @param {Component} component           the Component object representing the element
   * @param {Integer}   currentMediaQuery   index of the current media query

   * @return {Function} the new handler
   */
  show: function( component, currentMediaQuery )
  {
    var placeholder = component.element;
    var source = ModuleBase.getSourceWithOverride( placeholder, currentMediaQuery );

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
      if( xmlhttp.readyState === 4 && xmlhttp.status === 200 ) {
        placeholder.innerHTML = xmlhttp.responseText;
        var scripts = placeholder.querySelectorAll( 'script' );

        // scripts aren't evaluated when inserted with innerHTML.
        for (var i = 0; i < scripts.length; i++) {
          globalEval( scripts[i].innerHTML );
        }
      }
    };

    xmlhttp.open( 'GET', source, true );
    xmlhttp.send();

    return void 0;
  },


  /**
   * No processing.
   * @return {Function} the new handler
   */
  process: function()
  {
    return HtmlSnippetModule.show;
  },

  eagerSelector:  '.eager-html-snippet',

  lazySelector:   '.lazy-html-snippet'

};


module.exports = HtmlSnippetModule;
