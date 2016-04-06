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
    // Grab the arrow keys
    self.cursors = self.phaser.input.keyboard.createCursorKeys()
    self.cursors.space = self.phaser.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)

    // Grab the spacebar
    self.phaser.input.keyboard.addKeyCapture(Phaser.Keyboard.SPACEBAR)

    var maze = new Maze()
    var json = {"rows":5,"columns":5,"cellWidth":10,"cellHeight":10,"cells":{"1,1":{"type":"Floor","x":1,"y":1},"1,2":{"type":"Wall","x":1,"y":2},"1,3":{"type":"Wall","x":1,"y":3},"1,4":{"type":"Wall","x":1,"y":4},"1,5":{"type":"Floor","x":1,"y":5},"2,1":{"type":"Wall","x":2,"y":1},"2,2":{"type":"Floor","x":2,"y":2},"2,3":{"type":"Wall","x":2,"y":3},"2,4":{"type":"Floor","x":2,"y":4},"2,5":{"type":"Wall","x":2,"y":5},"3,1":{"type":"Wall","x":3,"y":1},"3,2":{"type":"Wall","x":3,"y":2},"3,3":{"type":"Floor","x":3,"y":3},"3,4":{"type":"Wall","x":3,"y":4},"3,5":{"type":"Wall","x":3,"y":5},"4,1":{"type":"Wall","x":4,"y":1},"4,2":{"type":"Floor","x":4,"y":2},"4,3":{"type":"Wall","x":4,"y":3},"4,4":{"type":"Floor","x":4,"y":4},"4,5":{"type":"Wall","x":4,"y":5},"5,1":{"type":"Floor","x":5,"y":1},"5,2":{"type":"Wall","x":5,"y":2},"5,3":{"type":"Wall","x":5,"y":3},"5,4":{"type":"Wall","x":5,"y":4},"5,5":{"type":"Floor","x":5,"y":5}}}
    maze.from(json)
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
