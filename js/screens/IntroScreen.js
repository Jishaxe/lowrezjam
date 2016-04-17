var inherits = require('util').inherits
var TalkingHana = require('../talkinghana')
var EventEmitter = require('events').EventEmitter

function IntroScreen (story) {
  EventEmitter.call(this)
  this.hana = null
  this.story = story
  this.tinypetals = null

  this.addToPhaser = function (phaser) {
    this.tinypetals = phaser.add.group()
    this.tinypetals.enableBody = true
    this.tinypetals.physicsBodyType = Phaser.Physics.ARCADE

    this.hana = new TalkingHana(story)
    this.hana.addToPhaser(phaser)

    var self = this

    this.hana.on('complete', function () {
      self.emit('complete')
    })
  }

  this.removeFromPhaser = function (phaser) {
    this.hana.removeFromPhaser(phaser)
    this.hana = null
    this.tinypetals.destroy()
  }

  this.onKey = function (phaser, keys) {
    if (this.hana) this.hana.onKey(phaser, keys)

    if (phaser.rnd.between(0, 40) === 20) {
      var petal = this.tinypetals.create(phaser.world.randomX, -30, 'tinypetal')
      petal.body.gravity.y = 20
      petal.body.gravity.x = phaser.rnd.between(-20, 20)
      petal.body.collideWorldBounds = true
      petal.body.bounce.set(0.8)
    }

    this.tinypetals.forEach(function (petal) {
      if (petal.y > 58) petal.destroy()
    })
  }
}

inherits(IntroScreen, EventEmitter)
module.exports = IntroScreen
