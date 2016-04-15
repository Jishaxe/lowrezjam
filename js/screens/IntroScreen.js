var inherits = require('util').inherits
var EventEmitter = require('events').EventEmitter

function IntroScreen () {
  EventEmitter.call(this)

  this.addToPhaser = function (phaser) {

  }

  this.removeFromPhaser = function (phaser) {

  }

  this.onKey = function (phaser, keys) {
    if (keys.space.isDown) this.emit('complete')
  }
}

inherits(IntroScreen, EventEmitter)
module.exports = IntroScreen
