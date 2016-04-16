var EventEmitter = require('events').EventEmitter
var inherits = require('util').inherits

function TalkingHana () {
  this.sprite = null
  this.bubble = null
  this.space_to_continue = null
  this.text = null

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

    this.bubble = phaser.add.sprite(0, 10, 'bubble')
    this.text = phaser.add.bitmapText(2, 19, 'pixel', 'why hello there how are you doing love you lots', 8)
    phaser.physics.enable(this.text, Phaser.Physics.ARCADE)
  }

  this.removeFromPhaser = function (phaser) {
    this.sprite.destroy()
    this.space_to_continue.destroy()
  }

  this.changed_already = false
  this.onKey = function (phaser, keys) {
    if (keys.space.isDown) {
      this.text.body.velocity.x = -30
    } else {
      this.text.body.velocity.x = 0
    }

    if (this.text.x < -50 && !this.changed_already) {
      this.sprite.loadTexture('talkinghana_amazing')
      this.changed_already = true
    }
  }
}

inherits(TalkingHana, EventEmitter)
module.exports = TalkingHana
