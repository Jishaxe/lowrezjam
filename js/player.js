/* globals Phaser */
var Wall = require('./mazes').Wall

// Represents a player in the game
function Player () {
  this.sprite = null
  this.speed = 60

  this.addToPhaser = function (phaser, x, y) {
    // 6 x 8
    this.sprite = phaser.add.sprite(x, y, 'player')
    phaser.camera.follow(this.sprite, Phaser.Camera.FOLLOW_TOPDOWN)
  }

  this.collidedWithFloor = function (player, floorSprite) {
    var floor = floorSprite.floor
    if (floor.hasPetal) {
      floor.hasPetal = false
      floor.removeFromPhaser(this.phaser)
      floor.addToPhaser(this.phaser)
      this.sprite.bringToTop()
    }

    return true
  }

  // Set up the physics for the player and walls
  this.setupPhysics = function (phaser, maze) {
    // First give the player a physics
    phaser.physics.enable(this.sprite, Phaser.Physics.ARCADE)
    this.sprite.body.collideWorldBounds = true

    // Now give every wall a physics
    for (var key in maze.cells) {
      var cell = maze.cells[key]

      if (cell instanceof Wall) {
        phaser.physics.enable(cell.sprite, Phaser.Physics.ARCADE)
        cell.sprite.body.immovable = true

        // If the wall doesn't have an opening on the bottom, collide a little higher
        if (cell.getSpriteKey().indexOf('S') === -1) {
          cell.sprite.body.setSize(10, 8, 0, 0)
        }
      } else {
        // Collide with floors that have a petal, start point or end point
        if (cell.hasPetal || cell.hasStartPoint || cell.hasEndPoint) {
          phaser.physics.enable(cell.sprite, Phaser.Physics.ARCADE)
          cell.sprite.body.immovable = true
          cell.sprite.body.setSize(8, 8, 1, 1)
        }
      }
    }
  }

  this.onUpdate = function (phaser, maze) {
    for (var key in maze.cells) {
      var cell = maze.cells[key]
      if (cell instanceof Wall) {
        phaser.physics.arcade.collide(this.sprite, cell.sprite)
      } else {
        if (cell.hasPetal || cell.hasStartPoint || cell.hasEndPoint) {
          phaser.physics.arcade.overlap(this.sprite, cell.sprite, function () {}, this.collidedWithFloor, {sprite: this.sprite, phaser: phaser, maze: maze})
        }
      }
    }
  }

  this.onKey = function (keys) {
    if (keys.up.isDown) this.sprite.body.velocity.y = -this.speed
    if (keys.down.isDown) this.sprite.body.velocity.y = this.speed
    if (keys.right.isDown) this.sprite.body.velocity.x = this.speed
    if (keys.left.isDown) this.sprite.body.velocity.x = -this.speed

    if (!keys.down.isDown && !keys.up.isDown && !keys.left.isDown && !keys.right.isDown) this.sprite.body.velocity.set(0, 0)
  }
}

module.exports = Player
