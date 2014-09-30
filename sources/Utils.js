'use strict';

var Utils = {

  addEvent: function( target, type, listener ) {
    if( target.addEventListener ) {
      target.addEventListener( type, listener, false );
    } else {
      target.attachEvent( 'on' + type, listener );
    }
  },

  removeEvent: function( target, type, listener ) {
    if( target.removeEventListener ) {
      target.removeEventListener( type, listener, false );
    } else {
      target.detachEvent( 'on' + type, listener );
    }
  },

  clientHeight: function() {
    if (document.documentElement.clientHeight >= 0) {
      return document.documentElement.clientHeight;
    } else if (document.body && document.body.clientHeight >= 0) {
      return document.body.clientHeight;
    } else if (window.innerHeight >= 0) {
      return window.innerHeight;
    } else {
      return 0;
    }
  },


  /*!
   * contentloaded.js
   * referenced at https://developer.mozilla.org/en-US/docs/Web/Events/DOMContentLoaded
   *
   * Author: Diego Perini (diego.perini at gmail.com)
   * License: MIT
   * Version: 1.2
   *
   * URL:
   * http://javascript.nwbox.com/ContentLoaded/
   * http://javascript.nwbox.com/ContentLoaded/MIT-LICENSE
   *
   */
  domready: function( fn ) {
    var done = false, top = true,

    doc = window.document, root = doc.documentElement,

    init = function(e) {
      if (e.type === 'readystatechange' && doc.readyState !== 'complete') return;
      Utils.removeEvent((e.type === 'load' ? window : document), e.type, init);
      if (!done && (done = true)) fn.call(window, e.type || e);
    },

    poll = function() {
      try { root.doScroll('left'); } catch(e) { setTimeout(poll, 50); return; }
      init('poll');
    };

    if (doc.readyState === 'complete') fn.call(window, 'lazy');
    else {
      if ( !doc.addEventListener && root.doScroll) {
        try { top = !window.frameElement; } catch(e) { }
        if (top) poll();
      }

      Utils.addEvent( document, 'DOMContentLoaded', init );
      Utils.addEvent( document, 'readystatechange', init );
      Utils.addEvent( window,   'load',             init );
    }

  },


  /**
   * Simple throttle function.
   * @param  {Function} fn       function to be throttled
   * @param  {integer}  minDelay minimum delay in ms between 2 calls of the function
   * @private
   */
  throttle: function(fn, minDelay) {
    var lastCall = 0;
    return function() {
      var now = +new Date();
      if (now - lastCall < minDelay) {
        return;
      }
      lastCall = now;

      // https://github.com/documentcloud/underscore/issues/387
      fn.apply(this, arguments);
    };
  },

  appendCss: function( stylesheet ) {
    var css = document.createElement( 'style' );
    css.type = 'text/css';
    if( css.styleSheet && !css.sheet )
      css.styleSheet.cssText = stylesheet;
    else
      css.appendChild( document.createTextNode( stylesheet ) );

    document.getElementsByTagName('head')[0].appendChild( css );
  },


  /**
   * Globally evaluates a JavaScript code.
   * @param  {String} code JS source code to evaluate
   *
   * @private
   */
  globalEvalJavascript: function( scriptNode ) {
    var script = document.createElement( 'script' );
    script.text = scriptNode.innerHTML;
    script.src = scriptNode.src;
    script.async = scriptNode.async;
    document.getElementsByTagName('head')[0].appendChild( script ).parentNode.removeChild( script );
  }

};


window.requestAnimFrame =
  window.requestAnimationFrame       ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame    ||
  function( callback ){
    window.setTimeout(callback, 1000 / 60);
  };


// https://github.com/jquery/sizzle/blob/3136f48b90e3edc84cbaaa6f6f7734ef03775a07/sizzle.js#L708
Utils.contains = document.documentElement.compareDocumentPosition ?
  function( a, b ) {
    return !!(a.compareDocumentPosition( b ) & 16);
  } :
  document.documentElement.contains ?
  function( a, b ) {
    return a !== b && ( a.contains ? a.contains( b ) : false );
  } :
  function( a, b ) {
    while ( (b = b.parentNode) ) {
      if ( b === a ) {
        return true;
      }
    }
    return false;
  };


/**
 * Find a media query match starting from the last one.
 * @private
 */
Utils.matchMediaQueries = ( window.matchMedia === void 0 ) ?
  function( mediaQueries ) {
    return mediaQueries.length > 0 ? mediaQueries.length - 1 : 0;
  } :
  function( mediaQueries )
  {
    for( var i = mediaQueries.length - 1; i >= 0; i-- ) {
      if( window.matchMedia( mediaQueries[i] ).matches ) {
        return i;
      }
    }
    return 0;
  };


module.exports = Utils;
