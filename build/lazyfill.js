(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
/*
The MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

@authors
Alexandre Jozwicki - https://twitter.com/AlexJozwicki
*/
'use strict';

var Utils = require( './Utils.js' );

var lazyOffset          = 500,        // Vertical offset in px. Used for preloading images while scrolling
    clientHeight        = Utils.clientHeight(), // Window height
    isLoaded            = false,
    loadedComponents    = [],
    lazyComponents      = [],
    deferredComponents  = [],

    mediaQueries        = [ 'only all', '(min-width: 768px)', '(min-width: 1025px)'/*, '(min-resolution: 192dpi),(min-resolution: 2dppx)'*/ ],
    currentMediaQuery   = 0;

var plugins = [
  require( './plugins/Image.js' ),
  require( './plugins/Iframe.js' ),
  require( './plugins/HtmlSnippet.js' ),
  require( './plugins/HtmlUncomment.js' )
];

var Component = require( './Component.js' );


/**
 * Shows a component for the first time.
 * The handler is called only once upon loading.
 *
 * @param  {Component} component
 * @private
 */
function loadComponent( component ) {
  if( component.deferred && !isLoaded ) {
    deferredComponents.push( component );
  }
  else {
    component.execHandler( currentMediaQuery );
    component.execCallbackOnce();
    loadedComponents.push( component );
  }
}


/**
 * @private
 */
function showDeferredComponents()
{
  if( deferredComponents.length > 0 ) {
    loadComponent( deferredComponents.pop() );
    requestAnimFrame( showDeferredComponents );
  }
  else
    deferredComponents = [];
}


/**
 * Discover every components inside an element.
 * Deferred component will be loaded after the onload event.
 * CSS class used for discovery is removed to avoid them being processed a second time.
 *
 * @param  {DOMElement}     element the dom element to parse
 * @param  {LazyFillPlugin} plugin  the one to install
 *
 * @private
 */
function discoverComponentsWithPlugin( element, plugin ) {
  // eager
  //
  var elements = element.querySelectorAll( plugin.eagerSelector );
  var i=0, deferred=false, component;

  for( i = elements.length - 1; i >= 0; i-- ) {
    deferred = plugin.defer === true || elements[ i ].hasAttribute( 'data-defer' );
    component = new Component( elements[i], plugin.process, deferred );

    component.execHandler( currentMediaQuery );
    loadComponent( component );
  }


  // lazy
  //
  elements = element.querySelectorAll( plugin.lazySelector );

  for( i = elements.length - 1; i >= 0; i-- ) {
    deferred = plugin.defer === true || elements[ i ].hasAttribute( 'data-defer' );
    component = new Component( elements[i], plugin.process, deferred );

    component.execHandler( currentMediaQuery );
    lazyComponents.push( component );
  }
}


/**
 * @param  {DOMElement} element parent element of lazy components
 * @private
 */
function _discoverComponents( element )
{
  for (var i = plugins.length - 1; i >= 0; i--) {
    discoverComponentsWithPlugin( element, plugins[i] );
  }
}



/**
 * @param  {Component}  component the component definition
 * @param  {Integer}    index     index of the component in the lazy loading registry
 * @return {Boolean}              whether the component has been displayed
 *
 * @internal
 */
function showIfVisible( component, index ) {
  var element = component.element;

  if( Utils.contains( document.documentElement, element ) &&
      element.getBoundingClientRect().top < clientHeight + lazyOffset ) {

    loadComponent( component );
    lazyComponents[index] = null;

    return true;
  } else {
    return false;
  }
}


/**
 * @internal
 */
function showLazyComponents() {
  var allComponentsDone = true;

  for( var current = 0; current < lazyComponents.length; current++ ) {
    var component = lazyComponents[current];
    if( component !== null && !showIfVisible( component, current ) ) {
      // something that needs to be shown is still not shown
      allComponentsDone = false;
    }
  }

  if( allComponentsDone && isLoaded ) {
    lazyComponents = [];
  }
}


/**
 * Checks if a new media query match better suited is found. If it is, reload a new source for all the already
 * loaded images.
 * @internal
 */
function resizeComponents()
{
  clientHeight = Utils.clientHeight();

  if( Utils.matchMediaQueries( mediaQueries ) !== currentMediaQuery ) {
    for (var i = 0; i < loadedComponents.length; i++) {
      loadedComponents[i].execHandler( currentMediaQuery );
    }
  }
}

/**
 * @internal
 */
function updateClientHeight()
{
  clientHeight = Utils.clientHeight();
}



var showLazyComponentsT     = Utils.throttle(showLazyComponents, 20);


/**
 * find and merge images on domready
 * @private
 */
function init() {
  // default media queries for the whole page can be overriden on the script tag of lazyfill
  var me = document.querySelector( 'script[data-media-queries]' );
  if( me ) {
    mediaQueries = me.getAttribute( 'data-media-queries' ).split( ',' );
  }

  // initial match
  currentMediaQuery = Utils.matchMediaQueries( mediaQueries );

  // on mobile devices, the offset is roughly the same as the screen height, since a touch
  // scroll will most likely shift the whole page
  if( /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile/g.test( navigator.userAgent ) )
    lazyOffset = 1000;

  _discoverComponents( document );
}



/**
 * When the page is fully loaded, try to fill the component, if possible
 * @private
 */
function onLoad() {
  isLoaded = true;

  // showing component waiting for the page to have loaded
  requestAnimFrame( showDeferredComponents );

  // if page height changes (hiding elements at start)
  // we should recheck for new in viewport images that need to be shown
  // see onload test
  showLazyComponentsT();

  // show the components once the browser gives us time to
  requestAnimFrame( showLazyComponentsT );
}


(function registerEvents() {
  Utils.domready( init );
  Utils.addEvent( window, 'load',   onLoad );
  Utils.addEvent( window, 'scroll', showLazyComponentsT);
  Utils.addEvent( window, 'touchmove', showLazyComponentsT);

  if( window.matchMedia )
    Utils.addEvent( window, 'resize', Utils.throttle( resizeComponents, 20 ) );
  else
    Utils.addEvent( window, 'resize', Utils.throttle( updateClientHeight, 20 ) );
})();


/**
 * LazyFill API
 */
var LazyFill = {
  /**
   * Discover the components and immediatly tries to load them.
   *
   * @param  {DOMElement} element   parent element of lazy components
   */
  discoverComponents: function( element )
  {
    _discoverComponents( element );
    showLazyComponentsT();
  },


  /**
   * Registers a callback function
   * @param  {Function}   filter    function filtering out the elemenet. return true to keep it
   * @param  {Function}   callback  THE callback
   */
  registerCallback: function( filter, callback )
  {
    for (var i = loadedComponents.length - 1; i >= 0; i--) {
      if( filter( loadedComponents[i].element ) )
        callback( loadedComponents[i].element );
    }

    for (var j = lazyComponents.length - 1; j >= 0; j--) {
      if( lazyComponents[j] && filter( lazyComponents[j].element ) )
        lazyComponents[j].callback = callback;
    }
  }

};



window.LazyFill = LazyFill;

},{"./Component.js":1,"./Utils.js":4,"./plugins/HtmlSnippet.js":5,"./plugins/HtmlUncomment.js":6,"./plugins/Iframe.js":7,"./plugins/Image.js":8}],3:[function(require,module,exports){
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

},{"./Utils.js":4}],4:[function(require,module,exports){
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

    if( scriptNode.src )    script.src = scriptNode.src;
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

},{}],5:[function(require,module,exports){
'use strict';

var ModuleBase = require( '../ModuleBase.js' );
var Utils = require( '../Utils.js' );



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
          Utils.globalEvalJavascript( scripts[i] );
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

},{"../ModuleBase.js":3,"../Utils.js":4}],6:[function(require,module,exports){
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

},{"../ModuleBase.js":3,"../Utils.js":4}],7:[function(require,module,exports){
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

},{"../ModuleBase.js":3}],8:[function(require,module,exports){
'use strict';

var ModuleBase   = require( '../ModuleBase.js' );
var Utils        = require( '../Utils.js' );


/**
 * Using a width/height ratio, the height of the placeholder can be set for fluid images before they
 * are downloaded.
 *
 * @param {DOMElement} image               placeholder
 * @param {Integer}    currentMediaQuery   index of the current media query
 *
 * @internal
 */
function applyRatio( component, currentMediaQuery )
{
  var placeholder = component.element;
  currentMediaQuery = ModuleBase.findQueryOverride( placeholder, currentMediaQuery );
  placeholder.style.paddingBottom = ModuleBase.safeArrayGet( placeholder, 'data-ratios', currentMediaQuery );
}


/**
 * Adds the small bit of stylesheet necessary for fluid images.
 * @internal
 */
(function init() {

  var css = '@charset "UTF-8";' +
  '.fluid, .fluid {' +
    'display: block;' +
    'position: relative;' +
  '}' +
  '.fluid img, .fluid img {' +
      'position: absolute;' +
      'top:0;' +
      'left:0;' +
      'width: 100%' +
  '}';

  Utils.appendCss( css );

})();



/**
 * Image loading module.
 * The placeholder of the image can receive a `fluid` class. The fluid class makes an image have
 * a 100% width.
 * In order ot reserve the space for the image ahead of when it will be effectively loaded,
 * a `ratios` attribute can be set, with a list of width to height ratio, that will be applied
 * to the placeholder height.
 * This list will be matched to the selected media query.
 *
 *  <div class="eager-responsive-image" alt="alt text"
 *    data-sources="img1.jpg,img2.jpg,img3.jpg,img4.jpg">
 *  </div>
 *  <noscript><img src="img1.jpg" /></noscript>
 *
 *  <div class="eager-responsive-image" data-defer alt="alt text"
 *    data-sources="img1.jpg,img2.jpg,img3.jpg,img4.jpg">
 *  </div>
 *
 *  <div class="lazy-responsive-image" alt="alt text"
 *    data-sources="img1.jpg,img2.jpg"
 *    data-media-queries="only all,(min-width: 768px)">
 *  </div>
 *
 *  <div class="lazy-responsive-image fluid" alt="alt text"
 *    data-ratios="50%,60%,70%,90%"
 *    data-sources="img1.jpg,img2.jpg,img3.jpg,img4.jpg">
 *  </div>

 */
var ImagePlugin = {
  /**
   * Parses the sources available, find a media match with one of them and displays it
   *
   * @param {Component} component           the Component object representing the element
   * @param {Integer}   currentMediaQuery   index of the current media query
   *
   * @return {Function} the new handler
   */
  show: function( component, currentMediaQuery ) {
    var placeholder = component.element;
    currentMediaQuery = ModuleBase.findQueryOverride( placeholder, currentMediaQuery );

    var newSource = ModuleBase.getSource( placeholder, currentMediaQuery );
    if( newSource === null || ( component.imgElement && newSource === component.imgElement.src ) )
      return ImagePlugin.show;

    applyRatio( component, currentMediaQuery );

    if( !component.imgElement ) {
      var alt = placeholder.getAttribute( 'data-alt' );
      component.imgElement = document.createElement( 'img' );

      if( alt ) component.imgElement.alt = alt;

      placeholder.appendChild( component.imgElement );
    }

    component.imgElement.src = newSource;

    return ImagePlugin.show;
  },


  /**
   * Applies the ratio before the image is downloaded.
   *
   * @param {Component} component           the Component object representing the element
   * @param {Integer}   currentMediaQuery   index of the current media query

   * @return {Function} the new handler
   */
  process: function( component, currentMediaQuery ) {
    applyRatio( component, currentMediaQuery );

    return ImagePlugin.show;
  },


  eagerSelector:  '.eager-responsive-image',

  lazySelector:   '.lazy-responsive-image'
};


module.exports = ImagePlugin;

},{"../ModuleBase.js":3,"../Utils.js":4}]},{},[2]);