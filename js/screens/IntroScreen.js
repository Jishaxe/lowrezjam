var inherits = require('util').inherits
var TalkingHana = require('../talkinghana')
var EventEmitter = require('events').EventEmitter

function IntroScreen () {
  EventEmitter.call(this)
  this.hana = null

  this.addToPhaser = function (phaser) {
    this.hana = new TalkingHana()
    this.hana.addToPhaser(phaser)

    var self = this

    this.hana.on('complete', function () {
      self.emit('complete')
    })
  }

  this.removeFromPhaser = function (phaser) {
    this.hana.removeFromPhaser(phaser)
    this.hana = null
  }

  this.onKey = function (phaser, keys) {
    if (this.hana) this.hana.onKey(phaser, keys)
  }
}

inherits(IntroScreen, EventEmitter)
module.exports = IntroScreen
