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
