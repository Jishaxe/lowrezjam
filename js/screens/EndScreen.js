var inherits = require('util').inherits
var EventEmitter = require('events').EventEmitter

function EndScreen (collected, total) {
  EventEmitter.call(this)
  this.collected = collected
  this.total = total
  this.hana = null
  this.percentage = null

  this.addToPhaser = function (phaser) {
    var perc = (this.collected / this.total) * 100

    this.percentage = phaser.add.bitmapText(3, 8, 'pixel', perc + '%sdnfklsdnfsdf', 8)
  }

  this.removeFromPhaser = function (phaser) {
    this.percentage.destroy()
  }

  this.onKey = function (phaser, keys) {
    if (keys.space.isDown) this.emit('complete')
  }
}

inherits(EndScreen, EventEmitter)
module.exports = EndScreen
