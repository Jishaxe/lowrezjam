/* globals PIXI, Phaser */

var inherits = require('util').inherits

// Represents a maze
function Maze () {
  this.cells = {}
  this.width = null
  this.height = null
  this.cellWidth = 10
  this.cellHeight = 10
  this.selector = null

  // Parse a maze.js linkset
  this.from = function (json) {
    for (var x = 1; x <= 30; x++) {
      for (var y = 1; y <= 30; y++) {
        this.cells[x + ',' + y] = new Wall(x, y)
      }
    }

    this.width = 30 * this.cellWidth
    this.height = 30 * this.cellHeight
  }

  this.enableEditor = function () {
    this.selector = new Selector()
  }

  // Add this maze to phaser
  this.addToPhaser = function (phaser) {
    for (var key in this.cells) {
      var cell = this.cells[key]
      cell.addToPhaser(phaser)
    }

    if (this.selector) {
      this.selector.addToPhaser(phaser)
      phaser.camera.follow(this.selector.sprite, Phaser.Camera.FOLLOW_TOPDOWN)
    }
  }

  this.onKey = function (phaser, keys) {
    // We only need the keys for editor mode
    if (this.selector) this.selector.onKey(phaser, keys)
  }
}

function Selector () {
  this.sprite = null

  // The current tween for this sprite
  this.tween = {isRunning: false}

  this.addToPhaser = function (phaser) {
    this.sprite = phaser.add.sprite(10, 10, 'selector')
    this.sprite.blendMode = PIXI.blendModes.ADD
  }

  this.onKey = function (phaser, keys) {
    if (!this.tween.isRunning) {
      phaser.tweens.remove(this.tween)

      var newX
      var newY

      if (keys.up.isDown) newY = this.sprite.y - 10
      if (keys.down.isDown) newY = this.sprite.y + 10
      if (keys.right.isDown) newX = this.sprite.x + 10
      if (keys.left.isDown) newX = this.sprite.x - 10

      // If we want to move left right XOR up down. Not dianoganlly!
      if ((!newX && newY) || (newX && !newY)) {
        var bounds = phaser.stage.getBounds()

        // If we're not trying to move out the map
        if ((newX >= 0 &&
          newX <= bounds.width) ||
          (newY >= 0 &&
          newY <= bounds.height)) {
          this.tween = phaser.add.tween(this.sprite)
          this.tween.to({x: newX, y: newY}, 100, Phaser.Easing.Linear.Out, true)
        }
      }
    }
  }
}

// Represents a single block. Can be a floor or a wall
function Cell (x, y) {
  this.x = x
  this.y = y
  this.width = 10
  this.height = 10
  this.sprite = null

  this.addToPhaser = function (phaser) {
    this.sprite = phaser.add.sprite((this.x * this.width), (this.y * this.height), this.getSpriteKey())
  }
}

// A walkable floor cell
function Floor (x, y) {
  Cell.call(this, x, y)

  this.getSpriteKey = function () {
    return 'floor'
  }
}

// A wall.
function Wall (x, y) {
  Cell.call(this, x, y)

  this.openNorth = false
  this.openEast = false
  this.openSouth = false
  this.openWest = false

  this.getSpriteKey = function () {
    var sprite_key = 'wall'

    if (this.openNorth) sprite_key += 'N'
    if (this.openEast) sprite_key += 'E'
    if (this.openSouth) sprite_key += 'S'
    if (this.openWest) sprite_key += 'W'

    // return sprite_key
    return 'wall'
  }
}

inherits(Wall, Cell)
inherits(Floor, Cell)

module.exports.Maze = Maze
