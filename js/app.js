/* globals Phaser */
var $ = require('jquery')
var Maze = require('./mazes').Maze

window.app = new App('#game-container')
window.app.start()

// Main app class
function App (gameContainer) {
  var self = this
  this.gameContainer = gameContainer
  this.cursors = null
  this.phaser = null
  this.maze = null

  // Start game
  this.start = function () {
    // Assign resize handler and trigger it once.
    // Keeps the game container in proportion!
    $(window).resize(self.onResize)

    self.startPhaser()

    // Fade in the game
    $('#container').css('opacity', 1)
  }

  // Phaser create callback
  // Once phaser is ready to go, gen and load a new maze
  this.onCreate = function () {
    self.cursors = self.phaser.input.keyboard.createCursorKeys()

    var maze = new Maze()
    maze.from()
    maze.enableEditor()

    self.maze = maze
    self.phaser.world.setBounds(0, 0, maze.width, maze.height)
    self.maze.addToPhaser(self.phaser)
  }

  // Phaser preload callback
  // Set up scaling and cache all the sprites
  this.onPreload = function () {
    self.phaser.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT

    var img = function (key) {
      self.phaser.load.image(key, '/img/' + key + '.png')
    }

    img('wall')
    img('floor')
    img('selector')
  }

  // Gamecontainer resize handler
  this.onResize = function (stuff) {
    // Resize the canvas parent with a ratio of 1:1
    var width = $(gameContainer).width()
    $(gameContainer).height(width)

    if (self.canvas) {
      self.canvas.width = width
      self.canvas.height = width
      Phaser.Canvas.setSmoothingEnabled(self.canvas.getContext('2d'), false)
    }
  }

  this.onRender = function () {
    self.canvas.getContext('2d').drawImage(self.phaser.canvas, 0, 0, 64, 64, 0, 0, self.canvas.width, self.canvas.height)
  }

  this.onUpdate = function () {
    if (self.maze) self.maze.onKey(self.phaser, self.cursors)
  }

  this.onInit = function () {
    self.phaser.canvas.style['display'] = 'none'
    self.canvas = Phaser.Canvas.create(300, 300)
    Phaser.Canvas.addToDOM(self.canvas, self.gameContainer.split('#')[1])
    Phaser.Canvas.setSmoothingEnabled(self.canvas.getContext('2d'), false)
    Phaser.Canvas.setImageRenderingCrisp(self.canvas)
    self.onResize()
  }

  // Starts up the phaser instance
  this.startPhaser = function () {
    self.phaser = new Phaser.Game(64, 64, Phaser.CANVAS, /* this.gameContainer.split('#')[1] */'', {init: this.onInit, preload: this.onPreload, create: this.onCreate, render: this.onRender, update: this.onUpdate}, false, false)
  }
}

module.exports = App
