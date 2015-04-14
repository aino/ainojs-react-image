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