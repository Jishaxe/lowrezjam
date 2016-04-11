/* globals Phaser */
var Wall = require('./mazes').Wall
var EventEmitter = require('events').EventEmitter
var Floor = require('./mazes').Floor
var inherits = require('util').inherits

// Represents a player in the game
function Player () {
  EventEmitter.call(this)
  var self = this

  this.collidables = null
  this.sprite = null
  this.speed = 60

  this.removeFromPhaser = function (phaser) {
    this.sprite.destroy()
  }

  this.addToPhaser = function (phaser, x, y) {
    // 6 x 8
    this.sprite = phaser.add.sprite(x, y, 'player')
    phaser.camera.follow(this.sprite, Phaser.Camera.FOLLOW_TOPDOWN)
  }

  this.end = function () {
    this.emit('complete')
  }

  this.collidedWithCell = function (player, cellSprite) {
    var cell = cellSprite.cell

    if (cell instanceof Floor) {
      if (cell.hasPetal) {
        cell.hasPetal = false
        cell.removeFromPhaser(this.phaser)
        cell.addToPhaser(this.phaser)
        self.sprite.bringToTop()
      }

      if (cell.hasEndPoint) self.end()

      return false
    } else {
      return true
    }
  }

  // Set up the physics for the player and walls
  this.setupPhysics = function (phaser, maze) {
    // First give the player a physics
    phaser.physics.enable(this.sprite, Phaser.Physics.ARCADE)
    this.sprite.body.collideWorldBounds = true

    this.collidables = phaser.add.group()
    this.collidables.enableBody = true
    this.collidables.physicsBodyType = Phaser.Physics.ARCADE

    // Now give every wall a physics
    for (var key in maze.cells) {
      var cell = maze.cells[key]

      if (cell instanceof Wall) {
        this.collidables.add(cell.sprite)
        cell.sprite.body.immovable = true

        // If the wall doesn't have an opening on the bottom, collide a little higher
        if (cell.getSpriteKey().indexOf('S') === -1) {
          cell.sprite.body.setSize(10, 8, 0, 0)
        }
      } else {
        // Collide with floors that have a petal, start point or end point
        if (cell.hasPetal || cell.hasStartPoint || cell.hasEndPoint) {
          this.collidables.add(cell.sprite)
          cell.sprite.body.immovable = true
          cell.sprite.body.setSize(8, 8, 1, 1)
        }
      }
    }
  }

  this.onUpdate = function (phaser, maze) {
    phaser.physics.arcade.collide(this.sprite, this.collidables, function () {}, this.collidedWithCell, {sprite: this.sprite, phaser: phaser, maze: maze})
  }

  this.onKey = function (keys) {
    if (keys.up.isDown) this.sprite.body.velocity.y = -this.speed
    if (keys.down.isDown) this.sprite.body.velocity.y = this.speed
    if (keys.right.isDown) this.sprite.body.velocity.x = this.speed
    if (keys.left.isDown) this.sprite.body.velocity.x = -this.speed

    if (!keys.down.isDown && !keys.up.isDown && !keys.left.isDown && !keys.right.isDown) this.sprite.body.velocity.set(0, 0)
  }
}

inherits(Player, EventEmitter)
module.exports = Player
