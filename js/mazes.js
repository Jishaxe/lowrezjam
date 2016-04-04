/* globals PIXI, Phaser */

var inherits = require('util').inherits

// Represents a maze
function Maze () {
  this.cells = {}
  this.width = null
  this.height = null
  this.cellWidth = 10
  this.cellHeight = 10
  this.columns = 5
  this.rows = 5
  this.selector = null

  // Parse a maze.js linkset
  this.from = function (json) {
  }

  this.blank = function () {
    for (var x = 1; x <= this.columns; x++) {
      for (var y = 1; y <= this.rows; y++) {
        this.cells[x + ',' + y] = new Wall(x, y)
      }
    }

    this.width = this.columns * this.cellWidth
    this.height = this.rows * this.cellHeight
  }

  this.enableEditor = function () {
    this.selector = new Selector(this)
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

  // Convert this maze to JSON
  this.toJSON = function () {
    var json = {}
    json.rows = this.rows
    json.columns = this.columns
    json.cellWidth = this.cellWidth
    json.cellHeight = this.cellHeight
    json.cells = {}

    for (var key in this.cells) {
      var cell = this.cells[key]

      json.cells[key] = {
        type: cell.constructor.name,
        x: cell.x,
        y: cell.y
      }
    }

    return json
  }
}

function Selector (maze) {
  this.maze = maze
  this.sprite = null
  this.debounce = false

  // The current tween for this sprite
  this.tween = {isRunning: false}

  this.addToPhaser = function (phaser) {
    this.sprite = phaser.add.sprite(10, 10, 'selector')
    this.sprite.blendMode = PIXI.blendModes.ADD
  }

  this.getCurrentCell = function () {
    return this.maze.cells[this.sprite.x / this.maze.cellWidth + ',' + this.sprite.y / this.maze.cellHeight]
  }

  this.onKey = function (phaser, keys) {
    // If the selector box isn't moving
    if (!this.tween.isRunning) {
      phaser.tweens.remove(this.tween)

      // First, move the selector box
      var newX
      var newY

      if (keys.up.isDown) newY = this.sprite.y - 10
      if (keys.down.isDown) newY = this.sprite.y + 10
      if (keys.right.isDown) newX = this.sprite.x + 10
      if (keys.left.isDown) newX = this.sprite.x - 10

      if (newX || newY) {
        this.tween = phaser.add.tween(this.sprite)
        this.tween.to({x: newX, y: newY}, 100, Phaser.Easing.Linear.Out, true)
      }

      // Now handle the spacebar
      if (keys.space.isDown && !this.debounce) {
        var cell = this.getCurrentCell()

        // If there is a cell here
        if (cell instanceof Cell) {
          // Swap up this shit
          cell.removeFromPhaser(phaser)

          // Switch a Wall with a Floor and vice versa
          if (cell instanceof Wall) {
            var floor = new Floor(cell.x, cell.y)
            this.maze.cells[cell.x + ',' + cell.y] = floor
            floor.addToPhaser(phaser)
          } else if (cell instanceof Floor) {
            var wall = new Wall(cell.x, cell.y)
            this.maze.cells[cell.x + ',' + cell.y] = wall
            wall.addToPhaser(phaser)
          }

          // Bring the selector to the top
          this.sprite.bringToTop()
          console.log(JSON.stringify(this.maze.toJSON()))

          // Don't space again for 200ms
          this.debounce = true
          var self = this
          setTimeout(function () {
            self.debounce = false
          }, 500)
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

  this.removeFromPhaser = function (phaser) {
    this.sprite.destroy()
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
