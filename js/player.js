/* globals Phaser */
var Wall = require('./mazes').Wall
var EventEmitter = require('events').EventEmitter
var inherits = require('util').inherits

// Represents a player in the game
function Player () {
  EventEmitter.call(this)
  var self = this

  this.walls = null
  this.floors = null
  this.sprite = null
  this.speed = 60

  this.removeFromPhaser = function (phaser) {
    this.sprite.destroy()
  }

  this.addToPhaser = function (phaser, x, y) {
    // 6 x 8
    this.sprite = phaser.add.sprite(x, y, 'player_idle')
    this.sprite.animations.add('walk', [1, 2, 3, 4])
    phaser.camera.follow(this.sprite, Phaser.Camera.FOLLOW_TOPDOWN)
  }

  this.end = function () {
    this.emit('complete')
  }

  // Set up the physics for the player and walls
  this.setupPhysics = function (phaser, maze) {
    // First give the player a physics
    phaser.physics.enable(this.sprite, Phaser.Physics.ARCADE)
    this.sprite.body.collideWorldBounds = true
    // self.sprite.body.setSize(3, 0, 8, 16)

    this.walls = phaser.add.group()
    this.walls.enableBody = true
    this.walls.physicsBodyType = Phaser.Physics.ARCADE

    this.floors = phaser.add.group()
    this.floors.enableBody = true
    this.floors.physicsBodyType = Phaser.Physics.ARCADE

    // Now give every wall a physics
    for (var key in maze.cells) {
      var cell = maze.cells[key]

      if (cell instanceof Wall) {
        this.walls.add(cell.sprite)
        cell.sprite.body.immovable = true
      } else {
        // Collide with floors that have a petal, start point or end point
        if (cell.hasPetal || cell.hasEndPoint) {
          this.floors.add(cell.sprite)
          cell.sprite.body.immovable = true
          // cell.sprite.body.setSize(8, 8, 1, 1)

          if (cell.hasPetal) cell.petal.bringToTop()
          if (cell.hasStartPoint) cell.startPoint.bringToTop()
          if (cell.hasEndPoint) cell.endPoint.bringToTop()
        }
      }
    }

    this.sprite.bringToTop()
  }

  this.onUpdate = function (phaser, maze) {
    phaser.physics.arcade.collide(this.sprite, this.walls)
    phaser.physics.arcade.overlap(this.sprite, this.floors, function (plr, floorSpr) {
      var floor = floorSpr.cell

      if (floor.hasPetal) {
        floor.hasPetal = false
        /*
        floor.removeFromPhaser(phaser)
        floor.addToPhaser(phaser)
        self.sprite.bringToTop()*/
        phaser.physics.enable(floor.petal, Phaser.Physics.ARCADE)
        floor.petal.body.gravity.y = 300
        floor.petal.body.velocity.x = phaser.rnd.between(-50, 50)
      }

      if (floor.hasEndPoint) self.end()
    })
  }

  this.lastDirection = 'idle'

  this.onKey = function (keys) {
    this.sprite.body.velocity.set(0, 0)

    if (keys.up.isDown) {
      this.sprite.body.velocity.y = -this.speed
      if (this.lastDirection !== 'up' && (!keys.left.isDown && !keys.right.isDown)) {
        this.lastDirection = 'up'
        this.sprite.loadTexture('player_up')
        this.sprite.animations.play('walk', 8, true)
      }
    }

    if (keys.down.isDown) {
      this.sprite.body.velocity.y = this.speed
      if (this.lastDirection !== 'down' && (!keys.left.isDown && !keys.right.isDown)) {
        this.lastDirection = 'down'
        this.sprite.loadTexture('player_down')
        this.sprite.animations.play('walk', 8, true)
      }
    }

    if (keys.right.isDown) {
      this.sprite.body.velocity.x = this.speed
      if (this.lastDirection !== 'right') {
        this.lastDirection = 'right'
        this.sprite.loadTexture('player_right')
        this.sprite.animations.play('walk', 8, true)
      }
    }

    if (keys.left.isDown) {
      this.sprite.body.velocity.x = -this.speed
      if (this.lastDirection !== 'left') {
        this.lastDirection = 'left'
        this.sprite.loadTexture('player_left')
        this.sprite.animations.play('walk', 8, true)
      }
    }

    if (this.sprite.body.velocity.x === 0 && this.sprite.body.velocity.y === 0) {
      if (this.lastDirection !== 'idle') {
        this.lastDirection = 'idle'
        this.sprite.loadTexture('player_idle')
        this.sprite.animations.play('walk', 4, true)
      }
    }
  }
}

inherits(Player, EventEmitter)
module.exports = Player
