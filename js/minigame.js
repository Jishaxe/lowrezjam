/* globals Phaser */

// Represents the basket-catching minigame
function Minigame () {
  this.player = null
  this.tinypetals = null
  this.speed = 60

  this.onKey = function (phaser, keys) {
    // Go left and flip
    if (keys.left.isDown) {
      this.player.body.velocity.x = -this.speed
      this.player.scale.x = -1
    }

    // Go right and flip
    if (keys.right.isDown) {
      this.player.body.velocity.x = this.speed
      this.player.scale.x = 1
    }

    // Jump if we're not in the air already
    if (keys.space.isDown && this.player.body.onFloor()) this.player.body.velocity.y = -80

    if (!keys.left.isDown && !keys.right.isDown) this.player.body.velocity.x = 0
  }

  this.onUpdate = function (phaser) {

  }

  this.addToPhaser = function (phaser) {
    phaser.world.setBounds(0, 0, 64, 64)
    this.player = phaser.add.sprite(phaser.world.centerX, phaser.world.centerY, 'player')
    this.player.anchor.setTo(0.5, 1)
    phaser.physics.enable(this.player, Phaser.Physics.ARCADE)

    this.player.body.collideWorldBounds = true
    this.player.body.gravity.y = 200
  }
}

module.exports = Minigame
