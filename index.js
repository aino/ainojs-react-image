const React = require('react')
const isNode = typeof window == 'undefined'

var findSize = (array, num) => {
  array = array.map((n) => {
    return parseInt(n, 10)
  }).sort((a, b) => {
    return a-b
  })
  var ans
  array.some((a) => {
    ans = a
    return a > num
  })
  return ans
}

var pixelRatio = isNode ? 1 : Math.min(1.8, window.devicePixelRatio) || 1

module.exports = React.createClass({

  displayName: 'Aino React Image',

  getInitialState() {
    return {
      loading: true,
      display: '',
      fallback: '',
      padding: 0,
      shouldload: false,
      mounted: false
    }
  },

  getDefaultProps() {
    return {
      alt: '',
      threshold: (!isNode && window.navigator.userAgent.match(/iPhone/i)) ? 500 : 50,
      onLoad: () => {}
    }
  },

  getImage(width, src) {
    src = src || this.props.src
    if ( typeof src == 'string' )
      return src
    else if ( Object.prototype.toString.call(src) == '[object Object]' ) {
      let sizes = Object.keys(src)
      let ratio = this.props.ratio || (this.state.padding ? this.state.padding/100 : 1)
      let m = width * Math.max(1, ratio)
      return src[findSize(sizes, (m*pixelRatio))]
    } else {
      throw new TypeError('"src" must be a string or object')
    }
  },

  componentWillMount() {
    this.setState({
      fallback: this.getImage(500),
      padding: this.getPadding()
    })
  },

  getPadding(props) {
    props = props || this.props
    return props.ratio ? Math.round(props.ratio*10000)/100 : 0
  },

  componentDidMount() {
    this.setState({
      mounted: true
    })
    if ( this.props.lazy && !isNode ) {
       window.addEventListener('scroll', this.onScroll)
    }
    if ( !isNode )
      window.addEventListener('orientationchange', this.onOrientationChange)

    if ( this.props.lazy && !this.props.ratio )
      console.warn('Lazy loading images without a ratio is not recommended and might fail')
    if ( this.props.blendImage ) {
      let p = new Image()
      p.src = this.props.blendImage
    }
    this.setState({
      display: this.getImage(this.imageNode.parentNode.getBoundingClientRect().width),
      shouldload: !this.props.lazy,
    }, () => {
      this.onScroll()
      this.load()
    })
  },

  componentWillReceiveProps(nextProps) {
    if ( JSON.stringify(this.props.src) != JSON.stringify(nextProps.src)) {
      this.setState({
        display: this.getImage(this.imageNode.parentNode.getBoundingClientRect().width, nextProps.src),
      }, this.load)
    }
    if ( this.props.ratio !== nextProps.ratio ) {
      this.setState({
        padding: this.getPadding(nextProps)
      })
    }
  },

  load() {
    if ( this.isMounted() && this.state.shouldload ) {
      var img = new Image()
      img.onload = this.onImageLoad
      img.src = this.state.display
    }
  },

  onScroll() {
    if ( isNode )
      return
    if ( this.state.shouldload || !this.isMounted() ) {
      this.removeScrollListener()
      return
    }
    if ( !this.imageNode )
      return
    let rect = this.imageNode.getBoundingClientRect()
    if ( rect.bottom > -this.props.threshold && rect.top < window.innerHeight+this.props.threshold ) {
      this.setState({
        shouldload: true
      }, this.load)
    }
  },

  onOrientationChange() {
    if ( isNode || !this.isMounted() )
      return
    this.setState({
      display: this.getImage(this.imageNode.parentNode.getBoundingClientRect().width)
    })
  },

  removeScrollListener() {
    if ( isNode )
      return
    window.removeEventListener('scroll', this.onScroll)
  },

  componentWillUnmount() {
    this.removeScrollListener()
    window.removeEventListener('orientationchange', this.onOrientationChange)
  },

  onImageLoad(e) {
    if ( !this.isMounted() )
      return
    this.setState({
      loading: false,
      padding: this.state.padding || Math.round(e.target.height/e.target.width*10000)/100
    }, () => {
      this.setState({
        display: this.getImage(this.imageNode.parentNode.getBoundingClientRect().width)
      }, () => {
        this.props.onLoad(e.target)
      })
    })
  },

  render() {

    var classNames = ['image-container']
    var imageStyle = {}
    var containerStyle = {}
    if ( this.state.mounted ) {
      containerStyle.paddingBottom = this.state.padding+'%',
      containerStyle.position = 'relative'
    }

    var blendUrl = this.props.blendImage ? (', url('+this.props.blendImage+')') : ''

    if (!this.state.loading) {
      imageStyle = {
        backgroundImage: 'url('+this.state.display+')' + blendUrl
      }
      if ( this.props.blendMode ) {
        imageStyle.backgroundBlendMode = this.props.blendMode
      }
      classNames.push('ready')
    } else if ( this.state.display ) {
      classNames.push(this.state.shouldload ? 'loading' : 'waiting')
    }

    if ( this.props.lazy )
      classNames.push('lazy')

    if ( this.state.padding )
      classNames.push('padding')

    if ( this.props.className )
      classNames.push(this.props.className)

    var noscript = { __html: '<noscript><img src="'+this.state.fallback+'" alt="'+this.props.alt+'"></noscript>' }

    var img = React.createElement('div', {
      className: 'image',
      style: imageStyle,
      dangerouslySetInnerHTML: noscript
    })

    return React.createElement('div', {
      ref: (n) => { this.imageNode = n },
      className: classNames.join(' '),
      style: containerStyle
    }, img)
  }
})
