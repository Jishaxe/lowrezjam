/* globals Phaser */
var $ = require('jquery')
var Maze = require('./mazes').Maze
var Floor = require('./mazes').Floor
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
  this.introScreenViewed = false
  this.gameContainer = gameContainer
  this.cursors = null
  this.phaser = null
  this.player = null
  this.maze = null
  this.mazeIndex = 0
  this.minigame = null
  this.story = [
    {text: 'Hello there!',
    emotion: 'happy'},
    {text: 'It\'s finally spring time and all',
    emotion: 'good'},
    {text: 'the cherry blossoms are in bloom, ready for the festivals!',
    emotion: 'happy'},{
    text: 'However  ',
    emotion: 'good'},
    {text: 'These pesky ghosts have been littering the prefectures with the cherry blossom petals!',
    emotion: 'bad'},
    {text: 'I\'m in charge of cleaning duties for the 5 prefectures',
    emotion: 'good'},{
    text: 'Perhaps you can help me?',
    emotion: 'happy'},{
      text: 'Lets start!',
      emotion: 'amazing'
    }]

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

  this.playMazeEditor = function (rows, columns) {
    var maze = new Maze()
    maze.blank(rows, columns)
    self.maze = maze
    self.maze.enableEditor()
    self.maze.addToPhaser(self.phaser)
  }

  this.playMaze = function (json) {
    if (!json.dirty) {
      json.dirty = true
      MazeData.calculateMaxPetals(json)
    }

    if (self.minigame) {
      this.minigame.removeFromPhaser(self.phaser)
      this.minigame = null
    }

    var maze = new Maze()
    maze.from(json)
    // maze.enableEditor()
    self.maze = maze
    self.maze.addToPhaser(self.phaser)
    self.player = new Player()
    var startPoint = self.maze.getStartPoint()
    self.player.addToPhaser(self.phaser, startPoint.x, startPoint.y)
    self.player.setupPhysics(self.phaser, self.maze)

    return self.player
  }

  this.playMinigame = function (amount) {
    if (this.maze) {
      this.maze.removeFromPhaser(self.phaser)
      this.maze = null
    }

    if (this.player) {
      this.player.removeFromPhaser(self.phaser)
      this.player = null
    }

    self.minigame = new Minigame(amount)
    self.minigame.addToPhaser(self.phaser)

    return self.minigame
  }

  // Phaser create callback
  // Once phaser is ready to go, gen and load a new maze
  this.onCreate = function () {
    // Grab the arrow keys
    self.cursors = self.phaser.input.keyboard.createCursorKeys()
    self.cursors.space = self.phaser.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
    self.cursors.enter = self.phaser.input.keyboard.addKey(Phaser.Keyboard.ENTER)
    self.cursors.one = self.phaser.input.keyboard.addKey(Phaser.KeyCode.ONE)
    self.cursors.two = self.phaser.input.keyboard.addKey(Phaser.KeyCode.TWO)
    self.cursors.three = self.phaser.input.keyboard.addKey(Phaser.KeyCode.THREE)
    // Grab the spacebar
    self.phaser.input.keyboard.addKeyCapture(Phaser.Keyboard.SPACEBAR)

    // openStartScreen()
    self.playMazeEditor(15, 15)

    function openStartScreen () {
      self.startScreen = new StartScreen()
      self.startScreen.addToPhaser(self.phaser)

      self.startScreen.once('complete', openIntroScreen)
    }

    function openIntroScreen () {
      if (self.endScreen) {
        self.endScreen.removeFromPhaser(self.phaser)
        self.endScreen = null
      }

      if (self.startScreen) {
        self.startScreen.removeFromPhaser(self.phaser)
        self.startScreen = null
      }

      var story = []

      if (!self.introScreenViewed) {
        story = self.story
        self.introScreenViewed = true
      } else {
        story.push({text: 'Now let\'s continue with this!', emotion: 'happy'})
      }

      self.introScreen = new IntroScreen(story)
      self.introScreen.addToPhaser(self.phaser)
      self.introScreen.once('complete', function () {
        self.introScreen.removeFromPhaser(self.phaser)
        self.introScreen = null
        openMazes()
      })
    }

    function chooseMaze() {
      var has_petals_left = []

      MazeData.data.forEach(function (mazeData, i) {
        if (MazeData.getPetals(mazeData).petals > 0) {
          has_petals_left.push(i)
        }
      })

      return {i: self.phaser.rnd.pick(has_petals_left), last: has_petals_left.length === 1}
    }

    function openMazes () {
      var chosenMaze = chooseMaze()
      self.mazeIndex = chosenMaze.i
      var isLast = chosenMaze.last

      self.playMaze(MazeData.data[self.mazeIndex]).once('complete', function () {
        var petal_cells = []
        for (var key in self.maze.cells) {
          var cell = self.maze.cells[key]
          if (cell instanceof Floor && cell.hasPetal) petal_cells.push(cell)
        }

        MazeData.savePetals(petal_cells, MazeData.data[self.mazeIndex])

        var petalsForMinigame = MazeData.data[self.mazeIndex].petalsForMinigame
        if (petalsForMinigame === undefined) petalsForMinigame = 10
        self.playMinigame(petalsForMinigame).once('complete', function (petalsCollected) {
          MazeData.data[self.mazeIndex].petalsForMinigame = (petalsForMinigame - petalsCollected)
          var maxPetals = MazeData.getPetals(MazeData.data[self.mazeIndex]).maxPetals
          var petalsLeft = MazeData.getPetals(MazeData.data[self.mazeIndex]).petals

          var totalMinigamePetalsCollected = 10 - (petalsForMinigame - petalsCollected)
          var collected = (maxPetals - petalsLeft) + totalMinigamePetalsCollected
          maxPetals += 10

          openEndScreen(collected, maxPetals, isLast)
        })
      })
    }

    function openEndScreen (collected, total) {
      if (self.minigame) {
        self.minigame.removeFromPhaser(self.phaser)
        self.minigame = null
      }

      self.endScreen = new EndScreen(collected, total)
      self.endScreen.addToPhaser(self.phaser)
      self.endScreen.once('complete', openIntroScreen)
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

    sheet('ghost_crying')
    img('background')
    img('button')
    img('button_selected')
    img('bubble')
    img('space')
    img('talkinghana_good')
    img('talkinghana_bad')
    img('talkinghana_happy')
    img('talkinghana_amazing')
    img('pop')
    img('minigame')
    sheet('startpoint')
    sheet('endpoint')
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

module.exports = App
