var CreditsScreen = require('./CreditsScreen')
var inherits = require('util').inherits
var EventEmitter = require('events').EventEmitter

function EndScreen (collected, total, ended) {
  EventEmitter.call(this)
  this.collected = collected
  this.total = total
  this.hana = null
  this.ghost = null
  this.percentage = null
  this.space_to_continue = null
  this.debounce = true
  this.ended = ended
  this.credits = null

  this.addToPhaser = function (phaser) {
    var perc = (this.collected / this.total) * 100
    var txt = 'bad'
    var emotion = 'bad'
    var ghost = 'endpoint'

    if (perc <= 50) {
      emotion = 'bad'
    } else if (perc <= 99) {
      emotion = 'good'
      txt = 'good job'
      ghost = 'ghost_crying'
    } else if (perc === 100) {
      txt = 'excellent'
      emotion = 'amazing'
      ghost = 'ghost_crying'
    }


    this.percentage = phaser.add.bitmapText(0, 1, 'pixel', 'map\ncomplete\n\n' + txt, 8)
    this.percentage.x = 32 - (this.percentage.width / 2)


    this.hana = phaser.add.sprite(10, 24, 'talkinghana_' + emotion)
    this.ghost = phaser.add.sprite(35, 24, ghost)
    this.ghost.animations.add('dance')
    this.ghost.animations.play('dance', 6, true)

    this.space_to_continue = phaser.add.sprite(44, 56, 'space')
    var tween = phaser.add.tween(this.space_to_continue).to({alpha: 0}, 500, 'Linear', true)
    tween.repeat()

    var self = this
    setTimeout(function () {
      self.debounce = false
    }, 1000)
  }

  this.removeFromPhaser = function (phaser) {
    this.percentage.destroy()
    this.hana.destroy()
    this.ghost.destroy()
    this.space_to_continue.destroy()
  }

  this.onKey = function (phaser, keys) {
    if (keys.space.isDown && !this.debounce) {
      if (!this.ended) {
        this.emit('complete')
      } else {
        this.removeFromPhaser(phaser)
        this.credits = new CreditsScreen()
        this.credits.addToPhaser(phaser)
        this.debounce = true
      }
    }

    if (this.credits) this.credits.onKey(phaser, keys)
  }
}

inherits(EndScreen, EventEmitter)
module.exports = EndScreen
