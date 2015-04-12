# ainojs-react-image

Lazyloads responsive images based on resolution.

    var images = {
      800: "http://galleria.io/static/i/s2013/2m.jpg", 
      200: "http://galleria.io/static/i/s2013/2s.jpg"
    }

    <ImageComponent images={images} lazy={true} ratio={114/200} />