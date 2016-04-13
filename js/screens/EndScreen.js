var inherits = require('util').inherits
var EventEmitter = require('events').EventEmitter

function EndScreen () {
  EventEmitter.call(this)

  this.addToPhaser = function (phaser) {

  }

  this.removeFromPhaser = function (phaser) {

  }

  this.onKey = function (phaser, keys) {

  }
}

inherits(EndScreen, EventEmitter)
module.exports = EndScreen
