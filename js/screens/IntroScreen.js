var inherits = require('util').inherits
var EventEmitter = require('events').EventEmitter

function IntroScreen () {
  EventEmitter.call(this)

  this.addToPhaser = function (phaser) {

  }

  this.removeFromPhaser = function (phaser) {

  }
}

inherits(IntroScreen, EventEmitter)
module.exports = IntroScreen
