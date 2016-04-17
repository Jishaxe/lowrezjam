var inherits = require('util').inherits
var EventEmitter = require('events').EventEmitter
var Buttons = require('./buttons')

function StartScreen () {
  EventEmitter.call(this)
  this.buttons = null
  this.start_button = null
  this.controls_button = null

  this.hana = null
  this.ghost = null
  this.tinypetals = null

  this.addToPhaser = function (phaser) {
    this.tinypetals = phaser.add.group()
    this.tinypetals.enableBody = true
    this.tinypetals.physicsBodyType = Phaser.Physics.ARCADE

    this.buttons = new Buttons()

    this.start_button = this.buttons.add(0, 40, 'Play')

    var self = this
    this.start_button.on('click', function () {
      self.emit('complete')
    })

    this.buttons.addToPhaser(phaser)

    this.hana = phaser.add.sprite(4, 12, 'player_right')
    this.hana.animations.add('run')
    this.hana.animations.play('run', 8, true)

    this.ghost = phaser.add.sprite(18, 12, 'ghost_crying')
    this.ghost.animations.add('cry')
    this.ghost.animations.play('cry', 8, true)

    phaser.physics.enable([this.hana, this.ghost], Phaser.Physics.ARCADE)
    this.hana.body.velocity.x = 40
    this.ghost.body.velocity.x = 40

    this.hana.body.immovable = true
    this.ghost.body.immovable = true

    this.hana.body.setSize(5, 5, 0, 0)
    this.ghost.body.setSize(5, 5, 0, 0)
  }

  this.removeFromPhaser = function (phaser) {
    this.buttons.removeFromPhaser(phaser)
    this.buttons = null

    this.hana.destroy()
    this.ghost.destroy()
    this.tinypetals.destroy()
  }

  this.onKey = function (phaser, keys) {
    if (this.buttons) this.buttons.onKey(phaser, keys)

    if (this.ghost.x > 64) {
      this.ghost.x = -12
    }

    if (this.hana.x > 64) {
      this.hana.x = -12
    }

    if (phaser.rnd.between(0, 40) === 20) {
      var petal = this.tinypetals.create(phaser.world.randomX, -30, 'tinypetal')
      petal.body.gravity.y = 20
      petal.body.gravity.x = phaser.rnd.between(-20, 20)
      petal.body.collideWorldBounds = true
      petal.body.bounce.set(0.8)
    }

    this.tinypetals.forEach(function (petal) {
      if (petal.y > 58) petal.destroy()
    })

    phaser.physics.arcade.collide(this.hana, this.tinypetals)
    phaser.physics.arcade.collide(this.ghost, this.tinypetals)
  }
}

inherits(StartScreen, EventEmitter)
module.exports = StartScreen
