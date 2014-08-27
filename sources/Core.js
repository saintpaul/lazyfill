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
  require( './plugins/HtmlSnippet.js' )
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
 * Shows up the deferred components.
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
 * Installs a plugin
 * @param  {DOMElement}     element the dom element to parse
 * @param  {LazyFillPlugin} plugin  the one to install
 *
 * @private
 */
function processComponentsWithPlugin( element, plugin ) {
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
 * Processes a DOM Element to find any component inside it.
 *
 * @param  {DOMElement} element parent element of lazy components
 * @private
 */
function _processComponents( element )
{
  for (var i = plugins.length - 1; i >= 0; i--) {
    processComponentsWithPlugin( element, plugins[i] );
  }
}



/**
 * Shows a DOM element if it's about to be visible on the page
 *
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
 * Displays all the other images on the page, AFTER the onload event, and lazily (if they're visible on the page)
 * @internal
 */
function showComponents() {
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



var showComponentsT     = Utils.throttle(showComponents, 20);


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
  Utils.matchMediaQueries( mediaQueries );

  // on mobile devices, the offset is roughly the same as the screen height, since a touch
  // scroll will most likely shift the whole page
  if( /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile/g.test( navigator.userAgent ) )
    lazyOffset = 1000;

  _processComponents( document );
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
  showComponentsT();

  // show the components once the browser gives us time to
  requestAnimFrame( showComponentsT );
}


(function registerEvents() {
  Utils.domready( init );
  Utils.addEvent( window, 'load',   onLoad );
  Utils.addEvent( window, 'scroll', showComponentsT);
  Utils.addEvent( window, 'touchmove', showComponentsT);

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
   * API function exposed to the client page; processes the element and immediatly tries to load them.
   * Basically, this should only be used after the complete load of a page.
   *
   * @param  {DOMElement} element parent element of lazy components
   */
  processComponents: function( element )
  {
    _processComponents( element );
    showComponentsT();
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
