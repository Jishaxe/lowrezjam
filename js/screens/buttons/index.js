var Button = require('./Button')

function Buttons () {
  this.buttons = []
  this.debounce = false
  this.selected_button = 0

  this.add = function (x, y, text) {
    var button = new Button(x, y, text)
    if (this.buttons.length === 0) button.selected = true

    this.buttons.push(button)
    return button
  }

  this.addToPhaser = function (phaser) {
    this.buttons.forEach(function (button) {
      button.addToPhaser(phaser)
    })
  }

  this.removeFromPhaser = function (phaser) {
    this.buttons.forEach(function (button) {
      button.removeFromPhaser(phaser)
    })
  }

  this.onKey = function (phaser, keys) {
    var self = this

    if (keys.space.isDown || keys.enter.isDown) {
      this.buttons[this.selected_button].emit('click')
    }

    if (keys.down.isDown && !this.debounce) {
      if (this.selected_button < (this.buttons.length - 1)) this.selected_button++
      else this.selected_button = 0

      this.debounce = true
      setTimeout(function () {
        self.debounce = false
      }, 200)
    }

    if (keys.up.isDown && !this.debounce) {
      if (this.selected_button > 0) this.selected_button--
      else this.selected_button = this.buttons.length - 1

      this.debounce = true
      setTimeout(function () {
        self.debounce = false
      }, 200)
    }

    this.buttons.forEach(function (button, i) {
      if (i === self.selected_button) button.selected = true
      else button.selected = false
      button.onKey(phaser, keys)
    })
  }
}

module.exports = Buttons
