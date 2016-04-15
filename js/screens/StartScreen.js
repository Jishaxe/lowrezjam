var inherits = require('util').inherits
var EventEmitter = require('events').EventEmitter

function StartScreen () {
  EventEmitter.call(this)

  this.addToPhaser = function (phaser) {

  }

  this.removeFromPhaser = function (phaser) {

  }

  this.onKey = function (phaser, keys) {
    this.emit('complete')
  }
}

inherits(StartScreen, EventEmitter)
module.exports = StartScreen
