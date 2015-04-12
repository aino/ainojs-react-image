/** @jsx React.DOM */

var React = require('react')
var Dimensions = require('ainojs-dimensions')

var findClosest = function(array, num) {
  array = array.sort(function(a, b) {
    return a - b
  })
  var i = array.length
  var ans = array[0]
  while( i-- && num < array[i] )
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
      shouldLoad: false
    }
  },

  getImage: function(width) {
    if ( this.props.image )
      return this.props.image
    else if ( this.props.images ) {
      var sizes = Object.keys(this.props.images)
      return this.props.images[findClosest(sizes, width*pixelRatio)]
    }
    return '#'
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
    var padding = this.state.padding
    if (!padding) {
      padding = Math.round(e.target.height/e.target.width*10000)/100
    }
    this.setState({
      loading: false,
      padding: padding
    })
  },

  render: function() {

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
    }

    var noscript = { __html: '<noscript><img src="'+this.state.fallback+'"></noscript>' }

    return (
      <div className="image-container" style={containerStyle}>
        <div className="image" style={imageStyle} dangerouslySetInnerHTML={noscript} />
      </div>
    )
  }
})