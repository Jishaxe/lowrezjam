/* globals Phaser */
var $ = require('jquery')
var Maze = require('./mazes').Maze

window.app = new App('#game-container')
window.app.start()

// Main app class
function App (gameContainer) {
  var self = this
  this.gameContainer = gameContainer
  this.phaser = null
  this.maze = null

  // Start game
  this.start = function () {
    // Assign resize handler and trigger it once.
    // Keeps the game container in proportion!
    $(window).resize(self.onResize)
    self.onResize()

    // Fade in the game
    $('#container').css('opacity', 1)

    self.startPhaser()
  }

  this.loadMaze = function (maze) {
    if (self.maze != null) {
      self.maze.destroy()
    }

    self.maze = maze
    self.maze.addToPhaser(self.phaser)
  }

  this.onCreate = function () {
    var maze = new Maze()
    maze.generate(5, 5)
    self.loadMaze(maze)
  }

  this.onPreload = function () {
    self.phaser.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT
  }

  // Gamecontainer resize handler
  this.onResize = function (stuff) {
    // Resize the canvas parent with a ratio of 1:1
    var width = $(gameContainer).width()
    $(gameContainer).height(width)
  }

  // Starts up the phaser instance
  this.startPhaser = function () {
    self.phaser = new Phaser.Game(64, 64, Phaser.CANVAS, this.gameContainer.split('#')[1], {preload: this.onPreload, create: this.onCreate})
  }
}

module.exports = App
