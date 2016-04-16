var inherits = require('util').inherits
var EventEmitter = require('events').EventEmitter

function Button (x, y, text) {
  EventEmitter.call(this)

  this.sprite = null
  this.text = null
  this.selected = false

  this.text = text
  this.x = x
  this.y = y

  this.addToPhaser = function (phaser) {
    this.sprite = phaser.add.sprite(this.x, this.y, 'button')

    this.text = phaser.add.bitmapText(this.x, this.y + 9, 'pixel', this.text, 8)
    this.text.x = 32 - (this.text.width / 2)
  }

  this.removeFromPhaser = function (phaser) {
    this.sprite.destroy()
    this.text.destroy()
    this.sprite = null
    this.text = null
  }

  this.onKey = function (phaser, keys) {
    if (this.sprite) {
      if (this.selected) this.sprite.loadTexture('button_selected')
      else this.sprite.loadTexture('button')
    }
  }
}

inherits(Button, EventEmitter)
module.exports = Button
