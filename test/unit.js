var mocha = require('mocha')
var chai = require('chai')
var React = require('react')
var ReactDOMServer = require('react-dom/server')
var ImageComponent = require('../index')
var assert = chai.assert
var expect = chai.expect
var should = chai.should()

var images = {
  800: "http://galleria.io/static/i/s2013/2m.jpg", 
  200: "http://galleria.io/static/i/s2013/2s.jpg"
}

var component = React.createClass({
  render() {
    return <ImageComponent src={images} lazy={true} ratio={114/200} alt="Snorkel" />
  }
})

var element = React.createFactory(component)()
var output = ReactDOMServer.renderToString(element)
console.log(output)