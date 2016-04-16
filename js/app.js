/* globals Phaser */
var $ = require('jquery')
var Maze = require('./mazes').Maze
var Player = require('./player')
var MazeData = require('./mazedata')
var Minigame = require('./minigame')
var StartScreen = require('./screens').StartScreen
var IntroScreen = require('./screens').IntroScreen
var EndScreen = require('./screens').EndScreen

window.app = new App('#game-container')
window.app.start()

// Main app class
function App (gameContainer) {
  var self = this
  this.gameContainer = gameContainer
  this.cursors = null
  this.phaser = null
  this.player = null
  this.maze = null
  this.mazeIndex = 0
  this.minigame = null

  this.startScreen = null
  this.introScreen = null
  this.endScreen = null

  // Start game
  this.start = function () {
    // Assign resize handler and trigger it once.
    // Keeps the game container in proportion!
    $(window).resize(self.onResize)

    self.startPhaser()

    // Fade in the game
    $('#container').css('opacity', 1)
  }

  this.playMaze = function (json) {
    if (self.minigame) {
      this.minigame.removeFromPhaser(self.phaser)
      this.minigame = null
    }

    var maze = new Maze()
    maze.from(json)
    // maze.enableEditor()
    self.maze = maze
    self.phaser.world.setBounds(0, 0, 20000, 20000)
    self.maze.addToPhaser(self.phaser)
    self.player = new Player()
    var startPoint = self.maze.getStartPoint()
    self.player.addToPhaser(self.phaser, startPoint.x, startPoint.y)
    self.player.setupPhysics(self.phaser, self.maze)

    return self.player
  }

  this.playMinigame = function () {
    if (this.maze) {
      this.maze.removeFromPhaser(self.phaser)
      this.maze = null
    }

    if (this.player) {
      this.player.removeFromPhaser(self.phaser)
      this.player = null
    }

    self.minigame = new Minigame()
    self.minigame.addToPhaser(self.phaser)

    return self.minigame
  }

  // Phaser create callback
  // Once phaser is ready to go, gen and load a new maze
  this.onCreate = function () {
    // Grab the arrow keys
    self.cursors = self.phaser.input.keyboard.createCursorKeys()
    self.cursors.space = self.phaser.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
    self.cursors.one = self.phaser.input.keyboard.addKey(Phaser.KeyCode.ONE)
    self.cursors.two = self.phaser.input.keyboard.addKey(Phaser.KeyCode.TWO)
    self.cursors.three = self.phaser.input.keyboard.addKey(Phaser.KeyCode.THREE)

    // Grab the spacebar
    self.phaser.input.keyboard.addKeyCapture(Phaser.Keyboard.SPACEBAR)

    self.startScreen = new StartScreen()
    self.startScreen.addToPhaser(self.phaser)

    self.startScreen.once('complete', openIntroScreen)

    function openIntroScreen () {
      self.startScreen.removeFromPhaser(self.phaser)
      self.startScreen = null
      self.introScreen = new IntroScreen()
      self.introScreen.addToPhaser(self.phaser)
      self.introScreen.once('complete', function () {
        self.introScreen.removeFromPhaser(self.phaser)
        self.introScreen = null
        openMazes()
      })
    }

    function openMazes () {
      function next () {
        if (self.mazeIndex <= MazeData.length) {
          self.playMaze(MazeData[self.mazeIndex]).once('complete', function () {
            self.mazeIndex++
            self.playMinigame().once('complete', next)
          })
        } else {
          this.minigame.removeFromPhaser(self.phaser)
          this.minigame = null
          openEndScreen()
        }
      }

      next()
    }

    function openEndScreen () {
      self.endScreen = new EndScreen()
      self.endScreen.addToPhaser(self.phaser)
      self.endScreen.once('complete', function () {
        self.endScreen.removeFromPhaser(self.phaser)
        self.endScreen = null

        self.startScreen = new StartScreen()
        self.startScreen.addToPhaser(self.phaser)

        self.startScreen.once('complete', openIntroScreen)
      })
    }
  }

  // Phaser preload callback
  // Set up scaling and cache all the sprites
  this.onPreload = function () {
    self.phaser.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT
    self.phaser.load.bitmapFont('pixel', 'font/font.png', 'font/font.fnt')

    var img = function (key) {
      self.phaser.load.image(key, '/img/' + key + '.png')
    }

    var sheet = function (key) {
      self.phaser.load.spritesheet(key, '/img/' + key + '.png', 20, 20)
    }

    self.phaser.load.spritesheet('player_idle', 'img/player/idle.png', 14, 16)
    self.phaser.load.spritesheet('player_up', 'img/player/up.png', 14, 16)
    self.phaser.load.spritesheet('player_down', 'img/player/down.png', 14, 16)
    self.phaser.load.spritesheet('player_left', 'img/player/left.png', 14, 16)
    self.phaser.load.spritesheet('player_right', 'img/player/right.png', 14, 16)

    img('bubble')
    img('space')
    img('talkinghana_happy')
    img('talkinghana_amazing')
    img('pop')
    img('minigame')
    img('startpoint')
    img('endpoint')
    img('tinypetal')
    img('petal')
    sheet('wall')
    sheet('wallN')
    sheet('wallE')
    sheet('wallS')
    sheet('wallW')
    sheet('wallNS')
    sheet('wallEW')
    sheet('wallNW')
    sheet('wallNSW')
    sheet('wallES')
    sheet('wallESW')
    sheet('wallNEW')
    sheet('wallSW')
    sheet('wallNE')
    sheet('wallNES')
    sheet('wallNESW')
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
    if (self.player) {
      self.player.onKey(self.cursors)
      self.player.onUpdate(self.phaser, self.maze)
    }

    if (self.minigame) {
      self.minigame.onKey(self.phaser, self.cursors)
      self.minigame.onUpdate(self.phaser)
    }

    if (self.startScreen) self.startScreen.onKey(self.phaser, self.cursors)
    if (self.introScreen) self.introScreen.onKey(self.phaser, self.cursors)
    if (self.endScreen) self.endScreen.onKey(self.phaser, self.cursors)
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

/*eslint-disable */
var test_map = {"rows":8,"columns":8,"cellWidth":10,"cellHeight":10,"cells":{"1,1":{"type":"Wall","x":1,"y":1},"1,2":{"type":"Wall","x":1,"y":2},"1,3":{"type":"Floor","x":1,"y":3,"hasPetal":false,"hasStartPoint":true,"hasEndPoint":false},"1,4":{"type":"Wall","x":1,"y":4},"1,5":{"type":"Wall","x":1,"y":5},"1,6":{"type":"Wall","x":1,"y":6},"1,7":{"type":"Wall","x":1,"y":7},"1,8":{"type":"Floor","x":1,"y":8,"hasPetal":false,"hasStartPoint":false,"hasEndPoint":false},"2,1":{"type":"Wall","x":2,"y":1},"2,2":{"type":"Wall","x":2,"y":2},"2,3":{"type":"Floor","x":2,"y":3,"hasPetal":false,"hasStartPoint":false,"hasEndPoint":false},"2,4":{"type":"Wall","x":2,"y":4},"2,5":{"type":"Floor","x":2,"y":5,"hasPetal":false,"hasStartPoint":false,"hasEndPoint":true},"2,6":{"type":"Floor","x":2,"y":6,"hasPetal":true,"hasStartPoint":false,"hasEndPoint":false},"2,7":{"type":"Wall","x":2,"y":7},"2,8":{"type":"Floor","x":2,"y":8,"hasPetal":false,"hasStartPoint":false,"hasEndPoint":false},"3,1":{"type":"Wall","x":3,"y":1},"3,2":{"type":"Wall","x":3,"y":2},"3,3":{"type":"Floor","x":3,"y":3,"hasPetal":true,"hasStartPoint":false,"hasEndPoint":false},"3,4":{"type":"Wall","x":3,"y":4},"3,5":{"type":"Wall","x":3,"y":5},"3,6":{"type":"Floor","x":3,"y":6,"hasPetal":true,"hasStartPoint":false,"hasEndPoint":false},"3,7":{"type":"Wall","x":3,"y":7},"3,8":{"type":"Floor","x":3,"y":8,"hasPetal":false,"hasStartPoint":false,"hasEndPoint":false},"4,1":{"type":"Wall","x":4,"y":1},"4,2":{"type":"Wall","x":4,"y":2},"4,3":{"type":"Floor","x":4,"y":3,"hasPetal":true,"hasStartPoint":false,"hasEndPoint":false},"4,4":{"type":"Wall","x":4,"y":4},"4,5":{"type":"Wall","x":4,"y":5},"4,6":{"type":"Floor","x":4,"y":6,"hasPetal":true,"hasStartPoint":false,"hasEndPoint":false},"4,7":{"type":"Wall","x":4,"y":7},"4,8":{"type":"Floor","x":4,"y":8,"hasPetal":false,"hasStartPoint":false,"hasEndPoint":false},"5,1":{"type":"Wall","x":5,"y":1},"5,2":{"type":"Wall","x":5,"y":2},"5,3":{"type":"Floor","x":5,"y":3,"hasPetal":true,"hasStartPoint":false,"hasEndPoint":false},"5,4":{"type":"Wall","x":5,"y":4},"5,5":{"type":"Wall","x":5,"y":5},"5,6":{"type":"Floor","x":5,"y":6,"hasPetal":true,"hasStartPoint":false,"hasEndPoint":false},"5,7":{"type":"Wall","x":5,"y":7},"5,8":{"type":"Floor","x":5,"y":8,"hasPetal":false,"hasStartPoint":false,"hasEndPoint":false},"6,1":{"type":"Wall","x":6,"y":1},"6,2":{"type":"Wall","x":6,"y":2},"6,3":{"type":"Floor","x":6,"y":3,"hasPetal":true,"hasStartPoint":false,"hasEndPoint":false},"6,4":{"type":"Floor","x":6,"y":4,"hasPetal":true,"hasStartPoint":false,"hasEndPoint":false},"6,5":{"type":"Floor","x":6,"y":5,"hasPetal":true,"hasStartPoint":false,"hasEndPoint":false},"6,6":{"type":"Floor","x":6,"y":6,"hasPetal":true,"hasStartPoint":false,"hasEndPoint":false},"6,7":{"type":"Wall","x":6,"y":7},"6,8":{"type":"Floor","x":6,"y":8,"hasPetal":false,"hasStartPoint":false,"hasEndPoint":false},"7,1":{"type":"Wall","x":7,"y":1},"7,2":{"type":"Wall","x":7,"y":2},"7,3":{"type":"Wall","x":7,"y":3},"7,4":{"type":"Wall","x":7,"y":4},"7,5":{"type":"Wall","x":7,"y":5},"7,6":{"type":"Wall","x":7,"y":6},"7,7":{"type":"Wall","x":7,"y":7},"7,8":{"type":"Floor","x":7,"y":8,"hasPetal":false,"hasStartPoint":false,"hasEndPoint":false},"8,1":{"type":"Floor","x":8,"y":1,"hasPetal":false,"hasStartPoint":false,"hasEndPoint":false},"8,2":{"type":"Floor","x":8,"y":2,"hasPetal":false,"hasStartPoint":false,"hasEndPoint":false},"8,3":{"type":"Floor","x":8,"y":3,"hasPetal":false,"hasStartPoint":false,"hasEndPoint":false},"8,4":{"type":"Floor","x":8,"y":4,"hasPetal":false,"hasStartPoint":false,"hasEndPoint":false},"8,5":{"type":"Floor","x":8,"y":5,"hasPetal":false,"hasStartPoint":false,"hasEndPoint":false},"8,6":{"type":"Floor","x":8,"y":6,"hasPetal":false,"hasStartPoint":false,"hasEndPoint":false},"8,7":{"type":"Floor","x":8,"y":7,"hasPetal":false,"hasStartPoint":false,"hasEndPoint":false},"8,8":{"type":"Floor","x":8,"y":8,"hasPetal":false,"hasStartPoint":false,"hasEndPoint":false}}}
/*eslint-enable */

module.exports = App
