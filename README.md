# LazyFill

LazyFill is a JavaScript library allowing responsive lazy loading of components in a page.

The core reason of this library is to provide with a standard way of lazy loading any type of object on a web page.
The source of each object is selected using media queries to cater to Responsive Design needs.

## Features

- an extendable module system, allowing any type of components to be loaded
- an eager and lazy mode
- a page global media query match
- a deferred mode
- a callback system

## Supported browser

- Internet Explorer 8+
- Safari and Safari Mobile
- Chrome
- Firefox

## Installing the library

```html
<script src="lazyfill.min.js" data-media-queries="only all,(min-width: 768px),(min-width: 1025px)"></script>
```

## Modules

### Common

Each future component is placed on the page using a placeholder.
Eager component are loaded after `DOMContentLoaded` and before `onload`. 
Lazy components are loaded as soon as they might become visible on the screen.

Media queries are evaluated from right to left, with the first matching being used.

List of placeholder attributes common to all modules:

- **sources:** the sources for each media queries

- **media-queries:** A component can override the page global media queries.

- **defer:** deferred components will be always loaded after the `onload` event.



### Images
 
The placeholder of the image can have a `fluid` class. The fluid class makes an image have a 100% width.

In order ot reserve the space for the image ahead of when it will be effectively loaded, a `ratios` attribute can be set, with a list of width to height ratio, that will be applied to the placeholder height.

This list will be matched to the selected media query.


**ratios:** list of height to width ratios, for the different sources of the images


### iframes

Every iframe is deferred by default, be it eager or lazy, as to not block the onload event.

**scrolling:** `iframe` Element scrolling property
 
**frameborder:** `iframe` Element frameborder property

**frame-width:** `iframe` Element width property

**frame-height:** `iframe` Element height property

### HTML Snippet

HTML Snippet is a piece of HTML that will be loaded from an external URL, and placed inside the placeholder.
The complete content of the placeholder will be replaced.
Any scripts inside the snippet will be evaluated.

As with any component, it can deferred as to be loaded after onload event.


## Examples

### Images

```html
<div class="eager-responsive-image" alt="alt text"
  data-sources="img1.jpg,img2.jpg,img3.jpg,img4.jpg">
</div>
<noscript><img src="img1.jpg" /></noscript>
```

```html
<div class="eager-responsive-image" data-defer alt="alt text"
  data-sources="img1.jpg,img2.jpg,img3.jpg,img4.jpg">
</div>
```

```html
<div class="lazy-responsive-image" alt="alt text"
  data-sources="img1.jpg,img2.jpg"
  data-media-queries="only all,(min-width: 768px)">
</div>
```

```html
<div class="lazy-responsive-image fluid" alt="alt text"
  data-ratios="50%,60%,70%,90%"
  data-sources="img1.jpg,img2.jpg,img3.jpg,img4.jpg">
</div>
```

### iframes

```html
<div class="eager-iframe" data-source="https://myiframe/"
  data-frame-width="300px" data-frame-height="320px"
  data-media-query="(min-width: 768px)" >
</div>
```

```html
<div class="lazy-iframe" data-source=",https://myiframe/"
  data-frame-width="300px" data-frame-height="320px"
  data-media-query="only all,(min-width: 768px)" >
</div>
```

### HTML Snippet

```html
<div class="eager-html-snippet" data-sources="snippet.html">
</div>
```


## Contribute

### Building Your Copy of React

The process to build `lazyfill.js` is built entirely on top of node.js, using many libraries you may already be familiar with.

#### Prerequisites

* You have `node` installed at v0.10.0+ (it might work at lower versions, we just haven't tested).
* You are familiar with `npm` and know whether or not you need to use `sudo` when installing packages globally.
* You are familiar with `git`.

#### Build

Once you have the repository cloned, building a copy of `lazyfill.js` is really easy.

```sh
# grunt-cli is needed by grunt; you might have this installed already
npm install -g grunt-cli
npm install
grunt build
```

At this point, you should now have a `build/` directory populated with everything you need to use React. The examples should all work.
