var inherits = require('util').inherits
var EventEmitter = require('events').EventEmitter
var Buttons = require('./buttons')

function StartScreen () {
  EventEmitter.call(this)
  this.buttons = null
  this.start_button = null
  this.controls_button = null

  this.addToPhaser = function (phaser) {
    this.buttons = new Buttons()

    this.start_button = this.buttons.add(0, 5, 'Play')

    var self = this
    this.start_button.on('click', function () {
      self.emit('complete')
    })

    this.controls_button = this.buttons.add(0, 40, 'Controls')

    this.buttons.addToPhaser(phaser)
  }

  this.removeFromPhaser = function (phaser) {
    this.buttons.removeFromPhaser(phaser)
    this.buttons = null
  }

  this.onKey = function (phaser, keys) {
    if (this.buttons) this.buttons.onKey(phaser, keys)
  }
}

inherits(StartScreen, EventEmitter)
module.exports = StartScreen
