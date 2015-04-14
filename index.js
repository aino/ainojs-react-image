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
  while( num > array[i] && array[i++] )
    ans = array[i]
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
      shouldload: false,
      lazy: false
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
      padding: padding,
      lazy: isNode ? false : this.props.lazy // no lazy load for node
    })
  },

  componentDidMount: function() {
    if ( this.state.lazy ) {
       window.addEventListener('scroll', this.onScroll)
       if ( !this.props.ratio )
        console.warn('Lazy loading images without a ratio is not recommended and might fail')
    }
    var parent = this.getDOMNode().parentNode
    var width = parent.getBoundingClientRect().width
    this.setState({
      display: this.getImage(width),
      shouldload: !this.state.lazy,
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
        backgroundImage: 'url('+this.state.display+')',
        backgroundSize: 'cover',
        backgroundPosition: '50% 50%',
        backgroundRepeat: 'no-repeat',
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0
      }
    } else {
      classNames.push(this.state.shouldload ? 'loading' : 'waiting')
    }
    if ( this.state.lazy )
      classNames.push('lazy')

    var noscriptStyles = 'width:100%'
    if ( this.state.padding )
      noscriptStyles += ';position:absolute;top:0;left:0'

    var fallback = { __html: '<img src="'+this.state.fallback+'" style="'+noscriptStyles+'" alt="'+this.props.alt+'">' }

    var noscript = React.createElement('noscript', { 
      dangerouslySetInnerHTML: fallback 
    })

    var img = React.createElement('div', {
      className: 'image', 
      style: imageStyle
    }, noscript)

    return React.createElement('div', {
      className: classNames.join(' '), 
      style: containerStyle
    }, img)
  }
})