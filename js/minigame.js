/* globals Phaser */
var EventEmitter = require('events').EventEmitter
var inherits = require('util').inherits

// Represents the basket-catching minigame
function Minigame () {
  EventEmitter.call(this)

  this.player = null
  this.background = null
  this.tinypetals = null
  this.explosion = null
  this.speed = 60
  this.swarm = 10
  this.petalCount = 0
  this.maxPetals = 10

  this.onKey = function (phaser, keys) {
    // Go left and flip
    if (keys.left.isDown) {
      this.player.body.velocity.x = -this.speed
      this.player.scale.x = -1
    }

    // Go right and flip
    if (keys.right.isDown) {
      this.player.body.velocity.x = this.speed
      this.player.scale.x = 1
    }

    // Jump if we're not in the air already
    if (keys.up.isDown && this.player.body.onFloor()) this.player.body.velocity.y = -80

    if (!keys.left.isDown && !keys.right.isDown) this.player.body.velocity.x = 0
  }

  this.onUpdate = function (phaser) {
    if (this.petalCount >= this.maxPetals) {
      this.emit('complete')
    }

    if (phaser.rnd.between(0, 40) === 20 && this.petalCount < this.maxPetals) {
      var petal = this.tinypetals.create(phaser.world.randomX, -10, 'tinypetal')
      petal.body.gravity.y = this.swarm
      petal.body.gravity.x = phaser.rnd.between(-this.swarm, this.swarm)
      petal.body.collideWorldBounds = true
      petal.body.bounce.set(0.8)
    }

    var self = this
    this.tinypetals.forEach(function (petal) {
      if (petal.y > 58) {
        petal.destroy()
        self.petalCount++
      }

      if (petal.collected && phaser.rnd.between(0, 20) === 20) {
        self.explosion.x = petal.x
        self.explosion.y = petal.y
        self.explosion.start(true, 2000, null, 10)
        petal.destroy()
        self.petalCount++
      }
    })

    phaser.physics.arcade.collide(this.player, this.tinypetals, function (plr, petal) {
      petal.collected = true
    })
  }

  this.addToPhaser = function (phaser) {
    phaser.world.setBounds(0, -10, 64, 74)
    this.background = phaser.add.sprite(0, 0, 'minigame')
    this.player = phaser.add.sprite(phaser.rnd.between(10, 50), phaser.world.centerY, 'player_idle')
    this.player.anchor.setTo(0.5, 1)
    phaser.physics.enable(this.player, Phaser.Physics.ARCADE)

    this.player.body.collideWorldBounds = true
    this.player.body.gravity.y = 200
    this.player.body.immovable = true

    this.tinypetals = phaser.add.group()
    this.tinypetals.enableBody = true
    this.tinypetals.physicsBodyType = Phaser.Physics.ARCADE

    this.explosion = phaser.add.emitter(0, 0, 100)
    this.explosion.makeParticles('pop')
  }

  this.removeFromPhaser = function (phaser) {
    this.player.destroy()
    this.tinypetals.destroy()
    this.explosion.destroy()
  }
}

inherits(Minigame, EventEmitter)
module.exports = Minigame
