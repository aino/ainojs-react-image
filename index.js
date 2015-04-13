/** @jsx React.DOM */

var React = require('react')
var Dimensions = require('ainojs-dimensions')

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

var pixelRatio = window.devicePixelRatio || 1

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
    if ( this.props.lazy ) {
       window.addEventListener('scroll', this.onScroll)
    }
    var width = Dimensions(this.getDOMNode().parentNode).width
    this.setState({
      display: this.getImage(width),
      shouldload: !this.props.lazy,
    }, function() {
      this.onScroll()
      this.load()
    })
  },

  load: function() {
    if ( this.state.shouldload ) {
      var img = new Image()
      img.onload = this.onImageLoad
      img.src = this.state.display
    }
  },

  onScroll: function(e) {
    if ( this.state.shouldload ) {
      this.removeScrollListener()
      return
    }
    var dim = Dimensions(this.getDOMNode())
    var top = dim.top
    var bottom = top+dim.height
    var scrolled = document.body.scrollTop
    var height = window.innerHeight
    if ( bottom > scrolled && top < scrolled+height )
      this.setState({
        shouldload: true
      }, this.load)
  },

  removeScrollListener: function() {
    window.removeEventListener('scroll', this.onScroll)
  },

  componentWillUnmount: function() {
    this.removeScrollListener()
  },

  onImageLoad: function(e) {
    this.setState({
      loading: false,
      padding: this.state.padding || Math.round(e.target.height/e.target.width*10000)/100
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
      classNames.push('loading')
    }

    var noscript = { __html: '<noscript><img src="'+this.state.fallback+'"></noscript>' }
    return (
      <div className={classNames.join(' ')} style={containerStyle}>
        <div className="image" style={imageStyle} dangerouslySetInnerHTML={noscript} />
      </div>
    )
  }
})