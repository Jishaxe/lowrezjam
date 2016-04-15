var EventEmitter = require('events').EventEmitter
var inherits = require('util').inherits

function TalkingHana () {
  this.sprite = null

  this.addToPhaser = function (phaser) {
    phaser.world.setBounds(0, 0, 64, 64)
    this.sprite = phaser.add.sprite(6, 20, 'talkinghana_happy')
  }

  this.removeFromPhaser = function (phaser) {
    this.sprite.destroy()
  }

  this.onKey = function (phaser, keys) {

  }
}

inherits(TalkingHana, EventEmitter)
module.exports = TalkingHana
