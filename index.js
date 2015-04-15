/** @jsx React.DOM */

var React = require('react')

var isNode = typeof window == 'undefined'

var findSize = function(array, num) {
  array = array.map(function(n) {
    return parseInt(n, 10)
  }).sort(function(a, b) {
    return a-b
  })
  var i = 0
  var ans = array[i]
  while( array[i] && num > array[i] ) {
    ans = array[++i]
  }
  return ans
}

var pixelRatio = isNode ? 1 : window.devicePixelRatio || 1

module.exports = React.createClass({

  getInitialState: function() {
    return {
      loading: true,
      display: '',
      fallback: '',
      padding: 0,
      shouldload: false
    }
  },

  getDefaultProps: function() {
    return {
      alt: '',
      threshold: (!isNode && window.navigator.userAgent.match(/iPhone/i)) ? 500 : 50,
      onLoad: function(){}
    }
  },

  getImage: function(width) {
    var src = this.props.src
    if ( typeof src == 'string' )
      return src
    else if ( Object.prototype.toString.call(src) == '[object Object]' ) {
      var sizes = Object.keys(src)
      return src[findSize(sizes, width*pixelRatio)]
    } else {
      throw new TypeError('"src" must be a string or object')
    }
  },

  componentWillMount: function() {
    var padding = 0
    if ( this.props.ratio ) 
      padding = Math.round(this.props.ratio*10000)/100
    this.setState({
      fallback: this.getImage(500),
      padding: padding
    })
  },

  componentDidMount: function() {
    if ( this.props.lazy && !isNode ) {
       window.addEventListener('scroll', this.onScroll)
    }
    if ( this.props.lazy && !this.props.ratio )
      console.warn('Lazy loading images without a ratio is not recommended and might fail')
    var parent = this.getDOMNode().parentNode
    var width = parent.getBoundingClientRect().width
    this.setState({
      display: this.getImage(width),
      shouldload: !this.props.lazy,
    }, function() {
      this.onScroll()
      this.load()
    })
  },

  load: function() {
    if ( this.isMounted() && this.state.shouldload ) {
      var img = new Image()
      img.onload = this.onImageLoad
      img.src = this.state.display
    }
  },

  onScroll: function(e) {
    if ( isNode )
      return
    if ( this.state.shouldload || !this.isMounted() ) {
      this.removeScrollListener()
      return
    }
    var rect = this.getDOMNode().getBoundingClientRect()
    if ( rect.bottom > -this.props.threshold && rect.top < window.innerHeight+this.props.threshold )
      this.setState({
        shouldload: true
      }, this.load)
  },

  removeScrollListener: function() {
    if (isNode)
      return
    window.removeEventListener('scroll', this.onScroll)
  },

  componentWillUnmount: function() {
    this.removeScrollListener()
  },

  onImageLoad: function(e) {
    if ( !this.isMounted() )
      return
    this.setState({
      loading: false,
      padding: this.state.padding || Math.round(e.target.height/e.target.width*10000)/100
    }, function() {
      this.props.onLoad(e.target)
    })
  },

  render: function() {

    var classNames = ['image-container']
    var imageStyle = {}
    var containerStyle = {
      paddingBottom: this.state.padding+'%',
      position: 'relative'
    }

    if (!this.state.loading) {
      imageStyle = {
        backgroundImage: 'url('+this.state.display+')'
      }
      classNames.push('ready')
    } else if ( this.state.display ) {
      classNames.push(this.state.shouldload ? 'loading' : 'waiting')
    }

    if ( this.props.lazy )
      classNames.push('lazy')

    if ( this.state.padding )
      classNames.push('padding')

    var noscript = { __html: '<noscript><img src="'+this.state.fallback+'" alt="'+this.props.alt+'"></noscript>' }

    var img = React.createElement('div', {
      className: 'image', 
      style: imageStyle,
      dangerouslySetInnerHTML: noscript
    })

    return React.createElement('div', {
      className: classNames.join(' '), 
      style: containerStyle
    }, thumbnail, img)
  }
})