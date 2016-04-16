/* globals Phaser */

var EventEmitter = require('events').EventEmitter
var inherits = require('util').inherits

function TalkingHana (story) {
  this.sprite = null
  this.bubble = null
  this.space_to_continue = null
  this.speed = 80
  this.text = null
  this.charSize = 8
  story.push({text: '...', emotion: 'done'})

  this.story = story

  this.addToPhaser = function (phaser) {
    phaser.world.setBounds(0, 0, 64, 64)
    this.sprite = phaser.add.sprite(6, 40, 'talkinghana_happy')

    this.space_to_continue = phaser.add.sprite(44, 56, 'space')
    var tween = phaser.add.tween(this.space_to_continue).to({alpha: 0}, 500, 'Linear', true)
    tween.repeat()

    var story_concat = ''
    this.story.forEach(function (story) {
      story_concat += story.text + ' '
    })

    this.bubble = phaser.add.sprite(0, 10, 'bubble')
    this.text = phaser.add.bitmapText(2, 19, 'pixel', story_concat, this.charSize)
    phaser.physics.enable(this.text, Phaser.Physics.ARCADE)
  }

  this.getEmotionAt = function (x) {
    var emotion = 'happy'
    var current_x = -64
    var charSize = this.charSize

    this.story.forEach(function (story, i) {
      if (x < current_x) emotion = story.emotion
      current_x -= (story.text.replace(' ', '').length * (charSize / 2))
    })

    return emotion
  }

  this.removeFromPhaser = function (phaser) {
    this.sprite.destroy()
    this.space_to_continue.destroy()
    this.bubble.destroy()
    this.text.destroy()
  }

  this.last_emotion = 'happy'
  this.onKey = function (phaser, keys) {
    if (keys.space.isDown) {
      this.text.body.velocity.x = -this.speed
    } else {
      this.text.body.velocity.x = 0
    }

    if (this.getEmotionAt(this.text.x) !== this.last_emotion) {
      var emotion = this.getEmotionAt(this.text.x)

      if (emotion !== 'done') {
        this.last_emotion = emotion
        this.sprite.loadTexture('talkinghana_' + emotion)
      } else {
        this.emit('complete')
      }
    }
  }
}

inherits(TalkingHana, EventEmitter)
module.exports = TalkingHana
