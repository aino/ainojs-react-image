# ainojs-react-image

Lazyloads responsive images based on resolution.


## Plain image without lazy:

    <ImageComponent src="http://galleria.io/static/i/s2013/2m.jpg" ratio={114/200} />

``ratio`` can be omitted but is recomended or your component will not know it’s height until the image is loaded


## Lazyload resolution-dependent image:

    var images = {
      800: "http://galleria.io/static/i/s2013/2m.jpg", 
      200: "http://galleria.io/static/i/s2013/2s.jpg"
    }

    <ImageComponent src={images} lazy={true} ratio={114/200} alt="Snorkel" />


## Run a function when the image has loaded and is displayed:

    onImageLoad: function(imgElement) {
      console.log(imgElement)
    }

    [...]

    <ImageComponent src={images} lazy={true} ratio={114/200} onLoad={this.onImageLoad} />


## Run a function when the image fails to load (defaults to 3000ms, you can set timeout as prop)

    onImageError: function(imgElement) {
      console.log('error', imgElement)
    }

    [...]

    <ImageComponent src={images} lazy={true} ratio={114/200} onError={this.onImageError} />


## All properties:

- **src** (String or Object) Image source URL or an object of sizes and URLs (se above).
- **alt** (String) Alt text for the generated ``<img>`` tag.
- **lazy** (Boolean) Toggles lazy load.
- **ratio** (Number) Sets the image ratio (height/width).
- **blendImage** (String) Adds another blended image, useful for texture backgrounds.
- **blendMode** (String) Sets image blend mode for browsers that supports it.
- **threshold** (Number) Defines the amount of pixels below/above the screen for the image to show on lazy load.
- **onLoad** (Function) Runs when the image has loaded. First argument is the image node.
- **onBeforeLoad** (Function) Runs before this image starts loading.
- **onError** (Function) Runs when the image has failed to load through timeout or http response. First argument is the image node.
