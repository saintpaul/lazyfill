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
  '.eager-responsive-image.fluid, .lazy-responsive-image.fluid {' +
    'display: block;' +
    'position: relative;' +
  '}' +
  '.eager-responsive-image.fluid img, .lazy-responsive-image.fluid img {' +
      'position: absolute;' +
      'top:0;' +
      'left:0;' +
      'width: 100%' +
  '}';

  Utils.appendCss( css );

})();



/**
 * HTML5 Picture loading module.
 */
var PicturePlugin = {
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

    applyRatio( component, currentMediaQuery );

    if( !component.pictureElement ) {
      var sources = ModuleBase.safeSplitArray( placeholder, currentMediaQuery );
      var pictureElement = document.createElement( 'picture' );
      var imgElement = document.createElement( 'img' );

      for( var i = 0; i < sources.length; i++) {
        Things[i
      }
        var alt = placeholder.getAttribute( 'data-alt' );
        imgElement = document.createElement( 'img' );
        if( alt )
          imgElement.alt = alt;

        placeholder.appendChild( imgElement );

      component.imgElement = imgElement;
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


  eagerSelector:  '.eager-responsive-picture',

  lazySelector:   '.lazy-responsive-picture'
};


module.exports = PicturePlugin;
