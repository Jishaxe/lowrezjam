var EventEmitter = require('events').EventEmitter
var inherits = require('util').inherits

function TalkingHana () {
  this.sprite = null
  this.space_to_continue = null

  this.story = [{
    text: 'Test text',
    emotion: 'happy'
  }]

  this.addToPhaser = function (phaser) {
    phaser.world.setBounds(0, 0, 64, 64)
    this.sprite = phaser.add.sprite(6, 40, 'talkinghana_happy')

    this.space_to_continue = phaser.add.sprite(44, 56, 'space')

    var tween = phaser.add.tween(this.space_to_continue).to({alpha: 0}, 500, 'Linear', true)
    tween.repeat()
    // this.space_to_continue = phaser.add.bitmapText(2, 1, 'pixel', 'space', 8)
  }

  this.removeFromPhaser = function (phaser) {
    this.sprite.destroy()
    this.space_to_continue.destroy()
  }

  this.onKey = function (phaser, keys) {

  }
}

inherits(TalkingHana, EventEmitter)
module.exports = TalkingHana
